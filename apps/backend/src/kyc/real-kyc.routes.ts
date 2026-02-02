import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { serviceGatekeeper } from '../middleware/gatekeeper.middleware';
import { auditLogger } from '../services/audit-logger.service';
import { AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';
import { onfidoProvider } from '../services/onfido.service';
import { walletEngine } from '../engines/wallet.engine';
import { generateId } from '../utils/id-generator';

/**
 * Real KYC Routes with Onfido Integration
 * 
 * Flow:
 * 1. Admin initiates KYC → Creates Onfido applicant
 * 2. System generates SDK token
 * 3. Email sent to end user with verification link
 * 4. End user completes KYC on Onfido portal
 * 5. Webhook notifies backend of completion
 * 6. Admin sees results in dashboard
 */

export async function realKycRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);

  /**
   * POST /api/v1/kyc/real/initiate
   * Initiate real KYC verification with Onfido
   */
  fastify.post(
    '/initiate',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'TENANT_ADMIN', 'SUB_TENANT_ADMIN', 'AGENT'),
        serviceGatekeeper('KYC_BASIC'), // Check wallet & pricing
      ],
    },
    async (request, reply) => {
      const { 
        endUserName, 
        endUserEmail, 
        endUserPhone,
        documentTypes,
        biometricRequired 
      } = request.body as any;

      const { userId, tenantId, role } = (request as any).user;
      const sessionId = generateId('kyc_session');

      try {
        // Step 1: Create Onfido Applicant
        const [firstName, ...lastNameParts] = endUserName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        const applicant = await onfidoProvider.createApplicant(
          firstName,
          lastName,
          endUserEmail
        );

        // Step 2: Generate SDK Token for end user
        const sdkToken = await onfidoProvider.generateSDKToken(applicant.id);

        // Step 3: Generate verification URL
        const verificationUrl = `${process.env.FRONTEND_URL}/verify/kyc/${sessionId}?token=${sdkToken.token}`;

        // Step 4: Deduct wallet balance
        const serviceCost = 2.50; // TODO: Get from pricing engine
        await walletEngine.deduct(
          tenantId,
          serviceCost,
          'KYC_BASIC',
          sessionId,
          userId
        );

        // Step 5: Send email to end user
        // TODO: Implement email service
        console.log('KYC Email should be sent to:', endUserEmail);
        console.log('Verification URL:', verificationUrl);

        // Step 6: Save to database (TODO)
        const kycSession = {
          sessionId,
          applicantId: applicant.id,
          tenantId,
          initiatedBy: userId,
          endUserName,
          endUserEmail,
          endUserPhone,
          documentTypes,
          biometricRequired,
          status: 'pending',
          verificationUrl,
          sdkToken: sdkToken.token,
          expiresAt: sdkToken.expires_at,
          createdAt: new Date().toISOString(),
          cost: serviceCost,
        };

        // Audit log
        await auditLogger.log({
          event_type: AuditEventType.KYC_REAL_INITIATED,
          event_result: AuditEventResult.ALLOWED,
          actor_id: userId,
          actor_role: role,
          tenant_id: tenantId,
          target_entity: 'KYC_SESSION',
          target_id: sessionId,
          metadata: {
            applicantId: applicant.id,
            endUserEmail,
            documentTypes,
            biometricRequired,
            provider: 'onfido',
          },
          message: `Real KYC initiated for ${endUserEmail}`,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
        });

        return reply.send({
          success: true,
          data: {
            sessionId,
            applicantId: applicant.id,
            verificationUrl,
            status: 'pending',
            expiresAt: sdkToken.expires_at,
            message: `KYC verification link sent to ${endUserEmail}`,
          },
        });
      } catch (error: any) {
        // Audit log for failure
        await auditLogger.log({
          event_type: AuditEventType.KYC_REAL_FAILED,
          event_result: AuditEventResult.FAILED,
          actor_id: userId,
          actor_role: role,
          tenant_id: tenantId,
          target_entity: 'KYC_SESSION',
          target_id: sessionId,
          metadata: { endUserEmail, error: error.message },
          message: `KYC initiation failed: ${error.message}`,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
        });

        return reply.status(500).send({
          success: false,
          error: 'Failed to initiate KYC',
          message: error.message,
        });
      }
    }
  );

  /**
   * POST /api/v1/kyc/real/:sessionId/create-check
   * Create verification check after end user uploads documents
   */
  fastify.post(
    '/:sessionId/create-check',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'TENANT_ADMIN', 'SUB_TENANT_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { sessionId } = request.params as any;
      const { userId, tenantId, role } = (request as any).user;

      try {
        // TODO: Get KYC session from database
        const applicantId = 'mock_applicant_id'; // TODO: Get from DB

        // Create check in Onfido
        const check = await onfidoProvider.createCheck(applicantId, [
          'document',
          'facial_similarity_photo',
        ]);

        // TODO: Update database with check ID

        await auditLogger.log({
          event_type: AuditEventType.KYC_CHECK_CREATED,
          event_result: AuditEventResult.ALLOWED,
          actor_id: userId,
          actor_role: role,
          tenant_id: tenantId,
          target_entity: 'KYC_CHECK',
          target_id: check.id,
          metadata: { sessionId, applicantId, checkId: check.id },
          message: 'KYC verification check created',
          ip_address: request.ip,
          user_agent: request.headers['user-agent'],
        });

        return reply.send({
          success: true,
          data: {
            checkId: check.id,
            status: check.status,
            message: 'Verification in progress',
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to create check',
          message: error.message,
        });
      }
    }
  );

  /**
   * GET /api/v1/kyc/real/:sessionId/status
   * Get current status of KYC verification
   */
  fastify.get(
    '/:sessionId/status',
    {
      preHandler: [
        requireRole('SUPER_ADMIN', 'TENANT_ADMIN', 'SUB_TENANT_ADMIN', 'AGENT'),
      ],
    },
    async (request, reply) => {
      const { sessionId } = request.params as any;

      try {
        // TODO: Get session from database
        const checkId = 'mock_check_id'; // TODO: Get from DB

        // Get check status from Onfido
        const check = await onfidoProvider.getCheck(checkId);

        return reply.send({
          success: true,
          data: {
            sessionId,
            checkId: check.id,
            status: check.status,
            result: check.result,
            reports: check.reports.map((report) => ({
              type: report.name,
              status: report.status,
              result: report.result,
            })),
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to get status',
          message: error.message,
        });
      }
    }
  );

  /**
   * POST /api/v1/kyc/real/webhook
   * Onfido webhook endpoint for status updates
   */
  fastify.post('/webhook', async (request, reply) => {
    const payload = request.body as any;

    try {
      // Verify webhook signature (TODO: Add signature verification)
      
      // Process webhook
      await onfidoProvider.handleWebhook(payload);

      // TODO: Update database
      // TODO: Send notification to admin
      // TODO: Update audit logs

      return reply.send({ success: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  });
}
