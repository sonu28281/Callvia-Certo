# System Architecture: Multi-Tenant KYC & Digital Contract Platform

**Document Version:** 1.0  
**Last Updated:** February 1, 2026  
**Compliance Framework:** DPDP Act 2023, IT Act Section 10A, DigiLocker API Guidelines

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [User Flows](#user-flows)
5. [API Design](#api-design)
6. [Database Schema](#database-schema)
7. [Security & Compliance](#security--compliance)
8. [Digital Signature Framework](#digital-signature-framework)
9. [Third-Party Extension Points](#third-party-extension-points)
10. [Cost Analysis](#cost-analysis)
11. [Migration Roadmap](#migration-roadmap)

---

## Executive Summary

### Design Philosophy
**Primary Stack (Preferred):**
- ✅ DigiLocker OAuth (FREE, govt-backed)
- ✅ Platform-controlled Mobile OTP (₹0.10-0.20/SMS)
- ✅ Live Face Detection (In-house, FREE)
- ✅ Document OCR + Face Match (AWS Rekognition: ₹1-2/verification)
- ✅ In-house Digital Signing (FREE)

**Total Cost:** ₹1.50-2.50 per complete KYC + Signing

**Avoid by Default:**
- ❌ Aadhaar OTP via IDfy/Signzy (₹3-5/verification)
- ❌ UIDAI AUA/ASA licenses (₹50 lakhs+ investment)
- ❌ Third-party signing UIs (₹10-50/signature)

**Future-Ready:**
- 🔌 Pluggable architecture for optional third-party providers
- 🔌 Abstract verification layer for hybrid models
- 🔌 Compliance-first design

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Platform Frontend                            │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐                 │
│  │  Platform  │  │   Reseller   │  │   Customer  │                 │
│  │   Admin    │  │   Dashboard  │  │   Portal    │                 │
│  └────────────┘  └──────────────┘  └─────────────┘                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API Gateway / Auth Layer                      │
│                    (JWT + RBAC + Tenant Isolation)                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  KYC Engine   │  │  Contract Engine │  │  Signing Engine  │
│               │  │                  │  │                  │
│ - Verification│  │ - Template Mgmt  │  │ - Signature UI   │
│ - Orchestrator│  │ - Dynamic Fields │  │ - Cryptographic  │
│ - Provider    │  │ - PDF Generation │  │   Hash           │
│   Abstraction │  │ - Delivery       │  │ - Audit Trail    │
└───────┬───────┘  └────────┬─────────┘  └────────┬─────────┘
        │                   │                      │
        ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Core Services Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐           │
│  │   Audit      │  │   Consent    │  │   Notification │           │
│  │   Logger     │  │   Manager    │  │   Service      │           │
│  └──────────────┘  └──────────────┘  └────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL   │  │   Redis Cache    │  │   S3 Storage     │
│               │  │                  │  │                  │
│ - Tenants     │  │ - Sessions       │  │ - Documents      │
│ - Users       │  │ - OTP Cache      │  │ - Signed PDFs    │
│ - KYC Records │  │ - Rate Limiting  │  │ - Face Images    │
│ - Contracts   │  │                  │  │                  │
│ - Signatures  │  │                  │  │                  │
└───────────────┘  └──────────────────┘  └──────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  DigiLocker   │  │   SMS Gateway    │  │  AWS Rekognition │
│  OAuth API    │  │  (MSG91/Twilio)  │  │  (Face Match)    │
│  (FREE)       │  │  (₹0.10/SMS)     │  │  (₹1-2/call)     │
└───────────────┘  └──────────────────┘  └──────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│        Third-Party Provider Abstraction Layer (Optional)       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Signzy  │  │   IDfy   │  │ HyperVerge│  │  Digio   │     │
│  │ Adapter  │  │ Adapter  │  │  Adapter  │  │ Adapter  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. KYC Engine

**Purpose:** Orchestrate multi-step verification flows with provider abstraction and per-customer override support

**Components:**

#### 1.1 Verification Orchestrator
```typescript
interface IKYCOrchestrator {
  initiateKYC(params: KYCInitiationParams): Promise<KYCSession>;
  executeStep(sessionId: string, step: VerificationStep): Promise<StepResult>;
  getSessionStatus(sessionId: string): Promise<KYCSessionStatus>;
  completeKYC(sessionId: string): Promise<KYCCompletionResult>;
  applyKYCOverride(params: KYCOverrideParams): Promise<KYCSession>;
}

interface KYCInitiationParams {
  tenantId: string;          // Platform or Reseller ID
  customerId: string;        // End customer ID
  verificationType: 'full' | 'lite' | 'custom';
  requiredSteps: VerificationStepType[];
  callbackUrl?: string;
  
  // Override Support
  useOverride?: boolean;     // Flag to indicate if override is being applied
  overrideConfig?: KYCOverrideConfig;
  overrideReason?: string;   // Mandatory if useOverride = true
  overrideNotes?: string;    // Optional supporting notes
  overrideAppliedBy?: string; // User ID who applied override
}

interface KYCOverrideParams {
  customerId: string;
  originalConfig: KYCConfig;
  overrideConfig: KYCConfig;
  reason: string;           // Mandatory
  notes?: string;
  appliedBy: string;        // User ID
  requiresApproval?: boolean; // For high-risk overrides
}

interface KYCConfig {
  verificationType: 'full' | 'lite' | 'custom';
  requiredSteps: VerificationStepType[];
  estimatedCost: number;
  additionalModules?: string[]; // e.g., ['video_kyc', 'enhanced_liveness']
}

enum VerificationStepType {
  DIGILOCKER_IDENTITY = 'digilocker_identity',
  MOBILE_OTP = 'mobile_otp',
  LIVE_FACE = 'live_face',
  DOCUMENT_UPLOAD = 'document_upload',
  FACE_MATCH = 'face_match',
  // Future: Third-party options
  AADHAAR_OTP_THIRDPARTY = 'aadhaar_otp_thirdparty',
  VIDEO_KYC = 'video_kyc'
}
```

#### 1.2 Provider Abstraction Layer
```typescript
interface IVerificationProvider {
  readonly name: string;
  readonly type: VerificationStepType;
  readonly cost: number; // in rupees
  
  verify(request: VerificationRequest): Promise<VerificationResult>;
  isAvailable(): Promise<boolean>;
}

// Primary Providers (In-house)
class DigiLockerProvider implements IVerificationProvider {
  name = 'DigiLocker OAuth';
  type = VerificationStepType.DIGILOCKER_IDENTITY;
  cost = 0; // FREE
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // OAuth flow implementation
  }
}

class MobileOTPProvider implements IVerificationProvider {
  name = 'Platform Mobile OTP';
  type = VerificationStepType.MOBILE_OTP;
  cost = 0.15; // ₹0.15 per SMS
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // MSG91/Twilio integration
  }
}

class LiveFaceProvider implements IVerificationProvider {
  name = 'In-house Liveness Detection';
  type = VerificationStepType.LIVE_FACE;
  cost = 0; // FREE
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // face-api.js ML-based detection
  }
}

class DocumentOCRProvider implements IVerificationProvider {
  name = 'Document OCR + Face Match';
  type = VerificationStepType.FACE_MATCH;
  cost = 1.5; // AWS Rekognition cost
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // AWS Rekognition or Azure Face API
  }
}

// Optional Third-Party Providers
class SignzyAadhaarProvider implements IVerificationProvider {
  name = 'Signzy Aadhaar OTP';
  type = VerificationStepType.AADHAAR_OTP_THIRDPARTY;
  cost = 4.5;
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // Signzy API integration (optional)
  }
}
```

#### 1.3 Verification Factory Pattern
```typescript
class VerificationProviderFactory {
  private providers: Map<VerificationStepType, IVerificationProvider[]> = new Map();
  
  register(provider: IVerificationProvider): void {
    const existing = this.providers.get(provider.type) || [];
    existing.push(provider);
    this.providers.set(provider.type, existing);
  }
  
  getBestProvider(
    stepType: VerificationStepType,
    criteria: 'cost' | 'reliability' | 'speed' = 'cost'
  ): IVerificationProvider {
    const available = this.providers.get(stepType) || [];
    
    if (criteria === 'cost') {
      return available.sort((a, b) => a.cost - b.cost)[0];
    }
    
    // Add more selection logic
    return available[0];
  }
  
  getAllProviders(stepType: VerificationStepType): IVerificationProvider[] {
    return this.providers.get(stepType) || [];
  }
}
```

---

### 2. Contract Engine

**Purpose:** Template management, dynamic PDF generation, and delivery

#### 2.1 Contract Template Manager
```typescript
interface IContractTemplate {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  pdfTemplateUrl: string;
  dynamicFields: DynamicField[];
  createdAt: Date;
  updatedAt: Date;
}

interface DynamicField {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'currency';
  placeholder: string;
  required: boolean;
  validation?: string; // regex
}

class ContractTemplateService {
  async createTemplate(params: CreateTemplateParams): Promise<IContractTemplate>;
  async updateTemplate(id: string, updates: Partial<IContractTemplate>): Promise<IContractTemplate>;
  async generatePDF(templateId: string, data: Record<string, any>): Promise<Buffer>;
  async shareWithCustomer(contractId: string, customerId: string): Promise<string>;
}
```

#### 2.2 PDF Generation
```typescript
import PDFDocument from 'pdfkit';

class PDFGenerationService {
  async generateFromTemplate(
    template: IContractTemplate,
    data: Record<string, any>
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    // Load template PDF
    // Replace dynamic fields
    // Add metadata
    
    doc.end();
    
    return Buffer.concat(chunks);
  }
  
  async addSignatureMetadata(
    pdfBuffer: Buffer,
    signature: ISignature
  ): Promise<Buffer> {
    // Embed signature metadata into PDF
    // Add visual signature block
    // Add verification QR code
  }
}
```

---

### 3. Signing Engine

**Purpose:** Legally valid electronic signatures with audit trail

#### 3.1 Signature Capture
```typescript
interface ISignature {
  id: string;
  contractId: string;
  customerId: string;
  tenantId: string;
  
  // Signature Data
  signatureType: 'drawn' | 'typed' | 'uploaded';
  signatureDataUrl: string; // Base64 image
  
  // Binding Data (Critical for Legal Validity)
  mobileNumber: string;
  mobileVerified: boolean;
  otpVerificationId: string;
  
  // Metadata
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  geoLocation?: { lat: number; lon: number };
  
  // Cryptographic Proof
  documentHash: string; // SHA-256 of PDF
  signatureHash: string; // SHA-256 of signature data
  
  // KYC Linkage
  kycSessionId?: string;
  kycVerificationLevel: 'full' | 'lite' | 'none';
  
  // Audit
  consentGiven: boolean;
  consentTimestamp: Date;
  status: 'pending' | 'completed' | 'rejected';
}

class SigningService {
  async initiateSigningSession(
    contractId: string,
    customerId: string
  ): Promise<SigningSession>;
  
  async verifyMobileForSigning(
    sessionId: string,
    mobile: string
  ): Promise<OTPSent>;
  
  async captureSignature(
    sessionId: string,
    signatureData: SignatureData
  ): Promise<ISignature>;
  
  async completeSignature(
    sessionId: string,
    otp: string
  ): Promise<SignedContract>;
  
  async generateCertificate(signatureId: string): Promise<Buffer>;
}
```

#### 3.2 Legal Compliance Framework
```typescript
interface SignatureLegalMetadata {
  // IT Act Section 10A Compliance
  electronicRecordType: 'contract' | 'agreement' | 'consent';
  signatoryIntent: 'agree' | 'accept' | 'acknowledge';
  
  // Evidence Collection
  evidence: {
    preSignatureConsent: boolean;
    termsAcceptance: boolean;
    identityVerification: {
      method: string; // e.g., "DigiLocker + Mobile OTP"
      verificationId: string;
      timestamp: Date;
    };
    documentAccess: {
      viewedAt: Date;
      downloadedAt?: Date;
      timeSpentSeconds: number;
    };
    signatureCapture: {
      method: 'drawn' | 'typed' | 'uploaded';
      capturedAt: Date;
      deviceInfo: string;
    };
  };
  
  // Audit Trail
  auditLog: AuditEntry[];
}

class LegalComplianceService {
  async generateSignatureCertificate(
    signature: ISignature,
    metadata: SignatureLegalMetadata
  ): Promise<SignatureCertificate>;
  
  async validateSignatureIntegrity(signatureId: string): Promise<boolean>;
  
  async generateAuditReport(contractId: string): Promise<AuditReport>;
}
```

---

## User Flows

### Flow 1: Platform Admin → Reseller Onboarding

```
1. Platform Admin Login
   ↓
2. Navigate to "Resellers" → "Add New Reseller"
   ↓
3. Fill Form:
   - Company Name
   - Contact Person
   - Email
   - Mobile
   - Business Type
   - KYC Package Selection (Full/Lite/Custom)
   ↓
4. System Creates:
   - Tenant ID
   - API Keys (for reseller integration)
   - Subdomain (optional): reseller.platform.com
   ↓
5. Email Sent to Reseller:
   - Login Credentials
   - API Documentation
   - Dashboard Access Link
```

### Flow 2: Reseller → Initiate Customer KYC (Single Customer)

```
1. Reseller Login to Dashboard
   ↓
2. Navigate to "Customers" → "Add Customer" → "Start KYC"
   ↓
3. Fill Form:
   - Customer Name
   - Customer Email
   - Customer Mobile
   
   DEFAULT CONFIG (Auto-selected from tenant settings):
   ☑ DigiLocker Identity
   ☑ Mobile OTP
   ☑ Live Face Detection
   ☑ Document Upload
   
   OVERRIDE SECTION (Only if user has APPLY_KYC_OVERRIDES permission):
   ┌────────────────────────────────────────┐
   │ ☐ Apply Custom KYC Configuration       │
   │                                        │
   │ If checked:                            │
   │ ☐ Third-Party Aadhaar OTP (+₹3.50)    │
   │ ☐ Video KYC (+₹15.00)                 │
   │ ☐ Enhanced Liveness Check (+₹2.00)    │
   │                                        │
   │ Reason (required): ________________    │
   │ Notes (optional): __________________   │
   │                                        │
   │ Estimated Cost: ₹1.65 → ₹6.15         │
   └────────────────────────────────────────┘
   ↓
4. System Behavior:
   - If override applied:
     * Validates user has APPLY_KYC_OVERRIDES permission
     * Requires mandatory reason
     * Logs override in kyc_override_logs table
     * Calculates cost impact
     * Checks if approval required (based on tenant settings)
   - If no override:
     * Uses tenant's default_kyc_config
     * Standard cost applies
   ↓
5. System Generates:
   - KYC Session ID
   - Unique Customer Portal Link
   - Consent Collection Page
   - [If override with approval] Creates pending approval record
   ↓
6. Email + SMS Sent to Customer:
   Subject: "[Reseller Name] - Complete Your Verification"
   Body: "Click here to verify: [link]"
   Note: Customer only sees final KYC flow, not override details
   ↓
7. Reseller Sees:
   - KYC Session Status Dashboard
   - Real-time Progress Updates
   - Estimated Completion Time
   - [If override] Override badge with cost delta
   - [If approval pending] "Awaiting Approval" status
```

### Flow 2B: Reseller → Bulk KYC Initiation

```
1. Reseller Dashboard → "Customers" → "Bulk Import"
   ↓
2. Upload CSV or Select Multiple Customers:
   - List of customers with name, email, mobile
   ↓
3. System Behavior (Important):
   - Override option is DISABLED for bulk operations
   - System displays: "Bulk operations always use default KYC configuration"
   - Shows default config and total estimated cost
   ↓
4. Confirm Bulk Action:
   - Total customers: 100
   - Config: DigiLocker + Mobile OTP + Liveness + Document
   - Cost per customer: ₹1.65
   - Total cost: ₹165.00
   ↓
5. System Creates:
   - 100 KYC sessions with default config
   - All marked with is_bulk_operation = true
   - Batch ID for tracking
   ↓
6. Emails sent to all 100 customers
   ↓
7. If specific customer needs override AFTER bulk creation:
   - Reseller can navigate to individual customer
   - Click "Apply Override"
   - Provide reason and select additional modules
   - System creates new override log
   - Updates that specific session only
```

### Flow 3: Customer → Complete KYC Journey

```
1. Customer Clicks Link from Email/SMS
   ↓
2. Landing Page:
   - Reseller Branding (white-label option)
   - Welcome Message
   - Privacy Policy Link
   - Consent Checkboxes:
     ☑ I agree to share my identity information
     ☑ I understand my data will be processed for verification
   ↓
3. Click "Start Verification"
   ↓
4. Step-by-Step Flow:

   STEP 1: DigiLocker Identity (if selected)
   ├─ Button: "Connect with DigiLocker"
   ├─ Redirects to DigiLocker OAuth
   ├─ User Logs in with DigiLocker
   ├─ User Consents to Share Data
   ├─ Redirected Back with Data:
   │  - Name
   │  - Date of Birth
   │  - Gender
   │  - Address (limited attributes)
   ├─ System Stores: NO Aadhaar number
   └─ Status: ✓ Identity Verified
   
   STEP 2: Mobile Number Verification
   ├─ Input: Mobile Number
   ├─ Click "Send OTP"
   ├─ OTP Sent via SMS (MSG91/Twilio)
   ├─ Input: 6-digit OTP
   ├─ Verify OTP
   └─ Status: ✓ Mobile Verified
   
   STEP 3: Live Face Detection (if selected)
   ├─ Camera Permission Request
   ├─ Face Oval Guide Appears
   ├─ Instructions:
   │  1. "Please smile" → Detects smile
   │  2. "Please blink" → Detects blink
   │  3. "Turn your head left" → Detects turn
   │  4. "Turn your head right" → Detects turn
   ├─ Liveness Score Calculated (using face-api.js)
   ├─ Anti-Spoofing Checks:
   │  - Motion detection
   │  - 3D depth estimation
   │  - Reflection analysis
   └─ Status: ✓ Liveness Confirmed (Score: 94%)
   
   STEP 4: Document Upload (if selected)
   ├─ Upload Options:
   │  - Aadhaar Card (front + back)
   │  - PAN Card
   │  - Driving License
   │  - Passport
   ├─ OCR Extraction:
   │  - Name
   │  - Date of Birth
   │  - Document Number (masked in display)
   ├─ Face Matching:
   │  - Extract face from document photo
   │  - Compare with live selfie (Step 3)
   │  - AWS Rekognition: Similarity Score
   └─ Status: ✓ Document Verified (Face Match: 97%)

   ↓
5. Verification Complete Screen:
   - Summary of Verified Data
   - Verification Reference ID
   - Download Verification Certificate (PDF)
   - "Proceed to Next Step" (if contract signing required)
```

### Flow 4: Customer → Sign Digital Contract

```
1. After KYC Complete → Redirect to Contract Review
   ↓
2. Contract Display:
   - PDF Viewer (in-browser)
   - Contract Title
   - Dynamic Fields Populated:
     * Customer Name (from KYC)
     * Customer Mobile (from KYC)
     * Contract Date
     * Custom Terms (reseller-specific)
   ↓
3. UserKYC Config: 🔧 Override / ✓ Default
     * Cost: ₹1.65 / ₹6.15 (with delta)
     * Contract Status: ✓ Signed / ⏳ Pending / - Not Initiated
     * Verification Date
     * Actions: View Details | Apply Override (if not bulk)
   ↓
3. Click "View Details":
   - KYC Summary (no raw data):
     * Identity Verified: Yes/No
     * Mobile Verified: Yes/No
     * Liveness Check: Pass/Fail
     * Document Match: Pass/Fail
   
   - KYC Configuration:
     * Config Used: Default / Override
     * [If Override]:
       ┌─────────────────────────────────────┐
       │ 🔧 OVERRIDE APPLIED                 │
       │                                     │
       │ Original Config: DigiLocker + Mobile│
       │ Override Config: + Video KYC        │
       │ Cost Delta: +₹15.00                 │
       │                                     │
       │ Applied By: John Doe (Admin)        │
       │ Applied On: 2024-02-01 10:30 AM     │
       │ Reason: Customer requested video KYC│
       │ Notes: High-risk profile            │
       │                                     │
       │ Status: ✓ Approved / ⏳ Pending     │
       └─────────────────────────────────────┘
   
   - Contract Summary:
     * Contract Name
     * Signed Date
     * Download Signed PDF
   
   - Audit Trail (high-level):
     * Initiated on: [date]
     * Completed on: [date]
     * Total Time: 8 minutes
     * [If Override] Override Event logged
   ↓
4. Actions Available:
   - [If not bulk & has permission] "Apply Override"
   - [If override pending] "View Approval Status"
   - "View Full Audit Log"
   ↓
5. Export Options:
   - Export Customer List (CSV) - includes override flags
   - Generate Compliance Report
   - Download Audit Logs
   - Export Override Report (shows all overrides with reasons)
   
   Consent Checkboxes:
   ├─ ☑ I have read and understood the contract
   ├─ ☑ I agree to the terms and conditions
   └─ ☑ I digitally sign this agreement
   
   ↓
5. Click "Sign Contract"
   ↓
6. System Processing:
   - Generate Document Hash (SHA-256)
   - Generate Signature Hash
   - Capture Metadata:
     * Timestamp
     * IP Address
     * Device Fingerprint
     * Geo-location (if permitted)
   - Embed Signature into PDF
   - Add Verification QR Code
   - Generate Audit Certificate
   ↓
7. Completion Screen:
   - "Contract Signed Successfully"
   - Download Signed PDF
   - Download Signature Certificate
   - Email Sent with Documents
   - Reference ID for Records
```

### Flow 5: Reseller → View Customer Status

```
1. Reseller Dashboard
   ↓
2. Customer List View:
   - Table with Columns:
     * Customer Name
     * Email (masked: j***@example.com)
     * Mobile (masked: +91-9****56789)
     * KYC Status: ✓ Verified / ⏳ Pending / ✗ Failed
     * Contract Status: ✓ Signed / ⏳ Pending / - Not Initiated
     * Verification Date
     * Actions: View Details
   ↓
3. Click "View Details":
   - KYC Summary (no raw data):
     * Identity Verified: Yes/No
     * Mobile Verified: Yes/No
     * Liveness Check: Pass/Fail
     * Document Match: Pass/Fail
   - Contract Summary:
     * Contract Name
     * Signed Date
     * Download Signed PDF
   - Audit Trail (high-level):
     * Initiated on: [date]
     * Completed on: [date]
     * Total Time: 8 minutes
   ↓
4. Export Options:
   - Export Customer List (CSV)
   - Generate Compliance Report
   - Download Audit Logs
```

---

## API Design

### Authentication & Authorization

```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  tenantId: string;
  role: 'platform_admin' | 'reseller_admin' | 'customer';
  permissions: string[];
  iat: number;
  exp: number;
}

// Middleware
app.use(authenticateJWT);
app.use(authorizeTenant);
app.use(enforceRBAC);
```

### API Endpoints

#### Platform Admin APIs

```typescript
// Reseller Management
POST   /api/v1/admin/resellers                    // Create reseller
GET    /api/v1/admin/resellers                    // List resellers
GET    /api/v1/admin/resellers/:id                // Get reseller details
PUT    /api/v1/admin/resellers/:id                // Update reseller
DELETE /api/v1/admin/resellers/:id                // Deactivate reseller

// System Configuration
POST   /api/v1/admin/config/providers             // Add verification provider
GET    /api/v1/admin/config/providers             // List providers
PUT    /api/v1/admin/config/providers/:id         // Update provider settings

// Analytics
GET    /api/v1/admin/analytics/kyc-stats          // KYC volume & success rates
GET    /api/v1/admin/analytics/cost-report        // Cost per verification
```

#### Reseller APIs

```typescript
// Customer KYC Initiation (Single)
POST   /api/v1/reseller/kyc/initiate
Request Body:
{
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  verificationType: 'full' | 'lite' | 'custom';
  requiredSteps: VerificationStepType[];
  callbackUrl?: string;
  metadata?: Record<string, any>;
  
  // Override Support (optional)
  useOverride?: boolean;
  overrideConfig?: {
    addModules?: VerificationStepType[]; // Additional modules to add
    replaceModules?: VerificationStepType[]; // Replace entire config (requires permission)
  };
  overrideReason?: string; // Mandatory if useOverride = true
  overrideNotes?: string;
}
Response:
{
  sessionId: string;
  customerPortalUrl: string;
  expiresAt: string;
  estimatedCost: number;
  isOverride: boolean;
  overrideCostDelta?: number; // Additional cost if override applied
  requiresApproval?: boolean;
}

// Bulk KYC Initiation (Always uses default config)
POST   /api/v1/reseller/kyc/initiate-bulk
Request Body:
{
  customers: Array<{
    name: string;
    email: string;
    mobile: string;
  }>;
  useDefaultConfig: true; // Always true, cannot be overridden
  callbackUrl?: string;
}
Response:
{
  batchId: string;
  totalCustomers: number;
  estimatedTotalCost: number;
  sessions: Array<{
    customerId: string;
    sessionId: string;
    customerPortalUrl: string;
  }>;
}

// Apply KYC Override (Post-creation)
POST   /api/v1/reseller/kyc/:sessionId/override
Request Body:
{
  addModules?: VerificationStepType[];
  replaceModules?: VerificationStepType[];
  reason: string; // Mandatory
  notes?: string;
}
Response:
{
  success: boolean;
  updatedSession: KYCSession;
  costImpact: number;
  requiresApproval: boolean;
}

// Get Override History
GET    /api/v1/reseller/kyc/:sessionId/override-history
Response:
{
  overrides: Array<{
    id: string;
    appliedBy: string;
    appliedAt: string;
    reason: string;
    notes?: string;
    originalConfig: KYCConfig;
    overrideConfig: KYCConfig;
    costImpact: number;
    approved: boolean;
  }>;
}

// KYC Status Check
GET    /api/v1/reseller/kyc/:sessionId/status
Response:
{
  sessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedSteps: string[];
  currentStep?: string;
  completionPercentage: number;
  verificationSummary: {
    identityVerified: boolean;
    mobileVerified: boolean;
    livenessScore?: number;
    documentMatch?: number;
  };
}

// Contract Template Management
POST   /api/v1/reseller/contracts/templates       // Create template
GET    /api/v1/reseller/contracts/templates       // List templates
PUT    /api/v1/reseller/contracts/templates/:id   // Update template

// Contract Initiation
POST   /api/v1/reseller/contracts/initiate
Request Body:
{
  customerId: string;
  templateId: string;
  dynamicData: Record<string, any>;
  expiresIn?: number; // hours
}
Response:
{
  contractId: string;
  customerSigningUrl: string;
  expiresAt: string;
}

// Customer List
GET    /api/v1/reseller/customers
Query Params:
  - page: number
  - limit: number
  - status: 'verified' | 'pending' | 'failed'
  - search: string
```

#### Customer Public APIs (No Auth Required)

```typescript
// KYC Session Access
GET    /api/v1/kyc/session/:sessionId
Response:
{
  sessionId: string;
  reseller: {
    name: string;
    logo: string;
  };
  requiredSteps: VerificationStepType[];
  currentStep: string;
  consentRequired: boolean;
}

// DigiLocker Integration
POST   /api/v1/kyc/session/:sessionId/digilocker/init
Response:
{
  authUrl: string; // DigiLocker OAuth URL
  state: string;
}

GET    /api/v1/kyc/digilocker/callback
Query Params:
  - code: string
  - state: string

// Mobile OTP
POST   /api/v1/kyc/session/:sessionId/mobile/send-otp
Request Body:
{
  mobile: string;
}

POST   /api/v1/kyc/session/:sessionId/mobile/verify-otp
Request Body:
{
  mobile: string;
  otp: string;
}

// Live Face Detection
POST   /api/v1/kyc/session/:sessionId/liveness/verify
Request Body:
{
  actions: Array<{
    type: 'smile' | 'blink' | 'turn_left' | 'turn_right';
    videoFrameDataUrl: string; // Base64
    timestamp: number;
  }>;
}
Response:
{
  isLive: boolean;
  confidence: number;
  spoofDetected: boolean;
}

// Document Upload
POST   /api/v1/kyc/session/:sessionId/document/upload
Content-Type: multipart/form-data
Fields:
  - documentType: 'aadhaar' | 'pan' | 'dl' | 'passport'
  - frontImage: File
  - backImage?: File

POST   /api/v1/kyc/session/:sessionId/document/verify
Response:
{
  ocrData: {
    name: string;
    dob: string;
    documentNumber: string; // Masked
  };
  faceMatchScore: number;
  verified: boolean;
}

// Contract Signing
GET    /api/v1/contracts/:contractId
Response:
{
  contractId: string;
  pdfUrl: string;
  dynamicFields: Record<string, any>;
  status: 'pending' | 'signed';
}

POST   /api/v1/contracts/:contractId/send-signing-otp
Request Body:
{
  mobile: string;
}

POST   /api/v1/contracts/:contractId/sign
Request Body:
{
  signatureType: 'drawn' | 'typed' | 'uploaded';
  signatureDataUrl: string; // Base64
  otp: string;
  consent: {
    termsAccepted: boolean;
    documentRead: boolean;
  };
}
Response:
{
  signatureId: string;
  signedPdfUrl: string;
  certificateUrl: string;
}
```

---

## Database Schema

### PostgreSQL Schema

```sql
-- =============================================================================
-- TENANTS & USERS
-- =============================================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('platform', 'reseller')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  parent_tenant_id UUID REFERENCES tenants(id), -- NULL for platform
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7),
  subdomain VARCHAR(100) UNIQUE,
  
  -- API Access
  api_key_hash VARCHAR(255) UNIQUE,
  api_secret_hash VARCHAR(255),
  
  -- Billing
  kyc_package VARCHAR(20) CHECK (kyc_package IN ('full', 'lite', 'custom')),
  monthly_quota INTEGER,
  used_quota INTEGER DEFAULT 0,
  
  -- Default KYC Configuration (for bulk operations)
  default_kyc_config JSONB NOT NULL DEFAULT '{"verificationType": "full", "requiredSteps": ["digilocker_identity", "mobile_otp", "live_face", "document_upload"]}',
  
  -- Override Permissions
  allow_kyc_overrides BOOLEAN DEFAULT true,
  require_override_approval BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('platform_admin', 'reseller_admin', 'reseller_user', 'customer')),
  
  -- Identity
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  name VARCHAR(255),
  password_hash VARCHAR(255), -- Only for admins
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- =============================================================================
-- KYC SESSIONS
-- =============================================================================

CREATE TABLE kyc_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(50) UNIQUE NOT NULL, -- Short public ID
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES users(id), -- Created after session starts
  
  -- Customer Info (before user creation)
  customer_name VARCHAR(255),
  cusOverride Management
  is_override BOOLEAN DEFAULT false,
  original_config JSONB, -- Original default config (stored if overridden)
  override_config JSONB, -- Applied override config
  override_reason VARCHAR(500), -- Mandatory if is_override = true
  override_notes TEXT,
  override_applied_by UUID REFERENCES users(id),
  override_applied_at TIMESTAMP,
  override_approved BOOLEAN, -- If approval required
  override_approved_by UUID REFERENCES users(id),
  override_approved_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'expired')),
  completed_steps JSONB DEFAULT '[]', -- Array of completed step names
  current_step VARCHAR(50),
  
  -- Results
  verification_summary JSONB, -- Summary of all verifications
  total_cost DECIMAL(10,2) DEFAULT 0,
  override_cost_delta DECIMAL(10,2) DEFAULT 0, -- Additional cost due to override
  
  -- Metadata
  callback_url TEXT,
  custom_metadata JSONB,
  is_bulk_operation BOOLEAN DEFAULT false, -- Flag to identify bulk operations
  -- Results
  verification_summary JSONB, -- Summary of all verifications
  total_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  callback_url TEXT,
  custom_metadata JSONB,
  
  -- Timestamps
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Audit
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- =============================================================================
-- VERIFICATION RECORDS
-- =============================================================================

CREATE TABLE verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_session_id UUID NOT NULL REFERENCES kyc_sessions(id) ON DELETE CASCADE,
  
  -- Verification Details
  step_type VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  provider_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed')),
  
  -- Results (encrypted)
  raw_response JSONB, -- Encrypted provider response
  extracted_data JSONB, -- Encrypted extracted data
  verification_score DECIMAL(5,2), -- 0-100
  
  -- Evidence Storage
  evidence_urls JSONB, -- Array of S3 URLs (images, videos)
  
  -- Audit
  attempted_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- DigiLocker Specific
CREATE TABLE digilocker_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_record_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
  
  -- OAuth Data
  oauth_state VARCHAR(255) UNIQUE NOT NULL,
  oauth_code VARCHAR(255),
  access_token_hash VARCHAR(255), -- Never store plaintext
  
  -- Retrieved Data (encrypted, limited fields)
  retrieved_data JSONB, -- {name, dob, gender, address_line1, address_city}
  
  -- Important: NO AADHAAR NUMBER STORED
  
  consent_given BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mobile OTP Specific
CREATE TABLE mobile_otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_record_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
  
  mobile VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL, -- Never store plaintext OTP
  
  -- SMS Gateway
  gateway VARCHAR(50), -- 'msg91', 'twilio', etc.
  gateway_message_id VARCHAR(255),
  
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Liveness Detection Specific
CREATE TABLE liveness_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_record_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
  
  -- Video/Image Evidence
  selfie_image_url TEXT NOT NULL, -- S3 URL
  action_videos JSONB, -- Array of {action: 'smile', videoUrl: 's3://...'}
  
  -- Detection Results
  is_live BOOLEAN DEFAULT false,
  confidence_score DECIMAL(5,2), -- 0-100
  spoof_detected BOOLEAN DEFAULT false,
  spoof_type VARCHAR(50), -- 'photo', 'video', 'mask', 'screen'
  
  -- Face Analysis
  face_landmarks JSONB, -- face-api.js landmarks
  face_quality_score DECIMAL(5,2),
  
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Verification Specific
CREATE TABLE document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_record_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
  
  document_type VARCHAR(20) CHECK (document_type IN ('aadhaar', 'pan', 'dl', 'passport')),
  
  -- Image URLs
  front_image_url TEXT NOT NULL,
  back_image_url TEXT,
  
  -- OCR Results (encrypted)
  ocr_data JSONB, -- {name, dob, documentNumber}
  ocr_confidence DECIMAL(5,2),
  
  -- Face Matching
  face_match_score DECIMAL(5,2), -- 0-100 (vs. liveness selfie)
  face_match_provider VARCHAR(50), -- 'aws_rekognition', 'azure_face'
  
  -- Validation
  document_valid BOOLEAN DEFAULT false,
  document_expired BOOLEAN DEFAULT false,
  
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- CONTRACTS
-- =============================================================================

CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) NOT NULL,
  
  -- Template File
  template_pdf_url TEXT NOT NULL, -- S3 URL
  template_pdf_hash VARCHAR(64) NOT NULL, -- SHA-256
  
  -- Dynamic Fields Configuration
  dynamic_fields JSONB NOT NULL, -- Array of DynamicField
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id VARCHAR(50) UNIQUE NOT NULL, -- Short public ID
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  template_id UUID NOT NULL REFERENCES contract_templates(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  kyc_session_id UUID REFERENCES kyc_sessions(id), -- Optional linkage
  
  -- Generated Contract
  generated_pdf_url TEXT NOT NULL, -- S3 URL with dynamic fields filled
  generated_pdf_hash VARCHAR(64) NOT NULL, -- SHA-256
  
  -- Dynamic Data Used
  dynamic_data JSONB NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'rejected', 'expired')),
  
  -- Tracking
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  time_spent_seconds INTEGER,
  downloaded BOOLEAN DEFAULT false,
  
  -- Expiry
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SIGNATURES
-- =============================================================================

CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_id VARCHAR(50) UNIQUE NOT NULL, -- Short public ID
  
  -- Relationships
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Signature Data
  signature_type VARCHAR(20) CHECK (signature_type IN ('drawn', 'typed', 'uploaded')),
  signature_image_url TEXT NOT NULL, -- S3 URL
  signature_image_hash VARCHAR(64) NOT NULL, -- SHA-256
  
  -- Binding Data (Critical for Legal Validity)
  mobile_number VARCHAR(20) NOT NULL,
  mobile_verified BOOLEAN NOT NULL DEFAULT false,
  otp_verification_id UUID, -- Reference to mobile_otp_verifications
  
  -- Metadata
  signed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  device_fingerprint VARCHAR(255),
  geo_location JSONB, -- {lat, lon, accuracy}
  
  -- Cryptographic Proof
  document_hash VARCHAR(64) NOT NULL, -- SHA-256 of contract PDF
  signature_hash VARCHAR(64) NOT NULL, -- SHA-256 of signature image
  combined_hash VARCHAR(64) NOT NULL, -- SHA-256(document_hash + signature_hash + timestamp)
  
  -- KYC Linkage
  kyc_session_id UUID REFERENCES kyc_sessions(id),
  kyc_verification_level VARCHAR(20), -- 'full', 'lite', 'none'
  
  -- Consent
  consent_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  consent_document_read BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP NOT NULL,
  
  -- Signed PDF
  signed_pdf_url TEXT, -- S3 URL with embedded signature
  signed_pdf_hash VARCHAR(64), -- SHA-256
  
  -- Certificate
  certificate_pdf_url TEXT, -- S3 URL of signature certificate
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected', 'revoked')),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- CONSENT LOGS
-- =============================================================================

CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  user_id UUID REFERENCES users(id),
  kyc_session_id UUID REFERENCES kyc_sessions(id),
  contract_id UUID REFERENCES contracts(id),
  
  -- Consent Details
  consent_type VARCHAR(50) NOT NULL, -- 'kyc_data_sharing', 'contract_signing', 'terms_acceptance'
  consent_text TEXT NOT NULL, -- Full text shown to user
  cKYC OVERRIDE LOGS (Immutable Audit)
-- =============================================================================

CREATE TABLE kyc_override_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session Reference
  kyc_session_id UUID NOT NULL REFERENCES kyc_sessions(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES users(id),
  
  -- Override Details
  original_config JSONB NOT NULL,
  override_config JSONB NOT NULL,
  
  -- Changes
  added_modules JSONB, -- Array of added verification steps
  removed_modules JSONB, -- Array of removed steps (if allowed)
  cost_impact DECIMAL(10,2), -- Additional cost (positive) or savings (negative)
  
  -- Justification (Mandatory)
  reason VARCHAR(500) NOT NULL,
  reason_category VARCHAR(50), -- 'compliance', 'customer_request', 'risk_assessment', 'technical_issue', 'other'
  notes TEXT,
  
  -- Authorization
  applied_by UUID NOT NULL REFERENCES users(id),
  applied_by_role VARCHAR(50) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Approval Workflow (if required)
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Immutability Flag
  is_immutable BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_override_logs_session ON kyc_override_logs(kyc_session_id);
CREATE INDEX idx_kyc_override_logs_tenant ON kyc_override_logs(tenant_id);
CREATE INDEX idx_kyc_override_logs_applied_by ON kyc_override_logs(applied_by);
CREATE INDEX idx_kyc_override_logs_created ON kyc_override_logs(created_at DESC);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL, -- 'kyc_session', 'contract', 'signature', 'user', 'kyc_override'
  entity_id UUID NOT NULL,
  
  -- Action
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'verified', 'signed', 'override_applied', 'override_approv

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL, -- 'kyc_session', 'contract', 'signature', 'user'
  entity_id UUID NOT NULL,
  
  -- Action
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'verified', 'signed'
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(50), -- 'user', 'system', 'api'
  
  -- Details
  details JSONB, -- Additional context
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- PROVIDER CONFIGURATIONS
-- =============================================================================

CREATE TABLE verification_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) NOT NULL, -- 'digilocker', 'mobile_otp', 'liveness', 'document_ocr'
  
  -- Provider Details
  is_internal BOOLEAN DEFAULT true, -- true for in-house, false for third-party
  cost_per_verification DECIMAL(10,2) DEFAULT 0,
  
  -- Configuration (encrypted)
  api_credentials JSONB, -- Encrypted API keys, endpoints
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true, -- Real-time availability
  
  -- Limits
  daily_limit INTEGER,
  daily_usage INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_kyc_sessions_tenant ON kyc_sessions(tenant_id);
CREATE INDEX idx_kyc_sessions_status ON kyc_sessions(status);
CREATE INDEX idx_kyc_sessions_customer ON kyc_sessions(customer_email);

CREATE INDEX idx_verification_records_session ON verification_records(kyc_session_id);
CREATE INDEX idx_verification_records_status ON verification_records(status);

CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);

CREATE INDEX idx_signatures_contract ON signatures(contract_id);
CREATE INDEX idx_signatures_customer ON signatures(customer_id);

-- =============================================================================
-- SECURITY: ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE kyc_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Tenants can only see their own data
CREATE POLICY tenant_isolation_kyc ON kyc_sessions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_contracts ON contracts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Redis Schema (Caching & Sessions)

```typescript
// Session Cache
key: `kyc:session:{sessionId}`
value: JSON.stringify({
  sessionId,
  tenantId,
  customerId,
  status,
  currentStep,
  completedSteps,
  expiresAt
})
ttl: 3600 // 1 hour

// OTP Cache
key: `otp:mobile:{mobile}:{sessionId}`
value: otpHash
ttl: 300 // 5 minutes

// Rate Limiting
key: `ratelimit:ip:{ipAddress}:{endpoint}`
value: requestCount
ttl: 60 // 1 minute

// DigiLocker OAuth State
key: `digilocker:state:{state}`
value: JSON.stringify({ sessionId, tenantId })
ttl: 600 // 10 minutes
```

---

## Security & Compliance

### 1. Data Protection (DPDP Act 2023 Compliance)

#### Data Minimization
```typescript
// ❌ WRONG: Storing full Aadhaar number
{
  aadhaarNumber: "123456789012"
}

// ✅ CORRECT: Not storing Aadhaar at all
{
  identitySource: "digilocker",
  identityVerified: true,
  verificationDate: "2026-02-01",
  // No Aadhaar number stored
}

// ✅ CORRECT: If document uploaded, mask it
{
  documentType: "aadhaar",
  documentNumberMasked: "XXXX-XXXX-9012",
  documentImageUrl: "s3://encrypted-bucket/...", // Encrypted at rest
}
```

#### Data Retention Policy
```typescript
class DataRetentionService {
  async enforceRetention() {
    // Delete old session data
    await db.query(`
      DELETE FROM kyc_sessions 
      WHERE completed_at < NOW() - INTERVAL '90 days'
      AND status = 'completed'
    `);
    
    // Delete old verification records (keep only summary)
    await db.query(`
      UPDATE verification_records 
      SET raw_response = NULL, extracted_data = NULL
      WHERE completed_at < NOW() - INTERVAL '30 days'
    `);
    
    // Delete old OTP records
    await db.query(`
      DELETE FROM mobile_otp_verifications 
      WHERE created_at < NOW() - INTERVAL '7 days'
    `);
  }
}
```

#### Consent Management
```typescript
interface ConsentRecord {
  userId: string;
  purpose: string;
  consentText: string;
  consentGiven: boolean;
  timestamp: Date;
  expiryDate?: Date;
  revocable: boolean;
}

class ConsentManager {
  async recordConsent(consent: ConsentRecord): Promise<void>;
  async checkConsent(userId: string, purpose: string): Promise<boolean>;
  async revokeConsent(userId: string, purpose: string): Promise<void>;
  
  // DPDP Act: User right to data deletion
  async deleteAllUserData(userId: string): Promise<void> {
    // Delete from all tables
    // Generate deletion certificate
    // Notify user
  }
}
```

### 2. Encryption
APPROVE_KYC_OVERRIDES = 'approve_kyc_overrides',
  VIEW_ALL_OVERRIDE_LOGS = 'view_all_override_logs',
  
  // Reseller Admin
  INITIATE_KYC = 'initiate_kyc',
  VIEW_OWN_CUSTOMERS = 'view_own_customers',
  CREATE_CONTRACTS = 'create_contracts',
  VIEW_OWN_ANALYTICS = 'view_own_analytics',
  APPLY_KYC_OVERRIDES = 'apply_kyc_overrides', // NEW: Override permission
  VIEW_OWN_OVERRIDE_LOGS = 'view_own_override_logs',
  
  // Reseller User (Limited)
  INITIATE_KYC_DEFAULT_ONLY = 'initiate_kyc_default_only', // Cannot override
-- Encrypt sensitive columns
ALTER TABLE verification_records 
  ALTER COLUMN raw_response 
  TYPE bytea 
  USING pgp_sym_encrypt(raw_respon,
    Permission.APPROVE_KYC_OVERRIDES,
    Permission.VIEW_ALL_OVERRIDE_LOGS
  ],
  reseller_admin: [
    Permission.INITIATE_KYC,
    Permission.VIEW_OWN_CUSTOMERS,
    Permission.CREATE_CONTRACTS,
    Permission.VIEW_OWN_ANALYTICS,
    Permission.APPLY_KYC_OVERRIDES, // Can override KYC config
    Permission.VIEW_OWN_OVERRIDE_LOGS
  ],
  reseller_user: [
    Permission.INITIATE_KYC_DEFAULT_ONLY, // Cannot override
    Permission.VIEW_OWN_CUSTOMER

#### In Transit (TLS)
```typescript
// Force HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

#### End-to-End for Signature
```typescript
class SignatureCryptography {
  // Client-side signature hash
  async hashSignatureOnClient(signatureDataUrl: string): Promise<string> {
    const arrayBuffer = await fetch(signatureDataUrl).then(r => r.arrayBuffer());
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Server-side verification
  async verifySignatureIntegrity(
    signatureId: string
  ): Promise<boolean> {
    const signature = await db.signatures.findById(signatureId);
    const signedPdf = await s3.getObject(signature.signed_pdf_url);
    
    // Re-calculate hash
    const currentHash = crypto
      .createHash('sha256')
      .update(signedPdf)
      .digest('hex');
    
    // Compare with stored hash
    return currentHash === signature.signed_pdf_hash;
  }
}
```

### 3. Access Control

#### Role-Based Access Control (RBAC)
```typescript
enum Permission {
  // Platform Admin
  MANAGE_RESELLERS = 'manage_resellers',
  VIEW_ALL_ANALYTICS = 'view_all_analytics',
  CONFIGURE_PROVIDERS = 'configure_providers',
  
  // Reseller Admin
  INITIATE_KYC = 'initiate_kyc',
  VIEW_OWN_CUSTOMERS = 'view_own_customers',
  CREATE_CONTRACTS = 'create_contracts',
  VIEW_OWN_ANALYTICS = 'view_own_analytics',
  
  // Customer
  COMPLETE_KYC = 'complete_kyc',
  SIGN_CONTRACT = 'sign_contract',
  VIEW_OWN_DATA = 'view_own_data'
}

const rolePermissions: Record<string, Permission[]> = {
  platform_admin: [
    Permission.MANAGE_RESELLERS,
    Permission.VIEW_ALL_ANALYTICS,
    Permission.CONFIGURE_PROVIDERS
  ],
  reseller_admin: [
    Permission.INITIATE_KYC,
    Permission.VIEW_OWN_CUSTOMERS,
    Permission.CREATE_CONTRACTS,
    Permission.VIEW_OWN_ANALYTICS
  ],
  customer: [
    Permission.COMPLETE_KYC,
    Permission.SIGN_CONTRACT,
    Permission.VIEW_OWN_DATA
  ]
};

// Middleware
function requirePermission(permission: Permission) {
  return (req, res, next) => {
    const userPermissions = rolePermissions[req.user.role];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

#### Tenant Isolation
```typescript
// Middleware: Set tenant context
async function setTenantContext(req, res, next) {
  const tenantId = req.user.tenantId;
  
  // Set PostgreSQL session variable for RLS
  await db.query(`SET app.current_tenant_id = '${tenantId}'`);
  
  req.tenantId = tenantId;
  next();
}

// All queries now automatically filtered by tenant
const sessions = await db.query('SELECT * FROM kyc_sessions WHERE status = $1', ['pending']);
// RLS ensures only current tenant's data is returned
```

### 4. Rate Limiting & DDoS Protection

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP sending rate limit (prevent abuse)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTPs per minute
  keyGenerator: (req) => req.body.mobile, // Rate limit by mobile number
});

// Signature verification rate limit
const signatureLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes
  keyGenerator: (req) => req.params.contractId,
});

app.use('/api/', apiLimiter);
app.use('/api/v1/kyc/*/mobile/send-otp', otpLimiter);
app.use('/api/v1/contracts/*/sign', signatureLimiter);
```

### 5. Audit Trail Compliance

```typescript
class AuditLogger {
  async logAction(params: {
    entityType: string;
    entityId: string;
    action: string;
    actorId?: string;
    actorType: 'user' | 'system' | 'api';
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.query(`
      INSERT INTO audit_logs (
        entity_type, entity_id, action, actor_id, actor_type,
        details, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      params.entityType,
      params.entityId,
      params.action,
      params.actorId,
      params.actorType,
      JSON.stringify(params.details),
      params.ipAddress,
      params.userAgent
    ]);
  }
  
  // Generate compliance report
  async generateComplianceReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const logs = await db.query(`
      SELECT * FROM audit_logs
      WHERE entity_id IN (
        SELECT id FROM kyc_sessions WHERE tenant_id = $1
      )
      AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC
    `, [tenantId, startDate, endDate]);
    
    return {
      totalActions: logs.length,
      actionBreakdown: this.aggregateByAction(logs),
      timeline: this.buildTimeline(logs),
      anomalies: this.detectAnomalies(logs)
    };
  }
}
```

---

## Digital Signature Framework

### Legal Positioning (IT Act Section 10A)

```typescript
/**
 * IT Act Section 10A: Validity of Electronic Contracts
 * 
 * Where in a contract formation, the communication of proposals,
 * the acceptance of proposals, the revocation of proposals and acceptances,
 * as the case may be, are expressed in electronic form or by means of an
 * electronic record, such contract shall not be deemed to be unenforceable
 * solely on the ground that such electronic form or means was used for that purpose.
 * 
 * Our Implementation:
 * 1. Clear intent to sign (consent checkboxes)
 * 2. Signature binding (OTP-verified mobile)
 * 3. Cryptographic proof (SHA-256 hashes)
 * 4. Immutable audit trail
 * 5. Identity verification (KYC linkage)
 */

interface ElectronicSignatureCompliance {
  // IT Act Requirements
  signatoryIntent: boolean; // User explicitly clicked "Sign"
  electronicRecord: boolean; // PDF contract stored electronically
  attributableToSignatory: boolean; // OTP-verified mobile binding
  
  // Evidence Collection
  evidence: {
    preSignatureActions: {
      documentViewed: boolean;
      timeSpentOnDocument: number; // seconds
      scrolledToEnd: boolean;
      downloadedForReview: boolean;
    };
    
    identityVerification: {
      method: string; // "DigiLocker + Mobile OTP"
      kycSessionId: string;
      verificationLevel: 'full' | 'lite';
    };
    
    signatureCapture: {
      signatureType: 'drawn' | 'typed' | 'uploaded';
      capturedAt: Date;
      deviceInfo: {
        platform: string;
        browser: string;
        screenResolution: string;
      };
    };
    
    mobileVerification: {
      mobileNumber: string;
      otpVerified: boolean;
      verificationTimestamp: Date;
    };
  };
  
  // Cryptographic Integrity
  cryptographicProof: {
    documentHash: string; // SHA-256 of original PDF
    signatureHash: string; // SHA-256 of signature image
    combinedHash: string; // SHA-256(doc + sig + timestamp)
    timestampIST: string; // ISO 8601 with timezone
  };
  
  // Audit Trail
  immutableLog: AuditEntry[];
}
```

### Signature Certificate Generation

```typescript
import PDFDocument from 'pdfkit';

class SignatureCertificateService {
  async generateCertificate(signatureId: string): Promise<Buffer> {
    const signature = await db.signatures.findById(signatureId);
    const contract = await db.contracts.findById(signature.contract_id);
    const customer = await db.users.findById(signature.customer_id);
    const tenant = await db.tenants.findById(signature.tenant_id);
    const kyc = await db.kyc_sessions.findById(signature.kyc_session_id);
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    // Header
    doc.fontSize(20).text('Digital Signature Certificate', { align: 'center' });
    doc.fontSize(10).text('Issued under IT Act, 2000 - Section 10A', { align: 'center' });
    doc.moveDown(2);
    
    // Certificate Details
    doc.fontSize(12).text('Certificate ID:', { continued: true })
       .fontSize(10).text(` ${signature.signature_id}`);
    
    doc.fontSize(12).text('Issued On:', { continued: true })
       .fontSize(10).text(` ${new Date().toISOString()}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Contract Information', { underline: true });
    doc.fontSize(10).text(`Contract ID: ${contract.contract_id}`);
    doc.text(`Contract Name: ${contract.template.name}`);
    doc.text(`Signed On: ${signature.signed_at.toISOString()}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Signatory Information', { underline: true });
    doc.fontSize(10).text(`Name: ${customer.name}`);
    doc.text(`Email: ${customer.email}`);
    doc.text(`Mobile (Verified): ${signature.mobile_number}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Identity Verification', { underline: true });
    doc.fontSize(10).text(`KYC Level: ${signature.kyc_verification_level}`);
    doc.text(`KYC Session: ${kyc.session_id}`);
    doc.text(`Verification Methods: ${kyc.required_steps.join(', ')}`);
    doc.text(`Identity Source: DigiLocker OAuth`);
    doc.text(`Mobile Verified via: OTP`);
    doc.text(`Liveness Check: ${kyc.verification_summary.livenessScore ? 'Passed' : 'N/A'}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Signature Binding', { underline: true });
    doc.fontSize(10).text(`Signature Type: ${signature.signature_type}`);
    doc.text(`Mobile OTP Verified: Yes`);
    doc.text(`IP Address: ${signature.ip_address}`);
    doc.text(`Device Fingerprint: ${signature.device_fingerprint}`);
    doc.text(`Geo-location: ${signature.geo_location ? JSON.stringify(signature.geo_location) : 'Not captured'}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Cryptographic Proof', { underline: true });
    doc.fontSize(8).text(`Document Hash (SHA-256):`);
    doc.text(signature.document_hash);
    doc.text(`Signature Hash (SHA-256):`);
    doc.text(signature.signature_hash);
    doc.text(`Combined Hash (SHA-256):`);
    doc.text(signature.combined_hash);
    
    doc.moveDown();
    doc.fontSize(14).text('Consent & Legal Acceptance', { underline: true });
    doc.fontSize(10).text(`Terms Accepted: ${signature.consent_terms_accepted ? 'Yes' : 'No'}`);
    doc.text(`Document Read: ${signature.consent_document_read ? 'Yes' : 'No'}`);
    doc.text(`Consent Timestamp: ${signature.consent_timestamp.toISOString()}`);
    
    doc.moveDown(2);
    doc.fontSize(14).text('Verification', { underline: true });
    doc.fontSize(10).text('This certificate confirms that the above signatory:');
    doc.text('1. Was identity-verified through government-backed methods');
    doc.text('2. Explicitly consented to sign the contract');
    doc.text('3. Provided OTP-verified mobile number binding');
    doc.text('4. Signed using cryptographically secured process');
    doc.text('5. All actions were logged in immutable audit trail');
    
    doc.moveDown();
    doc.fontSize(8).text('Issued by: ' + tenant.name, { align: 'center' });
    doc.text('For verification, visit: https://platform.com/verify/' + signature.signature_id, { align: 'center' });
    
    // QR Code for verification
    const qrCode = await this.generateQRCode(`https://platform.com/verify/${signature.signature_id}`);
    doc.image(qrCode, doc.page.width / 2 - 50, doc.y + 20, { width: 100 });
    
    doc.end();
    
    return Buffer.concat(chunks);
  }
  
  async generateQRCode(data: string): Promise<Buffer> {
    // Use QR code library
    const QRCode = require('qrcode');
    return QRCode.toBuffer(data);
  }
}
```

### Public Verification Portal

```typescript
// Public API endpoint (no auth required)
app.get('/verify/:signatureId', async (req, res) => {
  const { signatureId } = req.params;
  
  const signature = await db.signatures.findBySignatureId(signatureId);
  
  if (!signature) {
    return res.status(404).json({ error: 'Signature not found' });
  }
  
  // Verify integrity
  const integrityValid = await cryptoService.verifySignatureIntegrity(signature.id);
  
  // Return public info (no sensitive data)
  res.json({
    signatureId: signature.signature_id,
    contractName: signature.contract.template.name,
    signatoryName: signature.customer.name, // Public info
    signedOn: signature.signed_at,
    integrityValid,
    kycVerificationLevel: signature.kyc_verification_level,
    certificateUrl: signature.certificate_pdf_url,
    
    verificationDetails: {
      documentHashMatch: integrityValid,
      signatureHashMatch: integrityValid,
      mobileVerified: signature.mobile_verified,
      kycCompleted: !!signature.kyc_session_id
    }
  });
});
```

---

## Third-Party Extension Points

### Provider Adapter Pattern

```typescript
// Abstract base class
abstract class ThirdPartyKYCProvider implements IVerificationProvider {
  abstract name: string;
  abstract type: VerificationStepType;
  abstract cost: number;
  
  protected apiKey: string;
  protected apiSecret: string;
  protected baseUrl: string;
  
  constructor(credentials: ProviderCredentials) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.baseUrl = credentials.baseUrl;
  }
  
  // Common methods
  protected async makeAuthenticatedRequest(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    // Implement authentication logic
  }
  
  // Abstract method to be implemented by each provider
  abstract verify(request: VerificationRequest): Promise<VerificationResult>;
  
  // Health check
  async isAvailable(): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest('/health', 'GET');
      return true;
    } catch {
      return false;
    }
  }
}

// Example: Signzy Adapter
class SignzyProvider extends ThirdPartyKYCProvider {
  name = 'Signzy Aadhaar OTP';
  type = VerificationStepType.AADHAAR_OTP_THIRDPARTY;
  cost = 4.5;
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // Step 1: Initiate OTP
    const initResponse = await this.makeAuthenticatedRequest(
      '/api/v2/aadhaar/otp/init',
      'POST',
      { aadhaarNumber: request.aadhaarNumber }
    );
    
    // Step 2: Verify OTP (would be in separate call in real impl)
    const verifyResponse = await this.makeAuthenticatedRequest(
      '/api/v2/aadhaar/otp/verify',
      'POST',
      { 
        requestId: initResponse.requestId,
        otp: request.otp 
      }
    );
    
    return {
      success: verifyResponse.status === 'success',
      data: {
        name: verifyResponse.name,
        dob: verifyResponse.dob,
        gender: verifyResponse.gender,
        address: verifyResponse.address
      },
      providerName: this.name,
      providerCost: this.cost,
      rawResponse: verifyResponse // Store for debugging
    };
  }
}

// Example: IDfy Adapter
class IdfyProvider extends ThirdPartyKYCProvider {
  name = 'IDfy Aadhaar Verification';
  type = VerificationStepType.AADHAAR_OTP_THIRDPARTY;
  cost = 3.5;
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // IDfy-specific implementation
    const response = await this.makeAuthenticatedRequest(
      '/v3/tasks/sync/verify_with_source/ind_aadhaar_otp',
      'POST',
      {
        task_id: uuidv4(),
        group_id: uuidv4(),
        data: {
          aadhaar_number: request.aadhaarNumber,
          otp: request.otp
        }
      }
    );
    
    return {
      success: response.status === 'completed',
      data: response.result,
      providerName: this.name,
      providerCost: this.cost,
      rawResponse: response
    };
  }
}

// Example: HyperVerge Video KYC Adapter
class HyperVergeProvider extends ThirdPartyKYCProvider {
  name = 'HyperVerge Video KYC';
  type = VerificationStepType.VIDEO_KYC;
  cost = 15.0;
  
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    // HyperVerge-specific implementation
    const response = await this.makeAuthenticatedRequest(
      '/v2.0/videoKyc/startFlow',
      'POST',
      {
        transactionId: request.sessionId,
        workflowId: 'default',
        enableFaceMatch: true
      }
    );
    
    return {
      success: response.result === 'action_complete',
      data: {
        videoKycUrl: response.videoKycUrl,
        faceMatchScore: response.faceMatchScore
      },
      providerName: this.name,
      providerCost: this.cost,
      rawResponse: response
    };
  }
}
```

### Dynamic Provider Registration

```typescript
class VerificationProviderRegistry {
  private static instance: VerificationProviderRegistry;
  private factory: VerificationProviderFactory;
  
  private constructor() {
    this.factory = new VerificationProviderFactory();
    this.registerDefaultProviders();
  }
  
  static getInstance(): VerificationProviderRegistry {
    if (!this.instance) {
      this.instance = new VerificationProviderRegistry();
    }
    return this.instance;
  }
  
  private registerDefaultProviders() {
    // Primary providers (always registered)
    this.factory.register(new DigiLockerProvider());
    this.factory.register(new MobileOTPProvider());
    this.factory.register(new LiveFaceProvider());
    this.factory.register(new DocumentOCRProvider());
  }
  
  async registerThirdPartyProvider(
    providerClass: new (credentials: ProviderCredentials) => IVerificationProvider,
    credentials: ProviderCredentials
  ): Promise<void> {
    const provider = new providerClass(credentials);
    
    // Test provider availability
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error(`Provider ${provider.name} is not available`);
    }
    
    this.factory.register(provider);
    
    // Store in database
    await db.verification_providers.create({
      name: provider.name,
      provider_type: provider.type,
      is_internal: false,
      cost_per_verification: provider.cost,
      api_credentials: this.encryptCredentials(credentials),
      is_active: true,
      is_available: true
    });
  }
  
  async enableThirdPartyProvider(providerId: string): Promise<void> {
    const providerConfig = await db.verification_providers.findById(providerId);
    const credentials = this.decryptCredentials(providerConfig.api_credentials);
    
    // Dynamically load provider class
    const ProviderClass = await this.loadProviderClass(providerConfig.name);
    const provider = new ProviderClass(credentials);
    
    this.factory.register(provider);
  }
  
  getFactory(): VerificationProviderFactory {
    return this.factory;
  }
  
  private encryptCredentials(credentials: ProviderCredentials): string {
    // Encrypt sensitive credentials
    return crypto.encrypt(JSON.stringify(credentials));
  }
  
  private decryptCredentials(encrypted: string): ProviderCredentials {
    return JSON.parse(crypto.decrypt(encrypted));
  }
  
  private async loadProviderClass(name: string): Promise<any> {
    // Dynamic import based on provider name
    switch (name) {
      case 'Signzy Aadhaar OTP':
        return (await import('./providers/signzy')).SignzyProvider;
      case 'IDfy Aadhaar Verification':
        return (await import('./providers/idfy')).IdfyProvider;
      case 'HyperVerge Video KYC':
        return (await import('./providers/hyperverge')).HyperVergeProvider;
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }
}
```

### Configuration UI for Platform Admin

```typescript
// API endpoint for platform admin
app.post('/api/v1/admin/config/providers', 
  authenticateJWT,
  requireRole('platform_admin'),
  async (req, res) => {
    const { providerName, providerType, credentials } = req.body;
    
    const registry = VerificationProviderRegistry.getInstance();
    
    try {
      // Map provider name to class
      const providerClass = mapProviderNameToClass(providerName);
      
      // Register provider
      await registry.registerThirdPartyProvider(providerClass, credentials);
      
      res.json({
        success: true,
        message: `Provider ${providerName} registered successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Frontend form for adding providers
const AddProviderForm = () => {
  const [provider, setProvider] = useState('');
  const [credentials, setCredentials] = useState({});
  
  const availableProviders = [
    { value: 'signzy', label: 'Signzy (Aadhaar OTP)', cost: '₹4.5/verification' },
    { value: 'idfy', label: 'IDfy (Aadhaar Verification)', cost: '₹3.5/verification' },
    { value: 'hyperverge', label: 'HyperVerge (Video KYC)', cost: '₹15/verification' },
    { value: 'digio', label: 'Digio (eSign)', cost: '₹10/signature' },
  ];
  
  const handleSubmit = async () => {
    await fetch('/api/v1/admin/config/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerName: provider,
        providerType: 'aadhaar_otp_thirdparty',
        credentials: credentials
      })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select value={provider} onChange={e => setProvider(e.target.value)}>
        {availableProviders.map(p => (
          <option value={p.value}>{p.label} - {p.cost}</option>
        ))}
      </select>
      
      {provider === 'signzy' && (
        <>
          <input 
            placeholder="API Key" 
            onChange={e => setCredentials({...credentials, apiKey: e.target.value})} 
          />
          <input 
            placeholder="API Secret" 
            type="password"
            onChange={e => setCredentials({...credentials, apiSecret: e.target.value})} 
          />
        </>
      )}
      
      <button type="submit">Add Provider</button>
    </form>
  );
};
```

---

## Cost Analysis

### Per-Verification Cost Breakdown

```typescript
interface VerificationCostAnalysis {
  primary: {
    digilocker: 0, // FREE (govt service)
    mobileOTP: 0.15, // MSG91: ₹0.10-0.20/SMS
    liveFace: 0, // In-house ML model (free after setup)
    documentOCR: 1.50, // AWS Rekognition: ₹1-2/call
    total: 1.65
  };
  
  optional: {
    aadhaarOTP_Signzy: 4.50,
    aadhaarOTP_IDfy: 3.50,
    videoKYC_HyperVerge: 15.00,
    eSign_Digio: 10.00
  };
  
  infrastructure: {
    s3Storage: 0.023, // per GB/month (negligible per verification)
    database: 0, // PostgreSQL on existing server
    compute: 0, // Existing server capacity
    total: 0.023
  };
  
  totalPerCustomer: {
    primaryKYC: 1.65,
    primaryKYC_plus_Signing: 1.65, // In-house signing is free
    withThirdPartyAadhaar: 5.15, // 1.65 + 3.50 (IDfy)
    withVideoKYC: 16.65 // 1.65 + 15.00 (HyperVerge)
  };
}

// Comparison with fully third-party solution
const competitorCosts = {
  Digio_fullSuite: 25.00, // ₹25 per customer (KYC + eSign)
  Signzy_fullSuite: 20.00, // ₹20 per customer
  HyperVerge_fullSuite: 30.00, // ₹30 per customer
  
  ourPrimarySolution: 1.65, // 93% cost savings vs. Digio
  ourWithThirdParty: 5.15 // Still 79% cheaper than Digio
};
```

### ROI Calculator for Resellers

```typescript
class ResellercostCalculator {
  calculateROI(params: {
    monthlyCustomers: number;
    resellPrice: number; // What reseller charges their customers
  }) {
    const platformCost = 1.65; // Primary KYC + Signing
    const resellPrice = params.resellPrice;
    const monthlyCustomers = params.monthlyCustomers;
    
    const monthlyRevenue = monthlyCustomers * resellPrice;
    const monthlyCost = monthlyCustomers * platformCost;
    const monthlyProfit = monthlyRevenue - monthlyCost;
    const profitMargin = ((monthlyProfit / monthlyRevenue) * 100).toFixed(2);
    
    return {
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      profitMargin: `${profitMargin}%`,
      
      // If reseller charges ₹10/customer
      example: {
        customerPrice: 10,
        platformCost: 1.65,
        grossMargin: 8.35,
        marginPercent: '83.5%'
      }
    };
  }
}

// Example output
const result = new ResellercostCalculator().calculateROI({
  monthlyCustomers: 1000,
  resellPrice: 10
});KYC Override Management (Week 8)

**Implement Per-Customer Override System**

```typescript
// Tasks:
✅ Add default_kyc_config to tenants table
✅ Create kyc_override_logs table (immutable)
✅ Update kyc_sessions with override fields
✅ Implement KYC override API endpoints:
  - POST /api/v1/reseller/kyc/initiate (with override support)
  - POST /api/v1/reseller/kyc/initiate-bulk (override disabled)
  - POST /api/v1/reseller/kyc/:sessionId/override
  - GET /api/v1/reseller/kyc/:sessionId/override-history
✅ Add override UI in reseller dashboard
✅ Implement permission checks (APPLY_KYC_OVERRIDES)
✅ Add mandatory reason field and validation
✅ Calculate cost delta for overrides
✅ Add approval workflow (if required)
✅ Update cost calculation service
✅ Add override badges in customer list
✅ Create o8: Production Hardening (Weeks 10-11
```

### Phase 7: Third-Party Provider Support (Week 9

console.log(result);
// {
//   monthlyRevenue: 10000,
//   monthlyCost: 1650,
//   monthlyProfit: 8350,
//   profitMargin: '83.5%'
// }
```

---

## Migration Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Current State → Multi-Tenant Ready**

```typescript
// Tasks:
✅ Convert existing in-memory store to PostgreSQL
✅ Implement tenant isolation (RLS)
✅ Add tenant management APIs
✅ Create platform admin dashboard
✅ Add RBAC middleware

// Database Migration
await migrateExistingData();

// New Tables
- tenants
- users (with tenant_id)
- tenant_settings
```

### Phase 2: DigiLocker Real Integration (Week 3)

**Mock Mode → Production DigiLocker**

```typescript
// Tasks:
✅ Register at partners.digilocker.gov.in (you already did this!)
✅ Get CLIENT_ID and CLIENT_SECRET
✅ Update .env with real credentials
✅ Remove DIGILOCKER_MOCK_MODE flag
✅ Test OAuth flow
✅ Store limited identity data (NO Aadhaar number)

// Code changes minimal - just config
DIGILOCKER_CLIENT_ID=your_real_client_id
DIGILOCKER_CLIENT_SECRET=your_real_secret
DIGILOCKER_REDIRECT_URI=https://yourdomain.com/api/v1/kyc/digilocker/callback
```

### Phase 3: Liveness Detection Implementation (Week 4)

**Fake Detection → Real ML-Based Detection**

```typescript
// Tasks:
✅ Load face-api.js models (TinyFaceDetector, FaceLandmark68Net)
✅ Implement smile detection (mouth aspect ratio)
✅ Implement blink detection (eye aspect ratio)
✅ Implement head turn detection (face pose estimation)
✅ Add anti-spoofing checks
✅ Test with real users

// See implementation in separate file (500+ lines)
```

### Phase 4: Contract & Signing Engine (Weeks 5-6)

**Add New Features**

```typescript
// Tasks:
✅ Create c9: Compliance & Legal (Week 12
✅ Create contracts table
✅ Create signatures table
✅ Implement PDF generation with dynamic fields
✅ Build signature capture UI
✅ Add OTP-based signature binding
✅ Generate signature certificates
✅ Build public verification portal
```

### Phase 5: Reseller Onboarding (Week 7)

**Add Reseller Features**

```typescript
// Tasks:10: Go-Live (Week 13
✅ Build reseller registration flow
✅ Generate API keys for resellers
✅ Create reseller dashboard
✅ Add white-label options
✅ Implement quota management
```

### Phase 6: Third-Party Provider Support (Week 8)

**Add Optional Integrations**

```typescript
// Tasks:
✅ Implement provider abstraction layer
✅ Create provider adapters (Signzy, IDfy)
✅ Add provider configuration UI
✅ Test hybrid verification flows
✅ Add cost tracking per provider
```

### Phase 7: Production Hardening (Weeks 9-10)

**Security & Performance**

```typescript
// Tasks:
✅ Full security audit
✅ Add rate limiting everywhere
✅ Implement data encryption (at rest & in transit)
✅ Set up monitoring (Sentry, DataDog)
✅ Load testing (10,000+ concurrent users)
✅ Add Redis caching
✅ CDN setup for static assets
✅ Database indexing optimization
✅ Auto-scaling setup
```

### Phase 8: Compliance & Legal (Week 11)

**DPDP Act & Audit Readiness**

```typescript
// Tasks:
✅ Implement data retention policies
✅ Add consent management system
✅ Create audit report generators
✅ Build user data deletion workflow
✅ Generate compliance documentation
✅ Legal review of signature framework
✅ Privacy policy & terms updates
```

### Phase 9: Go-Live (Week 12)

**Production Launch**

```typescript
// Tasks:
✅ Final QA testing
✅ Deploy to production
✅ DNS setup
✅ SSL certificates
✅ Backup & disaster recovery
✅ Launch monitoring dashboards
✅ Customer support setup
```

---

## Summary: Why This Architecture Wins

### ✅ Cost Efficiency
- **93% cheaper** than fully third-party solutions (₹1.65 vs ₹25)
- No Aadhaar OTP costs (use DigiLocker instead)
- In-house liveness detection (free after setup)
- In-house digital signing (no per-signature fees)

### ✅ Legal Compliance
- DPDP Act compliant (data minimization, no Aadhaar storage)
- IT Act Section 10A compliant (electronic signatures)
- Government-backed verification (DigiLocker)
- Full audit trail for all actions

### ✅ Future-Proof
- Pluggable architecture for third-party providers
- Can add paid services if needed (Signzy, IDfy, etc.)
- Modular design allows feature additions
- No vendor lock-in

### ✅ Reseller-Friendly
- Multi-tenant isolation
- White-label options
- API access for resellers
- 80%+ profit margins possible

### ✅ User Experience
- Single unified flow (no multiple redirects)
- In-platform signing (no external UI)
- Mobile-first design
- Fast verification (< 5 minutes)

---

**Next Steps:**
1. Review this architecture document
2. Approve design decisions
3. Begin Phase 1 implementation
4. I'll create detailed implementation files for each component

Ready to proceed? 🚀
