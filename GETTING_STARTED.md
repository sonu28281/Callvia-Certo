# Getting Started with Callvia Certo

This guide will help you set up and run the Callvia Certo platform locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** v8.0.0 or higher ([Install](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

## Step 1: Clone and Install

```bash
# Navigate to project directory
cd /workspaces/Callvia-Certo

# Install all dependencies
pnpm install

# This will install dependencies for:
# - Root workspace
# - Backend app
# - Types package
# - Constants package
```

## Step 2: Environment Configuration

```bash
# Copy the example environment file
cp .env.example apps/backend/.env

# Edit the file if needed (defaults work for local development)
# nano apps/backend/.env
```

The default `.env` file includes:
- Mock mode enabled
- JWT secret (change in production!)
- Port 3000
- Mock external services

## Step 3: Start the Backend

```bash
# Start backend in development mode
pnpm backend:dev

# You should see output like:
# Server listening on port 3000
# Environment: development
# Mock Mode: ENABLED
```

The server is now running at `http://localhost:3000`

## Step 4: Test the API

### Using curl

```bash
# 1. Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","version":"1.0.0"}

# 2. Login (mock)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant.com","password":"test"}'

# Expected response includes a token like: user_123:tenant_abc:TENANT_ADMIN

# 3. Get wallet balance
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"

# Expected response:
# {"success":true,"data":{"balance":150.75,"currency":"USD","tenant_id":"tenant_abc"},...}

# 4. Initiate KYC verification (tests gatekeeper + wallet deduction)
curl -X POST http://localhost:3000/api/v1/kyc/initiate \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "end_user_id": "user_456",
    "document_types": ["passport"],
    "biometric_required": true
  }'

# Expected: Success response with session_id and verification_url

# 5. Query audit logs
curl "http://localhost:3000/api/v1/audit/logs?limit=10" \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"

# Expected: List of audit log entries for tenant_abc
```

### Using Postman or Thunder Client

Import this collection structure:

**Collection: Callvia Certo API**

1. **Auth**
   - POST `http://localhost:3000/api/v1/auth/login`
   - Body: `{"email":"admin@tenant.com","password":"test"}`

2. **Wallet**
   - GET `http://localhost:3000/api/v1/wallet/balance`
   - Header: `Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN`

3. **KYC**
   - POST `http://localhost:3000/api/v1/kyc/initiate`
   - Header: `Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN`
   - Body: `{"end_user_id":"user_456","document_types":["passport"],"biometric_required":true}`

## Step 5: Understanding Mock Mode

Currently, the backend runs in **MOCK MODE** which means:

### Mocked Components
- ✅ **Database**: In-memory storage for wallets, tenants, pricing
- ✅ **Authentication**: Simple token parsing (format: `user_id:tenant_id:role`)
- ✅ **KYC Provider**: Returns mock verification sessions
- ✅ **Voice Provider**: Returns mock call sessions
- ✅ **Payment Gateway**: Instantly credits wallet
- ✅ **Audit Logs**: Stored in memory (logged to console)

### Real Components
- ✅ **Middleware Pipeline**: Auth → Tenant → Gatekeeper
- ✅ **Business Logic**: Wallet deduction, pricing resolution
- ✅ **Audit Logging**: Full event tracking
- ✅ **RBAC**: Role-based access control
- ✅ **Account Status**: Cascading disable logic

## Step 6: Testing Key Features

### Test 1: Wallet Balance Check
```bash
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"

# tenant_abc starts with $150.75
```

### Test 2: Service Gatekeeper (Success)
```bash
# KYC costs $2.00, tenant has $150.75, should succeed
curl -X POST http://localhost:3000/api/v1/kyc/initiate \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"end_user_id":"user_456","document_types":["passport"],"biometric_required":true}'

# Check wallet again - should be $148.75 now
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"
```

### Test 3: Insufficient Balance (Blocked)
```bash
# Use tenant_xyz which has only $5.50
curl -X POST http://localhost:3000/api/v1/kyc/initiate \
  -H "Authorization: Bearer user_123:tenant_xyz:TENANT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"end_user_id":"user_456","document_types":["passport"],"biometric_required":true}'

# After 3 KYC calls ($2 each = $6), this should fail with:
# {"success":false,"error":{"code":"INSUFFICIENT_BALANCE","message":"Wallet balance too low"}}
```

### Test 4: Audit Logs
```bash
# View audit logs for all actions
curl http://localhost:3000/api/v1/audit/logs \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"

# Filter by event type
curl "http://localhost:3000/api/v1/audit/logs?event_type=KYC_STARTED" \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"
```

### Test 5: Role-Based Access
```bash
# Try creating sub-tenant as AGENT (should fail)
curl -X POST http://localhost:3000/api/v1/tenants/sub-tenants \
  -H "Authorization: Bearer user_456:tenant_abc:AGENT" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Sub Tenant","email":"sub@example.com"}'

# Expected: 403 Forbidden (AGENT role not allowed)

# Try as TENANT_ADMIN (should succeed)
curl -X POST http://localhost:3000/api/v1/tenants/sub-tenants \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Sub Tenant","email":"sub@example.com"}'

# Expected: Success
```

## Step 7: Development Workflow

### File Structure
```
apps/backend/src/
├── index.ts                 # Server entry point
├── config.ts                # Configuration
├── routes.ts                # Route registration
├── middleware/              # Auth, Tenant, RBAC, Gatekeeper
├── engines/                 # Wallet, Pricing, AccountStatus
├── services/                # AuditLogger
├── auth/                    # Auth routes
├── wallet/                  # Wallet routes
├── tenant/                  # Tenant routes
├── kyc/                     # KYC routes
├── voice/                   # Voice routes
└── audit/                   # Audit routes
```

### Making Changes

1. **Edit a file** (e.g., `apps/backend/src/wallet/wallet.routes.ts`)
2. **Save** - tsx watch will auto-reload
3. **Test** - Use curl or Postman
4. **Check logs** - Watch terminal for structured logs

### Adding a New Route

```typescript
// apps/backend/src/wallet/wallet.routes.ts

fastify.get('/my-new-endpoint', async (request, reply) => {
  // Your logic here
  return {
    success: true,
    data: { message: 'Hello!' },
    meta: {
      request_id: request.requestId,
      timestamp: new Date().toISOString(),
    },
  };
});
```

Test:
```bash
curl http://localhost:3000/api/v1/wallet/my-new-endpoint \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"
```

## Step 8: Next Steps

### Phase 4: Frontend Development
1. Create React + Vite app in `apps/frontend/`
2. Implement dashboard layout
3. Connect to backend API
4. Build wallet UI, audit viewer

### Phase 5: Database Integration
1. Setup PostgreSQL container
2. Define schema
3. Replace mock engines with DB queries
4. Run migrations

### Phase 6: Real Integrations
1. Integrate Onfido/Jumio for KYC
2. Integrate Twilio for Voice
3. Integrate Stripe for Payments
4. Setup SendGrid for Emails

## Troubleshooting

### Port 3000 already in use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in apps/backend/.env
PORT=3001
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### TypeScript errors
```bash
# Check TypeScript config
cd apps/backend
npx tsc --noEmit
```

## Getting Help

- **Full Specification**: See [PROJECT_MASTER_PROMPT.md](./PROJECT_MASTER_PROMPT.md)
- **API Documentation**: See [README_DEV.md](./README_DEV.md#-api-endpoints)
- **Original Requirements**: See [README.md](./README.md)

---

**Happy Coding! 🚀**
