import type { FastifyInstance } from 'fastify';
import { auditLogger } from '../services/audit-logger.service';
import { AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';

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
}
