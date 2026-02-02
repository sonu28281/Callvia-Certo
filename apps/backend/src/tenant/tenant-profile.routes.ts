import { FastifyInstance } from 'fastify';
import { tenantProfileService, KYCMethod } from './tenant-profile.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

/**
 * Tenant Profile Management Routes
 * Allows tenants to view and update their KYC configuration
 */
export async function tenantProfileRoutes(fastify: FastifyInstance) {
  // TODO: Enable auth middleware in production
  // fastify.addHook('preHandler', authMiddleware);
  // fastify.addHook('preHandler', tenantMiddleware);

  /**
   * GET /api/v1/reseller/profile
   * Get current tenant profile with KYC configuration
   */
  fastify.get('/profile', async (_request, reply) => {
    try {
      // TODO: Get tenantId from auth token
      const tenantId = 'tenant_test_001';

      let profile = tenantProfileService.getProfile(tenantId);
      
      // Auto-create default profile if not exists
      if (!profile) {
        console.log('⚠️ No tenant profile found, creating default...');
        profile = tenantProfileService.createProfile(
          tenantId,
          'Test Company',
          { templateId: 'standard-digilocker-liveness' }
        );
      }

      return {
        success: true,
        data: {
          tenantId: profile.tenantId,
          companyName: profile.companyName,
          kycConfig: {
            methods: profile.kycConfig.methods,
            allowOverrides: profile.kycConfig.allowOverrides,
            methodNames: profile.kycConfig.methods.map(m => 
              tenantProfileService.getMethodDisplayName(m)
            )
          },
          pricing: {
            totalPrice: profile.pricing.totalPrice,
            breakdown: profile.pricing.perMethodPricing
          },
          emailConfig: profile.emailConfig,
          marketSegment: profile.marketSegment,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      };
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/v1/reseller/profile/kyc-config
   * Update tenant KYC configuration
   */
  fastify.put('/profile/kyc-config', async (request, reply) => {
    try {
      const { methods, allowOverrides } = request.body as {
        methods: KYCMethod[];
        allowOverrides?: boolean;
      };

      // TODO: Get tenantId from auth token
      const tenantId = 'tenant_test_001';

      // Validate methods array
      if (!Array.isArray(methods) || methods.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'At least one KYC method is required'
        });
      }

      // Update configuration
      const updatedProfile = tenantProfileService.updateKYCConfig(
        tenantId,
        methods,
        allowOverrides
      );

      return {
        success: true,
        data: {
          message: 'KYC configuration updated successfully',
          kycConfig: {
            methods: updatedProfile.kycConfig.methods,
            allowOverrides: updatedProfile.kycConfig.allowOverrides,
            methodNames: updatedProfile.kycConfig.methods.map(m => 
              tenantProfileService.getMethodDisplayName(m)
            )
          },
          pricing: {
            totalPrice: updatedProfile.pricing.totalPrice,
            breakdown: updatedProfile.pricing.perMethodPricing
          }
        }
      };
    } catch (error: any) {
      console.error('❌ Error updating KYC config:', error);
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/v1/reseller/profile/pricing-templates
   * Get available pricing templates
   */
  fastify.get('/profile/pricing-templates', async (_request, reply) => {
    try {
      const templates = tenantProfileService.getPricingTemplates();

      return {
        success: true,
        data: {
          templates: templates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            methods: t.methods,
            methodNames: t.methods.map(m => 
              tenantProfileService.getMethodDisplayName(m)
            ),
            price: t.totalPrice,
            breakdown: t.perMethodPricing
          }))
        }
      };
    } catch (error: any) {
      console.error('❌ Error fetching templates:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/reseller/profile/apply-template
   * Apply a pricing template to tenant
   */
  fastify.post('/profile/apply-template', async (request, reply) => {
    try {
      const { templateId } = request.body as { templateId: string };

      if (!templateId) {
        return reply.status(400).send({
          success: false,
          error: 'Template ID is required'
        });
      }

      const template = tenantProfileService.getTemplate(templateId);
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found'
        });
      }

      // TODO: Get tenantId from auth token
      const tenantId = 'tenant_test_001';

      // Apply template methods to tenant
      const updatedProfile = tenantProfileService.updateKYCConfig(
        tenantId,
        template.methods
      );

      return {
        success: true,
        data: {
          message: 'Template applied successfully',
          template: {
            name: template.name,
            methods: template.methods
          },
          kycConfig: {
            methods: updatedProfile.kycConfig.methods,
            methodNames: updatedProfile.kycConfig.methods.map(m => 
              tenantProfileService.getMethodDisplayName(m)
            )
          },
          pricing: {
            totalPrice: updatedProfile.pricing.totalPrice,
            breakdown: updatedProfile.pricing.perMethodPricing
          }
        }
      };
    } catch (error: any) {
      console.error('❌ Error applying template:', error);
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/v1/reseller/profile/email-config
   * Update email template configuration
   */
  fastify.put('/profile/email-config', async (request, reply) => {
    try {
      const { brandColor, logo, customMessage } = request.body as {
        brandColor?: string;
        logo?: string;
        customMessage?: string;
      };

      // TODO: Get tenantId from auth token
      const tenantId = 'tenant_test_001';

      const updatedProfile = tenantProfileService.updateEmailConfig(tenantId, {
        brandColor,
        logo,
        customMessage
      });

      return {
        success: true,
        data: {
          message: 'Email configuration updated successfully',
          emailConfig: updatedProfile.emailConfig
        }
      };
    } catch (error: any) {
      console.error('❌ Error updating email config:', error);
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });
}
