// Core User Roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SUB_TENANT_ADMIN = 'SUB_TENANT_ADMIN',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

// Account Status
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  SUSPENDED = 'SUSPENDED',
}

// User Entity
export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  sub_tenant_id?: string;
  status: AccountStatus;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  disabled_at?: Date;
  disabled_by?: string;
  disabled_reason?: string;
}

// User in Request Context
export interface RequestUser {
  user_id: string;
  tenant_id: string;
  sub_tenant_id?: string;
  role: UserRole;
  email: string;
}
