import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@callvia-certo/types';
import { db } from '../config/firebase-admin.config';

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

  // Toggle tenant status (PLATFORM_ADMIN only)
  fastify.patch(
    '/:tenantId/toggle-status',
    {
      preHandler: [requireRole(UserRole.SUPER_ADMIN)],
    },
    async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };

      try {
        // Get current tenant status
        const tenantRef = db.collection('tenants').doc(tenantId);
        const tenantDoc = await tenantRef.get();

        if (!tenantDoc.exists) {
          return reply.code(404).send({
            success: false,
            error: { message: 'Tenant not found' }
          });
        }

        const currentData = tenantDoc.data();
        const currentStatus = currentData?.status || 'enabled';
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';

        // Update status
        await tenantRef.update({
          status: newStatus,
          isActive: newStatus === 'enabled',
          updatedAt: new Date()
        });

        return {
          success: true,
          data: {
            tenantId,
            status: newStatus,
            message: `Tenant ${newStatus === 'enabled' ? 'enabled' : 'disabled'} successfully`
          },
          meta: {
            request_id: request.requestId,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.error('Toggle tenant status error:', error);
        return reply.code(500).send({
          success: false,
          error: { message: error.message || 'Failed to toggle tenant status' }
        });
      }
    }
  );

  // Get all tenants (PLATFORM_ADMIN only)
  fastify.get(
    '/list',
    {
      preHandler: [requireRole(UserRole.SUPER_ADMIN)],
    },
    async (request, reply) => {
      try {
        const tenantsSnapshot = await db.collection('tenants').get();
        const tenants = tenantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }));

        return {
          success: true,
          data: {
            tenants,
            total: tenants.length
          },
          meta: {
            request_id: request.requestId,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.error('Get tenants error:', error);
        return reply.code(500).send({
          success: false,
          error: { message: error.message || 'Failed to fetch tenants' }
        });
      }
    }
  );

  // Get tenant admin (PLATFORM_ADMIN only) - for impersonation
  fastify.get(
    '/:tenantId/admin',
    {
      preHandler: [requireRole(UserRole.SUPER_ADMIN)],
    },
    async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };

      try {
        // Find the admin user for this tenant
        const usersSnapshot = await db.collection('users')
          .where('tenantId', '==', tenantId)
          .where('role', '==', 'TENANT_ADMIN')
          .limit(1)
          .get();

        if (usersSnapshot.empty) {
          return reply.code(404).send({
            success: false,
            error: { message: 'Tenant admin not found' }
          });
        }

        const adminDoc = usersSnapshot.docs[0];
        const adminData = adminDoc.data();

        return {
          success: true,
          data: {
            userId: adminDoc.id,
            email: adminData.email,
            displayName: adminData.displayName,
            tenantId: adminData.tenantId
          },
          meta: {
            request_id: request.requestId,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.error('Get tenant admin error:', error);
        return reply.code(500).send({
          success: false,
          error: { message: error.message || 'Failed to fetch tenant admin' }
        });
      }
    }
  );
}
