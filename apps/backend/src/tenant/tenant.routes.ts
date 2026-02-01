import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@callvia-certo/types';

export default async function tenantRoutes(fastify: FastifyInstance) {
  // Apply middleware
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);
  
  // Get current tenant info
  fastify.get('/me', async (request, reply) => {
    return {
      success: true,
      data: request.tenantContext,
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Create sub-tenant (Tenant Admin only)
  fastify.post(
    '/sub-tenants',
    {
      preHandler: [requireRole(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)],
    },
    async (request, reply) => {
      const { name, email } = request.body as { name: string; email: string };
      
      // TODO: DB Implementation
      
      return {
        success: true,
        data: {
          message: 'Sub-tenant created successfully',
          sub_tenant: {
            sub_tenant_id: `sub_${Date.now()}`,
            name,
            email,
            status: 'ACTIVE',
          },
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  );
  
  // List sub-tenants
  fastify.get('/sub-tenants', async (request, reply) => {
    // TODO: DB Implementation
    
    return {
      success: true,
      data: {
        sub_tenants: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          total_pages: 0,
        },
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Update white-label settings
  fastify.put('/white-label', async (request, reply) => {
    const settings = request.body as Record<string, unknown>;
    
    // TODO: DB Implementation
    // TODO: Upload logo/favicon to S3
    
    return {
      success: true,
      data: {
        message: 'White-label settings updated',
        settings,
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
