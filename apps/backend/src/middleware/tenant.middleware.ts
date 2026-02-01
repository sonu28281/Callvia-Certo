import type { FastifyRequest, FastifyReply } from 'fastify';
import { AccountStatus, ErrorCode } from '@callvia-certo/types';

export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Extract tenant from:
  // 1. Subdomain (e.g., acmecorp.callviacerto.com)
  // 2. X-Tenant-ID header
  // 3. JWT claim (from auth middleware)
  
  const subdomainMatch = request.hostname.match(/^([^.]+)\./);
  const subdomain = subdomainMatch ? subdomainMatch[1] : null;
  
  const tenantHeader = request.headers['x-tenant-id'] as string;
  const tenantId = request.user?.tenant_id || tenantHeader || subdomain || 'default';
  
  // TODO: DB lookup to get tenant details and validate
  // MOCK: Create mock tenant context
  request.tenantContext = {
    tenant_id: tenantId,
    tenant_name: getTenantName(tenantId),
    slug: tenantId,
    status: AccountStatus.ACTIVE,
  };
}

function getTenantName(tenantId: string): string {
  // MOCK: Map tenant IDs to names
  const names: Record<string, string> = {
    tenant_abc: 'Acme Corporation',
    tenant_xyz: 'Tech Innovators Inc',
    default: 'Default Tenant',
  };
  return names[tenantId] || 'Unknown Tenant';
}
