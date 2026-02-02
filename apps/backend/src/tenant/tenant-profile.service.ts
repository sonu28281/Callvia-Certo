

// Types
export type KYCMethod = 
  | 'digilocker'
  | 'liveness'
  | 'aadhaar_otp'
  | 'passport'
  | 'document_upload'
  | 'video_kyc'
  | 'digital_contract';

export interface KYCMethodPricing {
  digilocker: number;
  liveness: number;
  aadhaar_otp: number;
  passport: number;
  document_upload: number;
  video_kyc: number;
  digital_contract: number;
}

export interface TenantKYCConfig {
  methods: KYCMethod[];
  isCustomizable: boolean;
  allowOverrides: boolean;
}

export interface TenantPricing {
  basePrice: number;
  perMethodPricing: Partial<KYCMethodPricing>;
  totalPrice: number;
}

export interface TenantEmailConfig {
  templateType: 'minimal' | 'standard' | 'complete';
  brandColor?: string;
  logo?: string;
  customMessage?: string;
}

export interface TenantProfile {
  tenantId: string;
  companyName: string;
  kycConfig: TenantKYCConfig;
  pricing: TenantPricing;
  emailConfig: TenantEmailConfig;
  marketSegment: 'basic' | 'standard' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  methods: KYCMethod[];
  basePrice: number;
  perMethodPricing: Partial<KYCMethodPricing>;
  totalPrice: number;
  isActive: boolean;
}

// Default pricing per method (in ₹)
const DEFAULT_METHOD_PRICING: KYCMethodPricing = {
  digilocker: 1.00,
  liveness: 1.50,
  aadhaar_otp: 3.50,
  passport: 2.00,
  document_upload: 1.00,
  video_kyc: 15.00,
  digital_contract: 2.00
};

// Pre-configured pricing templates
const PRICING_TEMPLATES: PricingTemplate[] = [
  {
    id: 'basic-digilocker',
    name: 'Basic - DigiLocker Only',
    description: 'Government document verification',
    methods: ['digilocker'],
    basePrice: 1.00,
    perMethodPricing: { digilocker: 1.00 },
    totalPrice: 1.00,
    isActive: true
  },
  {
    id: 'standard-digilocker-liveness',
    name: 'Standard - DigiLocker + Liveness',
    description: 'Document + Face verification',
    methods: ['digilocker', 'liveness'],
    basePrice: 2.50,
    perMethodPricing: { digilocker: 1.00, liveness: 1.50 },
    totalPrice: 2.50,
    isActive: true
  },
  {
    id: 'premium-passport',
    name: 'Premium - Passport KYC',
    description: 'International document verification',
    methods: ['passport', 'document_upload'],
    basePrice: 3.00,
    perMethodPricing: { passport: 2.00, document_upload: 1.00 },
    totalPrice: 3.00,
    isActive: true
  },
  {
    id: 'enterprise-full-stack',
    name: 'Enterprise - Full Stack',
    description: 'Complete verification + Contracts',
    methods: ['digital_contract', 'digilocker', 'document_upload', 'liveness'],
    basePrice: 5.00,
    perMethodPricing: {
      digital_contract: 2.00,
      digilocker: 1.00,
      document_upload: 0.50,
      liveness: 1.50
    },
    totalPrice: 5.00,
    isActive: true
  }
];

class TenantProfileService {
  // In-memory storage (will be replaced with PostgreSQL)
  private profiles: Map<string, TenantProfile> = new Map();

  /**
   * Create tenant profile with KYC configuration
   */
  createProfile(
    tenantId: string,
    companyName: string,
    options: {
      templateId?: string;
      customMethods?: KYCMethod[];
      marketSegment?: 'basic' | 'standard' | 'premium' | 'enterprise';
      allowOverrides?: boolean;
    }
  ): TenantProfile {
    let methods: KYCMethod[];
    let pricing: TenantPricing;

    // Use template or custom methods
    if (options.templateId) {
      const template = PRICING_TEMPLATES.find(t => t.id === options.templateId);
      if (!template) {
        throw new Error('Invalid pricing template ID');
      }
      methods = template.methods;
      pricing = {
        basePrice: template.basePrice,
        perMethodPricing: template.perMethodPricing,
        totalPrice: template.totalPrice
      };
    } else if (options.customMethods) {
      methods = options.customMethods;
      pricing = this.calculatePricing(methods);
    } else {
      // Default: Standard package
      const template = PRICING_TEMPLATES.find(t => t.id === 'standard-digilocker-liveness')!;
      methods = template.methods;
      pricing = {
        basePrice: template.basePrice,
        perMethodPricing: template.perMethodPricing,
        totalPrice: template.totalPrice
      };
    }

    // Validate method combination
    this.validateMethodCombination(methods);

    // Determine template type based on method count
    const templateType = methods.length === 1 ? 'minimal' :
                        methods.length <= 3 ? 'standard' : 'complete';

    const profile: TenantProfile = {
      tenantId,
      companyName,
      kycConfig: {
        methods,
        isCustomizable: true,
        allowOverrides: options.allowOverrides ?? false
      },
      pricing,
      emailConfig: {
        templateType,
        brandColor: '#3B82F6',
        customMessage: undefined
      },
      marketSegment: options.marketSegment || 'standard',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.profiles.set(tenantId, profile);
    
    console.log(`✅ Tenant profile created: ${companyName}`);
    console.log(`   Methods: ${methods.join(', ')}`);
    console.log(`   Total Price: ₹${pricing.totalPrice.toFixed(2)}`);

    return profile;
  }

  /**
   * Get tenant profile
   */
  getProfile(tenantId: string): TenantProfile | null {
    return this.profiles.get(tenantId) || null;
  }

  /**
   * Update tenant KYC configuration
   */
  updateKYCConfig(
    tenantId: string,
    methods: KYCMethod[],
    allowOverrides?: boolean
  ): TenantProfile {
    const profile = this.profiles.get(tenantId);
    if (!profile) {
      throw new Error('Tenant profile not found');
    }

    // Validate method combination
    this.validateMethodCombination(methods);

    // Recalculate pricing
    const newPricing = this.calculatePricing(methods);

    // Update template type
    const templateType = methods.length === 1 ? 'minimal' :
                        methods.length <= 3 ? 'standard' : 'complete';

    profile.kycConfig.methods = methods;
    if (allowOverrides !== undefined) {
      profile.kycConfig.allowOverrides = allowOverrides;
    }
    profile.pricing = newPricing;
    profile.emailConfig.templateType = templateType;
    profile.updatedAt = new Date();

    this.profiles.set(tenantId, profile);

    console.log(`✅ Tenant KYC config updated: ${profile.companyName}`);
    console.log(`   New Methods: ${methods.join(', ')}`);
    console.log(`   New Price: ₹${newPricing.totalPrice.toFixed(2)}`);

    return profile;
  }

  /**
   * Calculate pricing based on selected methods
   */
  calculatePricing(methods: KYCMethod[]): TenantPricing {
    const perMethodPricing: Partial<KYCMethodPricing> = {};
    let totalPrice = 0;

    methods.forEach(method => {
      const price = DEFAULT_METHOD_PRICING[method];
      perMethodPricing[method] = price;
      totalPrice += price;
    });

    // Round to 2 decimals
    totalPrice = Math.round(totalPrice * 100) / 100;

    return {
      basePrice: totalPrice,
      perMethodPricing,
      totalPrice
    };
  }

  /**
   * Validate method combination
   */
  private validateMethodCombination(methods: KYCMethod[]): void {
    // At least one method required
    if (methods.length === 0) {
      throw new Error('At least one KYC method is required');
    }

    // Passport and DigiLocker are mutually exclusive
    if (methods.includes('passport') && methods.includes('digilocker')) {
      throw new Error('Passport and DigiLocker cannot be used together');
    }

    // Digital contract requires identity verification
    if (methods.includes('digital_contract')) {
      const hasIdentityVerification = methods.some(m =>
        ['digilocker', 'aadhaar_otp', 'passport'].includes(m)
      );
      if (!hasIdentityVerification) {
        throw new Error('Digital contract requires identity verification method');
      }
    }
  }

  /**
   * Get all pricing templates
   */
  getPricingTemplates(): PricingTemplate[] {
    return PRICING_TEMPLATES.filter(t => t.isActive);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PricingTemplate | undefined {
    return PRICING_TEMPLATES.find(t => t.id === templateId);
  }

  /**
   * Get all tenant profiles (admin only)
   */
  getAllProfiles(): TenantProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Update email configuration
   */
  updateEmailConfig(
    tenantId: string,
    emailConfig: Partial<TenantEmailConfig>
  ): TenantProfile {
    const profile = this.profiles.get(tenantId);
    if (!profile) {
      throw new Error('Tenant profile not found');
    }

    profile.emailConfig = {
      ...profile.emailConfig,
      ...emailConfig
    };
    profile.updatedAt = new Date();

    this.profiles.set(tenantId, profile);

    console.log(`✅ Tenant email config updated: ${profile.companyName}`);

    return profile;
  }

  /**
   * Check if tenant can use specific method
   */
  hasMethod(tenantId: string, method: KYCMethod): boolean {
    const profile = this.profiles.get(tenantId);
    return profile ? profile.kycConfig.methods.includes(method) : false;
  }

  /**
   * Get method-friendly names for display
   */
  getMethodDisplayName(method: KYCMethod): string {
    const names: Record<KYCMethod, string> = {
      digilocker: 'DigiLocker Verification',
      liveness: 'Live Face Detection',
      aadhaar_otp: 'Aadhaar OTP (Third-party)',
      passport: 'Passport Verification',
      document_upload: 'Document Upload & OCR',
      video_kyc: 'Video KYC (Live Agent)',
      digital_contract: 'Digital Contract Signing'
    };
    return names[method];
  }
}

// Export singleton instance
export const tenantProfileService = new TenantProfileService();
