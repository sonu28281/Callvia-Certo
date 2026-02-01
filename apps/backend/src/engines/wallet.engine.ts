import { WalletTransactionType } from '@callvia-certo/types';
import { auditLogger } from '../services/audit-logger.service';
import { generateId } from '../utils/id-generator';

interface MockWallet {
  wallet_id: string;
  tenant_id: string;
  balance: number;
  currency: string;
}

class WalletEngine {
  // MOCK: In-memory wallet storage
  private wallets: Map<string, MockWallet> = new Map();
  
  constructor() {
    // Initialize with mock wallets
    this.wallets.set('tenant_abc', {
      wallet_id: 'wallet_1',
      tenant_id: 'tenant_abc',
      balance: 150.75,
      currency: 'USD',
    });
    
    this.wallets.set('tenant_xyz', {
      wallet_id: 'wallet_2',
      tenant_id: 'tenant_xyz',
      balance: 5.50,
      currency: 'USD',
    });
  }
  
  async getBalance(tenantId: string): Promise<number> {
    // TODO: DB Implementation
    // SELECT balance FROM wallets WHERE tenant_id = ?
    
    const wallet = this.wallets.get(tenantId);
    return wallet?.balance || 0;
  }
  
  async deduct(
    tenantId: string,
    amount: number,
    serviceCode: string,
    referenceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // TODO: DB Implementation with transaction
    // BEGIN TRANSACTION
    // SELECT balance FROM wallets WHERE tenant_id = ? FOR UPDATE
    // IF balance < amount THEN ROLLBACK
    // UPDATE wallets SET balance = balance - amount WHERE tenant_id = ?
    // INSERT INTO wallet_transactions ...
    // COMMIT
    
    const wallet = this.wallets.get(tenantId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    const previousBalance = wallet.balance;
    wallet.balance -= amount;
    
    await auditLogger.log({
      tenant_id: tenantId,
      event_type: 'WALLET_DEDUCTED' as any,
      event_result: 'ALLOWED' as any,
      actor_type: 'SYSTEM' as any,
      actor_id: 'system',
      actor_role: 'SUPER_ADMIN' as any,
      target_entity: 'wallet',
      target_id: wallet.wallet_id,
      message: `Wallet deducted: $${amount.toFixed(2)} for ${serviceCode}`,
      metadata: {
        transaction_type: WalletTransactionType.DEDUCTION,
        amount,
        currency: wallet.currency,
        service_code: serviceCode,
        reference_id: referenceId,
        previous_balance: previousBalance,
        new_balance: wallet.balance,
        ...metadata,
      },
      ip_address: '0.0.0.0',
      user_agent: 'system',
      request_id: generateId('req'),
      timestamp: new Date(),
    });
  }
  
  async topup(
    tenantId: string,
    amount: number,
    paymentId: string,
    actorId: string
  ): Promise<void> {
    // TODO: DB Implementation with transaction
    
    const wallet = this.wallets.get(tenantId);
    if (!wallet) {
      // Create wallet if it doesn't exist
      this.wallets.set(tenantId, {
        wallet_id: generateId('wallet'),
        tenant_id: tenantId,
        balance: amount,
        currency: 'USD',
      });
    } else {
      const previousBalance = wallet.balance;
      wallet.balance += amount;
      
      await auditLogger.log({
        tenant_id: tenantId,
        event_type: 'WALLET_TOPUP' as any,
        event_result: 'ALLOWED' as any,
        actor_type: 'USER' as any,
        actor_id: actorId,
        actor_role: 'TENANT_ADMIN' as any,
        target_entity: 'wallet',
        target_id: wallet.wallet_id,
        message: `Wallet topped up: $${amount.toFixed(2)}`,
        metadata: {
          transaction_type: WalletTransactionType.TOPUP,
          amount,
          currency: wallet.currency,
          payment_id: paymentId,
          previous_balance: previousBalance,
          new_balance: wallet.balance,
        },
        ip_address: '0.0.0.0',
        user_agent: 'system',
        request_id: generateId('req'),
        timestamp: new Date(),
      });
    }
  }
  
  async refund(
    tenantId: string,
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<void> {
    // TODO: DB Implementation with transaction
    
    const wallet = this.wallets.get(tenantId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    const previousBalance = wallet.balance;
    wallet.balance += amount;
    
    await auditLogger.log({
      tenant_id: tenantId,
      event_type: 'WALLET_REFUNDED' as any,
      event_result: 'ALLOWED' as any,
      actor_type: 'SYSTEM' as any,
      actor_id: 'system',
      actor_role: 'SUPER_ADMIN' as any,
      target_entity: 'wallet',
      target_id: wallet.wallet_id,
      message: `Wallet refunded: $${amount.toFixed(2)} - ${reason}`,
      metadata: {
        transaction_type: WalletTransactionType.REFUND,
        amount,
        currency: wallet.currency,
        reason,
        reference_id: referenceId,
        previous_balance: previousBalance,
        new_balance: wallet.balance,
      },
      ip_address: '0.0.0.0',
      user_agent: 'system',
      request_id: generateId('req'),
      timestamp: new Date(),
    });
  }
}

export const walletEngine = new WalletEngine();
