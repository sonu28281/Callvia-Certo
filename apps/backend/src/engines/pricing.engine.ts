import { ServiceCode } from '@callvia-certo/types';
import { DEFAULT_PRICES } from '@callvia-certo/constants';

interface ServicePricing {
  service_code: ServiceCode;
  price: number;
  currency: string;
}

class PricingEngine {
  // MOCK: In-memory pricing storage
  // tenant_id -> service_code -> price
  private tenantPrices: Map<string, Map<ServiceCode, number>> = new Map();
  
  constructor() {
    // Initialize with some custom tenant pricing
    const tenant_abc_prices = new Map<ServiceCode, number>();
    tenant_abc_prices.set(ServiceCode.KYC_BASIC, 1.50); // Custom lower price
    tenant_abc_prices.set(ServiceCode.VOICE_VERIFY, 0.08);
    this.tenantPrices.set('tenant_abc', tenant_abc_prices);
  }
  
  async getServicePrice(
    tenantId: string,
    serviceCode: ServiceCode
  ): Promise<ServicePricing | null> {
    // TODO: DB Implementation
    // 1. Check tenant-specific pricing
    // 2. Fall back to platform default
    // 3. Return null if not configured (service disabled)
    
    // Priority 1: Tenant-specific price
    const tenantPricing = this.tenantPrices.get(tenantId);
    if (tenantPricing?.has(serviceCode)) {
      return {
        service_code: serviceCode,
        price: tenantPricing.get(serviceCode)!,
        currency: 'USD',
      };
    }
    
    // Priority 2: Platform default price
    if (serviceCode in DEFAULT_PRICES) {
      return {
        service_code: serviceCode,
        price: DEFAULT_PRICES[serviceCode],
        currency: 'USD',
      };
    }
    
    // Service not configured
    return null;
  }
  
  async setTenantPrice(
    tenantId: string,
    serviceCode: ServiceCode,
    price: number,
    updatedBy: string
  ): Promise<void> {
    // TODO: DB Implementation
    // INSERT INTO service_prices (tenant_id, service_code, price, updated_by)
    // ON CONFLICT UPDATE
    
    let tenantPricing = this.tenantPrices.get(tenantId);
    if (!tenantPricing) {
      tenantPricing = new Map();
      this.tenantPrices.set(tenantId, tenantPricing);
    }
    
    tenantPricing.set(serviceCode, price);
  }
  
  async getAllPrices(tenantId: string): Promise<ServicePricing[]> {
    // TODO: DB Implementation
    // Return all prices for tenant (custom + defaults)
    
    const prices: ServicePricing[] = [];
    const tenantPricing = this.tenantPrices.get(tenantId);
    
    // Get all service codes
    for (const serviceCode of Object.values(ServiceCode)) {
      const price = await this.getServicePrice(tenantId, serviceCode);
      if (price) {
        prices.push(price);
      }
    }
    
    return prices;
  }
}

export const pricingEngine = new PricingEngine();
