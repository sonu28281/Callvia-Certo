import { AccountStatus } from './user';

// Tenant Entity
export interface Tenant {
  tenant_id: string;
  tenant_name: string;
  slug: string; // For subdomain
  status: AccountStatus;
  parent_tenant_id?: string; // For sub-tenants
  created_at: Date;
  updated_at: Date;
  disabled_at?: Date;
  disabled_by?: string;
  disabled_reason?: string;
}

// White-Label Settings
export interface WhiteLabelSettings {
  tenant_id: string;
  brand_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_domain?: string;
  email_from_name?: string;
  email_from_address?: string;
  terms_url?: string;
  privacy_url?: string;
}

// Tenant Context (attached to requests)
export interface TenantContext {
  tenant_id: string;
  tenant_name: string;
  slug: string;
  status: AccountStatus;
  parent_tenant_id?: string;
  white_label?: WhiteLabelSettings;
}
