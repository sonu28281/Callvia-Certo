# 🚀 Digital e-KYC Setup Guide

## Complete Implementation of DigiLocker & Aadhaar OTP Verification

This guide will help you set up production-ready digital e-KYC verification for Callvia-Certo.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: DigiLocker Setup (Recommended)](#option-1-digilocker-setup)
4. [Option 2: Aadhaar OTP Setup](#option-2-aadhaar-otp-setup)
5. [Option 3: Face Matching Setup](#option-3-face-matching-setup)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

We've implemented **3 methods** of digital e-KYC:

### 1. **DigiLocker OAuth** ⭐ RECOMMENDED
- Government-verified documents (Aadhaar, PAN, DL, etc.)
- Instant verification - no manual upload
- Legally valid and fraud-proof
- **Best user experience**

### 2. **Aadhaar OTP eKYC**
- Direct verification via Aadhaar number + OTP
- Face matching with selfie
- Quick and reliable
- **Backup method if user doesn't have DigiLocker**

### 3. **Manual Upload** (Existing)
- Fallback for users without Aadhaar/DigiLocker
- Manual review required
- **Legacy support**

---

## ✅ Prerequisites

### Required:
- Node.js 18+ installed
- Indian mobile number (for testing Aadhaar OTP)
- DigiLocker account (create at https://digilocker.meity.gov.in/)

### For Production (Optional but Recommended):
- Third-party KYC provider account (IDfy, Signzy, Karza)
- AWS account (for face matching via Rekognition)
- SSL certificate for production domain

---

## 🔐 Option 1: DigiLocker Setup (Recommended)

### Step 1: Register Your Application

1. **Create DigiLocker Account**
   - Visit: https://digilocker.meity.gov.in/
   - Sign up with mobile/Aadhaar
   - Complete your profile

2. **Register as Developer**
   - Go to: https://partners.digilocker.gov.in/
   - Apply for API access
   - Fill organization details
   - Wait for approval (1-2 business days)

3. **Get API Credentials**
   - Once approved, go to Developer Console
   - Create new application
   - Get:
     - Client ID
     - Client Secret
     - Redirect URI (whitelist your callback URL)

### Step 2: Configure Environment Variables

Update `.env` file:

```env
# DigiLocker Configuration
DIGILOCKER_CLIENT_ID=YOUR_CLIENT_ID_FROM_DIGILOCKER
DIGILOCKER_CLIENT_SECRET=YOUR_CLIENT_SECRET_FROM_DIGILOCKER
DIGILOCKER_REDIRECT_URI=http://localhost:5173/kyc/digilocker/callback

# For production:
# DIGILOCKER_REDIRECT_URI=https://yourdomain.com/kyc/digilocker/callback
```

### Step 3: Test the Flow

1. **Start both servers:**
   ```bash
   pnpm dev
   ```

2. **Navigate to Digital KYC page:**
   ```
   http://localhost:5173/kyc/digital
   ```

3. **Select "DigiLocker" method**

4. **Click "Continue with DigiLocker"**
   - You'll be redirected to DigiLocker login
   - Login with your credentials
   - Grant permission to access documents
   - You'll be redirected back with verified data

### Step 4: What Happens Behind the Scenes

```
User clicks "DigiLocker"
    ↓
Backend generates OAuth URL (/api/v1/kyc/digital/digilocker/init)
    ↓
User redirected to DigiLocker.gov.in
    ↓
User logs in and grants consent
    ↓
DigiLocker redirects back with authorization code
    ↓
Backend exchanges code for access token (/api/v1/kyc/digital/digilocker/callback)
    ↓
Backend fetches documents (Aadhaar, PAN, DL, etc.)
    ↓
Documents parsed and stored (encrypted)
    ↓
KYC marked as VERIFIED ✅
```

---

## 📱 Option 2: Aadhaar OTP Setup

### Step 1: Choose a Provider

You need a **third-party provider** for Aadhaar OTP verification (since direct UIDAI integration requires complex licensing).

**Recommended Providers:**

| Provider | Pricing | Best For |
|----------|---------|----------|
| [IDfy](https://idfy.com/) | ₹3-5/verification | Established, reliable |
| [Signzy](https://signzy.com/) | ₹2-4/verification | Good API, fast support |
| [Karza](https://www.karza.in/) | ₹4-6/verification | Enterprise features |
| [AuthBridge](https://www.authbridge.com/) | Custom | Large volumes |

### Step 2: Sign Up and Get API Key

**Example: IDfy Setup**

1. **Sign up:**
   - Visit: https://idfy.com/
   - Click "Get Started" or "Sign Up"
   - Fill business details

2. **Get API Key:**
   - Login to dashboard
   - Go to "API Keys" section
   - Generate new API key
   - Copy the key

3. **Test in Sandbox:**
   - Most providers offer sandbox mode
   - Use test Aadhaar numbers for testing

### Step 3: Configure Environment Variables

Update `.env`:

```env
# Aadhaar OTP Provider Configuration
AADHAAR_PROVIDER=idfy
AADHAAR_API_KEY=YOUR_IDFY_API_KEY_HERE
AADHAAR_API_ENDPOINT=https://api.idfy.com/v3/

# For Signzy:
# AADHAAR_PROVIDER=signzy
# AADHAAR_API_KEY=YOUR_SIGNZY_API_KEY
# AADHAAR_API_ENDPOINT=https://api.signzy.tech/v3/

# For Karza:
# AADHAAR_PROVIDER=karza
# AADHAAR_API_KEY=YOUR_KARZA_API_KEY
# AADHAAR_API_ENDPOINT=https://api.karza.in/v3/
```

### Step 4: Test Aadhaar OTP Flow

1. **Navigate to Digital KYC:**
   ```
   http://localhost:5173/kyc/digital
   ```

2. **Select "Aadhaar OTP" method**

3. **Enter Aadhaar number:**
   - For sandbox: Use provider's test Aadhaar numbers
   - For production: Use real Aadhaar number
   - Format: 1234 5678 9012

4. **Receive OTP:**
   - OTP sent to Aadhaar-registered mobile
   - Sandbox: Check provider dashboard for test OTP

5. **Enter OTP and verify:**
   - 6-digit OTP
   - Optional: Capture selfie for face matching

### Step 5: Provider-Specific Integration

#### IDfy Integration:

```typescript
// apps/backend/src/services/aadhaar-otp.service.ts
// Already configured! Just add your API key to .env
```

The service automatically handles:
- OTP generation
- OTP verification
- Data decryption
- Response parsing

---

## 📸 Option 3: Face Matching Setup

For enhanced security, we support face matching (compare Aadhaar photo with live selfie).

### Recommended: AWS Rekognition

**Step 1: Create AWS Account**
- Visit: https://aws.amazon.com/
- Sign up for free tier (first 5,000 images/month free)

**Step 2: Create IAM User**
1. Go to AWS Console → IAM
2. Create new user with programmatic access
3. Attach policy: `AmazonRekognitionFullAccess`
4. Save Access Key ID and Secret Access Key

**Step 3: Configure Environment Variables**

```env
# Face Matching Configuration
FACE_MATCH_PROVIDER=aws_rekognition
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1  # Mumbai region (best for India)
```

**Step 4: Install AWS SDK**

```bash
cd apps/backend
pnpm add @aws-sdk/client-rekognition
```

**Step 5: Implement Face Matching**

Already implemented in `aadhaar-otp.service.ts`! Just configure AWS credentials.

### Alternative: Azure Face API

```env
FACE_MATCH_PROVIDER=azure_face
AZURE_FACE_ENDPOINT=https://YOUR_RESOURCE.cognitiveservices.azure.com/
AZURE_FACE_KEY=YOUR_AZURE_FACE_KEY
```

---

## 🧪 Testing

### Test Aadhaar Numbers (Sandbox)

Most providers offer test Aadhaar numbers:

```
Aadhaar: 999999990019
OTP: 123456
Name: Test User
DOB: 01-01-1990
```

Check your provider's documentation for test credentials.

### Test DigiLocker (Sandbox)

DigiLocker offers sandbox mode:
- Create test DigiLocker account
- Upload test documents
- Use sandbox OAuth URLs

### Manual Testing Checklist

- [ ] DigiLocker OAuth flow completes
- [ ] Aadhaar OTP is received
- [ ] OTP verification works
- [ ] Selfie capture works
- [ ] Face matching returns result
- [ ] KYC data is displayed correctly
- [ ] Session expires after timeout
- [ ] Error messages are user-friendly

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] **Security:**
  - [ ] All API keys in environment variables (not hardcoded)
  - [ ] Enable HTTPS/SSL on production domain
  - [ ] Rate limiting on KYC endpoints
  - [ ] Input validation on all fields
  - [ ] SQL injection protection
  - [ ] XSS protection

- [ ] **Compliance:**
  - [ ] Privacy policy updated
  - [ ] Terms of service mention KYC
  - [ ] User consent for data processing
  - [ ] Data retention policy (5+ years)
  - [ ] Right to erasure implementation

- [ ] **Performance:**
  - [ ] Database indexes on session tables
  - [ ] Redis caching for sessions
  - [ ] CDN for frontend assets
  - [ ] Image compression for photos

- [ ] **Monitoring:**
  - [ ] Error logging (Sentry, LogRocket)
  - [ ] API monitoring (Datadog, New Relic)
  - [ ] Success rate tracking
  - [ ] Fraud detection alerts

### Database Migration

Create production tables:

```sql
CREATE TABLE kyc_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  tenant_id VARCHAR(255),
  method VARCHAR(50), -- 'digilocker', 'aadhaar-otp', 'manual'
  status VARCHAR(50), -- 'pending', 'verified', 'approved', 'rejected'
  
  -- DigiLocker data
  digilocker_token TEXT, -- Encrypted
  access_token_expires_at TIMESTAMP,
  
  -- Aadhaar data (encrypted)
  aadhaar_masked VARCHAR(20), -- XXXX-XXXX-1234
  kyc_data JSONB, -- Encrypted demographic data
  
  -- Verification details
  face_match_score FLOAT,
  liveness_check BOOLEAN,
  risk_score INTEGER,
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255),
  review_reason TEXT,
  
  -- Compliance
  consent_given BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE INDEX idx_kyc_user ON kyc_sessions(user_id);
CREATE INDEX idx_kyc_status ON kyc_sessions(status);
CREATE INDEX idx_kyc_created ON kyc_sessions(created_at);
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# DigiLocker (Production)
DIGILOCKER_CLIENT_ID=prod_client_id
DIGILOCKER_CLIENT_SECRET=prod_client_secret
DIGILOCKER_REDIRECT_URI=https://yourdomain.com/kyc/digilocker/callback

# Aadhaar Provider (Production)
AADHAAR_PROVIDER=idfy
AADHAAR_API_KEY=prod_api_key
AADHAAR_API_ENDPOINT=https://api.idfy.com/v3/

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@prod-db:5432/callvia_certo

# Redis (Session storage)
REDIS_URL=redis://prod-redis:6379

# Face Matching
AWS_ACCESS_KEY_ID=prod_access_key
AWS_SECRET_ACCESS_KEY=prod_secret_key
AWS_REGION=ap-south-1

# Email (Notifications)
SMTP_HOST=mail.autoxweb.com
SMTP_PORT=465
SMTP_USER=info@autoxweb.com
SMTP_PASSWORD=your_production_password
```

---

## 🐛 Troubleshooting

### DigiLocker Issues

**Problem: "Invalid redirect_uri"**
- **Solution:** Whitelist your callback URL in DigiLocker partner dashboard
- Check: https://partners.digilocker.gov.in/ → Your App → Redirect URIs

**Problem: "OAuth code expired"**
- **Solution:** OAuth codes expire in 10 minutes. Complete flow quickly.

**Problem: "No documents found"**
- **Solution:** User needs to upload documents to their DigiLocker account first
- Guide user to: https://digilocker.meity.gov.in/ → Add Documents

### Aadhaar OTP Issues

**Problem: "OTP not received"**
- **Solution:** 
  - Check mobile number registered with Aadhaar
  - Try resending OTP (wait 30 seconds between attempts)
  - Contact provider support

**Problem: "Invalid Aadhaar number"**
- **Solution:** Validate using Verhoeff algorithm (already implemented)
- Check: Must be exactly 12 digits

**Problem: "API quota exceeded"**
- **Solution:** Upgrade your provider plan or implement rate limiting

### Face Matching Issues

**Problem: "Face match confidence too low"**
- **Solution:**
  - Ensure good lighting in selfie
  - Face should be clearly visible
  - No sunglasses or masks
  - Lower threshold if needed (currently 90%)

**Problem: "AWS Rekognition error"**
- **Solution:** 
  - Check AWS credentials
  - Verify IAM permissions
  - Check AWS region is correct
  - Ensure billing is active

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Success Rate:**
   - % of KYC verifications completed successfully
   - Target: >95%

2. **Method Distribution:**
   - DigiLocker: __%
   - Aadhaar OTP: __%
   - Manual: __%

3. **Average Time:**
   - DigiLocker: ~2 minutes
   - Aadhaar OTP: ~3 minutes
   - Manual: 1-2 days

4. **Face Match Scores:**
   - Average confidence: __%
   - Rejection rate: __%

5. **Error Rates:**
   - API failures: __%
   - User abandonment: __%
   - OTP failures: __%

### Implement Analytics

```typescript
// Track KYC events
analytics.track('kyc_method_selected', {
  method: 'digilocker',
  userId: user.id,
  timestamp: new Date()
});

analytics.track('kyc_completed', {
  method: 'aadhaar-otp',
  duration: 180, // seconds
  faceMatchScore: 95.5,
  success: true
});
```

---

## 🔒 Security Best Practices

### Data Encryption

```typescript
// Encrypt sensitive data before storing
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  });
}
```

### Rate Limiting

```typescript
// Prevent abuse
fastify.register(require('@fastify/rate-limit'), {
  max: 5, // 5 requests
  timeWindow: '1 minute',
  cache: 10000,
  redis: redisClient // Use Redis in production
});
```

### Audit Logging

```typescript
// Log every KYC attempt
await auditLogger.log({
  event: 'kyc_verification_attempt',
  userId: user.id,
  method: 'aadhaar-otp',
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  result: 'success',
  timestamp: new Date()
});
```

---

## 📞 Support & Resources

### Official Documentation:
- DigiLocker: https://digilocker.meity.gov.in/
- UIDAI Aadhaar: https://uidai.gov.in/
- RBI KYC Guidelines: https://www.rbi.org.in/

### Third-Party Providers:
- IDfy: https://idfy.com/ | support@idfy.com
- Signzy: https://signzy.com/ | support@signzy.com
- Karza: https://www.karza.in/ | support@karza.in

### AWS Services:
- Rekognition Docs: https://docs.aws.amazon.com/rekognition/
- Support: https://console.aws.amazon.com/support/

---

## 🎉 Quick Start (TL;DR)

### For Development/Testing:

1. **Start servers:**
   ```bash
   pnpm dev
   ```

2. **Open Digital KYC page:**
   ```
   http://localhost:5173/kyc/digital
   ```

3. **Test Aadhaar OTP:**
   - Select "Aadhaar OTP"
   - Enter test Aadhaar: 999999990019
   - Enter test OTP: 123456
   - See verified data!

### For Production:

1. **Register with DigiLocker:**
   - https://partners.digilocker.gov.in/
   - Get Client ID & Secret

2. **Sign up with KYC provider:**
   - IDfy, Signzy, or Karza
   - Get API key

3. **Configure .env with production keys**

4. **Deploy and test!**

---

## ✅ Next Steps

1. [ ] Register for DigiLocker API access
2. [ ] Sign up with Aadhaar OTP provider (IDfy/Signzy)
3. [ ] Set up AWS Rekognition for face matching
4. [ ] Test in sandbox mode
5. [ ] Configure production environment variables
6. [ ] Set up database tables
7. [ ] Deploy to production
8. [ ] Monitor success rates
9. [ ] Optimize based on analytics

---

**Questions?** Open an issue or contact the development team.

**Ready to go live?** Follow the Production Deployment section above.

🚀 **Happy KYC Verification!**
