# CALLVIA CERTO - MASTER PROJECT PROMPT
## White-Label Multi-Tenant Compliance & AI Verification Platform

**Project Status**: GREENFIELD  
**Architecture Mode**: DB-LATER (Interfaces First, Database Implementation Later)  
**Mindset**: Think as Founder + Regulator + Enterprise CTO

---

# TABLE OF CONTENTS
1. [Core Identity & Vision](#core-identity--vision)
2. [Absolute Core Principles](#absolute-core-principles)
3. [System Architecture](#system-architecture)
4. [Business Rules](#business-rules)
5. [Security & Compliance](#security--compliance)
6. [Technical Infrastructure](#technical-infrastructure)
7. [Development Phases](#development-phases)
8. [Non-Functional Requirements](#non-functional-requirements)

---

# CORE IDENTITY & VISION

## What We're Building
CALLVIA CERTO is a B2B SaaS platform that provides:
- **KYC (Know Your Customer)** verification services
- **AI-powered Voice Verification** capabilities
- **Compliance Document Management** vault
- **White-label branding** for each tenant
- **Multi-tenant architecture** with strict isolation
- **Prepaid billing model** for service consumption

## Target Market
- Fintech companies needing KYC services
- Call centers requiring voice verification
- Compliance teams managing audit trails
- Enterprises needing white-labeled verification solutions

## Revenue Model
- Prepaid wallet system
- Pay-per-use for KYC and Voice services
- Tenant-specific custom pricing
- No credit/postpaid allowed

---

# ABSOLUTE CORE PRINCIPLES

## 1. Multi-Tenant From Day 1
- **Hard tenant isolation**: Data NEVER leaks between tenants
- Tenant context on EVERY request
- Database-level row security (when DB comes)
- Separate audit logs per tenant

## 2. White-Label by Default
- Custom domain per tenant (e.g., verify.clientname.com)
- Branded login pages, dashboards, emails
- Custom logo, colors, favicon per tenant
- SSL certificates auto-provisioned
- Email from tenant's domain

## 3. Hierarchical Control & Revenue Protection
```
Super Admin (Platform Owner)
 └─→ Tenant (Your Customer - B2B Client)
     └─→ Sub-Tenant (Tenant's Customer)
         └─→ Agent/User (Sub-Tenant's Employees)
             └─→ End User (KYC Subject)
```

**Control Flow**:
- Parent can ENABLE/DISABLE children
- Disabled parent → all children blocked automatically
- Cannot delete, only disable (for audit trail)

## 4. Prepaid Billing Only
- **ZERO credit extended**
- Every paid action checks wallet BEFORE execution
- `wallet_balance < service_price` → BLOCK + AUDIT LOG
- Real-time balance updates
- In-portal recharge only

## 5. Audit Logs = System Spine
- **Append-only** (NO updates, NO deletes)
- Generated for ALLOWED, BLOCKED, FAILED actions
- Tenant-isolated storage
- Required for compliance, disputes, billing reconciliation
- Human + machine readable

## 6. Modular Architecture
- Service-oriented design
- Plugin-ready for future services (biometric, document OCR, etc.)
- Provider-agnostic (swap KYC/Voice providers without code change)
- Feature flags for gradual rollout

## 7. Voice + AI = First-Class Citizens
- Voice verification as core service (not add-on)
- AI models for fraud detection, risk scoring
- Real-time and async processing
- Call recording + transcription

## 8. Architecture First, Database Later
- Define interfaces, enums, contracts NOW
- Mock all data access layers
- Use `// TODO: DB Implementation` markers
- Database schema designed AFTER business logic stabilizes

---

# SYSTEM ARCHITECTURE

## User Hierarchy (STRICT)

### Roles
1. **SuperAdmin** (Platform Owner)
   - Manage all tenants
   - Set platform-wide pricing defaults
   - Override tenant-specific pricing
   - Access global audit logs
   - Control feature flags

2. **TenantAdmin** (Your Customer)
   - Manage their sub-tenants
   - Recharge wallet
   - View usage & billing
   - Configure white-label settings
   - Manage their agents/users

3. **SubTenantAdmin** (Tenant's Customer)
   - Manage their users/agents
   - View their usage (limited to their scope)
   - Cannot recharge wallet (parent does)

4. **Agent/User**
   - Initiate KYC verifications
   - Make voice calls
   - View assigned cases only

5. **EndUser** (KYC Subject)
   - Person being verified
   - No login to platform
   - Data subject for privacy regulations

### Role Permissions Matrix
| Action | SuperAdmin | TenantAdmin | SubTenantAdmin | Agent | EndUser |
|--------|-----------|-------------|----------------|-------|---------|
| Create Tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Sub-Tenant | ✅ | ✅ | ❌ | ❌ | ❌ |
| Set Custom Pricing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Recharge Wallet | ✅ | ✅ | ❌ | ❌ | ❌ |
| Initiate KYC | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Audit Logs (Own) | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Audit Logs (All) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Disable Accounts | ✅ | ✅ (Sub-Tenants) | ✅ (Agents) | ❌ | ❌ |

---

# BUSINESS RULES

## Rule 1: Hierarchical Disable Control

### Behavior
- **SuperAdmin** can disable/enable Tenants
- **TenantAdmin** can disable/enable Sub-Tenants
- **SubTenantAdmin** can disable/enable Agents

### When Entity is Disabled
✅ **ALLOWED**:
- Login (to view disabled status)
- View audit logs (read-only)
- View wallet balance (read-only)

❌ **BLOCKED**:
- Initiate KYC verification
- Start voice call
- Consume wallet balance
- Create new sub-entities
- Modify any data
- Recharge wallet

⚠️ **MANDATORY**:
- Generate audit log for blocked actions
- Show clear "Account Disabled" banner
- Display reason (if provided by parent)

### Cascading Effect
```
IF Tenant is DISABLED:
  → ALL Sub-Tenants under it: BLOCKED
  → ALL Agents under it: BLOCKED
  → ALL pending KYCs: PAUSED

IF Sub-Tenant is DISABLED:
  → ALL Agents under it: BLOCKED
  → Tenant & other Sub-Tenants: UNAFFECTED
```

## Rule 2: Prepaid Wallet System

### Wallet Mechanics
```typescript
// Pseudo-logic for EVERY paid action
async function executeService(tenantId, serviceCode, price) {
  const balance = await walletEngine.getBalance(tenantId);
  
  if (balance < price) {
    await auditLogger.log({
      event: 'WALLET_INSUFFICIENT_BALANCE',
      result: 'BLOCKED',
      tenant_id: tenantId,
      service_code: serviceCode,
      required_amount: price,
      current_balance: balance
    });
    throw new InsufficientBalanceError();
  }
  
  // Deduct BEFORE service execution
  await walletEngine.deduct(tenantId, price, serviceCode);
  
  try {
    const result = await actualService.execute();
    await auditLogger.log({
      event: 'SERVICE_COMPLETED',
      result: 'SUCCESS'
    });
    return result;
  } catch (error) {
    // Refund on failure (optional: based on SLA)
    await walletEngine.refund(tenantId, price, serviceCode);
    throw error;
  }
}
```

### Wallet Rules
- **No negative balance** ever
- **No credit/overdraft** facility
- **Atomic deduction**: Deduct → Execute → Refund if failed
- **Real-time updates**: Balance visible always
- **Transaction history**: Every debit/credit logged

### Top-Up Flow
1. TenantAdmin logs into their portal
2. Clicks "Recharge Wallet"
3. Enters amount
4. Redirects to payment gateway
5. On success → Wallet credited
6. Invoice generated automatically
7. Audit log created

## Rule 3: Tenant-Wise Custom Pricing

### Pricing Resolution Logic
```
1. Check: Does Tenant have custom price for this service?
   YES → Use custom price
   NO  → Go to step 2

2. Check: Is there a platform default price?
   YES → Use default price
   NO  → Go to step 3

3. Service is DISABLED (price not configured)
   → BLOCK action
   → Log audit event
```

### Example Pricing Table (Mocked)
| Service Code | Platform Default | Tenant A Custom | Tenant B Custom |
|--------------|------------------|-----------------|-----------------|
| KYC_BASIC | $2.00 | $1.50 | $2.50 |
| KYC_ENHANCED | $5.00 | — | $4.00 |
| VOICE_VERIFY | $0.10/min | $0.08/min | — |

### Price Management
- SuperAdmin sets all prices
- Prices stored per tenant per service
- Historical pricing tracked (for audits)
- Price changes logged in audit logs

## Rule 4: In-Portal Payments

### Payment Flow
```
Tenant Dashboard
  → "Wallet" section
  → Current Balance: $150.00
  → "Recharge" button
  → Amount selector ($100, $500, $1000, Custom)
  → Payment Gateway (Stripe/Razorpay)
  → Success → Balance updated
  → Email receipt sent
  → Invoice generated
```

### Payment Gateway Integration
- **Phase 1**: Mock payment gateway (returns success)
- **Phase 2**: Integrate Stripe/Razorpay
- **Phase 3**: Multi-currency support

---

# SECURITY & COMPLIANCE

## Authentication & Authorization

### Authentication Methods
1. **Email + Password** (with MFA)
2. **SSO (SAML/OAuth)** for enterprise tenants
3. **API Keys** for programmatic access
4. **Magic Links** (passwordless option)

### Session Management
- JWT with short expiration (15 min)
- Refresh tokens (7 days)
- Concurrent session limits
- Force logout on password change
- IP-based session validation (optional)

### API Key Management
```typescript
interface ApiKey {
  key_id: string;
  tenant_id: string;
  scopes: string[]; // ['kyc:create', 'voice:initiate']
  rate_limit: number;
  expires_at: Date;
  last_used_at: Date;
  created_by: string;
  status: 'ACTIVE' | 'REVOKED';
}
```

**Rules**:
- API keys scoped to specific services
- Rotation policy (warn at 80 days)
- Automatic revocation on suspicious activity
- Rate limiting per key

### Multi-Factor Authentication (MFA)
- **Mandatory** for SuperAdmin
- **Optional** for Tenants (recommended)
- TOTP (Google Authenticator)
- SMS backup codes

## Data Protection & Privacy

### Encryption
- **At Rest**: AES-256 for PII data
- **In Transit**: TLS 1.3 minimum
- **Database**: Column-level encryption for sensitive fields
- **Backups**: Encrypted with separate keys

### GDPR Compliance
```typescript
// Data Subject Rights
interface DataSubjectRequest {
  type: 'ACCESS' | 'DELETE' | 'PORTABILITY' | 'RECTIFICATION';
  end_user_id: string;
  requested_by: string;
  requested_at: Date;
  completed_at: Date | null;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
}
```

**Required Features**:
1. **Right to Access**: Export all data about end user
2. **Right to Erasure**: Delete/anonymize end user data
3. **Right to Portability**: JSON/CSV export
4. **Consent Management**: Track consent for data processing
5. **Data Retention**: Auto-delete after N days (configurable)
6. **Breach Notification**: Alert within 72 hours

### Data Residency
- Multi-region deployment (US, EU, APAC)
- Tenant chooses data location
- No cross-region data transfer
- Compliance with local laws

### Compliance Certifications (Roadmap)
- [ ] SOC 2 Type II
- [ ] ISO 27001
- [ ] GDPR
- [ ] HIPAA (if healthcare tenants)

## Security Infrastructure

### Rate Limiting
```yaml
# Per Tenant
- API Calls: 1000/hour
- KYC Initiations: 100/hour
- Wallet Top-ups: 10/hour

# Per IP
- Login Attempts: 5/15min
- Password Reset: 3/hour

# Per API Key
- Custom limits per key
```

### IP Whitelisting
- Tenant can restrict access to specific IPs
- API keys can be IP-locked
- SuperAdmin bypass for support

### Security Headers
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security
```

---

# TECHNICAL INFRASTRUCTURE

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (v3+)
- **Icons**: lucide-react ONLY (no mixing)
- **State Management**: Zustand or React Context
- **API Client**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript (strict mode)
- **Framework**: Fastify (for performance) or Express
- **API Style**: RESTful + GraphQL (future)
- **Validation**: Zod
- **Logging**: Pino (JSON structured logs)
- **Testing**: Vitest + Supertest

### Database (Future)
- **Primary**: PostgreSQL 15+
- **Caching**: Redis
- **Search**: Elasticsearch (for audit logs)
- **Object Storage**: S3-compatible (MinIO/AWS S3)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or Loki
- **Error Tracking**: Sentry

## API Design Principles

### Versioning
```
/api/v1/kyc/initiate
/api/v1/wallet/balance
/api/v2/kyc/initiate (breaking changes)
```

### Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "ISO 8601"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Wallet balance too low",
    "details": {
      "required": 5.00,
      "available": 2.50
    }
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "ISO 8601"
  }
}
```

### Error Codes (Standardized)
```typescript
enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Account
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  
  // Billing
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  
  // Service
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  PRICE_NOT_CONFIGURED = 'PRICE_NOT_CONFIGURED',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

## Audit Log Structure

### Schema
```typescript
interface AuditLog {
  // Identity
  log_id: string; // UUID
  tenant_id: string;
  sub_tenant_id?: string;
  
  // Event
  event_type: AuditEventType;
  event_result: 'ALLOWED' | 'BLOCKED' | 'FAILED';
  event_category: 'AUTH' | 'ACCOUNT' | 'BILLING' | 'SERVICE' | 'ADMIN';
  
  // Actor
  actor_id: string; // user_id or api_key_id
  actor_role: UserRole;
  actor_type: 'USER' | 'SYSTEM' | 'API_KEY';
  
  // Target
  target_entity: string; // 'kyc', 'wallet', 'user', etc.
  target_id: string;
  
  // Context
  reason_code?: string;
  message: string;
  metadata: Record<string, any>; // Additional context
  
  // Request
  ip_address: string;
  user_agent: string;
  request_id: string;
  
  // Timing
  timestamp: Date;
  duration_ms?: number; // For service calls
}

enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  MFA_ENABLED = 'MFA_ENABLED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Account Control
  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_DISABLED = 'TENANT_DISABLED',
  TENANT_ENABLED = 'TENANT_ENABLED',
  SUB_TENANT_DISABLED = 'SUB_TENANT_DISABLED',
  USER_DISABLED = 'USER_DISABLED',
  USER_INVITED = 'USER_INVITED',
  
  // Billing
  WALLET_TOPUP = 'WALLET_TOPUP',
  WALLET_DEDUCTED = 'WALLET_DEDUCTED',
  WALLET_REFUNDED = 'WALLET_REFUNDED',
  WALLET_INSUFFICIENT = 'WALLET_INSUFFICIENT',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // Service Usage
  KYC_STARTED = 'KYC_STARTED',
  KYC_BLOCKED = 'KYC_BLOCKED',
  KYC_COMPLETED = 'KYC_COMPLETED',
  KYC_FAILED = 'KYC_FAILED',
  
  VOICE_CALL_STARTED = 'VOICE_CALL_STARTED',
  VOICE_CALL_ENDED = 'VOICE_CALL_ENDED',
  VOICE_CALL_FAILED = 'VOICE_CALL_FAILED',
  
  COMPLIANCE_FILE_GENERATED = 'COMPLIANCE_FILE_GENERATED',
  COMPLIANCE_FILE_DOWNLOADED = 'COMPLIANCE_FILE_DOWNLOADED',
  
  // Admin Actions
  PRICE_CHANGED = 'PRICE_CHANGED',
  SERVICE_ENABLED = 'SERVICE_ENABLED',
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  FEATURE_FLAG_TOGGLED = 'FEATURE_FLAG_TOGGLED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  
  // Security
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Data Privacy
  DATA_EXPORT_REQUESTED = 'DATA_EXPORT_REQUESTED',
  DATA_DELETION_REQUESTED = 'DATA_DELETION_REQUESTED',
}
```

## Notification System

### Channels
1. **Email** (Transactional)
   - White-labeled templates per tenant
   - SendGrid/AWS SES
   - SMTP fallback

2. **In-App Notifications**
   - Real-time via WebSocket
   - Persistent notification center
   - Badge counts

3. **SMS** (Critical only)
   - Twilio integration
   - Low balance alerts
   - Security events

4. **Webhooks** (For integrations)
   - Tenant subscribes to events
   - Retry logic (exponential backoff)
   - Signature verification

### Event Types
```typescript
enum NotificationType {
  // Billing
  WALLET_LOW_BALANCE = 'WALLET_LOW_BALANCE', // < 20%
  WALLET_CRITICAL_BALANCE = 'WALLET_CRITICAL_BALANCE', // < 5%
  TOPUP_SUCCESS = 'TOPUP_SUCCESS',
  
  // Account
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  USER_INVITED = 'USER_INVITED',
  
  // Service
  KYC_COMPLETED = 'KYC_COMPLETED',
  KYC_FAILED = 'KYC_FAILED',
  
  // Security
  NEW_LOGIN = 'NEW_LOGIN',
  API_KEY_EXPIRING = 'API_KEY_EXPIRING',
  
  // System
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
  INCIDENT_DETECTED = 'INCIDENT_DETECTED',
}
```

## Webhook System

### Tenant Webhook Configuration
```typescript
interface WebhookConfig {
  tenant_id: string;
  endpoint_url: string; // HTTPS only
  events: AuditEventType[]; // Subscribed events
  secret: string; // For signature verification
  status: 'ACTIVE' | 'DISABLED';
  retry_config: {
    max_retries: number;
    backoff_multiplier: number;
  };
}
```

### Webhook Delivery
```typescript
// Payload
{
  "event_id": "uuid",
  "event_type": "KYC_COMPLETED",
  "timestamp": "2026-01-30T10:30:00Z",
  "data": {
    "kyc_id": "kyc_123",
    "status": "APPROVED",
    "end_user_id": "eu_456"
  }
}

// Headers
X-Webhook-Signature: sha256=<hmac>
X-Webhook-ID: <event_id>
X-Webhook-Timestamp: <unix_timestamp>
```

---

# DEVELOPMENT PHASES

## Phase 1: Foundation (Week 1-2)

### Monorepo Structure
```
callvia-certo/
├── apps/
│   ├── backend/          # Fastify API server
│   ├── frontend/         # React + Vite dashboard
│   └── docs/             # Documentation site (optional)
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── validation/       # Zod schemas
│   ├── constants/        # Enums, error codes
│   └── utils/            # Shared utilities
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── README.md
├── PROJECT_MASTER_PROMPT.md
├── package.json          # Workspace root
└── turbo.json            # Turborepo config
```

### Initial Setup
- [x] Initialize monorepo (pnpm workspaces or Turborepo)
- [ ] Setup ESLint + Prettier
- [ ] Configure TypeScript (strict mode)
- [ ] Setup environment variables (.env.example)
- [ ] Create coding standards document
- [ ] Setup Git hooks (Husky)

## Phase 2: Backend Core (Week 3-5)

### 2.1 Shared Packages
```typescript
// packages/types/src/index.ts
export * from './user';
export * from './tenant';
export * from './wallet';
export * from './audit';
export * from './api';

// packages/constants/src/roles.ts
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SUB_TENANT_ADMIN = 'SUB_TENANT_ADMIN',
  AGENT = 'AGENT',
}

// packages/constants/src/errors.ts
export const ErrorMessages = {
  INSUFFICIENT_BALANCE: 'Wallet balance insufficient',
  // ... etc
};
```

### 2.2 Core Middleware

#### Auth Middleware
```typescript
// apps/backend/src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // TODO: Verify JWT token
  // TODO: Extract user_id, tenant_id, role
  // TODO: Attach to request.user
  
  // MOCK for now
  request.user = {
    user_id: 'user_123',
    tenant_id: 'tenant_abc',
    role: 'TENANT_ADMIN',
  };
}
```

#### Tenant Context Resolver
```typescript
// apps/backend/src/middleware/tenant.middleware.ts
export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Extract tenant from:
  // 1. Subdomain (preferred)
  // 2. X-Tenant-ID header
  // 3. JWT claim
  
  const subdomain = extractSubdomain(request.hostname);
  
  // TODO: DB lookup to validate tenant
  // MOCK for now
  request.tenantContext = {
    tenant_id: subdomain,
    tenant_name: 'Acme Corp',
    status: 'ACTIVE',
  };
}
```

#### RBAC Middleware
```typescript
// apps/backend/src/middleware/rbac.middleware.ts
export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      await auditLogger.log({
        event_type: 'PERMISSION_DENIED',
        result: 'BLOCKED',
        actor_id: request.user.user_id,
        actor_role: userRole,
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
  };
}

// Usage in routes:
fastify.post('/admin/tenant/create', {
  preHandler: [authMiddleware, requireRole(UserRole.SUPER_ADMIN)]
}, createTenantHandler);
```

### 2.3 Core Engines

#### Account Status Engine
```typescript
// apps/backend/src/engines/account-status.engine.ts
interface AccountStatus {
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  disabled_at?: Date;
  disabled_by?: string;
  disabled_reason?: string;
}

export class AccountStatusEngine {
  async checkStatus(entityId: string, entityType: string): Promise<boolean> {
    // TODO: DB lookup
    // MOCK: Check entity and all parents
    
    const entity = await this.getEntity(entityId);
    if (entity.status !== 'ACTIVE') return false;
    
    // Check parent cascade
    if (entity.parent_id) {
      return this.checkStatus(entity.parent_id, entity.parent_type);
    }
    
    return true;
  }
  
  async disable(
    entityId: string,
    disabledBy: string,
    reason?: string
  ): Promise<void> {
    // TODO: Update entity status
    // TODO: Cascade to children (mark as parent_disabled)
    
    await auditLogger.log({
      event_type: 'ACCOUNT_DISABLED',
      result: 'ALLOWED',
      actor_id: disabledBy,
      target_id: entityId,
      message: reason,
    });
  }
}
```

#### Wallet Engine
```typescript
// apps/backend/src/engines/wallet.engine.ts
export class WalletEngine {
  async getBalance(tenantId: string): Promise<number> {
    // TODO: DB lookup
    // MOCK: Return random balance
    return 100.50;
  }
  
  async deduct(
    tenantId: string,
    amount: number,
    serviceCode: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const balance = await this.getBalance(tenantId);
    
    if (balance < amount) {
      throw new InsufficientBalanceError(balance, amount);
    }
    
    // TODO: Atomic DB transaction
    // MOCK: Log deduction
    
    await auditLogger.log({
      event_type: 'WALLET_DEDUCTED',
      result: 'ALLOWED',
      tenant_id: tenantId,
      metadata: {
        amount,
        service_code: serviceCode,
        previous_balance: balance,
        new_balance: balance - amount,
      },
    });
  }
  
  async topup(
    tenantId: string,
    amount: number,
    paymentId: string
  ): Promise<void> {
    // TODO: DB transaction
    
    await auditLogger.log({
      event_type: 'WALLET_TOPUP',
      result: 'ALLOWED',
      tenant_id: tenantId,
      metadata: { amount, payment_id: paymentId },
    });
  }
  
  async refund(
    tenantId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    // TODO: DB transaction
    
    await auditLogger.log({
      event_type: 'WALLET_REFUNDED',
      result: 'ALLOWED',
      tenant_id: tenantId,
      metadata: { amount, reason },
    });
  }
}
```

#### Pricing Engine
```typescript
// apps/backend/src/engines/pricing.engine.ts
interface ServicePrice {
  service_code: string;
  price: number;
  currency: string;
}

export class PricingEngine {
  private defaultPrices: Map<string, ServicePrice> = new Map();
  private tenantPrices: Map<string, Map<string, ServicePrice>> = new Map();
  
  async getServicePrice(
    tenantId: string,
    serviceCode: string
  ): Promise<ServicePrice | null> {
    // TODO: DB lookup
    
    // 1. Check tenant-specific price
    const tenantPrice = this.tenantPrices.get(tenantId)?.get(serviceCode);
    if (tenantPrice) return tenantPrice;
    
    // 2. Check platform default
    const defaultPrice = this.defaultPrices.get(serviceCode);
    if (defaultPrice) return defaultPrice;
    
    // 3. Service not priced (disabled)
    return null;
  }
  
  async setTenantPrice(
    tenantId: string,
    serviceCode: string,
    price: number
  ): Promise<void> {
    // TODO: DB update
    
    await auditLogger.log({
      event_type: 'PRICE_CHANGED',
      result: 'ALLOWED',
      tenant_id: tenantId,
      metadata: { service_code: serviceCode, price },
    });
  }
}
```

### 2.4 Service Gatekeeper Middleware
```typescript
// apps/backend/src/middleware/gatekeeper.middleware.ts
export function serviceGatekeeper(serviceCode: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { user, tenantContext } = request;
    const tenantId = tenantContext.tenant_id;
    
    // 1. Check account status
    const isActive = await accountStatusEngine.checkStatus(
      tenantId,
      'TENANT'
    );
    
    if (!isActive) {
      await auditLogger.log({
        event_type: `${serviceCode}_BLOCKED`,
        result: 'BLOCKED',
        reason_code: 'ACCOUNT_DISABLED',
        actor_id: user.user_id,
        tenant_id: tenantId,
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account is disabled',
        },
      });
    }
    
    // 2. Check pricing
    const pricing = await pricingEngine.getServicePrice(
      tenantId,
      serviceCode
    );
    
    if (!pricing) {
      await auditLogger.log({
        event_type: `${serviceCode}_BLOCKED`,
        result: 'BLOCKED',
        reason_code: 'PRICE_NOT_CONFIGURED',
        actor_id: user.user_id,
        tenant_id: tenantId,
      });
      
      return reply.status(403).send({
        success: false,
        error: {
          code: 'SERVICE_DISABLED',
          message: 'Service not available for your account',
        },
      });
    }
    
    // 3. Check wallet balance
    const balance = await walletEngine.getBalance(tenantId);
    
    if (balance < pricing.price) {
      await auditLogger.log({
        event_type: 'WALLET_INSUFFICIENT',
        result: 'BLOCKED',
        actor_id: user.user_id,
        tenant_id: tenantId,
        metadata: {
          required: pricing.price,
          available: balance,
        },
      });
      
      return reply.status(402).send({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Wallet balance too low',
          details: {
            required: pricing.price,
            available: balance,
          },
        },
      });
    }
    
    // Attach pricing to request for later deduction
    request.servicePricing = pricing;
  };
}

// Usage:
fastify.post('/api/v1/kyc/initiate', {
  preHandler: [
    authMiddleware,
    tenantMiddleware,
    serviceGatekeeper('KYC_BASIC'),
  ]
}, async (request, reply) => {
  // Service logic here
  // Deduct wallet after successful execution
  await walletEngine.deduct(
    request.tenantContext.tenant_id,
    request.servicePricing.price,
    'KYC_BASIC'
  );
});
```

### 2.5 Audit Logger Service
```typescript
// apps/backend/src/services/audit-logger.service.ts
export class AuditLoggerService {
  async log(entry: Partial<AuditLog>): Promise<void> {
    const fullEntry: AuditLog = {
      log_id: generateUUID(),
      timestamp: new Date(),
      ...entry,
    };
    
    // TODO: Write to database
    // TODO: Write to Elasticsearch for search
    // MOCK: Log to console
    console.log('[AUDIT]', JSON.stringify(fullEntry));
    
    // TODO: Trigger webhooks if applicable
  }
  
  async query(
    tenantId: string,
    filters: AuditLogFilters
  ): Promise<AuditLog[]> {
    // TODO: Query from Elasticsearch
    return [];
  }
}

// Singleton instance
export const auditLogger = new AuditLoggerService();
```

## Phase 3: Service Modules (Week 6-8)

### 3.1 Tenant Management Module
```typescript
// apps/backend/src/modules/tenant/tenant.service.ts
export class TenantService {
  async createTenant(data: CreateTenantDTO): Promise<Tenant> {
    // TODO: DB insert
    
    // Initialize wallet
    await walletEngine.createWallet(data.tenant_id, 0);
    
    // Generate default API key
    await apiKeyService.generate(data.tenant_id);
    
    await auditLogger.log({
      event_type: 'TENANT_CREATED',
      result: 'ALLOWED',
      target_id: data.tenant_id,
    });
    
    return mockTenant;
  }
  
  async getTenant(tenantId: string): Promise<Tenant | null> {
    // TODO: DB lookup
    return null;
  }
  
  async updateWhiteLabelSettings(
    tenantId: string,
    settings: WhiteLabelSettings
  ): Promise<void> {
    // TODO: DB update
    // TODO: Upload logo/favicon to S3
  }
}
```

### 3.2 KYC Module (Provider-Agnostic)
```typescript
// apps/backend/src/modules/kyc/kyc.interface.ts
export interface IKYCProvider {
  name: string;
  initiate(data: KYCInitiateDTO): Promise<KYCSession>;
  getStatus(sessionId: string): Promise<KYCStatus>;
  getResult(sessionId: string): Promise<KYCResult>;
}

// apps/backend/src/modules/kyc/providers/onfido.provider.ts
export class OnfidoKYCProvider implements IKYCProvider {
  name = 'ONFIDO';
  
  async initiate(data: KYCInitiateDTO): Promise<KYCSession> {
    // TODO: Call Onfido API
    // MOCK: Return fake session
    return {
      session_id: 'kyc_' + Date.now(),
      provider: 'ONFIDO',
      verification_url: 'https://mock-onfido.com/verify',
    };
  }
}

// apps/backend/src/modules/kyc/kyc.service.ts
export class KYCService {
  private provider: IKYCProvider;
  
  constructor(providerName: string = 'ONFIDO') {
    // Factory pattern to load provider
    this.provider = this.loadProvider(providerName);
  }
  
  async initiateVerification(
    tenantId: string,
    data: KYCInitiateDTO
  ): Promise<KYCSession> {
    // Called AFTER gatekeeper middleware
    
    const session = await this.provider.initiate(data);
    
    await auditLogger.log({
      event_type: 'KYC_STARTED',
      result: 'ALLOWED',
      tenant_id: tenantId,
      metadata: { session_id: session.session_id },
    });
    
    return session;
  }
}
```

### 3.3 Voice Verification Module
```typescript
// apps/backend/src/modules/voice/voice.service.ts
export class VoiceService {
  async initiateCall(
    tenantId: string,
    data: VoiceCallDTO
  ): Promise<CallSession> {
    // TODO: Integrate Twilio/Vonage
    // MOCK: Return fake session
    
    await auditLogger.log({
      event_type: 'VOICE_CALL_STARTED',
      result: 'ALLOWED',
      tenant_id: tenantId,
    });
    
    return {
      call_id: 'call_' + Date.now(),
      status: 'INITIATED',
    };
  }
  
  async getCallRecording(callId: string): Promise<string> {
    // TODO: Return S3 signed URL
    return 'https://mock-s3.com/recording.mp3';
  }
}
```

## Phase 4: Frontend Foundation (Week 9-11)

### 4.1 Project Setup
```bash
# apps/frontend/
pnpm create vite@latest . -- --template react-ts
pnpm add tailwindcss postcss autoprefixer
pnpm add lucide-react zustand @tanstack/react-query
pnpm add react-router-dom react-hook-form zod
```

### 4.2 Theme System
```typescript
// apps/frontend/src/theme/theme.ts
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  logo: string;
  favicon: string;
  brandName: string;
}

// Load theme based on tenant subdomain
export async function loadTenantTheme(): Promise<Theme> {
  const subdomain = window.location.hostname.split('.')[0];
  
  // TODO: Fetch from API
  // MOCK: Return default theme
  return {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3F4F6',
      text: '#111827',
    },
    logo: '/default-logo.svg',
    favicon: '/default-favicon.ico',
    brandName: 'Callvia Certo',
  };
}
```

### 4.3 Layout Components
```typescript
// apps/frontend/src/components/Layout/DashboardLayout.tsx
import { LayoutDashboard, Wallet, Users, Settings, FileText } from 'lucide-react';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4">
          <img src={theme.logo} alt="Logo" className="h-8" />
        </div>
        
        <nav className="mt-6">
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <NavItem icon={Wallet} label="Wallet" to="/wallet" />
          <NavItem icon={Users} label="Sub-Tenants" to="/sub-tenants" />
          <NavItem icon={FileText} label="Audit Logs" to="/audit" />
          <NavItem icon={Settings} label="Settings" to="/settings" />
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header with Wallet Balance */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <WalletBalance />
            <UserMenu />
          </div>
        </header>
        
        {/* Disabled Banner */}
        <DisabledAccountBanner />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### 4.4 Wallet Component
```typescript
// apps/frontend/src/components/Wallet/WalletBalance.tsx
import { Wallet, AlertCircle } from 'lucide-react';

export function WalletBalance() {
  const { data: balance } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => api.getWalletBalance(),
  });
  
  const isLow = balance < 50; // Example threshold
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      <Wallet className="w-5 h-5" />
      <div>
        <div className="text-xs text-gray-600">Wallet Balance</div>
        <div className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
          ${balance?.toFixed(2) || '0.00'}
        </div>
      </div>
      {isLow && <AlertCircle className="w-4 h-4 text-red-600" />}
    </div>
  );
}
```

### 4.5 Recharge Wallet Page
```typescript
// apps/frontend/src/pages/Wallet/RechargePage.tsx
import { CreditCard } from 'lucide-react';

export function RechargePage() {
  const [amount, setAmount] = useState(100);
  
  const handleRecharge = async () => {
    // TODO: Integrate payment gateway
    // MOCK: Show success message
    alert('Payment gateway integration pending');
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Recharge Wallet</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Amount
          </label>
          <div className="grid grid-cols-4 gap-4">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`p-4 border-2 rounded-lg ${
                  amount === amt ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Custom Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <button
          onClick={handleRecharge}
          className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
```

---

# NON-FUNCTIONAL REQUIREMENTS

## Performance
- API response time: < 200ms (p95)
- Page load time: < 2s
- Real-time updates: < 500ms latency
- Concurrent users: 10,000+ per tenant

## Scalability
- Horizontal scaling for API servers
- Database read replicas
- CDN for static assets
- Queue-based async processing

## Reliability
- 99.9% uptime SLA
- Automatic failover
- Circuit breakers on external calls
- Graceful degradation

## Monitoring
- Health checks every 30s
- Error rate < 0.1%
- Alert on wallet low balance
- Track audit log volume

## Testing
- Unit test coverage: > 80%
- Integration tests for critical paths
- E2E tests for user flows
- Load testing monthly

---

# DEVELOPMENT RULES

## Mandatory Practices
1. **Every paid service** MUST go through Gatekeeper
2. **Every action** MUST generate audit log
3. **No hardcoded** tenant IDs, prices, or config
4. **Always use** shared types from `packages/types`
5. **TODO markers** for all DB logic: `// TODO: DB Implementation`
6. **Error handling** with proper error codes
7. **Logging** with structured JSON (Pino)
8. **API responses** follow standard format

## Code Style
- TypeScript strict mode enabled
- ESLint + Prettier configured
- No `any` types (use `unknown` if needed)
- Functional programming preferred
- Pure functions where possible

## Git Workflow
- Feature branches: `feature/wallet-engine`
- Commit messages: Conventional Commits format
- PR reviews required
- CI must pass before merge

## Documentation
- JSDoc for all public functions
- README in each module
- API documentation auto-generated
- Architecture Decision Records (ADRs)

---

# DELIVERABLES CHECKLIST

## Backend
- [ ] Monorepo structure
- [ ] Shared types package
- [ ] Auth middleware (mocked)
- [ ] Tenant context resolver
- [ ] RBAC engine
- [ ] Account status engine
- [ ] Wallet engine (mocked)
- [ ] Pricing engine (mocked)
- [ ] Service gatekeeper middleware
- [ ] Audit logger service
- [ ] Tenant management module
- [ ] KYC module (provider-agnostic)
- [ ] Voice module (skeleton)
- [ ] API documentation (Swagger)

## Frontend
- [ ] React + Vite setup
- [ ] Tailwind configured
- [ ] Theme system
- [ ] Dashboard layout
- [ ] Sidebar navigation (lucide icons)
- [ ] Wallet balance display
- [ ] Recharge wallet page
- [ ] Disabled account banner
- [ ] Sub-tenant management UI
- [ ] Audit log viewer
- [ ] Settings page (white-label config)

## DevOps
- [ ] Docker Compose for local dev
- [ ] Environment variables documented
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Linting & formatting checks
- [ ] Test runner configured

## Documentation
- [ ] PROJECT_MASTER_PROMPT.md (this file)
- [ ] API_DOCUMENTATION.md
- [ ] ARCHITECTURE.md
- [ ] DEPLOYMENT.md
- [ ] CONTRIBUTING.md

---

# SUCCESS CRITERIA

You will know Phase 1-4 is complete when:

1. ✅ Backend server starts without errors
2. ✅ Frontend loads with white-label theme
3. ✅ All middleware chains correctly
4. ✅ Mock KYC call succeeds (with audit log)
5. ✅ Wallet balance displays in UI
6. ✅ Gatekeeper blocks low-balance action
7. ✅ Audit logs are generated for every action
8. ✅ Role-based access works
9. ✅ Account disable cascades correctly
10. ✅ Code has TODO markers for DB integration

---

# NEXT PHASES (Future)

## Phase 5: Database Integration
- Design normalized schema
- Implement repositories
- Add migrations
- Replace all TODOs

## Phase 6: Real Integrations
- KYC provider (Onfido/Jumio)
- Voice provider (Twilio)
- Payment gateway (Stripe)
- Email service (SendGrid)

## Phase 7: Advanced Features
- Webhook system
- Reporting & analytics
- Bulk operations
- Data export (GDPR)

## Phase 8: Production Hardening
- Load testing
- Security audit
- Performance optimization
- Monitoring setup

---

# FINAL NOTES

This is a **compliance-first, revenue-protected, audit-driven** SaaS platform.

Every decision should answer:
1. **Compliance**: Does this log properly for audits?
2. **Revenue**: Does this prevent revenue leakage?
3. **Scale**: Will this work for 1000 tenants?
4. **Security**: Is tenant data isolated?
5. **UX**: Is this intuitive for B2B users?

Think like you're building the next Stripe or Twilio.

---

**End of Master Prompt**
