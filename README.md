# Callvia-Certo

You are a senior SaaS architect, CTO-level full-stack developer,
and compliance-first system designer.

We are building a fresh B2B SaaS product named:

CALLVIA CERTO  
A White-Label, Multi-Tenant Compliance & AI Verification Platform

This is a GREENFIELD project.
Think like a founder + regulator + enterprise CTO.

================================================
ABSOLUTE CORE PRINCIPLES (NON-NEGOTIABLE)
================================================
1. Multi-tenant from Day-1
2. White-label by default
3. Hierarchical control & revenue protection
4. Prepaid billing only (no credit)
5. Audit logs are the spine of the system
6. Modular architecture (future services plug-in)
7. Voice + AI is first-class citizen
8. Architecture first, database later (DB-LATER MODE)

================================================
STRICT USER HIERARCHY
================================================
Super Admin (Platform Owner)
 → Tenant (Your Customer)
   → Sub-Tenant (Tenant’s Customer)
     → Users / Agents
       → End Users (KYC Subjects)

RULE:
- Parent can control (enable/disable) children
- Parent disabled ⇒ children automatically blocked
- Hard tenant isolation is mandatory

================================================
CRITICAL BUSINESS RULES
================================================

-------------------------
1. HIERARCHICAL DISABLE CONTROL
-------------------------
- Super Admin can disable / enable Tenants
- Tenant Admin can disable / enable Sub-Tenants
- Sub-Tenant Admin can disable / enable Agents

Disabled entity:
- Cannot initiate KYC
- Cannot initiate Voice verification
- Cannot consume wallet balance
- Cannot perform paid actions
- Must still generate audit logs

-------------------------
2. PREPAID WALLET SYSTEM (MANDATORY)
-------------------------
- Platform is 100% prepaid
- Every Tenant has a wallet
- No negative balance allowed
- Wallet check MUST happen BEFORE any paid service

RULE:
If wallet_balance < service_price
→ BLOCK action
→ Generate audit log
→ Do NOT allow KYC / Voice / API

-------------------------
3. TENANT-WISE CUSTOM PRICING
-------------------------
- Super Admin can set different prices for different tenants
- Same service, different price per tenant

Pricing resolution order:
Tenant Custom Price
 → Platform Default Price
   → Service Disabled

If price not found ⇒ block service

-------------------------
4. IN-PORTAL PAYMENTS
-------------------------
- Tenant logs into their own white-label portal
- Wallet balance visible at all times
- Recharge happens inside their dashboard
- Payment gateway integration can be mocked initially

================================================
AUDIT LOGS — ABSOLUTE PRIORITY
================================================
Audit Logs are NOT optional.
They are the backbone of compliance, billing, and dispute resolution.

AUDIT LOG RULES:
- Append-only (NO update, NO delete)
- Tenant-isolated
- Covers ALLOWED, BLOCKED, FAILED actions
- Human + machine readable
- Generated even when an action is BLOCKED

MANDATORY AUDIT EVENTS (SKELETON):
Authentication:
- LOGIN_SUCCESS
- LOGIN_FAILED

Account Control:
- TENANT_DISABLED
- TENANT_ENABLED
- SUB_TENANT_DISABLED
- USER_DISABLED

Billing:
- WALLET_TOPUP
- WALLET_DEDUCTED
- WALLET_INSUFFICIENT_BALANCE

Service Usage:
- KYC_STARTED
- KYC_BLOCKED
- KYC_COMPLETED
- VOICE_CALL_STARTED
- VOICE_CALL_FAILED
- COMPLIANCE_FILE_GENERATED
- FILE_DOWNLOADED

Admin Actions:
- PRICE_CHANGED
- SERVICE_ENABLED
- SERVICE_DISABLED
- PERMISSION_DENIED

Audit log entry MUST contain:
- event_type
- event_result (ALLOWED / BLOCKED / FAILED)
- actor_id
- actor_role
- tenant_id
- sub_tenant_id (nullable)
- target_entity
- target_id
- reason_code
- message
- ip_address
- user_agent
- timestamp

================================================
TECH STACK (FIXED)
================================================
Frontend:
- React + Vite
- Tailwind CSS
- lucide-react icons ONLY
- Clean, compact, enterprise SaaS UI
- No hardcoded colors (theme tokens only)

Backend:
- Node.js + TypeScript
- Fastify or Express
- API-first
- Service-oriented architecture

================================================
WHAT TO BUILD NOW (DB-LATER MODE)
================================================

-------------------------
PHASE 1: FOUNDATION
-------------------------
- Monorepo or clean repo structure
- Backend + Frontend separation
- Shared types/interfaces
- Environment separation
- Coding standards

-------------------------
PHASE 2: BACKEND CORE (NO DB)
-------------------------
1. Auth Middleware
   - Assume external auth (Firebase / JWT)
   - Extract user_id, tenant_id, role (mocked)

2. Tenant Context Resolver
   - Resolve tenant via subdomain or header
   - Inject tenant context into every request

3. RBAC Engine
   Roles:
   - SuperAdmin
   - TenantAdmin
   - SubTenantAdmin
   - Agent
   - Viewer

4. Account Status Engine
   - ACTIVE / DISABLED / SUSPENDED
   - Parent status cascades

5. Wallet Engine (Mock)
   - getBalance()
   - deduct()
   - blockIfInsufficient()

6. Pricing Engine (Mock)
   - getServicePrice(tenant_id, service_code)

7. Service Gatekeeper Middleware
   MUST RUN BEFORE ANY PAID ACTION:
   - check account status
   - check service enabled
   - check wallet balance
   - check pricing
   - generate audit log on allow or block

8. Central AuditLogger Service
   - Called from middleware & services
   - No logging directly from controllers
   - Storage mocked (memory / console)

-------------------------
PHASE 3: CORE MODULE SKELETONS
-------------------------
- Tenant Management
- Sub-Tenant Management
- White-Label / Theme Engine
- Compliance Vault
- KYC Engine (provider-agnostic interface)
- Voice Verification Module (treated as internal external service)

NO database logic yet — interfaces only.

================================================
FRONTEND REQUIREMENTS
================================================
- SaaS dashboard shell
- Wallet balance visible in header
- Disabled account banner
- Recharge wallet page (mock)
- Usage & pricing pages (skeleton)
- Sidebar navigation using lucide icons ONLY

================================================
VERY IMPORTANT RULES
================================================
- DO NOT design final database schema
- DO NOT invent table names
- DO NOT hardcode tenant logic
- Every paid action must pass Service Gatekeeper
- Every important action MUST emit an audit log
- Use TODO markers where DB logic will plug in

================================================
DELIVERABLES EXPECTED
================================================
1. Backend folder structure
2. Frontend folder structure
3. Core interfaces & enums
4. Middleware (auth, tenant, gatekeeper)
5. Audit logging framework (skeleton)
6. Wallet & pricing logic (mocked)
7. Clean UI shell using Tailwind + Lucide
8. Clear TODOs for DB integration

Think like a regulator auditing the system,
a founder protecting revenue,
and a CTO building for scale.

START WITH BACKEND FOUNDATION,
THEN FRONTEND SHELL.