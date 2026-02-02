import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { registerRoutes } from './routes';

// Extend Fastify Request type to include custom properties
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      user_id: string;
      tenant_id: string;
      sub_tenant_id?: string;
      role: string;
      email: string;
    };
    tenantContext?: {
      tenant_id: string;
      tenant_name: string;
      slug: string;
      status: string;
    };
    servicePricing?: {
      service_code: string;
      price: number;
      currency: string;
    };
    requestId: string;
  }
}

async function buildServer() {
  const fastify = Fastify({
    logger,
    genReqId: () => crypto.randomUUID(),
  });

  // Register plugins
  await fastify.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://callvia-certo.netlify.app'
    ],
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  // Register API routes
  await registerRoutes(fastify);

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    const statusCode = error.statusCode || 500;
    
    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();
    
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    
    fastify.log.info(`Server listening on port ${config.port}`);
    fastify.log.info(`Environment: ${config.env}`);
    fastify.log.info(`Mock Mode: ${config.mockMode ? 'ENABLED' : 'DISABLED'}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
