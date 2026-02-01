import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { serviceGatekeeper } from '../middleware/gatekeeper.middleware';
import { ServiceCode, CallStatus, AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';
import { walletEngine } from '../engines/wallet.engine';
import { auditLogger } from '../services/audit-logger.service';
import { generateId } from '../utils/id-generator';

export default async function voiceRoutes(fastify: FastifyInstance) {
  // Apply middleware
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);
  
  // Initiate voice call
  fastify.post(
    '/call',
    {
      preHandler: [serviceGatekeeper(ServiceCode.VOICE_CALL)],
    },
    async (request, reply) => {
      const { to_phone, script, record } = request.body as {
        to_phone: string;
        script?: string;
        record: boolean;
      };
      
      const tenantId = request.tenantContext!.tenant_id;
      const servicePricing = request.servicePricing!;
      
      // TODO: Call Voice provider (Twilio, Vonage, etc.)
      // MOCK: Create mock call session
      const callId = generateId('call');
      
      // Deduct initial amount (estimate for 1 minute)
      await walletEngine.deduct(
        tenantId,
        servicePricing.price,
        ServiceCode.VOICE_CALL,
        callId,
        { estimated_duration: 60 }
      );
      
      await auditLogger.log({
        tenant_id: tenantId,
        event_type: AuditEventType.VOICE_CALL_STARTED,
        event_result: AuditEventResult.ALLOWED,
        actor_id: request.user!.user_id,
        actor_role: request.user!.role as any,
        actor_type: ActorType.USER,
        target_entity: 'voice_call',
        target_id: callId,
        message: `Voice call initiated to ${to_phone}`,
        metadata: {
          to_phone,
          record,
          script: script?.substring(0, 50),
        },
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] || '',
        request_id: request.requestId,
        timestamp: new Date(),
      });
      
      return {
        success: true,
        data: {
          call_id: callId,
          status: CallStatus.INITIATED,
          to_phone,
          started_at: new Date().toISOString(),
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
  
  // Get call status
  fastify.get('/:callId/status', async (request, reply) => {
    const { callId } = request.params as { callId: string };
    
    // TODO: Query voice provider for status
    
    return {
      success: true,
      data: {
        call_id: callId,
        status: CallStatus.COMPLETED,
        started_at: new Date(Date.now() - 120000).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: 120,
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Get call recording
  fastify.get('/:callId/recording', async (request, reply) => {
    const { callId } = request.params as { callId: string };
    
    // TODO: Get recording URL from S3
    
    return {
      success: true,
      data: {
        call_id: callId,
        recording_url: `https://mock-recordings.s3.amazonaws.com/${callId}.mp3`,
        duration_seconds: 120,
        transcript: 'Mock transcript of the call...',
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
