// API Configuration
// Using relative URLs to leverage Vite's proxy in development
// In production, set VITE_API_URL environment variable

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/v1/auth/signup/reseller`,
    SET_CLAIMS: `${API_BASE_URL}/api/v1/auth/set-claims`,
  },
  TENANTS: {
    LIST: `${API_BASE_URL}/api/v1/tenants/list`,
    TOGGLE_STATUS: (tenantId: string) => `${API_BASE_URL}/api/v1/tenants/${tenantId}/toggle-status`,
    GET_ADMIN: (tenantId: string) => `${API_BASE_URL}/api/v1/tenants/${tenantId}/admin`,
  },
  RESELLER: {
    PROFILE: `${API_BASE_URL}/api/v1/reseller/profile`,
    PRICING_TEMPLATES: `${API_BASE_URL}/api/v1/reseller/profile/pricing-templates`,
    KYC_CONFIG: `${API_BASE_URL}/api/v1/reseller/profile/kyc-config`,
    APPLY_TEMPLATE: `${API_BASE_URL}/api/v1/reseller/profile/apply-template`,
    EMAIL_CONFIG: `${API_BASE_URL}/api/v1/reseller/profile/email-config`,
  },
};
