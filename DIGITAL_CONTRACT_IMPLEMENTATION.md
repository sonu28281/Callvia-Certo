# Digital Contract & Signing - Implementation Guide

**Module:** Electronic Contract Management & Signature System  
**Compliance:** IT Act Section 10A (Electronic Contracts)  
**Timeline:** 2 weeks (8-10 days actual work)  
**Current Status:** Not Started

---

## Overview

Complete in-house digital contract and signing system with:
- ✅ PDF contract template management
- ✅ Dynamic field replacement
- ✅ Customer contract delivery via email/SMS
- ✅ In-browser signature capture (draw/type/upload)
- ✅ OTP-based signature binding
- ✅ Cryptographic integrity (SHA-256)
- ✅ Signature certificates
- ✅ Public verification portal
- ✅ Full audit trail

**Cost:** ₹0 per signature (vs ₹10-50 for Digio/SignDesk)

---

## Phase 1: Database Setup (Day 1)

### Task 1.1: Create Database Tables

**File:** `apps/backend/src/database/schema.sql` (create new file)

```sql
-- =============================================================================
-- CONTRACT TEMPLATES
-- =============================================================================

CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- Will add FK later when tenants table exists
  
  -- Template Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  category VARCHAR(50), -- 'employment', 'service', 'nda', 'custom'
  
  -- Template File
  template_pdf_url TEXT, -- S3 URL (optional, can generate from HTML)
  template_html TEXT, -- HTML template with {{placeholders}}
  
  -- Dynamic Fields Configuration
  dynamic_fields JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"name": "customerName", "label": "Customer Name", "type": "text", "required": true},
  --   {"name": "startDate", "label": "Start Date", "type": "date", "required": true},
  --   {"name": "amount", "label": "Amount", "type": "number", "required": true}
  -- ]
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID -- User who created template
);

-- =============================================================================
-- CONTRACTS (Generated instances)
-- =============================================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id VARCHAR(50) UNIQUE NOT NULL, -- Short public ID like "CNT-2024-00001"
  
  -- Relationships
  tenant_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES contract_templates(id),
  customer_id UUID, -- Will reference users table later
  kyc_session_id UUID, -- Optional linkage to KYC
  
  -- Customer Info (if customer_id not yet created)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  
  -- Generated Contract
  generated_pdf_url TEXT, -- S3 URL of filled PDF
  generated_pdf_hash VARCHAR(64), -- SHA-256 hash
  
  -- Dynamic Data Used
  dynamic_data JSONB NOT NULL DEFAULT '{}',
  -- Example: {"customerName": "John Doe", "startDate": "2024-02-01", "amount": 50000}
  
  -- Contract Terms
  contract_value DECIMAL(12,2), -- Extracted from dynamic_data if present
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'pending', 'sent', 'viewed', 'signed', 'rejected', 'expired', 'cancelled')
  ),
  
  -- Delivery Tracking
  sent_at TIMESTAMP,
  sent_via VARCHAR(20), -- 'email', 'sms', 'both'
  
  -- Viewing Tracking
  first_viewed_at TIMESTAMP,
  last_viewed_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0, -- Total time spent on contract page
  
  -- Download Tracking
  downloaded BOOLEAN DEFAULT false,
  downloaded_at TIMESTAMP,
  
  -- Expiry
  expires_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SIGNATURES
-- =============================================================================

CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_id VARCHAR(50) UNIQUE NOT NULL, -- Short public ID like "SIG-2024-00001"
  
  -- Relationships
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  customer_id UUID, -- Will reference users table later
  tenant_id UUID NOT NULL,
  
  -- Customer Info (snapshot at signing time)
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  signer_mobile VARCHAR(20) NOT NULL,
  
  -- Signature Data
  signature_type VARCHAR(20) NOT NULL CHECK (
    signature_type IN ('drawn', 'typed', 'uploaded')
  ),
  signature_image_url TEXT NOT NULL, -- S3 URL of signature image
  signature_image_hash VARCHAR(64) NOT NULL, -- SHA-256 of signature image
  
  -- Mobile Verification (Critical for Legal Validity)
  mobile_verified BOOLEAN NOT NULL DEFAULT false,
  mobile_otp_sent_at TIMESTAMP,
  mobile_otp_verified_at TIMESTAMP,
  mobile_otp_attempts INTEGER DEFAULT 0,
  
  -- Signing Metadata
  signed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  device_fingerprint VARCHAR(255),
  geo_location JSONB, -- {"lat": 28.6139, "lon": 77.2090, "city": "New Delhi"}
  
  -- Cryptographic Proof
  document_hash VARCHAR(64) NOT NULL, -- SHA-256 of original contract PDF
  signature_hash VARCHAR(64) NOT NULL, -- SHA-256 of signature image
  combined_hash VARCHAR(64) NOT NULL, -- SHA-256(doc_hash + sig_hash + timestamp + mobile)
  signing_timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
  
  -- KYC Linkage (if available)
  kyc_session_id UUID,
  kyc_verification_level VARCHAR(20), -- 'full', 'lite', 'none'
  identity_verified BOOLEAN DEFAULT false,
  
  -- Consent Records
  consent_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  consent_document_read BOOLEAN NOT NULL DEFAULT false,
  consent_data_processing BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMP NOT NULL,
  consent_ip_address VARCHAR(45) NOT NULL,
  
  -- Signed PDF with Embedded Signature
  signed_pdf_url TEXT, -- S3 URL of PDF with signature embedded
  signed_pdf_hash VARCHAR(64), -- SHA-256 of signed PDF
  
  -- Certificate
  certificate_pdf_url TEXT, -- S3 URL of signature certificate
  certificate_generated_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed' CHECK (
    status IN ('pending', 'completed', 'failed', 'revoked')
  ),
  
  -- Revocation (if needed)
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  revoked_by UUID,
  revocation_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SIGNATURE SESSIONS (for OTP flow)
-- =============================================================================

CREATE TABLE signature_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- Mobile OTP State
  mobile_number VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255), -- bcrypt hash of OTP
  otp_sent_at TIMESTAMP,
  otp_expires_at TIMESTAMP,
  otp_attempts INTEGER DEFAULT 0,
  otp_verified BOOLEAN DEFAULT false,
  
  -- Session State
  signature_data_url TEXT, -- Temporarily store signature until OTP verified
  signature_type VARCHAR(20),
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- CONTRACT AUDIT LOG
-- =============================================================================

CREATE TABLE contract_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL, -- 'contract', 'signature'
  entity_id UUID NOT NULL,
  
  -- Action
  action VARCHAR(100) NOT NULL, 
  -- 'created', 'sent', 'viewed', 'downloaded', 'signed', 'rejected', 'expired'
  
  actor_id UUID, -- User who performed action (NULL for customer)
  actor_type VARCHAR(50), -- 'admin', 'customer', 'system'
  actor_email VARCHAR(255),
  
  -- Details
  details JSONB, -- Additional context
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_customer_email ON contracts(customer_email);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_template ON contracts(template_id);

CREATE INDEX idx_signatures_contract ON signatures(contract_id);
CREATE INDEX idx_signatures_tenant ON signatures(tenant_id);
CREATE INDEX idx_signatures_signer_email ON signatures(signer_email);

CREATE INDEX idx_signature_sessions_contract ON signature_sessions(contract_id);
CREATE INDEX idx_signature_sessions_mobile ON signature_sessions(mobile_number);
CREATE INDEX idx_signature_sessions_expires ON signature_sessions(expires_at);

CREATE INDEX idx_contract_audit_logs_entity ON contract_audit_logs(entity_type, entity_id);
CREATE INDEX idx_contract_audit_logs_created ON contract_audit_logs(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_templates_updated_at 
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at 
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Action Required:**
```bash
# Run this in psql or create migration file
cd /workspaces/Callvia-Certo

# For now, we'll use in-memory Map, but prepare for PostgreSQL
# Create the schema file first
```

---

## Phase 2: Backend API - Template Management (Day 2)

### Task 2.1: Template Models & Service

**File:** `apps/backend/src/contracts/contract.types.ts` (create new)

```typescript
export interface ContractTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version: string;
  category?: 'employment' | 'service' | 'nda' | 'custom';
  templateHtml: string;
  dynamicFields: DynamicField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DynamicField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'currency' | 'textarea';
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  validation?: string; // regex
}

export interface Contract {
  id: string;
  contractId: string; // Short ID
  tenantId: string;
  templateId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  generatedPdfUrl?: string;
  generatedPdfHash?: string;
  dynamicData: Record<string, any>;
  status: 'draft' | 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';
  sentAt?: Date;
  firstViewedAt?: Date;
  viewCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Signature {
  id: string;
  signatureId: string;
  contractId: string;
  tenantId: string;
  signerName: string;
  signerEmail: string;
  signerMobile: string;
  signatureType: 'drawn' | 'typed' | 'uploaded';
  signatureImageUrl: string;
  signatureImageHash: string;
  mobileVerified: boolean;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  documentHash: string;
  signatureHash: string;
  combinedHash: string;
  consentTermsAccepted: boolean;
  consentDocumentRead: boolean;
  signedPdfUrl?: string;
  certificatePdfUrl?: string;
  status: 'pending' | 'completed' | 'failed';
}
```

**File:** `apps/backend/src/contracts/contract-template.service.ts` (create new)

```typescript
import crypto from 'crypto';

class ContractTemplateService {
  private templates: Map<string, ContractTemplate> = new Map();

  async createTemplate(params: {
    tenantId: string;
    name: string;
    description?: string;
    templateHtml: string;
    dynamicFields: DynamicField[];
    category?: string;
  }): Promise<ContractTemplate> {
    const template: ContractTemplate = {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      name: params.name,
      description: params.description,
      version: '1.0',
      category: params.category as any,
      templateHtml: params.templateHtml,
      dynamicFields: params.dynamicFields,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(template.id, template);
    return template;
  }

  async getTemplate(id: string): Promise<ContractTemplate | null> {
    return this.templates.get(id) || null;
  }

  async listTemplates(tenantId: string): Promise<ContractTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.tenantId === tenantId && t.isActive);
  }

  async updateTemplate(id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');

    const updated = { ...template, ...updates, updatedAt: new Date() };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');
    
    template.isActive = false;
    this.templates.set(id, template);
  }
}

export const contractTemplateService = new ContractTemplateService();
```

### Task 2.2: Template Management Routes

**File:** `apps/backend/src/contracts/contract-template.routes.ts` (create new)

```typescript
import { FastifyPluginAsync } from 'fastify';
import { contractTemplateService } from './contract-template.service';

export const contractTemplateRoutes: FastifyPluginAsync = async (fastify) => {
  // Create template
  fastify.post('/templates', async (request, reply) => {
    const { name, description, templateHtml, dynamicFields, category } = request.body as any;
    
    const template = await contractTemplateService.createTemplate({
      tenantId: 'default-tenant', // TODO: Get from auth
      name,
      description,
      templateHtml,
      dynamicFields,
      category
    });

    return { success: true, template };
  });

  // List templates
  fastify.get('/templates', async (request, reply) => {
    const tenantId = 'default-tenant'; // TODO: Get from auth
    
    const templates = await contractTemplateService.listTemplates(tenantId);
    
    return { success: true, templates };
  });

  // Get single template
  fastify.get('/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    const template = await contractTemplateService.getTemplate(id);
    
    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }
    
    return { success: true, template };
  });

  // Update template
  fastify.put('/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    const updates = request.body as any;
    
    const template = await contractTemplateService.updateTemplate(id, updates);
    
    return { success: true, template };
  });

  // Delete template
  fastify.delete('/templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    await contractTemplateService.deleteTemplate(id);
    
    return { success: true, message: 'Template deleted' };
  });
};
```

**File:** Update `apps/backend/src/routes.ts`

```typescript
// Add to existing routes
import { contractTemplateRoutes } from './contracts/contract-template.routes';

// Inside registerRoutes function:
app.register(contractTemplateRoutes, { prefix: '/api/v1/contracts' });
```

---

## Phase 3: Contract Generation & PDF Creation (Day 3)

### Task 3.1: Install Dependencies

```bash
cd apps/backend
pnpm add puppeteer handlebars
pnpm add -D @types/puppeteer
```

### Task 3.2: PDF Generation Service

**File:** `apps/backend/src/contracts/pdf-generator.service.ts` (create new)

```typescript
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class PDFGeneratorService {
  private browser: any = null;

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generatePDF(params: {
    templateHtml: string;
    data: Record<string, any>;
    outputPath: string;
  }): Promise<{ pdfPath: string; pdfHash: string }> {
    await this.init();

    // Compile Handlebars template
    const template = Handlebars.compile(params.templateHtml);
    const html = template(params.data);

    // Add styling
    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          h2 {
            color: #34495e;
            margin-top: 30px;
          }
          .contract-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .contract-section {
            margin: 30px 0;
          }
          .signature-block {
            margin-top: 80px;
            border-top: 2px solid #ecf0f1;
            padding-top: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
          }
          .field-value {
            font-weight: bold;
            color: #2980b9;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Create PDF
    const page = await this.browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: params.outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

    await page.close();

    // Calculate hash
    const pdfBuffer = fs.readFileSync(params.outputPath);
    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    return {
      pdfPath: params.outputPath,
      pdfHash: hash
    };
  }

  async addSignatureToPDF(params: {
    originalPdfPath: string;
    signatureImageUrl: string;
    signerName: string;
    signedAt: Date;
    outputPath: string;
  }): Promise<{ pdfPath: string; pdfHash: string }> {
    await this.init();

    const page = await this.browser.newPage();

    // Create HTML overlay with signature
    const signatureHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          .signature-overlay {
            position: absolute;
            bottom: 100px;
            right: 50px;
            width: 300px;
            border: 2px solid #2ecc71;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .signature-image {
            width: 100%;
            border-bottom: 2px solid #34495e;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .signature-info {
            font-size: 10pt;
            color: #555;
          }
          .verified-badge {
            color: #2ecc71;
            font-weight: bold;
            font-size: 12pt;
          }
        </style>
      </head>
      <body>
        <div class="signature-overlay">
          <div class="verified-badge">✓ Digitally Signed</div>
          <img src="${params.signatureImageUrl}" class="signature-image" />
          <div class="signature-info">
            <strong>${params.signerName}</strong><br/>
            Signed on: ${params.signedAt.toLocaleString('en-IN')}<br/>
            Verified via OTP
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(signatureHtml);
    await page.pdf({
      path: params.outputPath,
      format: 'A4',
      printBackground: true
    });

    await page.close();

    // Calculate hash
    const pdfBuffer = fs.readFileSync(params.outputPath);
    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    return {
      pdfPath: params.outputPath,
      pdfHash: hash
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
```

### Task 3.3: Contract Service

**File:** `apps/backend/src/contracts/contract.service.ts` (create new)

```typescript
import crypto from 'crypto';
import path from 'path';
import { contractTemplateService } from './contract-template.service';
import { pdfGeneratorService } from './pdf-generator.service';
import type { Contract } from './contract.types';

class ContractService {
  private contracts: Map<string, Contract> = new Map();
  private contractCounter = 1;

  generateContractId(): string {
    const year = new Date().getFullYear();
    const id = `CNT-${year}-${String(this.contractCounter++).padStart(5, '0')}`;
    return id;
  }

  async createContract(params: {
    tenantId: string;
    templateId: string;
    customerName: string;
    customerEmail: string;
    customerMobile: string;
    dynamicData: Record<string, any>;
    expiresInDays?: number;
  }): Promise<Contract> {
    const template = await contractTemplateService.getTemplate(params.templateId);
    if (!template) throw new Error('Template not found');

    const contractId = this.generateContractId();

    const contract: Contract = {
      id: crypto.randomUUID(),
      contractId,
      tenantId: params.tenantId,
      templateId: params.templateId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerMobile: params.customerMobile,
      dynamicData: params.dynamicData,
      status: 'draft',
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (params.expiresInDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);
      contract.expiresAt = expiresAt;
    }

    // Generate PDF
    const outputDir = path.join(process.cwd(), 'temp', 'contracts');
    if (!require('fs').existsSync(outputDir)) {
      require('fs').mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = path.join(outputDir, `${contractId}.pdf`);

    const { pdfHash } = await pdfGeneratorService.generatePDF({
      templateHtml: template.templateHtml,
      data: {
        ...params.dynamicData,
        contractId,
        generatedDate: new Date().toLocaleDateString('en-IN')
      },
      outputPath: pdfPath
    });

    contract.generatedPdfUrl = pdfPath; // In production, upload to S3
    contract.generatedPdfHash = pdfHash;

    this.contracts.set(contract.id, contract);

    return contract;
  }

  async getContract(id: string): Promise<Contract | null> {
    return this.contracts.get(id) || null;
  }

  async getContractByContractId(contractId: string): Promise<Contract | null> {
    return Array.from(this.contracts.values()).find(c => c.contractId === contractId) || null;
  }

  async listContracts(tenantId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(c => c.tenantId === tenantId);
  }

  async updateContractStatus(id: string, status: Contract['status']): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error('Contract not found');

    contract.status = status;
    contract.updatedAt = new Date();

    if (status === 'sent' && !contract.sentAt) {
      contract.sentAt = new Date();
    }

    this.contracts.set(id, contract);
    return contract;
  }

  async trackView(contractId: string): Promise<void> {
    const contract = await this.getContractByContractId(contractId);
    if (!contract) throw new Error('Contract not found');

    contract.viewCount++;
    if (!contract.firstViewedAt) {
      contract.firstViewedAt = new Date();
      contract.status = 'viewed';
    }

    this.contracts.set(contract.id, contract);
  }
}

export const contractService = new ContractService();
```

---

## Phase 4: Contract Delivery & Customer Portal (Day 4)

### Task 4.1: Email Service Update

**File:** Update `apps/backend/src/services/email.service.ts`

Add new method:

```typescript
async sendContractLink(params: {
  customerName: string;
  customerEmail: string;
  contractId: string;
  contractName: string;
  companyName: string;
  expiresAt?: Date;
}): Promise<void> {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const contractUrl = `${FRONTEND_URL}/contract/view/${params.contractId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: white;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Contract Ready for Signature</h1>
        </div>
        
        <div class="content">
          <p>Dear ${params.customerName},</p>
          
          <p>Your contract <strong>"${params.contractName}"</strong> from <strong>${params.companyName}</strong> is ready for review and signature.</p>
          
          ${params.expiresAt ? `
            <div class="warning">
              ⏰ <strong>Action Required:</strong> This contract expires on ${params.expiresAt.toLocaleDateString('en-IN')}
            </div>
          ` : ''}
          
          <p>To review and sign the contract:</p>
          <ol>
            <li>Click the button below to open the contract</li>
            <li>Read through the entire document</li>
            <li>Verify your mobile number via OTP</li>
            <li>Sign the contract digitally</li>
          </ol>
          
          <center>
            <a href="${contractUrl}" class="button">
              Review & Sign Contract
            </a>
          </center>
          
          <p><small>Or copy this link: <a href="${contractUrl}">${contractUrl}</a></small></p>
          
          <p>Your signature will be legally binding and secured with:</p>
          <ul>
            <li>✓ OTP-verified mobile number</li>
            <li>✓ Cryptographic hash (SHA-256)</li>
            <li>✓ Complete audit trail</li>
            <li>✓ Digital certificate</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Contract ID: ${params.contractId}</p>
          <p>This is an automated email. Please do not reply.</p>
          <p>If you did not expect this contract, please contact ${params.companyName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: this.from,
    to: params.customerEmail,
    subject: `📄 Contract Ready for Signature - ${params.contractName}`,
    html: htmlContent
  });
}
```

### Task 4.2: Contract Routes

**File:** `apps/backend/src/contracts/contract.routes.ts` (create new)

```typescript
import { FastifyPluginAsync } from 'fastify';
import { contractService } from './contract.service';
import { emailService } from '../services/email.service';

export const contractRoutes: FastifyPluginAsync = async (fastify) => {
  // Create and send contract
  fastify.post('/', async (request, reply) => {
    const {
      templateId,
      customerName,
      customerEmail,
      customerMobile,
      dynamicData,
      expiresInDays,
      sendEmail
    } = request.body as any;

    const contract = await contractService.createContract({
      tenantId: 'default-tenant',
      templateId,
      customerName,
      customerEmail,
      customerMobile,
      dynamicData,
      expiresInDays
    });

    // Send email if requested
    if (sendEmail) {
      await contractService.updateContractStatus(contract.id, 'sent');
      
      await emailService.sendContractLink({
        customerName,
        customerEmail,
        contractId: contract.contractId,
        contractName: 'Service Agreement', // Get from template
        companyName: 'Callvia',
        expiresAt: contract.expiresAt
      });
    }

    return { success: true, contract };
  });

  // Get contract for customer view
  fastify.get('/view/:contractId', async (request, reply) => {
    const { contractId } = request.params as any;

    const contract = await contractService.getContractByContractId(contractId);

    if (!contract) {
      return reply.status(404).send({ error: 'Contract not found' });
    }

    // Track view
    await contractService.trackView(contractId);

    return { success: true, contract };
  });

  // List contracts (admin)
  fastify.get('/', async (request, reply) => {
    const tenantId = 'default-tenant';

    const contracts = await contractService.listContracts(tenantId);

    return { success: true, contracts };
  });

  // Get PDF
  fastify.get('/:contractId/pdf', async (request, reply) => {
    const { contractId } = request.params as any;

    const contract = await contractService.getContractByContractId(contractId);

    if (!contract || !contract.generatedPdfUrl) {
      return reply.status(404).send({ error: 'PDF not found' });
    }

    const fs = require('fs');
    const stream = fs.createReadStream(contract.generatedPdfUrl);

    reply.type('application/pdf');
    return reply.send(stream);
  });
};
```

**Update `apps/backend/src/routes.ts`:**

```typescript
import { contractRoutes } from './contracts/contract.routes';

// Inside registerRoutes:
app.register(contractRoutes, { prefix: '/api/v1/contracts' });
```

---

## Phase 5: Frontend - Template Management UI (Day 5)

### Task 5.1: Template Manager Page

**File:** `apps/frontend/src/pages/ContractTemplates.tsx` (create new)

```typescript
import React, { useState, useEffect } from 'react';

interface DynamicField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email';
  required: boolean;
}

export const ContractTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'service',
    templateHtml: '',
    dynamicFields: [] as DynamicField[]
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const response = await fetch('/api/v1/contracts/templates');
    const data = await response.json();
    setTemplates(data.templates);
  };

  const addDynamicField = () => {
    setFormData({
      ...formData,
      dynamicFields: [
        ...formData.dynamicFields,
        { name: '', label: '', type: 'text', required: true }
      ]
    });
  };

  const updateDynamicField = (index: number, updates: Partial<DynamicField>) => {
    const fields = [...formData.dynamicFields];
    fields[index] = { ...fields[index], ...updates };
    setFormData({ ...formData, dynamicFields: fields });
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/v1/contracts/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      setShowModal(false);
      loadTemplates();
      setFormData({
        name: '',
        description: '',
        category: 'service',
        templateHtml: '',
        dynamicFields: []
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contract Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm hover:underline">
                Edit
              </button>
              <button className="text-red-600 text-sm hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Contract Template</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Service Agreement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="employment">Employment</option>
                  <option value="service">Service Agreement</option>
                  <option value="nda">Non-Disclosure Agreement</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Dynamic Fields */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Dynamic Fields</label>
                  <button
                    onClick={addDynamicField}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    + Add Field
                  </button>
                </div>

                {formData.dynamicFields.map((field, index) => (
                  <div key={index} className="border rounded p-4 mb-2">
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Field Name (e.g., customerName)"
                        value={field.name}
                        onChange={(e) => updateDynamicField(index, { name: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g., Customer Name)"
                        value={field.label}
                        onChange={(e) => updateDynamicField(index, { label: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateDynamicField(index, { type: e.target.value as any })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                      </select>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateDynamicField(index, { required: e.target.checked })}
                          className="mr-2"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* HTML Template */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  HTML Template (use {{'{'}}{'{'}fieldName{{'}'}}{'}' for dynamic fields)
                </label>
                <textarea
                  value={formData.templateHtml}
                  onChange={(e) => setFormData({ ...formData, templateHtml: e.target.value })}
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  rows={15}
                  placeholder={`<div class="contract-header">
  <h1>Service Agreement</h1>
</div>

<p>This agreement is made on {{generatedDate}} between:</p>

<p><strong>Service Provider:</strong> Callvia</p>
<p><strong>Client:</strong> {{customerName}}</p>

<h2>Terms and Conditions</h2>
<p>...</p>`}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Template
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

**(Content continues in next part due to length limit...)**

Would you like me to continue with Phase 6-10 covering:
- Phase 6: Contract Creation UI
- Phase 7: Customer Contract View & Signature Capture
- Phase 8: OTP Verification & Signature Binding
- Phase 9: Signature Certificates
- Phase 10: Public Verification Portal

**Summary of what you need to do:**
1. **Day 1:** Create database schema (for now, keep in-memory Maps)
2. **Day 2-3:** Backend APIs for templates & contract generation
3. **Day 4:** Email delivery integration
4. **Day 5:** Frontend template manager

Should I continue with the remaining phases?
