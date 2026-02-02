import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { auditLogger } from '../services/audit-logger.service';
import { AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';
import { inHouseKYC } from '../services/inhouse-kyc.service';
import { emailService } from '../services/email.service';
import { overrideLogService } from './override-log.service';
import { tenantProfileService } from '../tenant/tenant-profile.service';
import multipart from '@fastify/multipart';
import { asyncHandler, errors } from '../utils/error-handler';
import { sendSuccess } from '../utils/response-formatter';
import { validateRequired, validateEmail, validateLength } from '../utils/validators';

/**
 * In-House KYC Routes (No Third Party!)
 * 
 * Flow:
 * 1. Admin initiates KYC
 * 2. Email sent to end user with upload link
 * 3. End user uploads documents
 * 4. Admin reviews documents manually
 * 5. Admin approves/rejects
 * 
 * Cost: FREE (only storage)
 */

export async function inHouseKycRoutes(fastify: FastifyInstance) {
  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  });

  /**
   * POST /api/v1/kyc/inhouse/initiate
   * Initiate KYC verification using tenant's configured methods
   * Methods are now pulled from tenant profile, NOT from request body
   */
  fastify.post(
    '/initiate',
    asyncHandler(async (request, reply) => {
      const { 
        endUserName, 
        endUserEmail, 
        endUserPhone,
        isOverride = false,
        overrideReason,
        overrideNotes,
        additionalModules = [],
        appliedBy = 'admin' // TODO: Get from auth
      } = request.body as any;

      // Validate required fields
      validateRequired(
        { endUserName, endUserEmail },
        ['endUserName', 'endUserEmail']
      );
      validateEmail(endUserEmail);

      console.log('📥 Received KYC request:', { endUserName, endUserEmail });

      // Mock tenant ID for testing
      // TODO: Get from auth token
      const tenantId = 'tenant_test_001';
      const userId = 'user_test_001';

      // Get tenant's KYC configuration
      let tenantProfile = tenantProfileService.getProfile(tenantId);
      
      // If no profile exists, create default one
      if (!tenantProfile) {
        console.log('⚠️ No tenant profile found, creating default...');
        tenantProfile = tenantProfileService.createProfile(
          tenantId,
          'Test Company',
          { templateId: 'standard-digilocker-liveness' }
        );
      }

      // Get tenant's configured methods
      const configuredMethods = tenantProfile.kycConfig.methods;
      const baseCost = tenantProfile.pricing.totalPrice;
      
      console.log(`📋 Tenant Methods: ${configuredMethods.join(', ')}`);
      console.log(`💰 Base Cost: ₹${baseCost.toFixed(2)}`);

      // Create KYC session
      const session = await inHouseKYC.createSession({
        tenantId,
        initiatedBy: userId,
        endUserName,
        endUserEmail,
        endUserPhone,
      });

      // Convert KYC methods to verification methods object
      const verificationMethods = {
        digilocker: configuredMethods.includes('digilocker'),
        liveness: configuredMethods.includes('liveness'),
        aadhaarOTP: configuredMethods.includes('aadhaar_otp'),
        passport: configuredMethods.includes('passport'),
        documentUpload: configuredMethods.includes('document_upload'),
        videoKYC: configuredMethods.includes('video_kyc'),
        digitalContract: configuredMethods.includes('digital_contract')
      };

      let totalCost = baseCost;
      let costDelta = 0;
      
      // Apply override if requested AND allowed
      if (isOverride) {
        if (!tenantProfile.kycConfig.allowOverrides) {
          throw errors.forbidden('Tenant is not allowed to use KYC overrides');
        }
        
        // Validate override reason
        if (!overrideReason || overrideReason.trim().length === 0) {
          throw errors.validation('Override reason is required when isOverride is true');
        }
        
        // Calculate additional cost based on modules
        const moduleCosts: Record<string, number> = {
          'aadhaar_otp': 3.50,
          'video_kyc': 15.00,
          'enhanced_liveness': 2.00
        };
        
        additionalModules.forEach((module: string) => {
          const cost = moduleCosts[module] || 0;
          totalCost += cost;
          costDelta += cost;
        });
        
        // Store original config for logging
        const originalConfig = {
          methods: configuredMethods,
          verificationMethods: { ...verificationMethods },
          documentTypes: (session as any).documentTypes,
          estimatedCost: baseCost
        };
        
        // Apply override config
        const overrideVerificationMethods = {
          ...verificationMethods,
          aadhaarOTP: verificationMethods.aadhaarOTP || additionalModules.includes('aadhaar_otp'),
          videoKYC: verificationMethods.videoKYC || additionalModules.includes('video_kyc'),
          enhancedLiveness: additionalModules.includes('enhanced_liveness')
        };
        
        const overrideConfig = {
          methods: [...configuredMethods, ...additionalModules.filter((m: string) => !configuredMethods.includes(m as any))],
          verificationMethods: overrideVerificationMethods,
          documentTypes: (session as any).documentTypes,
          estimatedCost: totalCost
        };
        
        // Log the override
        const overrideLog = overrideLogService.logOverride({
          sessionId: session.id,
          tenantId,
          customerName: endUserName,
          customerEmail: endUserEmail,
          originalConfig,
          overrideConfig,
          reason: overrideReason,
          notes: overrideNotes,
          appliedBy,
          appliedByRole: 'admin',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        });
        
        console.log('🔧 Override applied:', {
          sessionId: session.id,
          addedModules: overrideLog.addedModules,
          costDelta: `+₹${costDelta.toFixed(2)}`,
          reason: overrideReason
        });
        
        // Update verification methods with override
        (session as any).verificationMethods = overrideVerificationMethods;
        (session as any).isOverride = true;
        (session as any).overrideLogId = overrideLog.id;
      } else {
        // No override - use tenant's configured methods
        (session as any).verificationMethods = verificationMethods;
        (session as any).isOverride = false;
      }
      
      // Store common session data
      (session as any).configuredMethods = configuredMethods;
      (session as any).documentTypes = configuredMethods.includes('passport') ? ['Passport'] : ['Aadhaar', 'PAN'];
      (session as any).biometricRequired = configuredMethods.includes('liveness');
      (session as any).totalCost = totalCost;
      (session as any).costDelta = costDelta;

      // Generate unified KYC URL (single entry point for all methods)
      const unifiedKycUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/kyc/unified/${session.id}`;

      console.log('📧 Sending email to:', endUserEmail);
      console.log('🔗 Unified KYC URL:', unifiedKycUrl);
      console.log('📋 Configured Methods:', configuredMethods);
      console.log('💰 Total Cost: ₹' + totalCost.toFixed(2));

      // Send real email with tenant's configured methods
      try {
        await emailService.sendKYCLink({
          customerName: endUserName,
          customerEmail: endUserEmail,
          verificationUrl: unifiedKycUrl,
          sessionId: session.id,
          documentTypes: (session as any).documentTypes,
          companyName: tenantProfile.companyName,
          verificationMethods: (session as any).verificationMethods,
        });
        console.log('✅ Email sent successfully to:', endUserEmail);
      } catch (emailError: any) {
        console.error('❌ Email sending failed:', emailError.message);
        // Continue even if email fails (for testing)
      }

      return sendSuccess(reply, request, {
        sessionId: session.id,
        verificationUrl: unifiedKycUrl,
        expiresAt: typeof session.expiresAt === 'string' ? session.expiresAt : (session.expiresAt as any) instanceof Date ? (session.expiresAt as Date).toISOString() : session.expiresAt,
        configuredMethods,
        isOverride,
        totalCost,
        costDelta: isOverride ? costDelta : 0,
        message: `KYC link sent to ${endUserEmail}`,
      });
    })
  );

  // Protected routes below (require auth)
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);

  /**
   * POST /api/v1/kyc/inhouse/:sessionId/upload
   * Upload document (End User - No Auth Required!)
   */
  fastify.post('/:sessionId/upload', async (request, reply) => {
    const { sessionId } = request.params as any;
    const { documentType } = request.query as any;

    try {
      // Get uploaded file
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'No file uploaded',
        });
      }

      const buffer = await data.toBuffer();

      // Upload document
      const document = await inHouseKYC.uploadDocument(
        sessionId,
        {
          filename: data.filename,
          data: buffer,
          mimetype: data.mimetype,
        },
        documentType
      );

      return reply.send({
        success: true,
        data: {
          documentId: document.id,
          filename: document.filename,
          uploadedAt: document.uploadedAt,
          message: 'Document uploaded successfully',
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to upload document',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/v1/kyc/inhouse/pending-reviews
   * Get all pending reviews (Admin)
   */
  fastify.get(
    '/pending-reviews',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { tenantId } = (request as any).user;

      try {
        const sessions = inHouseKYC.getPendingReviews(tenantId);

        return reply.send({
          success: true,
          data: sessions,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to get pending reviews',
        });
      }
    }
  );

  /**
   * GET /api/v1/kyc/inhouse/:sessionId
   * Get session details (Admin)
   */
  fastify.get(
    '/:sessionId',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { sessionId } = request.params as any;

      try {
        const session = inHouseKYC.getSession(sessionId);
        if (!session) {
          return reply.status(404).send({
            success: false,
            error: 'Session not found',
          });
        }

        return reply.send({
          success: true,
          data: session,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to get session',
        });
      }
    }
  );

  /**
   * GET /api/v1/kyc/inhouse/:sessionId/document/:documentId
   * View document (Admin)
   */
  fastify.get(
    '/:sessionId/document/:documentId',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { sessionId, documentId } = request.params as any;

      try {
        const filePath = inHouseKYC.getDocumentPath(sessionId, documentId);
        if (!filePath) {
          return reply.status(404).send({
            success: false,
            error: 'Document not found',
          });
        }

        // Read and send file
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(filePath);
        return reply.type('application/octet-stream').send(fileBuffer);
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to get document',
        });
      }
    }
  );

  /**
   * POST /api/v1/kyc/inhouse/:sessionId/approve
   * Approve KYC (Admin)
   */
  fastify.post(
    '/:sessionId/approve',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'SUB_TENANT_ADMIN'),
      ],
    },
    async (request, reply) => {
      const { sessionId } = request.params as any;
      const { notes } = request.body as any;
      const { userId, role, tenantId } = (request as any).user;

      try {
        const session = await inHouseKYC.approveSession(sessionId, userId, notes);

        // Audit log
        await auditLogger.log({
          event_type: AuditEventType.KYC_APPROVED,
          event_result: AuditEventResult.ALLOWED,
          actor_id: userId,
          actor_role: role,
          tenant_id: tenantId,
          target_entity: 'KYC_SESSION',
          target_id: sessionId,
          metadata: {
            endUserEmail: session.endUserEmail,
            notes,
          },
          message: `KYC approved for ${session.endUserEmail}`,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
        });

        return reply.send({
          success: true,
          data: session,
          message: 'KYC approved successfully',
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to approve KYC',
        });
      }
    }
  );

  /**
   * POST /api/v1/kyc/inhouse/:sessionId/reject
   * Reject KYC (Admin)
   */
  fastify.post(
    '/:sessionId/reject',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'SUB_TENANT_ADMIN'),
      ],
    },
    async (request, reply) => {
      const { sessionId } = request.params as any;
      const { reason } = request.body as any;
      const { userId, role, tenantId } = (request as any).user;

      try {
        const session = await inHouseKYC.rejectSession(sessionId, userId, reason);

        // Audit log
        await auditLogger.log({
          event_type: AuditEventType.KYC_REJECTED,
          event_result: AuditEventResult.FAILED,
          actor_id: userId,
          actor_role: role,
          tenant_id: tenantId,
          target_entity: 'KYC_SESSION',
          target_id: sessionId,
          metadata: {
            endUserEmail: session.endUserEmail,
            reason,
          },
          message: `KYC rejected for ${session.endUserEmail}`,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
        });

        return reply.send({
          success: true,
          data: session,
          message: 'KYC rejected',
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to reject KYC',
        });
      }
    }
  );

  /**
   * GET /api/v1/kyc/inhouse/sessions/all
   * Get all KYC sessions for tenant (Admin)
   */
  fastify.get(
    '/sessions/all',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { tenantId } = (request as any).user;

      try {
        const sessions = inHouseKYC.getSessionsByTenant(tenantId);

        return reply.send({
          success: true,
          data: sessions,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to get sessions',
        });
      }
    }
  );
}
