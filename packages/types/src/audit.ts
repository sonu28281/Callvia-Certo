import { UserRole } from './user';

// Audit Log Event Types
export enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // Account Control
  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_UPDATED = 'TENANT_UPDATED',
  TENANT_DISABLED = 'TENANT_DISABLED',
  TENANT_ENABLED = 'TENANT_ENABLED',
  
  SUB_TENANT_CREATED = 'SUB_TENANT_CREATED',
  SUB_TENANT_DISABLED = 'SUB_TENANT_DISABLED',
  SUB_TENANT_ENABLED = 'SUB_TENANT_ENABLED',
  
  USER_CREATED = 'USER_CREATED',
  USER_DISABLED = 'USER_DISABLED',
  USER_ENABLED = 'USER_ENABLED',
  USER_INVITED = 'USER_INVITED',
  
  // Billing
  WALLET_TOPUP = 'WALLET_TOPUP',
  WALLET_DEDUCTED = 'WALLET_DEDUCTED',
  WALLET_REFUNDED = 'WALLET_REFUNDED',
  WALLET_INSUFFICIENT = 'WALLET_INSUFFICIENT',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Service Usage
  KYC_STARTED = 'KYC_STARTED',
  KYC_BLOCKED = 'KYC_BLOCKED',
  KYC_COMPLETED = 'KYC_COMPLETED',
  KYC_FAILED = 'KYC_FAILED',
  
  VOICE_CALL_STARTED = 'VOICE_CALL_STARTED',
  VOICE_CALL_ENDED = 'VOICE_CALL_ENDED',
  VOICE_CALL_FAILED = 'VOICE_CALL_FAILED',
  VOICE_CALL_BLOCKED = 'VOICE_CALL_BLOCKED',
  
  COMPLIANCE_FILE_GENERATED = 'COMPLIANCE_FILE_GENERATED',
  COMPLIANCE_FILE_DOWNLOADED = 'COMPLIANCE_FILE_DOWNLOADED',
  
  // Admin Actions
  PRICE_CHANGED = 'PRICE_CHANGED',
  SERVICE_ENABLED = 'SERVICE_ENABLED',
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  FEATURE_FLAG_TOGGLED = 'FEATURE_FLAG_TOGGLED',
  
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_ROTATED = 'API_KEY_ROTATED',
  
  WHITE_LABEL_UPDATED = 'WHITE_LABEL_UPDATED',
  
  // Security
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  IP_BLOCKED = 'IP_BLOCKED',
  
  // Data Privacy
  DATA_EXPORT_REQUESTED = 'DATA_EXPORT_REQUESTED',
  DATA_EXPORT_COMPLETED = 'DATA_EXPORT_COMPLETED',
  DATA_DELETION_REQUESTED = 'DATA_DELETION_REQUESTED',
  DATA_DELETION_COMPLETED = 'DATA_DELETION_COMPLETED',
}

// Event Result
export enum AuditEventResult {
  ALLOWED = 'ALLOWED',
  BLOCKED = 'BLOCKED',
  FAILED = 'FAILED',
}

// Event Category
export enum AuditEventCategory {
  AUTH = 'AUTH',
  ACCOUNT = 'ACCOUNT',
  BILLING = 'BILLING',
  SERVICE = 'SERVICE',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  PRIVACY = 'PRIVACY',
}

// Actor Type
export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  API_KEY = 'API_KEY',
}

// Audit Log Entry
export interface AuditLog {
  // Identity
  log_id: string;
  tenant_id: string;
  sub_tenant_id?: string;
  
  // Event
  event_type: AuditEventType;
  event_result: AuditEventResult;
  event_category: AuditEventCategory;
  
  // Actor
  actor_id: string;
  actor_role: UserRole;
  actor_type: ActorType;
  
  // Target
  target_entity: string;
  target_id: string;
  
  // Context
  reason_code?: string;
  message: string;
  metadata?: Record<string, unknown>;
  
  // Request
  ip_address: string;
  user_agent: string;
  request_id: string;
  
  // Timing
  timestamp: Date;
  duration_ms?: number;
}

// Audit Log Filters
export interface AuditLogFilters {
  tenant_id: string;
  start_date?: Date;
  end_date?: Date;
  event_types?: AuditEventType[];
  event_results?: AuditEventResult[];
  actor_id?: string;
  target_entity?: string;
  limit?: number;
  offset?: number;
}
