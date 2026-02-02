# KYC Override Feature - Testing Guide

## ✅ Features Implemented

### 1. Backend (Override Log Service)
- ✅ `apps/backend/src/kyc/override-log.service.ts` created
- ✅ Logs all override actions with reason, cost delta, modules
- ✅ Immutable audit trail
- ✅ Statistics and reporting functions

### 2. Backend (API Updates)
- ✅ `/api/v1/kyc/inhouse/initiate` endpoint updated
- ✅ Accepts override parameters:
  - `isOverride` (boolean)
  - `overrideReason` (string, mandatory if override)
  - `overrideNotes` (string, optional)
  - `additionalModules` (array: aadhaar_otp, video_kyc, enhanced_liveness)
- ✅ Validates override reason
- ✅ Calculates cost delta
- ✅ Logs override in service
- ✅ Returns override info in response

### 3. Frontend (Admin UI)
- ✅ `apps/frontend/src/pages/KYC.tsx` updated
- ✅ Override checkbox in "Start New Verification" modal
- ✅ Additional modules selection:
  - 📱 Aadhaar OTP (+₹3.50)
  - 🎥 Video KYC (+₹15.00)
  - 🔍 Enhanced Liveness (+₹2.00)
- ✅ Mandatory reason field (500 chars max)
- ✅ Optional notes field
- ✅ Real-time cost calculation
- ✅ Visual cost impact summary

### 4. Frontend (Customer List)
- ✅ Override badge (🔧 Custom) on overridden customers
- ✅ Cost delta display (+₹X.XX)
- ✅ Orange color coding for overrides

## 🧪 How to Test

### Test 1: Normal KYC (No Override)
1. Go to KYC page
2. Click "Start New Verification"
3. Fill customer details
4. Select document types
5. **DO NOT** check "Apply Custom KYC Configuration"
6. Click "Send KYC Link"
7. **Expected:** Session created with cost ₹1.65, no override badge

### Test 2: KYC with Override
1. Go to KYC page
2. Click "Start New Verification"
3. Fill customer details
4. **Check** "Apply Custom KYC Configuration (Override)"
5. Select additional modules:
   - ✅ Aadhaar OTP
   - ✅ Video KYC
6. Fill reason: "Customer requested enhanced verification"
7. Fill notes (optional): "High-risk profile"
8. **Expected Cost:** ₹1.65 + ₹3.50 + ₹15.00 = ₹20.15
9. Click "🔧 Send KYC Link (Override)"
10. **Expected:**
    - Session created with override flag
    - Cost delta: +₹18.50
    - 🔧 Custom badge visible
    - Backend logs override in console

### Test 3: Override Validation
1. Start new verification
2. Check override checkbox
3. Select modules BUT leave reason empty
4. Try to submit
5. **Expected:** Button disabled, cannot submit without reason

### Test 4: Backend Logs
Check terminal for override logs:
```
🔧 Override applied: {
  sessionId: 'xxx',
  addedModules: ['Aadhaar OTP Verification', 'Video KYC'],
  costDelta: '+₹18.50',
  reason: 'Customer requested enhanced verification'
}
```

## 📊 Cost Breakdown

| Module | Cost |
|--------|------|
| Base (DigiLocker + Mobile + Liveness + Document) | ₹1.65 |
| + Aadhaar OTP (Third-party) | +₹3.50 |
| + Video KYC | +₹15.00 |
| + Enhanced Liveness | +₹2.00 |

**Examples:**
- Base only: ₹1.65
- Base + Aadhaar OTP: ₹5.15 (+₹3.50)
- Base + Video KYC: ₹16.65 (+₹15.00)
- Base + All extras: ₹22.15 (+₹20.50)

## 🔍 Verification Checklist

- [ ] Override checkbox works
- [ ] Modules selection works
- [ ] Reason field is mandatory
- [ ] Cost calculation is accurate
- [ ] Badge appears on overridden KYC
- [ ] Cost delta shows correctly
- [ ] Backend logs override
- [ ] API accepts override params
- [ ] Validation prevents submission without reason

## 🎯 Next Steps (Future)

- [ ] Add permission-based override control (only admins)
- [ ] Add approval workflow for high-cost overrides
- [ ] Add bulk operation protection (override disabled)
- [ ] Move from Map to PostgreSQL storage
- [ ] Add override history view
- [ ] Add override statistics dashboard

