// KYC Provider Interface
export interface IKYCProvider {
  name: string;
  initiate(data: KYCInitiateDTO): Promise<KYCSession>;
  getStatus(sessionId: string): Promise<KYCStatus>;
  getResult(sessionId: string): Promise<KYCResult>;
}

// KYC Session
export interface KYCSession {
  session_id: string;
  provider: string;
  verification_url: string;
  expires_at: Date;
}

// KYC Status
export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

// KYC Result
export interface KYCResult {
  session_id: string;
  status: KYCStatus;
  outcome: KYCOutcome;
  risk_score?: number;
  documents?: KYCDocument[];
  biometrics?: KYCBiometrics;
  verified_at?: Date;
  metadata?: Record<string, unknown>;
}

// KYC Outcome
export enum KYCOutcome {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

// KYC Document
export interface KYCDocument {
  document_id: string;
  document_type: string;
  country: string;
  verified: boolean;
  extracted_data?: Record<string, unknown>;
}

// KYC Biometrics
export interface KYCBiometrics {
  face_match: boolean;
  liveness_check: boolean;
  confidence_score?: number;
}

// KYC Initiate DTO
export interface KYCInitiateDTO {
  end_user_id: string;
  end_user_email?: string;
  end_user_phone?: string;
  document_types: string[];
  biometric_required: boolean;
  callback_url?: string;
}
