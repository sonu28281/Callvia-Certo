/**
 * Digital e-KYC Routes
 * 
 * Supports multiple verification methods:
 * 1. DigiLocker OAuth (Recommended)
 * 2. Aadhaar OTP eKYC
 * 3. Video KYC (Future)
 * 4. Manual upload (Legacy/Fallback)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import digilockerService from '../services/digilocker.service';
import aadhaarOtpService from '../services/aadhaar-otp.service';
import emailService from '../services/email.service';
import crypto from 'crypto';

// In-memory storage (replace with database in production)
const kycSessions = new Map<string, any>();

export default async function digitalKycRoutes(fastify: FastifyInstance) {
  
  // ==================== DigiLocker Routes ====================
  
  /**
   * Step 1: Generate DigiLocker OAuth URL
   * GET /api/v1/kyc/digital/digilocker/init
   */
  fastify.get('/digital/digilocker/init', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Create new KYC session
      const sessionId = `kyc_digilocker_${crypto.randomBytes(16).toString('hex')}`;
      
      // Generate OAuth URL
      const authUrl = digilockerService.generateAuthUrl(sessionId);
      
      // Store session
      kycSessions.set(sessionId, {
        sessionId,
        method: 'digilocker',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
      
      return reply.send({
        success: true,
        sessionId,
        authUrl,
        message: 'Redirect user to authUrl for DigiLocker login',
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });
  
  /**
   * Mock DigiLocker endpoint for testing without API keys
   * GET /api/v1/kyc/digital/digilocker/mock?sessionId=xxx
   */
  fastify.get('/digital/digilocker/mock', async (request: FastifyRequest<{
    Querystring: { sessionId: string };
  }>, reply: FastifyReply) => {
    try {
      const { sessionId } = request.query;
      
      const session = kycSessions.get(sessionId);
      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Invalid session',
        });
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock KYC data
      const mockKycData = {
        verificationStatus: 'verified',
        documents: {
          aadhaar: {
            name: 'Demo User',
            dob: '01-01-1990',
            gender: 'M',
            maskedAadhaar: 'XXXX-XXXX-1234',
            address: {
              house: 'Demo House #123',
              street: 'MG Road',
              locality: 'Sector 15',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110001',
            },
          },
          pan: {
            number: 'ABCDE1234F',
            name: 'DEMO USER',
            dob: '01/01/1990',
          },
        },
        verifiedAt: new Date().toISOString(),
        mockMode: true,
      };
      
      // Update session
      session.status = 'verified';
      session.kycData = mockKycData;
      session.verifiedAt = new Date();
      kycSessions.set(sessionId, session);
      
      return reply.send({
        success: true,
        sessionId,
        kycData: mockKycData,
        message: '🎭 Mock DigiLocker verification successful! (Demo data - no real API used)',
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });
  
  /**
   * Step 2: DigiLocker OAuth Callback
   * GET /api/v1/kyc/digital/digilocker/callback?code=xxx&state=xxx
   */
  fastify.get('/digital/digilocker/callback', async (request: FastifyRequest<{
    Querystring: { code: string; state: string; error?: string };
  }>, reply: FastifyReply) => {
    try {
      const { code, state, error } = request.query;
      
      if (error) {
        return reply.status(400).send({
          success: false,
          error: `DigiLocker authorization failed: ${error}`,
        });
      }
      
      // Extract session ID from state
      const [stateToken, sessionId] = state.split(':');
      
      const session = kycSessions.get(sessionId);
      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Invalid or expired session',
        });
      }
      
      // Exchange code for token
      const tokenResponse = await digilockerService.exchangeCodeForToken(code);
      
      // Fetch KYC documents
      const kycData = await digilockerService.performDigiLockerKYC(tokenResponse.access_token);
      
      // Update session
      session.status = kycData.verificationStatus;
      session.accessToken = tokenResponse.access_token; // Store encrypted in production
      session.kycData = kycData;
      session.verifiedAt = new Date();
      
      kycSessions.set(sessionId, session);
      
      return reply.send({
        success: true,
        sessionId,
        verificationStatus: kycData.verificationStatus,
        data: {
          aadhaar: kycData.aadhaar,
          documentsFound: kycData.documents.map(d => d.doctype),
        },
        message: 'KYC verification completed successfully',
      });
    } catch (error: any) {
      console.error('DigiLocker callback error:', error);
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== Aadhaar OTP Routes ====================
  
  /**
   * Step 1: Initiate Aadhaar OTP
   * POST /api/v1/kyc/digital/aadhaar/init
   * Body: { aadhaarNumber: string }
   */
  fastify.post('/digital/aadhaar/init', async (request: FastifyRequest<{
    Body: { aadhaarNumber: string };
  }>, reply: FastifyReply) => {
    try {
      const { aadhaarNumber } = request.body;
      
      if (!aadhaarNumber) {
        return reply.status(400).send({
          success: false,
          error: 'Aadhaar number is required',
        });
      }
      
      // Validate Aadhaar format
      if (!aadhaarOtpService.validateAadhaarFormat(aadhaarNumber)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid Aadhaar number format',
        });
      }
      
      // Initiate OTP
      const otpResponse = await aadhaarOtpService.initiateOTP(aadhaarNumber);
      
      // Create session
      const sessionId = `kyc_aadhaar_${crypto.randomBytes(16).toString('hex')}`;
      kycSessions.set(sessionId, {
        sessionId,
        method: 'aadhaar-otp',
        status: 'otp-sent',
        requestId: otpResponse.requestId,
        aadhaarNumber: aadhaarOtpService.maskAadhaar(aadhaarNumber),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
      
      return reply.send({
        success: true,
        sessionId,
        requestId: otpResponse.requestId,
        message: 'OTP sent to Aadhaar-registered mobile number',
        maskedAadhaar: aadhaarOtpService.maskAadhaar(aadhaarNumber),
      });
    } catch (error: any) {
      console.error('Aadhaar OTP init error:', error);
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });
  
  /**
   * Step 2: Verify Aadhaar OTP
   * POST /api/v1/kyc/digital/aadhaar/verify
   * Body: { sessionId: string, otp: string, selfiePhoto?: string }
   */
  fastify.post('/digital/aadhaar/verify', async (request: FastifyRequest<{
    Body: { sessionId: string; otp: string; selfiePhoto?: string };
  }>, reply: FastifyReply) => {
    try {
      const { sessionId, otp, selfiePhoto } = request.body;
      
      const session = kycSessions.get(sessionId);
      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Invalid or expired session',
        });
      }
      
      if (session.status !== 'otp-sent') {
        return reply.status(400).send({
          success: false,
          error: 'Invalid session state',
        });
      }
      
      // Verify OTP and get KYC data
      const kycResult = await aadhaarOtpService.verifyOTP(session.requestId, otp);
      
      let faceMatch;
      if (selfiePhoto && kycResult.data.photo) {
        faceMatch = await aadhaarOtpService.matchFaces(kycResult.data.photo, selfiePhoto);
      }
      
      // Update session
      session.status = 'verified';
      session.kycData = kycResult.data;
      session.faceMatch = faceMatch;
      session.verifiedAt = new Date();
      
      kycSessions.set(sessionId, session);
      
      return reply.send({
        success: true,
        sessionId,
        verified: true,
        data: {
          name: kycResult.data.name,
          dob: kycResult.data.dob,
          gender: kycResult.data.gender,
          address: kycResult.data.address,
          maskedAadhaar: kycResult.data.maskedAadhaar,
        },
        faceMatch: faceMatch ? {
          matched: faceMatch.match,
          confidence: faceMatch.confidence,
        } : undefined,
        message: 'KYC verification completed successfully',
      });
    } catch (error: any) {
      console.error('Aadhaar OTP verify error:', error);
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== Admin Routes ====================
  
  /**
   * Get KYC session details (Admin only)
   * GET /api/v1/kyc/digital/session/:sessionId
   */
  fastify.get('/digital/session/:sessionId', async (request: FastifyRequest<{
    Params: { sessionId: string };
  }>, reply: FastifyReply) => {
    const { sessionId } = request.params;
    
    const session = kycSessions.get(sessionId);
    if (!session) {
      return reply.status(404).send({
        success: false,
        error: 'Session not found',
      });
    }
    
    // Remove sensitive data before sending
    const { accessToken, ...safeSession } = session;
    
    return reply.send({
      success: true,
      session: safeSession,
    });
  });
  
  /**
   * Get all pending KYC verifications (Admin only)
   * GET /api/v1/kyc/digital/pending
   */
  fastify.get('/digital/pending', async (request: FastifyRequest, reply: FastifyReply) => {
    const pendingSessions = Array.from(kycSessions.values())
      .filter(s => s.status === 'pending' || s.status === 'otp-sent')
      .map(({ accessToken, ...session }) => session);
    
    return reply.send({
      success: true,
      count: pendingSessions.length,
      sessions: pendingSessions,
    });
  });
  
  /**
   * Get all verified KYC sessions (Admin only)
   * GET /api/v1/kyc/digital/verified
   */
  fastify.get('/digital/verified', async (request: FastifyRequest, reply: FastifyReply) => {
    const verifiedSessions = Array.from(kycSessions.values())
      .filter(s => s.status === 'verified' || s.status === 'success')
      .map(({ accessToken, ...session }) => session);
    
    return reply.send({
      success: true,
      count: verifiedSessions.length,
      sessions: verifiedSessions,
    });
  });
  
  /**
   * Approve/Reject KYC manually (Admin only)
   * POST /api/v1/kyc/digital/review/:sessionId
   * Body: { action: 'approve' | 'reject', reason?: string }
   */
  fastify.post('/digital/review/:sessionId', async (request: FastifyRequest<{
    Params: { sessionId: string };
    Body: { action: 'approve' | 'reject'; reason?: string };
  }>, reply: FastifyReply) => {
    const { sessionId } = request.params;
    const { action, reason } = request.body;
    
    const session = kycSessions.get(sessionId);
    if (!session) {
      return reply.status(404).send({
        success: false,
        error: 'Session not found',
      });
    }
    
    session.status = action === 'approve' ? 'approved' : 'rejected';
    session.reviewedAt = new Date();
    session.reviewReason = reason;
    
    kycSessions.set(sessionId, session);
    
    // TODO: Send email notification to user
    // await emailService.sendKYCResult(session.email, action, reason);
    
    return reply.send({
      success: true,
      sessionId,
      status: session.status,
      message: `KYC ${action}d successfully`,
    });
  });
  
  // ==================== Health Check ====================
  
  /**
   * Check if digital KYC services are available
   * GET /api/v1/kyc/digital/health
   */
  fastify.get('/digital/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      services: {
        digilocker: {
          available: !!process.env.DIGILOCKER_CLIENT_ID,
          configured: !!process.env.DIGILOCKER_CLIENT_SECRET,
        },
        aadhaar: {
          available: !!process.env.AADHAAR_API_KEY,
          provider: process.env.AADHAAR_PROVIDER || 'none',
        },
      },
      message: 'Digital KYC services status',
    });
  });
}
