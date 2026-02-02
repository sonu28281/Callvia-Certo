/**
 * Standardized API Response Formatter
 * 
 * Ensures consistent response structure across all endpoints
 * Reduces code duplication in route handlers
 */

import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta: {
    request_id?: string;
    timestamp: string;
  };
}

/**
 * Send standardized success response
 */
export function sendSuccess<T = any>(
  reply: FastifyReply,
  request: FastifyRequest,
  data: T,
  statusCode: number = 200
): FastifyReply {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      request_id: request.id,
      timestamp: new Date().toISOString(),
    },
  };

  return reply.status(statusCode).send(response);
}

/**
 * Send paginated response
 */
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    request_id?: string;
    timestamp: string;
  };
}

export function sendPaginated<T = any>(
  reply: FastifyReply,
  request: FastifyRequest,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): FastifyReply {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
    meta: {
      request_id: request.id,
      timestamp: new Date().toISOString(),
    },
  };

  return reply.status(200).send(response);
}

/**
 * Send created resource response (201)
 */
export function sendCreated<T = any>(
  reply: FastifyReply,
  request: FastifyRequest,
  data: T
): FastifyReply {
  return sendSuccess(reply, request, data, 201);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(reply: FastifyReply): FastifyReply {
  return reply.status(204).send();
}
