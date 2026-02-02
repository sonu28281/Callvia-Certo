import type { FastifyInstance } from 'fastify';
import { auditLogger } from '../services/audit-logger.service';
import { emailService } from '../services/email.service';
import { AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';
import { tenantProfileService, KYCMethod } from '../tenant/tenant-profile.service';
import { randomUUID } from 'crypto';
import { auth, db, verifyIdToken, setCustomClaims } from '../config/firebase-admin.config';
import { asyncHandler, errors } from '../utils/error-handler';
import { sendSuccess } from '../utils/response-formatter';
import { validateRequired, validateEmail } from '../utils/validators';

export default async function authRoutes(fastify: FastifyInstance) {
  // Mock login endpoint
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    
    // TODO: Verify credentials against database
    // TODO: Generate JWT token
    
    // MOCK: Accept any credentials
    const mockToken = `user_123:tenant_abc:TENANT_ADMIN`;
    
    await auditLogger.log({
      tenant_id: 'tenant_abc',
      event_type: AuditEventType.LOGIN_SUCCESS,
      event_result: AuditEventResult.ALLOWED,
      actor_id: 'user_123',
      actor_role: 'TENANT_ADMIN' as any,
      actor_type: ActorType.USER,
      target_entity: 'auth',
      target_id: 'user_123',
      message: `User logged in: ${email}`,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'] || '',
      request_id: request.requestId,
      timestamp: new Date(),
    });
    
    return {
      success: true,
      data: {
        token: mockToken,
        user: {
          user_id: 'user_123',
          email,
          role: 'TENANT_ADMIN',
          tenant_id: 'tenant_abc',
        },
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Mock logout endpoint
  fastify.post('/logout', async (request, reply) => {
    return {
      success: true,
      data: { message: 'Logged out successfully' },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Reseller signup endpoint with Firebase
  fastify.post('/signup/reseller', asyncHandler(async (request, reply) => {
    const {
      companyName,
      email,
      displayName,
      kycPackage = 'standard'
    } = request.body as {
      companyName: string;
      email: string;
      displayName: string;
      kycPackage?: string;
    };

    // Validate required fields
    validateRequired(
      { companyName, email, displayName },
      ['companyName', 'email', 'displayName']
    );
    validateEmail(email);

    // Check if email already exists in Firebase Auth
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        throw errors.validation(
          'This email is already registered. Please use a different email or try logging in.',
          { email, exists: true }
        );
      }
    } catch (error: any) {
      // If error code is 'auth/user-not-found', email doesn't exist - continue with signup
      if (error.code !== 'auth/user-not-found') {
        // If it's our custom validation error, throw it
        if (error.name === 'AppError') {
          throw error;
        }
        // For other Firebase errors, log and continue
        console.warn('Error checking existing user:', error.message);
      }
    }

    // Force role to TENANT_ADMIN - only tenant admins can signup
    const role = 'TENANT_ADMIN';

    // Generate temporary password (8 characters: letters + numbers)
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const temporaryPassword = generatePassword();

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password: temporaryPassword,
      displayName
    });

    // Create tenant ID
    const tenantId = randomUUID();

    // Create tenant profile with KYC configuration
    const profile = tenantProfileService.createProfile(
      tenantId,
      companyName,
      { marketSegment: kycPackage as any }
    );

    // Create Firestore documents
    // 1. User document
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: userRecord.email,
      displayName,
      role,
      tenantId,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null
    });

    // 2. Tenant document
    await db.collection('tenants').doc(tenantId).set({
      tenantId,
      companyName,
      companyEmail: email,
      isActive: true,
      status: 'enabled',
      kycConfig: {
        methods: profile.kycConfig.methods,
        allowOverrides: profile.kycConfig.allowOverrides
      },
      pricing: profile.pricing,
      wallet: {
        balance: 0,
        currency: 'INR'
      },
      createdAt: new Date(),
      createdBy: userRecord.uid
    });

    // Set custom claims for role-based access
    await setCustomClaims(userRecord.uid, {
      role,
      tenantId
    });

    await auditLogger.log({
      tenant_id: tenantId,
      event_type: AuditEventType.TENANT_CREATED,
      event_result: AuditEventResult.ALLOWED,
      actor_id: userRecord.uid,
      actor_role: 'SYSTEM' as any,
      actor_type: ActorType.SYSTEM,
      target_entity: 'tenant',
      target_id: tenantId,
      message: `New reseller signed up: ${companyName}`,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'] || '',
      request_id: request.requestId,
      timestamp: new Date(),
      metadata: {
        kycMethods: profile.kycConfig.methods,
        pricing: profile.pricing.totalPrice
      }
    });

    // Send welcome email in background (don't wait for it)
    // This prevents email issues from blocking the signup response
    emailService.sendWelcomeEmail({
      name: displayName,
      email,
      companyName,
      temporaryPassword,
      loginUrl: `${process.env.FRONTEND_URL || 'https://callvia-certo.netlify.app'}/login`
    }).then((emailResult) => {
      if (emailResult.success) {
        console.log(`✅ Welcome email sent to ${email}`);
      } else {
        console.warn(`⚠️ Failed to send welcome email to ${email}:`, emailResult.error);
      }
    }).catch((error) => {
      console.error(`❌ Email send error for ${email}:`, error);
    });

    // Return success immediately without waiting for email
    return sendSuccess(reply, request, {
      userId: userRecord.uid,
      tenantId,
      companyName,
      email,
      message: 'Account created successfully! Check your email for login credentials.',
      emailSent: true, // Email sent in background
      kycConfig: {
        methods: profile.kycConfig.methods,
        pricing: {
          totalPrice: profile.pricing.totalPrice,
          breakdown: profile.pricing.perMethodPricing
        }
      }
    });
  }));

  // Set custom claims endpoint (called from frontend after signup)
  fastify.post('/set-claims', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: { message: 'No token provided' }
        });
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(token);

      const { role, tenantId } = request.body as { role: string; tenantId?: string };

      await setCustomClaims(decodedToken.uid, { role, tenantId });

      return {
        success: true,
        data: { message: 'Claims set successfully' }
      };
    } catch (error: any) {
      console.error('Set claims error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message || 'Failed to set claims' }
      });
    }
  });
}
