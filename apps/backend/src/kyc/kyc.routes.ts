import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { serviceGatekeeper } from '../middleware/gatekeeper.middleware';
import { ServiceCode, KYCStatus, KYCOutcome, AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';
import { walletEngine } from '../engines/wallet.engine';
import { auditLogger } from '../services/audit-logger.service';
import { generateId } from '../utils/id-generator';

export default async function kycRoutes(fastify: FastifyInstance) {
  // Apply middleware
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);
  
  // Initiate KYC verification
  fastify.post(
    '/initiate',
    {
      preHandler: [serviceGatekeeper(ServiceCode.KYC_BASIC)],
    },
    async (request, reply) => {
      const { end_user_id, end_user_email, document_types, biometric_required } =
        request.body as {
          end_user_id: string;
          end_user_email?: string;
          document_types: string[];
          biometric_required: boolean;
        };
      
      const tenantId = request.tenantContext!.tenant_id;
      const servicePricing = request.servicePricing!;
      
      // TODO: Call KYC provider (Onfido, Jumio, etc.)
      // MOCK: Create mock KYC session
      const sessionId = generateId('kyc');
      
      try {
        // Deduct wallet balance
        await walletEngine.deduct(
          tenantId,
          servicePricing.price,
          ServiceCode.KYC_BASIC,
          sessionId
        );
        
        // Log audit event
        await auditLogger.log({
          tenant_id: tenantId,
          event_type: AuditEventType.KYC_STARTED,
          event_result: AuditEventResult.ALLOWED,
          actor_id: request.user!.user_id,
          actor_role: request.user!.role as any,
          actor_type: ActorType.USER,
          target_entity: 'kyc',
          target_id: sessionId,
          message: `KYC verification initiated for ${end_user_id}`,
          metadata: {
            end_user_id,
            document_types,
            biometric_required,
            price_charged: servicePricing.price,
          },
          ip_address: request.ip,
          user_agent: request.headers['user-agent'] || '',
          request_id: request.requestId,
          timestamp: new Date(),
        });
        
        return {
          success: true,
          data: {
            session_id: sessionId,
            verification_url: `https://mock-kyc-provider.com/verify/${sessionId}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: KYCStatus.PENDING,
          },
          meta: {
            request_id: request.requestId,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        // Refund on failure (optional based on provider)
        // await walletEngine.refund(tenantId, servicePricing.price, 'KYC initiation failed');
        throw error;
      }
    }
  );
  
  // Get KYC status
  fastify.get('/:sessionId/status', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    
    // TODO: Query KYC provider for status
    
    return {
      success: true,
      data: {
        session_id: sessionId,
        status: KYCStatus.COMPLETED,
        outcome: KYCOutcome.APPROVED,
        risk_score: 0.15,
        verified_at: new Date().toISOString(),
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Get KYC result
  fastify.get('/:sessionId/result', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    
    // TODO: Query KYC provider for detailed result
    
    return {
      success: true,
      data: {
        session_id: sessionId,
        status: KYCStatus.COMPLETED,
        outcome: KYCOutcome.APPROVED,
        risk_score: 0.15,
        documents: [
          {
            document_id: 'doc_123',
            document_type: 'passport',
            country: 'US',
            verified: true,
          },
        ],
        biometrics: {
          face_match: true,
          liveness_check: true,
          confidence_score: 0.95,
        },
        verified_at: new Date().toISOString(),
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
