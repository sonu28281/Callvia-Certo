// Service Pricing
export interface ServicePrice {
  price_id: string;
  tenant_id?: string; // null = platform default
  service_code: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
}

// Service Codes
export enum ServiceCode {
  // KYC Services
  KYC_BASIC = 'KYC_BASIC',
  KYC_ENHANCED = 'KYC_ENHANCED',
  KYC_DOCUMENT = 'KYC_DOCUMENT',
  
  // Voice Services
  VOICE_VERIFY = 'VOICE_VERIFY',
  VOICE_CALL = 'VOICE_CALL',
  VOICE_RECORDING = 'VOICE_RECORDING',
  
  // Compliance
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  AUDIT_EXPORT = 'AUDIT_EXPORT',
}
