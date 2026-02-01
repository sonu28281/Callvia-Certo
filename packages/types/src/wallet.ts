// Wallet Entity
export interface Wallet {
  wallet_id: string;
  tenant_id: string;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

// Wallet Transaction
export interface WalletTransaction {
  transaction_id: string;
  wallet_id: string;
  tenant_id: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  service_code?: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export enum WalletTransactionType {
  TOPUP = 'TOPUP',
  DEDUCTION = 'DEDUCTION',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

// Insufficient Balance Error
export interface InsufficientBalanceError {
  code: 'INSUFFICIENT_BALANCE';
  message: string;
  required: number;
  available: number;
}
