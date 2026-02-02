import type { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCode } from '@callvia-certo/types';
import { verifyIdToken } from '../config/firebase-admin.config';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Skip auth for public endpoints
  const publicEndpoints = [
    '/api/v1/kyc/inhouse/initiate',
    '/api/v1/auth/signup/reseller',
  ];
  
  // Extract path without query params
  const path = request.url.split('?')[0];
  
  if (publicEndpoints.includes(path) || path.includes('/api/v1/kyc/inhouse/') && path.includes('/upload')) {
    return; // Skip authentication
  }
  
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  try {
    // Extract and verify Firebase token
    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    // Extract user info from token
    request.user = {
      user_id: decodedToken.uid,
      tenant_id: decodedToken.tenantId || null,
      role: decodedToken.role || 'TENANT_USER',
      email: decodedToken.email || '',
    };
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return reply.status(401).send({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid or expired token',
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
