/**
 * Centralized Error Handling Utilities
 * 
 * Reduces complexity by providing standard error responses
 * and eliminating duplicate try-catch blocks
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from './logger';

export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business logic errors
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  PRICE_NOT_CONFIGURED = 'PRICE_NOT_CONFIGURED',
  
  // KYC errors
  KYC_INITIATE_ERROR = 'KYC_INITIATE_ERROR',
  KYC_UPLOAD_ERROR = 'KYC_UPLOAD_ERROR',
  KYC_NOT_FOUND = 'KYC_NOT_FOUND',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    request_id?: string;
    timestamp: string;
  };
}

/**
 * Send standardized error response
 */
export function sendError(
  reply: FastifyReply,
  request: FastifyRequest,
  error: Error | AppError,
  defaultStatusCode: number = 500
): FastifyReply {
  const isAppError = error instanceof AppError;
  
  const statusCode = isAppError ? error.statusCode : defaultStatusCode;
  const errorCode = isAppError ? error.code : ErrorCode.INTERNAL_ERROR;
  const message = error.message || 'An unexpected error occurred';
  const details = isAppError ? error.details : undefined;

  // Log error for debugging
  logger.error({
    error: {
      code: errorCode,
      message,
      stack: error.stack,
      details,
    },
    request_id: request.id,
  }, 'Error occurred');

  const response: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
    meta: {
      request_id: request.id,
      timestamp: new Date().toISOString(),
    },
  };

  return reply.status(statusCode).send(response);
}

/**
 * Async handler wrapper to eliminate try-catch repetition
 * 
 * Usage:
 * fastify.post('/route', asyncHandler(async (request, reply) => {
 *   // Your code here - no try-catch needed!
 *   const data = await someAsyncOperation();
 *   return sendSuccess(reply, request, data);
 * }));
 */
export function asyncHandler(
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      return sendError(reply, request, error as Error);
    }
  };
}

/**
 * Common error factories for quick throwing
 */
export const errors = {
  unauthorized: (message = 'Authentication required') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'You do not have permission to perform this action') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),
  
  validation: (message: string, details?: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),
  
  missingField: (field: string) =>
    new AppError(ErrorCode.MISSING_FIELD, `Required field missing: ${field}`, 400),
  
  invalidFormat: (field: string, expected: string) =>
    new AppError(
      ErrorCode.INVALID_FORMAT,
      `Invalid format for ${field}. Expected: ${expected}`,
      400
    ),
  
  insufficientBalance: (required: number, available: number) =>
    new AppError(
      ErrorCode.INSUFFICIENT_BALANCE,
      'Insufficient wallet balance',
      402,
      { required, available, shortfall: required - available }
    ),
  
  serviceDisabled: (service: string) =>
    new AppError(
      ErrorCode.SERVICE_DISABLED,
      `Service not available: ${service}`,
      403
    ),
  
  notFound: (resource: string, id?: string) =>
    new AppError(
      ErrorCode.KYC_NOT_FOUND,
      `${resource} not found${id ? `: ${id}` : ''}`,
      404
    ),
  
  internal: (message = 'Internal server error') =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500),
};
