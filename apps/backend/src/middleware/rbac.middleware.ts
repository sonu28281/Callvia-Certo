import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole, ErrorCode } from '@callvia-certo/types';
import { auditLogger } from '../services/audit-logger.service';
import { AuditEventType, AuditEventResult, ActorType } from '@callvia-certo/types';

export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
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
    
    const userRole = request.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      await auditLogger.log({
        tenant_id: request.user.tenant_id,
        event_type: AuditEventType.PERMISSION_DENIED,
        event_result: AuditEventResult.BLOCKED,
        actor_id: request.user.user_id,
        actor_role: userRole,
        actor_type: ActorType.USER,
        target_entity: 'endpoint',
        target_id: request.url,
        message: `Access denied: ${userRole} attempted to access ${request.url}`,
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] || '',
        request_id: request.requestId,
        timestamp: new Date(),
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: ErrorCode.FORBIDDEN,
          message: 'Insufficient permissions',
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}
