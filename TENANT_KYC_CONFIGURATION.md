# Tenant-Level KYC Configuration System

## 📋 Business Requirement

**Goal:** Allow different companies (tenants/resellers) to sign up with customized KYC configurations. Each company gets their own KYC settings, pricing, and customer email templates based on their selected verification methods.

## 🎯 Use Cases

### Company 1: DigiLocker Only
- **Business:** Government document verification service
- **KYC Methods:** DigiLocker only
- **Pricing:** ₹1.00 per verification
- **Customer Email:** Contains only DigiLocker verification link

### Company 2: DigiLocker + Liveness
- **Business:** Financial services (loan apps)
- **KYC Methods:** DigiLocker + Live face detection
- **Pricing:** ₹2.50 per verification
- **Customer Email:** Contains DigiLocker + Liveness check links

### Company 3: Passport Only
- **Business:** International travel agency
- **KYC Methods:** Passport document upload + OCR
- **Pricing:** ₹3.00 per verification
- **Customer Email:** Contains only passport upload link

### Company 4: Full Stack
- **Business:** Real estate platform
- **KYC Methods:** Digital Contract + DigiLocker + Document Upload
- **Pricing:** ₹5.00 per verification
- **Customer Email:** Contains contract signing + DigiLocker + document links

## 📊 System Architecture

### 1. Tenant Profile Schema

```typescript
interface TenantKYCProfile {
  tenantId: string;
  companyName: string;
  
  // KYC Configuration
  kycConfig: {
    methods: KYCMethod[];  // Active methods for this tenant
    isCustomizable: boolean;  // Can they customize per-customer?
    allowOverrides: boolean;  // Can admins override for specific customers?
  };
  
  // Pricing
  pricing: {
    basePrice: number;  // Base price in ₹
    perMethodPricing: {
      digilocker: number;
      liveness: number;
      aadhaar_otp: number;
      passport: number;
      document_upload: number;
      video_kyc: number;
      digital_contract: number;
    };
    totalPrice: number;  // Auto-calculated based on selected methods
  };
  
  // Email Template Configuration
  emailConfig: {
    templateType: 'minimal' | 'standard' | 'complete';  // Based on methods
    brandColor: string;
    logo: string;
    customMessage?: string;
  };
  
  // Market Segment
  marketSegment: 'basic' | 'standard' | 'premium' | 'enterprise';
  
  createdAt: Date;
  updatedAt: Date;
}

type KYCMethod = 
  | 'digilocker'
  | 'liveness'
  | 'aadhaar_otp'
  | 'passport'
  | 'document_upload'
  | 'video_kyc'
  | 'digital_contract';
```

### 2. Database Schema

```sql
-- Tenants table (extends existing)
ALTER TABLE tenants ADD COLUMN kyc_methods TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN kyc_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN pricing_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN email_template_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN market_segment VARCHAR(50) DEFAULT 'basic';
ALTER TABLE tenants ADD COLUMN allow_customer_overrides BOOLEAN DEFAULT false;

-- KYC Pricing Templates table (pre-configured packages)
CREATE TABLE kyc_pricing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,  -- 'Basic', 'Standard', 'Premium', 'Enterprise'
  description TEXT,
  included_methods TEXT[] NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  per_method_pricing JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pre-populate pricing templates
INSERT INTO kyc_pricing_templates (template_name, description, included_methods, base_price, per_method_pricing, total_price) VALUES
('Basic - DigiLocker Only', 'Government document verification', 
 ARRAY['digilocker'], 
 1.00, 
 '{"digilocker": 1.00}'::jsonb, 
 1.00),

('Standard - DigiLocker + Liveness', 'Document + Face verification', 
 ARRAY['digilocker', 'liveness'], 
 2.50, 
 '{"digilocker": 1.00, "liveness": 1.50}'::jsonb, 
 2.50),

('Premium - Passport KYC', 'International document verification', 
 ARRAY['passport', 'document_upload'], 
 3.00, 
 '{"passport": 2.00, "document_upload": 1.00}'::jsonb, 
 3.00),

('Enterprise - Full Stack', 'Complete verification + Contracts', 
 ARRAY['digital_contract', 'digilocker', 'document_upload', 'liveness'], 
 5.00, 
 '{"digital_contract": 2.00, "digilocker": 1.00, "document_upload": 0.50, "liveness": 1.50}'::jsonb, 
 5.00);
```

### 3. Tenant Onboarding Flow

```typescript
// Step 1: Tenant selects KYC package during signup
POST /api/v1/auth/signup/reseller
{
  companyName: "ABC Financial Services",
  email: "admin@abc.com",
  password: "***",
  
  // NEW: KYC Package Selection
  kycPackage: {
    templateId: "uuid",  // Or custom selection
    customMethods?: ['digilocker', 'liveness'],  // If custom
    marketSegment: 'standard'
  }
}

// Response includes calculated pricing
{
  tenantId: "uuid",
  kycConfig: {
    methods: ['digilocker', 'liveness'],
    pricing: {
      basePrice: 2.50,
      breakdown: {
        digilocker: 1.00,
        liveness: 1.50
      }
    }
  }
}
```

### 4. Customer KYC Initiation (Updated)

```typescript
// When tenant initiates KYC for customer
POST /api/v1/reseller/kyc/initiate
Headers: {
  Authorization: "Bearer tenant_token"
}
Body: {
  customerName: "Rahul Kumar",
  customerPhone: "+919876543210",
  customerEmail: "rahul@example.com",
  
  // REMOVED: documentTypes, verificationMethods (no longer in body)
  // Now automatically picked from tenant profile
}

// Backend Logic:
async function initiateKYC(req, reply) {
  // 1. Get tenant profile from auth token
  const tenant = await getTenantFromToken(req.headers.authorization);
  
  // 2. Use tenant's configured methods
  const methods = tenant.kycConfig.methods;
  const pricing = tenant.pricing;
  
  // 3. Create session with tenant's config
  const session = {
    ...customerData,
    methods: methods,  // From tenant profile
    cost: pricing.totalPrice,  // From tenant profile
    tenantId: tenant.id
  };
  
  // 4. Send email with only configured methods
  await sendKYCEmail(session, methods);
  
  return { sessionId, methods, estimatedCost: pricing.totalPrice };
}
```

### 5. Dynamic Email Template System

```typescript
// Email template generator based on tenant methods
function generateKYCEmailTemplate(session: KYCSession, methods: KYCMethod[]) {
  const sections = [];
  
  // Add sections only for configured methods
  if (methods.includes('digital_contract')) {
    sections.push(contractSigningSection);
  }
  
  if (methods.includes('digilocker')) {
    sections.push(digilockerSection);
  }
  
  if (methods.includes('liveness')) {
    sections.push(livenessSection);
  }
  
  if (methods.includes('passport')) {
    sections.push(passportUploadSection);
  }
  
  // Render email with only relevant sections
  return renderEmail({
    tenant: session.tenant,
    customer: session.customer,
    sections: sections,
    branding: session.tenant.emailConfig
  });
}
```

### 6. Customer Portal (Dynamic UI)

```typescript
// Customer visits: /kyc/:sessionId
// Portal shows only methods configured for their tenant

function UnifiedKYC() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    // Fetch session - includes tenant's methods
    fetch(`/api/v1/kyc/session/${sessionId}`)
      .then(res => res.json())
      .then(data => setSession(data));
  }, []);
  
  // Render only configured methods
  return (
    <div>
      <h1>Complete Your Verification</h1>
      
      {/* Step 1: Contract (if configured) */}
      {session?.methods.includes('digital_contract') && (
        <ContractSigningStep />
      )}
      
      {/* Step 2: DigiLocker (if configured) */}
      {session?.methods.includes('digilocker') && (
        <DigiLockerStep />
      )}
      
      {/* Step 3: Liveness (if configured) */}
      {session?.methods.includes('liveness') && (
        <LivenessStep />
      )}
      
      {/* Step 4: Passport (if configured) */}
      {session?.methods.includes('passport') && (
        <PassportUploadStep />
      )}
      
      {/* Step 5: Documents (if configured) */}
      {session?.methods.includes('document_upload') && (
        <DocumentUploadStep />
      )}
    </div>
  );
}
```

## 💰 Pricing Structure

### Market-Based Pricing Tiers

| Method | Basic | Standard | Premium | Enterprise |
|--------|-------|----------|---------|------------|
| DigiLocker | ₹1.00 | ₹1.00 | ₹1.00 | ₹0.80 |
| Liveness | ₹1.50 | ₹1.50 | ₹1.50 | ₹1.20 |
| Aadhaar OTP | ₹3.50 | ₹3.50 | ₹3.00 | ₹2.50 |
| Passport | ₹2.00 | ₹2.00 | ₹2.00 | ₹1.80 |
| Document Upload | ₹1.00 | ₹1.00 | ₹0.80 | ₹0.50 |
| Video KYC | ₹15.00 | ₹15.00 | ₹12.00 | ₹10.00 |
| Digital Contract | ₹2.00 | ₹2.00 | ₹1.80 | ₹1.50 |

### Pre-configured Packages

**Package 1: Basic (₹1.00)**
- ✅ DigiLocker verification
- Target: Small businesses, document verification services

**Package 2: Standard (₹2.50)**
- ✅ DigiLocker verification
- ✅ Live face detection
- Target: Fintech, lending platforms

**Package 3: Premium (₹3.00)**
- ✅ Passport upload + OCR
- ✅ Document verification
- Target: Travel agencies, visa services

**Package 4: Enterprise (₹5.00)**
- ✅ Digital contract signing
- ✅ DigiLocker verification
- ✅ Document upload
- ✅ Live face detection
- Target: Real estate, large enterprises

**Custom Package (Variable)**
- Tenant selects any combination
- Price = Sum of selected methods
- Enterprise discounts available

## 🔧 Implementation Plan

### Phase 1: Database & Backend (Day 1)

**Tasks:**
1. Create migration for tenant profile updates
2. Create `kyc_pricing_templates` table
3. Seed pricing templates
4. Create `TenantProfileService`:
   - `createProfile(tenantId, methods)` - During signup
   - `getProfile(tenantId)` - Get tenant config
   - `updateProfile(tenantId, methods)` - Update methods
   - `calculatePricing(methods)` - Dynamic pricing
5. Update `AuthService`:
   - Add KYC package selection to signup
   - Store profile in tenants table
6. Update `KYCService`:
   - Remove method selection from initiate API
   - Fetch methods from tenant profile
   - Use tenant pricing

**Files to modify:**
- `apps/backend/src/tenant/tenant-profile.service.ts` (NEW)
- `apps/backend/src/auth/auth.routes.ts`
- `apps/backend/src/kyc/inhouse-kyc.routes.ts`

### Phase 2: Dynamic Email Templates (Day 2)

**Tasks:**
1. Create method-based email template generator
2. Update email service:
   - Load tenant methods
   - Render only configured sections
   - Apply tenant branding
3. Create email templates:
   - `email-minimal.html` (1 method)
   - `email-standard.html` (2-3 methods)
   - `email-complete.html` (4+ methods)

**Files to create:**
- `apps/backend/src/services/email-template.service.ts`
- `apps/backend/templates/kyc-email-minimal.html`
- `apps/backend/templates/kyc-email-standard.html`
- `apps/backend/templates/kyc-email-complete.html`

### Phase 3: Admin Panel - Tenant Settings (Day 3)

**Tasks:**
1. Create Tenant Profile page
2. Show current KYC configuration
3. Allow method selection (checkboxes)
4. Show real-time pricing calculation
5. Save configuration
6. Preview email template

**Components to create:**
- `apps/frontend/src/pages/TenantProfile.tsx`
- `apps/frontend/src/components/KYCMethodSelector.tsx`
- `apps/frontend/src/components/PricingCalculator.tsx`
- `apps/frontend/src/components/EmailPreview.tsx`

### Phase 4: Platform Admin - Template Management (Day 4)

**Tasks:**
1. Create pricing template manager
2. CRUD operations for templates
3. Bulk assign templates to tenants
4. Market segment management
5. Discount configuration

**Components to create:**
- `apps/frontend/src/pages/admin/PricingTemplates.tsx`
- `apps/frontend/src/pages/admin/TenantManagement.tsx`

### Phase 5: Customer Portal - Dynamic UI (Day 5)

**Tasks:**
1. Update UnifiedKYC to load methods from session
2. Conditionally render steps based on methods
3. Update progress bar based on active steps
4. Update completion logic

**Files to modify:**
- `apps/frontend/src/pages/UnifiedKYC.tsx`
- `apps/frontend/src/components/kyc/StepProgress.tsx`

## 📝 API Endpoints

### Tenant Profile Management

```typescript
// Get current tenant profile
GET /api/v1/reseller/profile
Response: {
  tenantId: string,
  companyName: string,
  kycConfig: {
    methods: string[],
    allowOverrides: boolean
  },
  pricing: {
    totalPrice: number,
    breakdown: object
  }
}

// Update tenant KYC configuration
PUT /api/v1/reseller/profile/kyc-config
Body: {
  methods: ['digilocker', 'liveness'],
  allowOverrides: false
}
Response: {
  success: true,
  updatedConfig: {...},
  newPricing: {...}
}

// Preview email template
GET /api/v1/reseller/profile/email-preview
Response: {
  html: "<html>...</html>",
  methods: ['digilocker', 'liveness']
}
```

### Platform Admin APIs

```typescript
// List all pricing templates
GET /api/v1/admin/pricing-templates
Response: {
  templates: [
    {
      id: "uuid",
      name: "Basic - DigiLocker Only",
      methods: ['digilocker'],
      price: 1.00
    },
    ...
  ]
}

// Create custom template
POST /api/v1/admin/pricing-templates
Body: {
  name: "Custom Package",
  methods: ['digilocker', 'liveness', 'video_kyc'],
  perMethodPricing: {...}
}

// Assign template to tenant
POST /api/v1/admin/tenants/:tenantId/assign-template
Body: {
  templateId: "uuid"
}
```

## 🎨 UI Mockups

### Tenant Profile - KYC Configuration

```
┌─────────────────────────────────────────────────┐
│ 🏢 Company Profile - KYC Configuration          │
├─────────────────────────────────────────────────┤
│                                                  │
│ Select Verification Methods                      │
│                                                  │
│ ☑️ DigiLocker Verification         ₹1.00       │
│ ☑️ Live Face Detection              ₹1.50       │
│ ☐ Aadhaar OTP (Third-party)        ₹3.50       │
│ ☐ Passport Upload                  ₹2.00       │
│ ☐ Document Upload & OCR            ₹1.00       │
│ ☐ Video KYC (Live Agent)           ₹15.00      │
│ ☐ Digital Contract Signing         ₹2.00       │
│                                                  │
│ ─────────────────────────────────────────────   │
│ Total Price per Verification: ₹2.50             │
│ ─────────────────────────────────────────────   │
│                                                  │
│ 📧 Email Template Preview                       │
│ ┌──────────────────────────────────────────┐   │
│ │ Dear Customer,                            │   │
│ │                                           │   │
│ │ Complete your verification:               │   │
│ │ 1. ✅ DigiLocker Verification             │   │
│ │ 2. ✅ Live Face Detection                 │   │
│ │                                           │   │
│ │ [Start Verification]                      │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ [ Save Configuration ]  [ Cancel ]              │
└─────────────────────────────────────────────────┘
```

### Customer KYC Portal (Dynamic)

**Tenant A (DigiLocker Only):**
```
Step 1 of 1: DigiLocker Verification
[Progress: ████████████████████] 100%
```

**Tenant B (DigiLocker + Liveness):**
```
Step 1 of 2: DigiLocker Verification ✅
Step 2 of 2: Live Face Detection
[Progress: ██████████░░░░░░░░░░] 50%
```

**Tenant C (Full Stack):**
```
Step 1 of 4: Digital Contract ✅
Step 2 of 4: DigiLocker Verification ✅
Step 3 of 4: Live Face Detection
Step 4 of 4: Document Upload
[Progress: ██████████░░░░░░░░░░] 50%
```

## 🔐 Security & Validation

### Tenant Configuration Validation

```typescript
function validateKYCConfig(methods: string[]): boolean {
  // 1. At least one method must be selected
  if (methods.length === 0) {
    throw new Error('At least one KYC method required');
  }
  
  // 2. Validate method combinations
  if (methods.includes('passport') && methods.includes('digilocker')) {
    throw new Error('Passport and DigiLocker are mutually exclusive');
  }
  
  // 3. Digital contract requires at least one identity verification
  if (methods.includes('digital_contract')) {
    const hasIdentityVerification = methods.some(m => 
      ['digilocker', 'aadhaar_otp', 'passport'].includes(m)
    );
    if (!hasIdentityVerification) {
      throw new Error('Digital contract requires identity verification');
    }
  }
  
  return true;
}
```

### RBAC Permissions

```typescript
// Permissions
- MANAGE_TENANT_KYC_CONFIG (reseller_admin)
- VIEW_TENANT_KYC_CONFIG (reseller_admin, reseller_user)
- MANAGE_PRICING_TEMPLATES (platform_admin)
- ASSIGN_PRICING_TEMPLATES (platform_admin)
- VIEW_ALL_TENANT_CONFIGS (platform_admin)
```

## 📊 Analytics & Reporting

### Tenant Dashboard Metrics

```typescript
interface TenantKYCMetrics {
  totalVerifications: number;
  successRate: number;
  averageCost: number;
  methodUsage: {
    digilocker: number,
    liveness: number,
    passport: number,
    // ...
  };
  monthlySpend: number;
  projectedSpend: number;
}
```

### Platform Admin Analytics

```typescript
interface PlatformKYCMetrics {
  totalTenants: number;
  methodPopularity: {
    method: string,
    tenantCount: number,
    verificationCount: number
  }[];
  revenueByMethod: object;
  averagePricePerVerification: number;
  marketSegmentDistribution: {
    basic: number,
    standard: number,
    premium: number,
    enterprise: number
  };
}
```

## 🚀 Migration Strategy

### Step 1: Backfill Existing Tenants (Zero Downtime)

```sql
-- Add default configuration to existing tenants
UPDATE tenants
SET 
  kyc_methods = ARRAY['digilocker', 'liveness', 'document_upload'],
  pricing_config = '{
    "basePrice": 1.65,
    "totalPrice": 1.65,
    "breakdown": {
      "digilocker": 0.00,
      "liveness": 0.00,
      "document_upload": 1.65
    }
  }'::jsonb,
  market_segment = 'standard'
WHERE kyc_methods IS NULL OR kyc_methods = '{}';
```

### Step 2: Gradual Rollout

1. **Week 1:** Deploy backend changes (backward compatible)
2. **Week 2:** Enable tenant profile UI (optional)
3. **Week 3:** Migrate email templates
4. **Week 4:** Enforce tenant configuration (remove hardcoded methods)

## ✅ Success Criteria

1. ✅ Tenant can select KYC methods during signup
2. ✅ Tenant can update methods from profile page
3. ✅ Customer receives email with only configured methods
4. ✅ Customer portal shows only configured steps
5. ✅ Pricing automatically adjusts based on methods
6. ✅ Admin can create and assign pricing templates
7. ✅ Backward compatible with existing tenants
8. ✅ Zero downtime migration

## 🎯 Future Enhancements

- **Volume Discounts:** Reduce price based on monthly volume
- **Add-on Services:** One-time additions without config change
- **A/B Testing:** Test different method combinations
- **White-label Email:** Custom domain and branding
- **Method Dependencies:** Auto-enable required methods
- **Smart Recommendations:** Suggest methods based on industry

---

## 📞 Summary

This system allows **true multi-tenancy** where each company gets their own KYC configuration, pricing, and customer experience. The platform admin manages pricing templates, while tenant admins customize their specific needs. Customers only see and complete the verification methods configured for their tenant.

**Key Benefits:**
- 🎯 Tailored experience for each business vertical
- 💰 Flexible pricing based on method selection
- 📧 Dynamic emails showing only relevant steps
- 🔧 Easy tenant onboarding with pre-configured packages
- 📊 Better analytics and cost optimization
- 🚀 Scalable for different market segments
