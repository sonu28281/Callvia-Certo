import { ErrorCode } from '@callvia-certo/types';

// Error Messages
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.FORBIDDEN]: 'Insufficient permissions',
  [ErrorCode.INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCode.TOKEN_EXPIRED]: 'Authentication token expired',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  
  // Account
  [ErrorCode.ACCOUNT_DISABLED]: 'Account is disabled',
  [ErrorCode.ACCOUNT_SUSPENDED]: 'Account is suspended',
  [ErrorCode.TENANT_NOT_FOUND]: 'Tenant not found',
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  
  // Billing
  [ErrorCode.INSUFFICIENT_BALANCE]: 'Wallet balance insufficient',
  [ErrorCode.WALLET_NOT_FOUND]: 'Wallet not found',
  [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed',
  [ErrorCode.INVALID_AMOUNT]: 'Invalid amount provided',
  
  // Service
  [ErrorCode.SERVICE_DISABLED]: 'Service is not available for your account',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCode.PRICE_NOT_CONFIGURED]: 'Service pricing not configured',
  
  // Validation
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field missing',
  
  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  
  // System
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.DATABASE_ERROR]: 'Database operation failed',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
};
