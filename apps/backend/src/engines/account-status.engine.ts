import { AccountStatus } from '@callvia-certo/types';

interface EntityStatus {
  status: AccountStatus;
  parent_id?: string;
  parent_type?: string;
}

class AccountStatusEngine {
  // MOCK: In-memory storage
  private entities: Map<string, EntityStatus> = new Map();
  
  constructor() {
    // Initialize with mock data
    this.entities.set('tenant_abc', {
      status: AccountStatus.ACTIVE,
    });
    
    this.entities.set('tenant_xyz', {
      status: AccountStatus.DISABLED,
    });
    
    this.entities.set('sub_tenant_123', {
      status: AccountStatus.ACTIVE,
      parent_id: 'tenant_abc',
      parent_type: 'TENANT',
    });
  }
  
  async checkStatus(entityId: string, entityType: string): Promise<boolean> {
    // TODO: DB Implementation
    // Query entity and check:
    // 1. Own status
    // 2. Parent status (cascade up the hierarchy)
    
    const entity = this.entities.get(entityId);
    
    if (!entity) {
      // Entity not found, assume active for mock
      return true;
    }
    
    if (entity.status !== AccountStatus.ACTIVE) {
      return false;
    }
    
    // Check parent cascade
    if (entity.parent_id && entity.parent_type) {
      return this.checkStatus(entity.parent_id, entity.parent_type);
    }
    
    return true;
  }
  
  async disable(
    entityId: string,
    entityType: string,
    disabledBy: string,
    reason?: string
  ): Promise<void> {
    // TODO: DB Implementation
    // 1. Update entity status to DISABLED
    // 2. Record disabled_at, disabled_by, disabled_reason
    // 3. Cascade to children (optional: mark children as parent_disabled)
    
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.status = AccountStatus.DISABLED;
    }
  }
  
  async enable(entityId: string, entityType: string): Promise<void> {
    // TODO: DB Implementation
    // 1. Update entity status to ACTIVE
    // 2. Clear disabled_at, disabled_by, disabled_reason
    
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.status = AccountStatus.ACTIVE;
    }
  }
}

export const accountStatusEngine = new AccountStatusEngine();
