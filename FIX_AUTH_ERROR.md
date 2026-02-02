# Fix Firebase "auth/invalid-credential" Error

## Problem
You're getting `Firebase: Error (auth/invalid-credential)` when trying to login.

## Root Cause
The test tenant user doesn't exist in Firebase yet. You need to create it manually.

---

## Solution: Create User in Firebase Console

### Step 1: Create Firebase Auth User

1. Go to: https://console.firebase.google.com/project/callvia-certo/authentication/users
2. Click the **"Create user"** button (top right)
3. Fill in:
   - **Email**: `tenant.admin@testcorp.in`
   - **Password**: `TestCorp@123`
   - **Confirm Password**: `TestCorp@123`
4. Make sure **"Enable this user"** is checked
5. Click **"Create user"** button

**You'll see the new user in the list. Copy the User UID.**

---

### Step 2: Set Custom Claims

You can set custom claims in two ways:

#### Option A: Using Firebase CLI (Recommended)
```bash
firebase auth:modify YOUR_USER_UID \
  --custom-claims '{"role":"TENANT_ADMIN","tenantId":"test_tenant_001"}' \
  --project callvia-certo
```

Replace `YOUR_USER_UID` with the UID you copied from step 1.

#### Option B: Using Firebase Console Admin SDK (in backend)
Run this command in the backend:
```bash
cd apps/backend
npm run create-super-admin
# Then manually modify for TENANT_ADMIN
```

---

### Step 3: Create Firestore User Document

1. Go to: https://console.firebase.google.com/project/callvia-certo/firestore/data
2. Look for the **"users"** collection (create it if doesn't exist)
3. Click **"Add document"**
4. Set **Document ID** to: your UUID from Step 1
5. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| userId | string | your UUID |
| email | string | tenant.admin@testcorp.in |
| displayName | string | Test Admin |
| role | string | TENANT_ADMIN |
| tenantId | string | test_tenant_001 |
| isActive | boolean | true |
| isEmailVerified | boolean | true |
| createdAt | timestamp | (now) |

6. Click **"Save"**

---

### Step 4: Create Firestore Tenant Document

1. Look for the **"tenants"** collection in Firestore
2. Click **"Add document"**
3. Set **Document ID** to: `test_tenant_001`
4. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| tenantId | string | test_tenant_001 |
| companyName | string | Test Corp Alpha |
| companyEmail | string | tenant.admin@testcorp.in |
| isActive | boolean | true |
| status | string | enabled |
| kycConfig | map | *(see below)* |
| wallet | map | *(see below)* |
| createdAt | timestamp | (now) |

**For kycConfig** (map):
```
methods: [array] = ["digilocker", "liveness", "aadhaar_otp"]
allowOverrides: boolean = true
```

**For wallet** (map):
```
balance: number = 5000
currency: string = "INR"
```

5. Click **"Save"**

---

## Now Try Login!

1. Go to: https://callvia-certo.netlify.app/login
2. Enter:
   - **Email**: `tenant.admin@testcorp.in`
   - **Password**: `TestCorp@123`
3. Click **"Sign In"**

You should now see the **Tenant Dashboard** ✅

---

## What You'll See After Login

✅ Dashboard with statistics  
✅ Verifications list  
✅ Reports and analytics  
✅ Audit logs  
✅ Team members  
✅ Settings (API keys, webhooks, billing)

---

## Testing Impersonation (For Super Admin)

After login as tenant, logout and login as super admin:
- **Email**: `brijesh@callvia.in`
- **Password**: `brijesH#callviA`

Then:
1. Go to `/tenants` page
2. Find "Test Corp Alpha" card
3. Click "Login" button
4. See the tenant's dashboard from admin perspective

---

## Troubleshooting

### Still getting "auth/invalid-credential"?

**Check**:
1. User exists in Firebase Auth (check the list)
2. Email is exactly: `tenant.admin@testcorp.in` (case-sensitive)
3. Password is exactly: `TestCorp@123`
4. User is "Enabled" in Firebase
5. Custom claims are set correctly
6. Firestore documents are created

### Tenant dashboard doesn't show data?

The dashboard is using mock data right now, so you'll see sample data regardless.

### Backend errors?

Check that:
1. Backend is running: https://callvia-certo.onrender.com/api/v1/health
2. Firebase Admin SDK is configured
3. No RBAC errors in console logs

---

## Firebase Console Links

- **Authentication**: https://console.firebase.google.com/project/callvia-certo/authentication/users
- **Firestore**: https://console.firebase.google.com/project/callvia-certo/firestore/data
- **Settings**: https://console.firebase.google.com/project/callvia-certo/settings/general

---

**Status**: 🔧 Follow above steps to fix the error!
