# Real KYC Integration Guide - Onfido

## 🎯 What is Onfido?

**Onfido** is a leading identity verification platform that uses AI to verify:
- Government-issued IDs (Passport, Driver's License, National ID)
- Facial biometrics (selfie matching)
- Document authenticity (detects fake documents)
- Liveness detection (ensures it's a real person, not a photo)

## 💰 Pricing

- **Sandbox**: FREE for testing
- **Production**: $2-5 per verification
- **Volume discounts** available

## 🚀 Setup Steps

### 1. Create Onfido Account

```bash
1. Go to: https://onfido.com/
2. Sign up for free account
3. Navigate to Dashboard → API Keys
4. Copy your API token
```

### 2. Add API Key to Environment

```bash
# .env
ONFIDO_API_KEY=test_abc123...
ONFIDO_WEBHOOK_SECRET=webhook_secret_xyz...
FRONTEND_URL=http://localhost:5173
```

### 3. Install Onfido SDK

```bash
cd apps/backend
pnpm add axios
```

## 📋 How It Works

### Complete Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                   1. Admin Dashboard                        │
│  Admin enters:                                              │
│  - Customer Name: John Doe                                  │
│  - Customer Email: john@example.com                         │
│  - Documents: Passport, Driver's License                    │
│  → Click "Send KYC Link"                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   2. Backend Processing                     │
│  POST /api/v1/kyc/real/initiate                             │
│                                                             │
│  ✓ Create Onfido applicant                                 │
│  ✓ Generate SDK token (expires in 90 min)                  │
│  ✓ Deduct wallet balance ($2.50)                           │
│  ✓ Send email to john@example.com                          │
│  ✓ Create audit log                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   3. Email to Customer                      │
│  Subject: Complete Your Identity Verification              │
│                                                             │
│  Hi John,                                                   │
│                                                             │
│  Click here to verify your identity:                       │
│  https://verify.yourbrand.com/kyc/abc123                   │
│                                                             │
│  Required: Passport + Selfie                               │
│  Time: ~5 minutes                                          │
│  Link expires in: 90 minutes                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   4. Customer Portal                        │
│  Customer opens link in browser (mobile/desktop)           │
│                                                             │
│  Onfido SDK loads:                                         │
│  ┌─────────────────────────────────────────────────┐      │
│  │  Step 1: Take photo of passport                 │      │
│  │  [📷 Capture Front]                              │      │
│  │                                                   │      │
│  │  Tips:                                            │      │
│  │  • Clear photo, no glare                         │      │
│  │  • All corners visible                           │      │
│  │  • Place on flat surface                         │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  ┌─────────────────────────────────────────────────┐      │
│  │  Step 2: Take a selfie                           │      │
│  │  [📷 Start Camera]                               │      │
│  │                                                   │      │
│  │  • Center your face                              │      │
│  │  • Look directly at camera                       │      │
│  │  • Remove glasses/hat                            │      │
│  └─────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   5. Onfido AI Processing                   │
│  • Validates document authenticity                          │
│  • Extracts data (name, DOB, ID number)                    │
│  • Compares face with document photo                       │
│  • Checks for liveness (anti-spoofing)                     │
│  • AML/Watchlist screening (optional)                      │
│                                                             │
│  Result: CLEAR / CONSIDER / REJECT                         │
│  Time: 30 seconds - 2 minutes                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   6. Webhook to Backend                     │
│  POST /api/v1/kyc/real/webhook                              │
│                                                             │
│  {                                                          │
│    "resource_type": "check",                               │
│    "action": "check.completed",                            │
│    "object": {                                             │
│      "id": "check_abc123",                                 │
│      "status": "complete",                                 │
│      "result": "clear",                                    │
│      "reports": [...]                                      │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Backend updates database & notifies admin                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   7. Admin Dashboard Update                 │
│  ✓ Status: Completed                                       │
│  ✓ Result: Approved                                        │
│  ✓ Document: Verified                                      │
│  ✓ Face Match: 98% confidence                              │
│  ✓ Extracted Data:                                         │
│     - Full Name: John Doe                                  │
│     - DOB: 1990-05-15                                      │
│     - Nationality: United States                           │
│     - Passport #: X1234567                                 │
│  [Download Report] [View Documents]                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 API Endpoints

### 1. Initiate KYC

```bash
POST /api/v1/kyc/real/initiate
Authorization: Bearer token

{
  "endUserName": "John Doe",
  "endUserEmail": "john@example.com",
  "endUserPhone": "+1234567890",
  "documentTypes": ["passport"],
  "biometricRequired": true
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "kyc_session_abc123",
    "applicantId": "onfido_applicant_xyz",
    "verificationUrl": "https://verify.yourbrand.com/kyc/abc123",
    "status": "pending",
    "expiresAt": "2024-01-25T12:00:00Z"
  }
}
```

### 2. Check Status

```bash
GET /api/v1/kyc/real/:sessionId/status
Authorization: Bearer token

Response:
{
  "success": true,
  "data": {
    "sessionId": "kyc_session_abc123",
    "status": "complete",
    "result": "clear",
    "reports": [
      {
        "type": "document",
        "status": "complete",
        "result": "clear"
      },
      {
        "type": "facial_similarity_photo",
        "status": "complete",
        "result": "clear"
      }
    ]
  }
}
```

## 🎨 Frontend Integration

### Update KYC Page to Call Real API:

```typescript
// apps/frontend/src/pages/KYC.tsx

const handleInitiate = async () => {
  try {
    const response = await axios.post('/api/v1/kyc/real/initiate', {
      endUserName: formData.endUserName,
      endUserEmail: formData.endUserEmail,
      endUserPhone: formData.endUserPhone,
      documentTypes: formData.documentTypes,
      biometricRequired: formData.biometricRequired,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    alert(`✅ KYC link sent to ${formData.endUserEmail}`);
    // Optionally show the verification URL for testing
    console.log('Verification URL:', response.data.data.verificationUrl);
    
    setShowInitiateModal(false);
  } catch (error) {
    alert('Failed to initiate KYC');
  }
};
```

## 🔐 Security Best Practices

1. **API Keys**: Never expose in frontend
2. **Webhook Verification**: Verify signature from Onfido
3. **HTTPS Only**: All communication must be encrypted
4. **Token Expiry**: SDK tokens expire in 90 minutes
5. **Rate Limiting**: Prevent abuse

## 📊 Onfido Dashboard Features

- Real-time verification monitoring
- Success/failure rates
- Average processing time
- Cost tracking
- Webhook logs
- Document downloads

## 🧪 Testing

### Sandbox Mode:

```bash
# Use test documents
# Onfido provides test IDs that always pass/fail
# No real verification, instant results
```

### Production Mode:

```bash
# Real document verification
# Real cost per verification
# 30 sec - 2 min processing time
```

## 💡 Alternatives to Onfido

| Provider | Best For | Starting Price |
|----------|----------|----------------|
| **Onfido** | Global, AI-powered | $2-5 |
| **Veriff** | Video-based | $3-6 |
| **Jumio** | High-risk industries | $5-10 |
| **Sumsub** | Crypto/Fintech | $2-4 |
| **IDfy** | India-specific | ₹50-100 |

## ✅ Benefits of Real KYC

1. **Automated** - No manual review needed
2. **Fast** - 30 seconds average
3. **Accurate** - 99%+ accuracy
4. **Compliant** - Meets global regulations
5. **Scalable** - Handle thousands daily
6. **Fraud Prevention** - Detects fake documents

## 📝 Next Steps

1. ✅ Get Onfido API key
2. ✅ Add to `.env` file
3. ✅ Test in sandbox mode
4. ✅ Integrate webhook
5. ✅ Build customer portal
6. ✅ Go live!

---

**Need help setting up? Let me know!** 🚀
