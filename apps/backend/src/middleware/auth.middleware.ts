import type { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCode } from '@callvia-certo/types';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // TODO: Verify JWT token from Authorization header
  // TODO: Extract user_id, tenant_id, role from token
  // TODO: Validate token expiration
  
  // MOCK: For development, attach mock user
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  // MOCK: Parse mock token (format: "Bearer <user_id>:<tenant_id>:<role>")
  const token = authHeader.substring(7);
  const parts = token.split(':');
  
  if (parts.length === 3) {
    request.user = {
      user_id: parts[0],
      tenant_id: parts[1],
      role: parts[2],
      email: `${parts[0]}@example.com`,
    };
  } else {
    // Default mock user
    request.user = {
      user_id: 'user_123',
      tenant_id: 'tenant_abc',
      role: 'TENANT_ADMIN',
      email: 'admin@tenant.com',
    };
  }
}
