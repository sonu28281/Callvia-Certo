# Callvia Certo
## White-Label Multi-Tenant Compliance & AI Verification Platform

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> A B2B SaaS platform providing KYC verification, AI-powered voice verification, and compliance management with white-label multi-tenancy.

---

## 🎯 Project Overview

Callvia Certo is a **greenfield** enterprise SaaS platform built with compliance-first, revenue-protected, and audit-driven principles.

### What We Provide

- **KYC Verification** - Integration-ready document and biometric verification
- **Voice Verification** - AI-powered voice authentication and call management
- **Compliance Vault** - Secure document storage with audit trails
- **White-Label** - Fully customizable branding per tenant
- **Prepaid Billing** - Wallet-based pay-per-use model
- **Multi-Tenant** - Strict data isolation with hierarchical control

---

## 🏗️ Architecture Principles

1. **Multi-tenant from Day 1** - Hard tenant isolation, no data leakage
2. **White-label by default** - Custom domains, branding, and themes
3. **Hierarchical control** - SuperAdmin → Tenant → Sub-Tenant → Agent
4. **Prepaid only** - Zero credit, wallet-based billing
5. **Audit logs = spine** - Every action logged for compliance
6. **Modular design** - Plugin-ready for future services
7. **DB-Later mode** - Architecture first, database implementation later

---

## 📁 Project Structure

```
callvia-certo/
├── apps/
│   ├── backend/          # Fastify API server (Node.js + TypeScript)
│   └── frontend/         # React + Vite dashboard (TODO)
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── constants/        # Shared constants & enums
├── docker/               # Docker configuration (TODO)
├── .github/              # CI/CD workflows (TODO)
├── PROJECT_MASTER_PROMPT.md  # Complete project specification
├── README.md (original)  # Original requirements
└── README_DEV.md         # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example apps/backend/.env

# Start backend development server
pnpm backend:dev
```

The API server will start on **http://localhost:3000**

### Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Login (mock authentication)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant.com","password":"test"}'

# Response includes a mock token like: user_123:tenant_abc:TENANT_ADMIN

# Get wallet balance (use token from login)
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"

# Initiate KYC verification
curl -X POST http://localhost:3000/api/v1/kyc/initiate \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "end_user_id": "user_456",
    "document_types": ["passport"],
    "biometric_required": true
  }'
```

---

## 🔑 Core Features Implemented

### 1. Hierarchical User Management
```
SuperAdmin (Platform Owner)
 └─→ Tenant (Your B2B Customer)
     └─→ Sub-Tenant (Tenant's Customer)
         └─→ Agent (Sub-Tenant's Employee)
             └─→ End User (KYC Subject)
```

### 2. Service Gatekeeper Middleware
Every paid service goes through these checks:
1. ✅ Account status (disabled accounts blocked)
2. ✅ Service pricing (is pricing configured?)
3. ✅ Wallet balance (sufficient funds?)
4. ✅ Audit log (allowed/blocked/failed action)

### 3. Comprehensive Audit Logging
- **Append-only** - No updates or deletes allowed
- **Tenant-isolated** - Data never leaks between tenants
- **Complete coverage** - Auth, billing, services, admin actions
- **Searchable** - Ready for Elasticsearch integration

### 4. Prepaid Wallet System
- Zero credit policy (no negative balance)
- Real-time balance tracking
- Atomic deductions (deduct → execute → refund on failure)
- Full transaction history

### 5. Mock Integrations
- KYC provider interface (ready for Onfido/Jumio)
- Voice provider interface (ready for Twilio)
- Payment gateway (ready for Stripe)

---

## 🛠️ Technology Stack

### Backend (✅ Implemented)
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify (high performance)
- **Logging**: Pino (structured JSON logs)
- **Validation**: Zod (schema validation)
- **Auth**: JWT (mocked for now)
- **Security**: Helmet.js, CORS, Rate Limiting

### Database (TODO)
- **Primary**: PostgreSQL 15+
- **Cache**: Redis
- **Search**: Elasticsearch

### Frontend (TODO)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **State**: Zustand
- **API**: TanStack Query

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Mock login | No |
| POST | `/api/v1/auth/logout` | Logout | Yes |

### Wallet Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/wallet/balance` | Get wallet balance | Yes |
| POST | `/api/v1/wallet/topup` | Recharge wallet | Yes |
| GET | `/api/v1/wallet/transactions` | Transaction history | Yes |

### Tenant Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tenants/me` | Get tenant info | Yes |
| POST | `/api/v1/tenants/sub-tenants` | Create sub-tenant | Yes (Admin) |
| PUT | `/api/v1/tenants/white-label` | Update branding | Yes |

### KYC Services
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/kyc/initiate` | Start KYC verification | Yes + Wallet |
| GET | `/api/v1/kyc/:sessionId/status` | Check KYC status | Yes |
| GET | `/api/v1/kyc/:sessionId/result` | Get KYC result | Yes |

### Voice Services
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/voice/call` | Initiate voice call | Yes + Wallet |
| GET | `/api/v1/voice/:callId/status` | Get call status | Yes |
| GET | `/api/v1/voice/:callId/recording` | Get recording URL | Yes |

### Audit Logs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/audit/logs` | Query audit logs | Yes |
| POST | `/api/v1/audit/export` | Export logs | Yes |

---

## 🧪 Development Status

### ✅ Completed (Phases 1-3)
- [x] Monorepo structure with pnpm workspaces
- [x] Shared types package (@callvia-certo/types)
- [x] Shared constants package (@callvia-certo/constants)
- [x] Auth middleware (mocked JWT)
- [x] Tenant context resolver
- [x] RBAC engine with role-based access
- [x] Account status engine (cascading disable)
- [x] Wallet engine (mocked in-memory)
- [x] Pricing engine (tenant-specific + defaults)
- [x] Service gatekeeper middleware
- [x] Audit logger service
- [x] API routes for all core modules
- [x] Fastify server with security plugins

### 🚧 In Progress (Phase 4)
- [ ] Frontend React application
- [ ] Dashboard UI layout
- [ ] Wallet recharge interface
- [ ] Audit log viewer
- [ ] White-label theme system

### 📋 Backlog (Future Phases)
- [ ] PostgreSQL database integration
- [ ] Redis caching layer
- [ ] Real KYC provider (Onfido/Jumio)
- [ ] Real voice provider (Twilio/Vonage)
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] Email service (SendGrid/AWS SES)
- [ ] Webhook delivery system
- [ ] Feature flags management
- [ ] Multi-region deployment
- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Load testing (k6)
- [ ] Security audit
- [ ] SOC 2 compliance

---

## 🔐 Security Features

- **JWT Authentication** - Token-based auth with expiration
- **Rate Limiting** - 100 requests/minute per IP
- **Helmet.js** - Security headers (CSP, X-Frame-Options, etc.)
- **CORS** - Configured for white-label domains
- **Input Validation** - Zod schemas on all endpoints
- **SQL Injection Prevention** - Parameterized queries (when DB added)
- **XSS Protection** - Content sanitization

---

## 📖 Documentation

- **[PROJECT_MASTER_PROMPT.md](./PROJECT_MASTER_PROMPT.md)** - Complete specification (architecture, business rules, development phases)
- **[README.md](./README.md)** - Original requirements document
- **API Documentation** - Swagger/OpenAPI (TODO)
- **Architecture Decisions** - ADRs (TODO)

---

## 🎯 Success Criteria (Phase 1-4)

| Criterion | Status |
|-----------|--------|
| Backend server starts without errors | ✅ |
| Frontend loads with white-label theme | ⏳ |
| All middleware chains correctly | ✅ |
| Mock KYC call succeeds (with audit log) | ✅ |
| Wallet balance displays in UI | ⏳ |
| Gatekeeper blocks low-balance action | ✅ |
| Audit logs generated for every action | ✅ |
| Role-based access works | ✅ |
| Account disable cascades correctly | ✅ |
| Code has TODO markers for DB integration | ✅ |

---

## 🚀 Next Steps

1. **Install dependencies**: `pnpm install`
2. **Start backend**: `pnpm backend:dev`
3. **Test API**: Use curl or Postman with examples above
4. **Build frontend**: Follow Phase 4 in PROJECT_MASTER_PROMPT.md
5. **Integrate database**: Replace mocks with PostgreSQL
6. **Deploy**: Set up Docker + Kubernetes

---

## 🤝 Contributing

This is currently a private/internal project. Contribution guidelines will be added when open-sourced.

---

## 📄 License

ISC License

---

**Built with ❤️ for enterprise compliance and security**

For questions or support, refer to [PROJECT_MASTER_PROMPT.md](./PROJECT_MASTER_PROMPT.md) for detailed specifications.
