import type { FastifyInstance } from 'fastify';

export async function registerRoutes(fastify: FastifyInstance) {
  // API v1 prefix
  await fastify.register(async (api) => {
    // Auth routes
    await api.register((await import('./auth/auth.routes')).default, {
      prefix: '/auth',
    });
    
    // Wallet routes
    await api.register((await import('./wallet/wallet.routes')).default, {
      prefix: '/wallet',
    });
    
    // Tenant routes
    await api.register((await import('./tenant/tenant.routes')).default, {
      prefix: '/tenants',
    });
    
    // KYC routes
    await api.register((await import('./kyc/kyc.routes')).default, {
      prefix: '/kyc',
    });
    
    // Voice routes
    await api.register((await import('./voice/voice.routes')).default, {
      prefix: '/voice',
    });
    
    // Audit routes
    await api.register((await import('./audit/audit.routes')).default, {
      prefix: '/audit',
    });
  }, { prefix: '/api/v1' });
}
