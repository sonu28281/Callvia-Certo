import { ServiceCode } from '@callvia-certo/types';

// Default Platform Prices (in USD)
export const DEFAULT_PRICES: Record<ServiceCode, number> = {
  // KYC Services
  [ServiceCode.KYC_BASIC]: 2.0,
  [ServiceCode.KYC_ENHANCED]: 5.0,
  [ServiceCode.KYC_DOCUMENT]: 3.0,
  
  // Voice Services
  [ServiceCode.VOICE_VERIFY]: 0.1, // per minute
  [ServiceCode.VOICE_CALL]: 0.08, // per minute
  [ServiceCode.VOICE_RECORDING]: 0.02, // per minute
  
  // Compliance
  [ServiceCode.COMPLIANCE_REPORT]: 10.0,
  [ServiceCode.AUDIT_EXPORT]: 5.0,
};

// Service Names (Human Readable)
export const SERVICE_NAMES: Record<ServiceCode, string> = {
  [ServiceCode.KYC_BASIC]: 'Basic KYC Verification',
  [ServiceCode.KYC_ENHANCED]: 'Enhanced KYC Verification',
  [ServiceCode.KYC_DOCUMENT]: 'Document Verification',
  [ServiceCode.VOICE_VERIFY]: 'Voice Verification',
  [ServiceCode.VOICE_CALL]: 'Voice Call',
  [ServiceCode.VOICE_RECORDING]: 'Call Recording',
  [ServiceCode.COMPLIANCE_REPORT]: 'Compliance Report',
  [ServiceCode.AUDIT_EXPORT]: 'Audit Log Export',
};
