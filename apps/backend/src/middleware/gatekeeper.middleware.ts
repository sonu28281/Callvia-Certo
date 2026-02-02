import type { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCode, ServiceCode, AuditEventResult, ActorType } from '@callvia-certo/types';
import { accountStatusEngine } from '../engines/account-status.engine';
import { walletEngine } from '../engines/wallet.engine';
import { pricingEngine } from '../engines/pricing.engine';
import { auditLogger } from '../services/audit-logger.service';

export function serviceGatekeeper(serviceCode: ServiceCode | string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !request.tenantContext) {
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
    
    const { user, tenantContext } = request;
    const tenantId = tenantContext.tenant_id;
    
    // 1. Check account status
    const isActive = await accountStatusEngine.checkStatus(tenantId, 'TENANT');
    
    if (!isActive) {
      await auditLogger.log({
        tenant_id: tenantId,
        event_type: `${serviceCode}_BLOCKED` as any,
        event_result: AuditEventResult.BLOCKED,
        actor_id: user.user_id,
        actor_role: user.role as any,
        actor_type: ActorType.USER,
        target_entity: 'service',
        target_id: serviceCode,
        reason_code: ErrorCode.ACCOUNT_DISABLED,
        message: 'Service blocked: Account is disabled',
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] || '',
        request_id: request.requestId,
        timestamp: new Date(),
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: ErrorCode.ACCOUNT_DISABLED,
          message: 'Account is disabled',
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // 2. Check pricing configuration
    const pricing = await pricingEngine.getServicePrice(tenantId, serviceCode as any);
    
    if (!pricing) {
      await auditLogger.log({
        tenant_id: tenantId,
        event_type: `${serviceCode}_BLOCKED` as any,
        event_result: AuditEventResult.BLOCKED,
        actor_id: user.user_id,
        actor_role: user.role as any,
        actor_type: ActorType.USER,
        target_entity: 'service',
        target_id: serviceCode,
        reason_code: ErrorCode.PRICE_NOT_CONFIGURED,
        message: 'Service blocked: Pricing not configured',
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] || '',
        request_id: request.requestId,
        timestamp: new Date(),
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: ErrorCode.SERVICE_DISABLED,
          message: 'Service not available for your account',
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // 3. Check wallet balance
    const balance = await walletEngine.getBalance(tenantId);
    
    if (balance < pricing.price) {
      await auditLogger.log({
        tenant_id: tenantId,
        event_type: 'WALLET_INSUFFICIENT' as any,
        event_result: AuditEventResult.BLOCKED,
        actor_id: user.user_id,
        actor_role: user.role as any,
        actor_type: ActorType.USER,
        target_entity: 'service',
        target_id: serviceCode,
        reason_code: ErrorCode.INSUFFICIENT_BALANCE,
        message: 'Service blocked: Insufficient wallet balance',
        metadata: {
          required: pricing.price,
          available: balance,
          service_code: serviceCode,
        },
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] || '',
        request_id: request.requestId,
        timestamp: new Date(),
      });
      
      return reply.status(402).send({
        success: false,
        error: {
          code: ErrorCode.INSUFFICIENT_BALANCE,
          message: 'Wallet balance too low',
          details: {
            required: pricing.price,
            available: balance,
            currency: pricing.currency,
          },
        },
        meta: {
          request_id: request.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // Attach pricing to request for later deduction
    request.servicePricing = {
      service_code: serviceCode,
      price: pricing.price,
      currency: pricing.currency,
    };
  };
}
