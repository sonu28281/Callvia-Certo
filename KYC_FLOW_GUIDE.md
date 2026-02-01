# KYC Verification Flow - Complete Guide

## 🎯 Understanding the KYC Process

### Who is Who?

1. **You (Admin/Tenant Admin/Agent)** 
   - Dashboard user
   - Initiates KYC for customers
   - Tracks verification status
   - Views results

2. **End User (Customer)** 
   - Person whose identity needs verification
   - Receives email/SMS with KYC link
   - Completes verification on their own device
   - Uploads documents, takes selfie

---

## 📧 Best Practice: Email Link Method

### ✅ Why Email Link is Best:

1. **Security** - Unique, time-limited link
2. **Convenience** - Customer does it on their time
3. **Mobile Friendly** - Works on phone/tablet
4. **Audit Trail** - Full tracking
5. **No App Required** - Just browser needed

---

## 🔄 Complete Flow (Step by Step)

### **Step 1: Admin Initiates KYC**

```
Admin Dashboard → KYC Page → Click "Start New Verification"
```

**Admin enters:**
- Customer Name: "John Doe"
- Customer Email: "john@example.com"
- Customer Phone: "+1234567890" (optional for SMS)
- Documents Required: Passport, Driver's License
- Biometric: Yes/No

**Admin clicks:** "Send KYC Link"

---

### **Step 2: Backend Processing**

```javascript
// Backend receives request
POST /api/v1/kyc/initiate

{
  "endUserName": "John Doe",
  "endUserEmail": "john@example.com",
  "endUserPhone": "+1234567890",
  "documentTypes": ["passport", "drivers_license"],
  "biometricRequired": true
}

// Backend does:
1. Create KYC session → kyc_session_abc123
2. Generate unique verification link
3. Send email to john@example.com
4. (Optional) Send SMS to phone
5. Deduct wallet balance
6. Create audit log
7. Return session ID to admin
```

---

### **Step 3: Customer Receives Email**

```
Subject: Complete Your Identity Verification

Hi John,

You've been invited to complete identity verification.

Click here to start: https://verify.yourbrand.com/kyc/abc123

This link expires in 24 hours.

Required documents:
- Passport
- Driver's License
- Selfie Photo

Estimated time: 5 minutes

Questions? Contact support@yourbrand.com
```

---

### **Step 4: Customer Opens Link**

**Customer sees separate portal** (not admin dashboard):

```
┌─────────────────────────────────────┐
│  Your Brand Logo                    │
│                                     │
│  Identity Verification              │
│                                     │
│  Step 1 of 3: Upload Passport       │
│  ┌──────────────────────────────┐  │
│  │  [Upload Photo/PDF]          │  │
│  │                              │  │
│  │  • Clear photo of full page  │  │
│  │  • All corners visible       │  │
│  │  • No glare or shadows       │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Continue] →                       │
└─────────────────────────────────────┘
```

**Customer uploads:**
1. Passport photo (front page)
2. Driver's License (front & back)
3. Takes selfie (live photo for biometric)

---

### **Step 5: AI Verification**

```
Backend sends to KYC Provider (e.g., Onfido):
- Document images
- Face photo

AI checks:
✓ Document is authentic (not fake)
✓ Face matches document photo
✓ Data extraction (name, DOB, ID number)
✓ Liveness detection (not a photo of photo)

Result: APPROVED / REJECTED
```

---

### **Step 6: Admin Sees Result**

```
Admin Dashboard → KYC Page → Shows:

┌─────────────────────────────────────────────────┐
│ kyc_session_abc123  ✓ Completed                │
│ John Doe (john@example.com)                     │
│                                                 │
│ Status: Approved ✓                              │
│ Documents: Passport ✓, Driver's License ✓       │
│ Biometric: Match ✓                              │
│                                                 │
│ Started: 2024-01-25 10:00                       │
│ Completed: 2024-01-25 10:05                     │
│ Cost: $2.50                                     │
│                                                 │
│ [View Full Report] [Download PDF]              │
└─────────────────────────────────────────────────┘
```

---

## 🆚 Alternative Methods (Less Common)

### Method 2: QR Code
```
Admin generates QR code
→ Customer scans with phone
→ Opens verification page
```
**Use case:** In-person verification (retail, bank branch)

### Method 3: Embedded Widget
```
Customer already on your website
→ KYC widget embedded in page
→ Completes inline
```
**Use case:** During account signup

### Method 4: Mobile SDK
```
Customer has your mobile app
→ KYC flow inside app
→ Native experience
```
**Use case:** Banking apps, fintech apps

---

## 📊 Admin Dashboard Features

### What Admin Can See:

1. **Initiate New KYC**
   - Enter customer details
   - Select required documents
   - Send link

2. **Track Status**
   - Pending (link sent, not opened)
   - In Progress (customer uploading)
   - Under Review (AI processing)
   - Completed (approved/rejected)

3. **View Results**
   - Extracted data (name, DOB, ID number)
   - Verification status
   - Confidence scores
   - Flagged issues

4. **Download Reports**
   - PDF certificate
   - Audit trail
   - Compliance documents

---

## 🔐 Security Best Practices

1. **Unique Links** - One-time use per customer
2. **Expiration** - 24-48 hour validity
3. **Encryption** - All data encrypted in transit
4. **No Storage** - Images deleted after verification
5. **Audit Logs** - Every action tracked

---

## 💰 Pricing Model

```
Admin initiates KYC
→ Wallet balance checked
→ If sufficient: proceed
→ Deduct amount ($2.50 - $5.00)
→ Send link to customer
→ If customer fails to complete: 
   Option to refund or not (your policy)
```

---

## 🎨 White-Label Customization

**Customer sees YOUR branding:**
- Your logo
- Your colors
- Your domain (verify.yourbrand.com)
- Your email sender
- Your support contact

**Not "Callvia Certo" branding!**

---

## 📝 Backend API Endpoints

### Initiate KYC
```javascript
POST /api/v1/kyc/initiate

Request:
{
  "endUserName": "John Doe",
  "endUserEmail": "john@example.com",
  "endUserPhone": "+1234567890",
  "documentTypes": ["passport", "drivers_license"],
  "biometricRequired": true,
  "notifyVia": ["email", "sms"]  // optional
}

Response:
{
  "sessionId": "kyc_session_abc123",
  "verificationUrl": "https://verify.yourbrand.com/kyc/abc123",
  "expiresAt": "2024-01-26T10:00:00Z",
  "status": "pending",
  "estimatedCost": 2.50,
  "walletBalanceAfter": 1247.50
}
```

### Check Status
```javascript
GET /api/v1/kyc/:sessionId/status

Response:
{
  "sessionId": "kyc_session_abc123",
  "status": "completed",
  "result": "approved",
  "endUserName": "John Doe",
  "completedAt": "2024-01-25T10:05:00Z",
  "documents": [
    {
      "type": "passport",
      "status": "verified",
      "extractedData": {
        "fullName": "John Doe",
        "dateOfBirth": "1990-05-15",
        "passportNumber": "X1234567",
        "nationality": "US"
      }
    }
  ],
  "biometricMatch": true,
  "confidenceScore": 0.98
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Basic Flow
- [ ] Admin can enter customer details
- [ ] System generates unique link
- [ ] Email sent to customer
- [ ] Customer portal for document upload
- [ ] Basic AI verification
- [ ] Admin sees result

### Phase 2: Enhanced Features
- [ ] SMS notifications
- [ ] QR code generation
- [ ] Multiple document types
- [ ] Real-time status updates (WebSocket)
- [ ] Retry failed verifications
- [ ] Bulk KYC initiation (CSV upload)

### Phase 3: Advanced
- [ ] Risk scoring
- [ ] Watchlist checking
- [ ] AML screening
- [ ] Compliance reporting
- [ ] API for developers
- [ ] Webhook notifications

---

## 💡 Your Questions Answered

### Q: "End User ID kya hai?"
**A:** End User = Your customer (जिसका KYC होना है). Admin portal में आप उनकी details डालते हो, system automatically ID generate करता है.

### Q: "Email link best way hai?"
**A:** Yes! सबसे secure और convenient. Customer अपने time पे, अपने device पे कर सकता है.

### Q: "Customer क्या upload करेगा?"
**A:** Documents (Passport, ID card) + Selfie (for face matching). सब कुछ उनके browser से.

### Q: "Result कब मिलेगा?"
**A:** Usually 2-5 minutes. AI instantly verify करता है. Admin dashboard में real-time status दिखेगा.

### Q: "Wallet balance कब deduct होगा?"
**A:** जैसे ही Admin "Send KYC Link" click करेगा. अगर customer complete नहीं करता, policy के according refund हो सकता है.

---

## 🎯 Summary

**Email link method is BEST because:**
✅ Secure (unique links)
✅ Convenient (customer's own time)
✅ Professional (white-label branding)
✅ Mobile-friendly (works everywhere)
✅ Full audit trail
✅ Industry standard

**You (Admin) just need:**
1. Customer name
2. Customer email
3. What documents needed

**System handles everything else!**

---

Need more clarification? Let me know! 😊
