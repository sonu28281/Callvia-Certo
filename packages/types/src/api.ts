// Standard API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: ResponseMeta;
}

// API Error
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// Response Metadata
export interface ResponseMeta {
  request_id: string;
  timestamp: string;
  duration_ms?: number;
}

// Error Codes
export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Account
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  
  // Billing
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  
  // Service
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  PRICE_NOT_CONFIGURED = 'PRICE_NOT_CONFIGURED',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
