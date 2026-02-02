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
    
    // Tenant Profile routes (KYC configuration)
    await api.register((await import('./tenant/tenant-profile.routes')).tenantProfileRoutes, {
      prefix: '/reseller',
    });
    
    // KYC routes (mock)
    await api.register((await import('./kyc/kyc.routes')).default, {
      prefix: '/kyc',
    });
    
    // Real KYC routes (Onfido - Third Party)
    await api.register((await import('./kyc/real-kyc.routes')).realKycRoutes, {
      prefix: '/kyc/real',
    });
    
    // In-House KYC routes (No Third Party!)
    await api.register((await import('./kyc/inhouse-kyc.routes')).inHouseKycRoutes, {
      prefix: '/kyc/inhouse',
    });
    
    // Digital KYC routes (DigiLocker, Aadhaar OTP)
    await api.register((await import('./kyc/digital-kyc.routes')).default, {
      prefix: '/kyc',
    });
    
    // Liveness Detection routes
    await api.register((await import('./kyc/liveness.routes')).default, {
      prefix: '/kyc/liveness',
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
