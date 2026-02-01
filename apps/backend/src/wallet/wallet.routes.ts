import type { FastifyInstance} from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { walletEngine } from '../engines/wallet.engine';

export default async function walletRoutes(fastify: FastifyInstance) {
  // Apply middleware to all wallet routes
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', tenantMiddleware);
  
  // Get wallet balance
  fastify.get('/balance', async (request, reply) => {
    const tenantId = request.tenantContext!.tenant_id;
    const balance = await walletEngine.getBalance(tenantId);
    
    return {
      success: true,
      data: {
        balance,
        currency: 'USD',
        tenant_id: tenantId,
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Initiate wallet top-up
  fastify.post('/topup', async (request, reply) => {
    const { amount } = request.body as { amount: number };
    const tenantId = request.tenantContext!.tenant_id;
    const userId = request.user!.user_id;
    
    if (!amount || amount <= 0) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than 0',
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // TODO: Integrate payment gateway (Stripe/Razorpay)
    // MOCK: Simulate successful payment
    const mockPaymentId = `pay_${Date.now()}`;
    
    await walletEngine.topup(tenantId, amount, mockPaymentId, userId);
    
    return {
      success: true,
      data: {
        message: 'Top-up successful',
        amount,
        payment_id: mockPaymentId,
        new_balance: await walletEngine.getBalance(tenantId),
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
  
  // Get transaction history
  fastify.get('/transactions', async (request, reply) => {
    const tenantId = request.tenantContext!.tenant_id;
    
    // TODO: Query wallet transactions from database
    
    return {
      success: true,
      data: {
        transactions: [], // TODO: Implement
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          total_pages: 0,
        },
      },
      meta: {
        request_id: request.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  });
}
