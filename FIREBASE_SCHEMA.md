# Firebase Firestore Database Schema

## 🔥 Firestore Collections Structure

### 1. **users** Collection
```typescript
users/{userId}
{
  // Basic Info
  userId: string;              // Firebase Auth UID
  email: string;               // User email
  displayName: string;         // Full name
  phoneNumber?: string;        // Phone number
  
  // Role & Access
  role: 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
  tenantId?: string;           // Reference to tenant (null for platform admin)
  
  // Profile
  photoURL?: string;           // Profile picture URL
  createdAt: Timestamp;        // Account creation date
  updatedAt: Timestamp;        // Last update
  lastLoginAt?: Timestamp;     // Last login time
  
  // Status
  isActive: boolean;           // Account active status
  isEmailVerified: boolean;    // Email verification status
  
  // Metadata
  createdBy?: string;          // User ID who created this account
  permissions?: string[];      // Custom permissions array
}
```

**Example Document:**
```javascript
{
  userId: "abc123xyz",
  email: "admin@company.com",
  displayName: "Rahul Kumar",
  phoneNumber: "+919876543210",
  role: "TENANT_ADMIN",
  tenantId: "tenant_001",
  photoURL: "https://...",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  lastLoginAt: Timestamp.now(),
  isActive: true,
  isEmailVerified: true,
  permissions: ["MANAGE_KYC", "VIEW_WALLET"]
}
```

---

### 2. **tenants** Collection (Companies/Resellers)
```typescript
tenants/{tenantId}
{
  // Basic Info
  tenantId: string;
  companyName: string;
  email: string;               // Company email
  phoneNumber?: string;
  
  // Business Details
  gstNumber?: string;
  panNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  
  // KYC Configuration (NEW - Tenant-specific)
  kycConfig: {
    methods: string[];         // ['digilocker', 'liveness', ...]
    allowOverrides: boolean;   // Can admins override per customer?
    defaultPackageId?: string; // Reference to pricing template
  };
  
  // Pricing
  pricing: {
    basePrice: number;         // Base cost per verification
    perMethodPricing: {
      digilocker?: number;
      liveness?: number;
      aadhaar_otp?: number;
      passport?: number;
      document_upload?: number;
      video_kyc?: number;
      digital_contract?: number;
    };
    totalPrice: number;        // Auto-calculated
  };
  
  // Email Branding
  emailConfig: {
    templateType: 'minimal' | 'standard' | 'complete';
    brandColor?: string;
    logoURL?: string;
    customMessage?: string;
  };
  
  // Wallet
  walletBalance: number;       // Current balance in ₹
  creditLimit?: number;        // Credit limit if applicable
  
  // Status
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  marketSegment: 'basic' | 'standard' | 'premium' | 'enterprise';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;           // Platform admin who created
  
  // Statistics (denormalized for quick access)
  stats: {
    totalVerifications: number;
    successfulVerifications: number;
    totalSpent: number;
    lastVerificationAt?: Timestamp;
  };
}
```

---

### 3. **kyc_sessions** Collection
```typescript
kyc_sessions/{sessionId}
{
  // Session Info
  sessionId: string;
  tenantId: string;
  initiatedBy: string;         // User ID who initiated
  
  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  // KYC Configuration (from tenant profile)
  configuredMethods: string[]; // Methods from tenant's KYC config
  verificationMethods: {
    digilocker: boolean;
    liveness: boolean;
    aadhaarOTP: boolean;
    passport: boolean;
    documentUpload: boolean;
    videoKYC: boolean;
    digitalContract: boolean;
  };
  
  // Override Info (if applicable)
  isOverride: boolean;
  overrideReason?: string;
  overrideNotes?: string;
  overrideLogId?: string;      // Reference to kyc_override_logs
  
  // Pricing
  baseCost: number;
  totalCost: number;
  costDelta: number;           // If override applied
  
  // Status
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'EXPIRED';
  
  // Verification Results
  verificationResults: {
    digilocker?: {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      completedAt?: Timestamp;
      data?: any;              // Retrieved documents
    };
    liveness?: {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      completedAt?: Timestamp;
      score?: number;
    };
    documents?: {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      completedAt?: Timestamp;
      uploadedFiles?: string[];
    };
    // ... other methods
  };
  
  // Documents (URLs to uploaded files)
  uploadedDocuments: {
    documentType: string;
    fileURL: string;
    uploadedAt: Timestamp;
  }[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;        // Session expiry (24 hours)
  completedAt?: Timestamp;
  
  // Review
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}
```

---

### 4. **kyc_override_logs** Collection
```typescript
kyc_override_logs/{overrideLogId}
{
  id: string;
  sessionId: string;
  tenantId: string;
  
  // Customer
  customerName: string;
  customerEmail: string;
  
  // Configuration Changes
  originalConfig: {
    methods: string[];
    verificationMethods: object;
    estimatedCost: number;
  };
  overrideConfig: {
    methods: string[];
    verificationMethods: object;
    estimatedCost: number;
  };
  
  // Added/Removed Methods
  addedModules: string[];
  removedModules: string[];
  
  // Governance
  reason: string;              // Mandatory
  notes?: string;
  appliedBy: string;           // User ID
  appliedByRole: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  
  // Cost Impact
  costDelta: number;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
```

---

### 5. **wallet_transactions** Collection
```typescript
wallet_transactions/{transactionId}
{
  transactionId: string;
  tenantId: string;
  
  // Transaction Details
  type: 'CREDIT' | 'DEBIT' | 'REFUND';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  
  // Related Entity
  relatedEntity?: {
    type: 'KYC_SESSION' | 'VOICE_CALL' | 'CONTRACT';
    id: string;
  };
  
  // Description
  description: string;
  
  // Status
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  
  // Payment Info (for credits)
  paymentMethod?: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET';
  paymentGatewayId?: string;
  
  // Metadata
  createdAt: Timestamp;
  processedAt?: Timestamp;
  createdBy: string;
}
```

---

### 6. **audit_logs** Collection
```typescript
audit_logs/{auditLogId}
{
  auditLogId: string;
  tenantId: string;
  
  // Event Details
  eventType: 'LOGIN_SUCCESS' | 'KYC_INITIATED' | 'KYC_APPROVED' | 'WALLET_CREDIT' | ...;
  eventResult: 'ALLOWED' | 'DENIED' | 'ERROR';
  
  // Actor (who performed the action)
  actorId: string;
  actorRole: string;
  actorType: 'USER' | 'SYSTEM' | 'API';
  
  // Target (what was affected)
  targetEntity: string;        // 'kyc_session', 'wallet', 'user'
  targetId: string;
  
  // Details
  message: string;
  metadata?: any;
  
  // Request Info
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  
  // Timestamp
  timestamp: Timestamp;
}
```

---

### 7. **pricing_templates** Collection (Platform Admin)
```typescript
pricing_templates/{templateId}
{
  id: string;
  name: string;                // 'Basic - DigiLocker Only'
  description: string;
  
  // Methods Included
  methods: string[];           // ['digilocker', 'liveness']
  
  // Pricing
  basePrice: number;
  perMethodPricing: {
    digilocker?: number;
    liveness?: number;
    // ...
  };
  totalPrice: number;
  
  // Status
  isActive: boolean;
  
  // Usage Stats
  usedByTenantCount: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 📊 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isTenantAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'TENANT_ADMIN';
    }
    
    function isPlatformAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'PLATFORM_ADMIN';
    }
    
    function belongsToSameTenant(tenantId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenantId == tenantId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isPlatformAdmin());
      allow create: if isPlatformAdmin();
      allow update: if isOwner(userId) || isPlatformAdmin();
      allow delete: if isPlatformAdmin();
    }
    
    // Tenants collection
    match /tenants/{tenantId} {
      allow read: if isAuthenticated() && (belongsToSameTenant(tenantId) || isPlatformAdmin());
      allow create: if isPlatformAdmin();
      allow update: if (isTenantAdmin() && belongsToSameTenant(tenantId)) || isPlatformAdmin();
      allow delete: if isPlatformAdmin();
    }
    
    // KYC Sessions
    match /kyc_sessions/{sessionId} {
      allow read: if isAuthenticated() && 
                     (belongsToSameTenant(resource.data.tenantId) || isPlatformAdmin());
      allow create: if isAuthenticated() && isTenantAdmin();
      allow update: if isAuthenticated() && 
                       (belongsToSameTenant(resource.data.tenantId) || isPlatformAdmin());
      allow delete: if isPlatformAdmin();
    }
    
    // Wallet Transactions
    match /wallet_transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     (belongsToSameTenant(resource.data.tenantId) || isPlatformAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isPlatformAdmin();
    }
    
    // Audit Logs (read-only for tenants)
    match /audit_logs/{logId} {
      allow read: if isAuthenticated() && 
                     (belongsToSameTenant(resource.data.tenantId) || isPlatformAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if false; // Immutable
    }
    
    // Pricing Templates
    match /pricing_templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isPlatformAdmin();
    }
  }
}
```

---

## 🔑 Firebase Authentication Setup

### User Roles Hierarchy
```
PLATFORM_ADMIN
  ├── Full access to all tenants
  ├── Create/manage tenants
  ├── Configure pricing templates
  └── View all data

TENANT_ADMIN
  ├── Manage their company profile
  ├── Configure KYC methods
  ├── Initiate KYC for customers
  ├── View wallet balance
  └── Manage tenant users

TENANT_USER
  ├── View KYC sessions
  ├── Upload documents
  └── Limited access
```

---

## 📝 Index Requirements

Create these composite indexes in Firestore:

### 1. KYC Sessions by Tenant & Status
```
Collection: kyc_sessions
Fields: tenantId (Ascending), status (Ascending), createdAt (Descending)
```

### 2. Wallet Transactions by Tenant & Date
```
Collection: wallet_transactions
Fields: tenantId (Ascending), createdAt (Descending)
```

### 3. Audit Logs by Tenant & Event Type
```
Collection: audit_logs
Fields: tenantId (Ascending), eventType (Ascending), timestamp (Descending)
```

### 4. Users by Tenant
```
Collection: users
Fields: tenantId (Ascending), isActive (Ascending), createdAt (Descending)
```

---

## 🚀 Initial Data Seeding

### Create Platform Admin (First User)
```javascript
{
  userId: "platform_admin_001",
  email: "admin@callvia-certo.com",
  displayName: "Platform Admin",
  role: "PLATFORM_ADMIN",
  isActive: true,
  isEmailVerified: true,
  createdAt: Timestamp.now()
}
```

### Create Default Pricing Templates
```javascript
// Basic Package
{
  id: "basic-digilocker",
  name: "Basic - DigiLocker Only",
  methods: ["digilocker"],
  totalPrice: 1.00,
  isActive: true
}

// Standard Package
{
  id: "standard-digilocker-liveness",
  name: "Standard - DigiLocker + Liveness",
  methods: ["digilocker", "liveness"],
  totalPrice: 2.50,
  isActive: true
}
```

---

## 📊 Summary

**Total Collections:** 7
- ✅ users (authentication & profiles)
- ✅ tenants (companies/resellers)
- ✅ kyc_sessions (verification sessions)
- ✅ kyc_override_logs (audit trail)
- ✅ wallet_transactions (payment history)
- ✅ audit_logs (system events)
- ✅ pricing_templates (packages)

**Key Features:**
- 🔐 Role-based access control
- 💰 Multi-tenant architecture
- 📝 Complete audit trail
- 🔒 Firestore security rules
- 📊 Denormalized stats for performance
- 🎯 Indexed queries for speed

Ab Firebase setup ke saath login/signup implement karte hain! 🚀
