import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { auditLogger } from '../services/audit-logger.service';
import { AuditEventType, AuditEventResult } from '@callvia-certo/types';

export default async function auditRoutes(fastify: FastifyInstance) {
  // Apply middleware
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);
  
  // Query audit logs
  fastify.get('/logs', async (request, reply) => {
    const tenantId = request.tenantContext!.tenant_id;
    const query = request.query as {
      event_type?: string;
      start_date?: string;
      end_date?: string;
      limit?: string;
      offset?: string;
    };
    
    const logs = await auditLogger.query({
      tenant_id: tenantId,
      event_types: query.event_type
        ? ([query.event_type] as AuditEventType[])
        : undefined,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
      limit: query.limit ? parseInt(query.limit) : 50,
      offset: query.offset ? parseInt(query.offset) : 0,
    });
    
    const total = await auditLogger.count({
      tenant_id: tenantId,
      event_types: query.event_type
        ? ([query.event_type] as AuditEventType[])
        : undefined,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
    });
    
    return {
      success: true,
      data: {
        logs,
        pagination: {
          page: Math.floor((parseInt(query.offset || '0') / 50) + 1),
          limit: parseInt(query.limit || '50'),
          total,
          total_pages: Math.ceil(total / parseInt(query.limit || '50')),
        },
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Export audit logs (mock)
  fastify.post('/export', async (request, reply) => {
    const tenantId = request.tenantContext!.tenant_id;
    
    // TODO: Generate CSV/JSON export
    // TODO: Store in S3 and return signed URL
    
    return {
      success: true,
      data: {
        message: 'Export initiated',
        download_url: `https://mock-exports.s3.amazonaws.com/${tenantId}_audit_${Date.now()}.csv`,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
