# Digital e-KYC Research & Implementation Plan

## Overview
Moving from manual document upload to fully digital, automated e-KYC verification using government-backed identity systems and third-party verification providers.

---

## 🇮🇳 India e-KYC Standards

### 1. **DigiLocker Integration** (Government of India)
**What is DigiLocker?**
- Government cloud platform for storing digital documents
- Documents are legally valid and pre-verified by issuing authorities
- Citizens can share documents with service providers securely

**How it works:**
1. User authenticates via Aadhaar-based OAuth
2. User provides consent to share specific documents
3. Your app receives verified documents via API (PAN, Driving License, Education certificates, etc.)
4. No manual upload needed - documents are already government-verified

**API Flow:**
```
User → DigiLocker Login → OAuth Consent → Your App receives:
  - Aadhaar XML (name, DOB, address, photo)
  - PAN Card
  - Driving License
  - Other uploaded documents
```

**Advantages:**
- ✅ Government-issued, verified documents
- ✅ No fraud risk (documents can't be tampered)
- ✅ Instant verification
- ✅ Legally valid for KYC compliance
- ✅ User-friendly (no manual upload)

**Requirements:**
- Register at https://digilocker.meity.gov.in/
- Get API credentials (Client ID, Client Secret)
- Implement OAuth 2.0 flow
- Use DigiLocker Pull API for fetching documents

---

### 2. **Aadhaar-based e-KYC (UIDAI)**
**What is Aadhaar eKYC?**
- Direct integration with UIDAI (Unique Identification Authority of India)
- Real-time demographic and biometric verification
- Returns XML with verified name, DOB, address, photo

**How it works:**
1. User enters 12-digit Aadhaar number
2. OTP sent to Aadhaar-registered mobile
3. User enters OTP
4. Your app receives encrypted XML with KYC data
5. Decrypt using your private key

**API Types:**
- **OTP-based eKYC**: Simpler, OTP to user's mobile
- **Biometric eKYC**: Fingerprint/iris scan (requires device)

**Advantages:**
- ✅ Most reliable - directly from UIDAI
- ✅ Instant verification (< 5 seconds)
- ✅ Photo included for face matching
- ✅ Address proof included
- ✅ RBI/SEBI/IRDAI compliant

**Requirements:**
- Register as KUA (KYC User Agency) with UIDAI
- Get AUA (Authentication User Agency) license
- Use licensed ASA (Aadhaar Service Agency) like NSDL, CDSL
- Or use third-party providers (easier)

---

### 3. **Video KYC (VKYC)** - RBI Approved
**What is Video KYC?**
- Live video call with customer
- AI-powered or human-assisted verification
- Required for banking, securities, insurance

**How it works:**
1. Customer schedules video call
2. Shows ID card to camera (PAN, Aadhaar, etc.)
3. Agent/AI verifies face matches ID
4. AI performs liveness check (blink, turn head)
5. OCR extracts data from ID card
6. Recording stored for audit

**RBI Guidelines (Master Direction - KYC):**
- Must record and store video for minimum period
- Geo-tagging required
- Liveness detection mandatory
- Agent must verify in real-time

**Advantages:**
- ✅ Human verification element
- ✅ Liveness detection prevents fraud
- ✅ Works for customers without DigiLocker
- ✅ Regulatory compliant

---

### 4. **PAN Verification API**
**What is PAN verification?**
- Verify PAN card details with Income Tax Department
- Returns: Name, PAN status, DOB

**Providers:**
- NSDL PAN API (official)
- Third-party: IDfy, Signzy, AuthBridge

**How it works:**
1. User enters PAN number
2. API call to NSDL/provider
3. Returns verified name and status
4. Match with other KYC documents

---

## 🌍 International e-KYC Standards

### 1. **eIDAS (European Union)**
- Electronic Identification, Authentication and Trust Services
- Cross-border recognition of e-signatures and e-IDs
- Three levels: Low, Substantial, High assurance

### 2. **Know Your Customer (KYC) APIs - Global**
- **Onfido**: Document verification + facial biometrics
- **Jumio**: ID verification + liveness detection
- **Trulioo**: Global identity verification (195+ countries)
- **Sumsub**: AI-powered KYC/AML
- **Veriff**: Video-first identity verification

### 3. **Typical Global e-KYC Flow:**
```
1. User uploads ID document (passport, driver's license, national ID)
2. OCR extraction of data
3. Document authenticity check (holograms, fonts, security features)
4. Selfie capture
5. Face matching (selfie vs ID photo)
6. Liveness detection (blink, smile, turn head)
7. Database checks (PEP, sanctions, watchlists)
8. Risk scoring and approval
```

---

## 🏗️ Recommended Architecture for Callvia-Certo

### **Hybrid Approach: Best of All Worlds**

#### **For Indian Users (Primary):**
1. **DigiLocker Integration** (Easiest for users)
   - OAuth login to DigiLocker
   - Fetch Aadhaar, PAN, DL automatically
   - No manual upload needed

2. **Aadhaar OTP eKYC** (Fallback)
   - If user doesn't have DigiLocker
   - Direct UIDAI integration via provider

3. **PAN Verification** (Always)
   - Cross-verify PAN with IT Department
   - Mandatory for financial services

#### **For International Users:**
1. **Global KYC Provider** (Onfido/Jumio/Veriff)
   - Passport/ID upload
   - Face verification
   - Liveness check

#### **Video KYC** (For high-risk or large amounts)
   - Live agent verification
   - Required for banking license

---

## 🔧 Implementation Stack

### Backend Services:
```typescript
/services
  ├── digilocker.service.ts       // DigiLocker OAuth & Pull API
  ├── aadhaar-otp.service.ts      // Aadhaar OTP verification
  ├── pan-verification.service.ts  // PAN card verification
  ├── face-match.service.ts        // Face matching AI
  ├── ocr.service.ts               // Extract data from documents
  ├── liveness.service.ts          // Detect fake photos/videos
  └── kyc-provider.service.ts      // Third-party provider (Onfido, etc.)
```

### Database Schema:
```sql
kyc_sessions:
  - session_id
  - user_id
  - tenant_id
  - verification_method: 'digilocker' | 'aadhaar-otp' | 'video-kyc' | 'manual'
  - aadhaar_verified: boolean
  - pan_verified: boolean
  - face_match_score: float
  - liveness_check: boolean
  - verification_status: 'pending' | 'verified' | 'rejected'
  - digilocker_token: string (encrypted)
  - verified_data: JSON (encrypted)
  - audit_trail: JSON
```

### Frontend Flow:
```
┌─────────────────────────────────────────┐
│  Choose Verification Method:            │
│  [ ] DigiLocker (Recommended)           │
│  [ ] Aadhaar OTP                        │
│  [ ] Video KYC                          │
│  [ ] Manual Upload (Legacy)             │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  DigiLocker Flow:                       │
│  1. "Login with DigiLocker" button      │
│  2. Redirect to digilocker.gov.in       │
│  3. User grants consent                 │
│  4. Redirect back with auth code        │
│  5. Fetch documents via API             │
│  6. Auto-fill form with verified data   │
│  7. Face match with selfie camera       │
│  8. Submit for approval                 │
└─────────────────────────────────────────┘
```

---

## 📋 Regulatory Compliance

### India - RBI Master Direction on KYC
- Officially Valid Documents (OVDs): Aadhaar, PAN, Passport, Voter ID, Driving License
- Video KYC allowed since 2020
- Aadhaar eKYC allowed for licensed entities
- PAN mandatory for financial transactions

### India - Prevention of Money Laundering Act (PMLA)
- Customer Due Diligence (CDD) required
- Beneficial ownership identification
- Risk categorization
- Record keeping (5 years minimum)

### Global - FATF Recommendations
- Risk-based approach to KYC
- Customer identification and verification
- Ongoing monitoring
- Enhanced Due Diligence (EDD) for high-risk

---

## 🚀 Recommended Implementation Plan

### Phase 1: DigiLocker Integration (Week 1-2)
1. Register on DigiLocker portal
2. Implement OAuth 2.0 flow
3. Integrate Pull API for documents
4. Add PAN verification API
5. Build frontend with "Login with DigiLocker"

### Phase 2: Aadhaar OTP eKYC (Week 3)
1. Partner with ASA provider (e.g., IDfy, Signzy)
2. Implement OTP flow
3. Handle encrypted XML response
4. Add fallback to DigiLocker

### Phase 3: Face Matching & Liveness (Week 4)
1. Integrate face recognition API (AWS Rekognition, Azure Face API)
2. Add liveness detection (blink, head turn)
3. Compare selfie with Aadhaar/ID photo
4. Set threshold for match score (e.g., 95%)

### Phase 4: Video KYC (Week 5-6)
1. Build video call infrastructure (Twilio, Agora)
2. Implement OCR for ID cards
3. Add recording and storage
4. Create agent dashboard for verification

### Phase 5: International KYC (Week 7)
1. Integrate Onfido/Jumio API
2. Support passport verification
3. Multi-country compliance

---

## 💰 Cost Estimates

### DigiLocker:
- **Free** for government platform access
- Only development effort

### Aadhaar OTP eKYC:
- ₹2-5 per verification via third-party providers
- Direct UIDAI: Requires license (complex)

### PAN Verification:
- ₹1-3 per verification

### Face Matching:
- AWS Rekognition: $0.001 per image (very cheap)
- Azure Face API: Similar pricing

### Third-party KYC Providers:
- Onfido: $1-3 per check
- Jumio: $1-2 per verification
- IDfy: ₹5-10 per verification

### Video KYC:
- Infrastructure: Twilio Video ~$0.004/min
- Agent cost: If human-assisted

---

## 🎯 Recommended Approach for Callvia-Certo

**Primary Method: DigiLocker + Aadhaar OTP + PAN Verification**

**Why?**
1. ✅ **User-friendly**: No manual uploads, instant verification
2. ✅ **Cost-effective**: DigiLocker free, Aadhaar ₹2-5, PAN ₹1-3
3. ✅ **Legally valid**: Government-verified documents
4. ✅ **Fast**: Complete KYC in < 2 minutes
5. ✅ **Fraud-proof**: Documents can't be tampered
6. ✅ **Compliant**: Meets RBI/SEBI/IRDAI requirements

**Implementation Priority:**
1. DigiLocker OAuth (Easiest, best UX)
2. PAN Verification (Always required)
3. Face matching with selfie (Anti-fraud)
4. Aadhaar OTP (Backup method)
5. Video KYC (For special cases)

---

## 📚 Resources & Documentation

### Official:
- DigiLocker API: https://digilocker.meity.gov.in/
- UIDAI Aadhaar: https://uidai.gov.in/
- NSDL PAN: https://www.pan.nsdl.com/
- RBI Master Direction: https://www.rbi.org.in/

### Third-party Providers (India):
- IDfy: https://idfy.com/
- Signzy: https://signzy.com/
- AuthBridge: https://www.authbridge.com/
- Karza: https://www.karza.in/

### Global Providers:
- Onfido: https://onfido.com/
- Jumio: https://www.jumio.com/
- Veriff: https://www.veriff.com/
- Sumsub: https://sumsub.com/

---

## 🔐 Security & Privacy

### Data Protection:
- Encrypt all PII data at rest (AES-256)
- Encrypt in transit (TLS 1.3)
- Store biometric data hashed (one-way)
- GDPR/DPDP Act compliance
- Right to erasure support

### Aadhaar Guidelines:
- Cannot store Aadhaar number in plain text
- Can store masked version (XXXX-XXXX-1234)
- Can store encrypted XML with consent
- Virtual ID (VID) preferred over Aadhaar number

### Audit Trail:
- Log every KYC attempt
- Store consent records
- Record verification decisions
- Keep for regulatory periods (5+ years)

---

## ✅ Next Steps

1. **Decide**: Which providers to integrate first?
2. **Register**: Get API credentials from DigiLocker, PAN provider
3. **Develop**: Implement OAuth flow and verification APIs
4. **Test**: Sandbox testing with test Aadhaar numbers
5. **Deploy**: Production rollout with monitoring
6. **Monitor**: Track success rates, user feedback, fraud attempts

**Recommended First Provider: DigiLocker**
- Easiest to integrate
- Best user experience
- Government-backed
- Free to use
- Covers 80% of use cases

Would you like me to start implementing DigiLocker integration?
