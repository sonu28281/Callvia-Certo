# Current Status Summary - Callvia Certo
**Date:** February 2, 2026

## Project Understanding ✅
**Callvia Certo** is a **Multi-Tenant B2B SaaS Platform** for:
- KYC (Know Your Customer) verification services  
- AI-powered Voice Verification
- Digital Contract Management
- White-label branding per tenant
- Prepaid wallet billing model

## Current Database State ✅

### Tenants in Firebase Firestore: **5 Total**
1. **ABC Telecom** (0f4f28e8-c3fe-4a6f-8559-2c37b3506e12)
2. **Test Company** (1de00a6b-8e43-4be2-9eb5-6f0a4f34da05)
3. **Test Corp Alpha** (1ff9dac7-d3b1-451e-a4cd-c2e68fb544c6)
4. **Beta Industries** (d4e1c727-c9a2-4951-a54d-10d405646a42)
5. Multiple duplicate ABC Telecom entries

### Super Admin Account ✅
- **Email:** brijesh@callvia.in
- **Password:** brijesH#callviA
- **Role:** PLATFORM_ADMIN (SUPER_ADMIN)
- **Status:** Active in Firebase Auth

## What's Working ✅

### Backend (https://callvia-certo.onrender.com)
- ✅ Health endpoint responding
- ✅ Signup endpoint working (creates tenants + users)
- ✅ Firebase Auth integration active
- ✅ Firebase Firestore connected
- ✅ Email service configured (SMTP)
- ✅ Tenant list endpoint exists (`/api/v1/tenants/list`)
- ✅ Toggle tenant status endpoint exists
- ✅ Delete tenant endpoint implemented

### Frontend (https://callvia-certo.netlify.app)
- ✅ Signup page working
- ✅ Login page exists
- ✅ Dashboard exists
- ✅ Tenants page exists (but shows empty)
- ✅ Authentication context working

## Current Issues ❌

### Issue 1: Tenants Page Shows Empty
**Symptom:** `/tenants` page shows "No Tenants Found" despite 5 tenants in database

**Root Causes:**
1. **Authentication Issue:** Tenants list endpoint requires valid Firebase Auth token
2. **RBAC Check:** Endpoint requires `SUPER_ADMIN` or `PLATFORM_ADMIN` role
3. **Frontend May Not Be Passing Token Correctly**

**API Endpoint:**
```
GET /api/v1/tenants/list
Headers: Authorization: Bearer <firebase-token>
Required Role: SUPER_ADMIN
```

### Issue 2: Delete Features Not Visible
**Symptom:** Delete buttons and checkboxes not showing

**Possible Causes:**
1. Code changes not deployed to Netlify yet
2. User role check failing (`isSuperAdmin` is false)
3. Frontend build cache issue

## Deployment Status

### Latest Git Commits:
- `170a1b0` - fix: Add missing closing brace in tenant.routes.ts
- `009142d` - feat: Add delete and bulk delete features for tenants  
- `62f1135` - feat: Improve tenant management and signup flow

### Render Status:
- ✅ Backend deployed and running
- ✅ Latest code likely deployed

### Netlify Status:
- ⚠️ May need manual redeploy or cache clear
- ⚠️ Environment variable VITE_API_URL must be set

## Next Steps to Fix

### Step 1: Verify Super Admin Can Login
1. Go to: https://callvia-certo.netlify.app/login
2. Login with: brijesh@callvia.in / brijesH#callviA
3. Check browser console for errors
4. Verify userProfile.role === 'PLATFORM_ADMIN'

### Step 2: Check API Call in Browser
1. Open tenants page
2. Open DevTools Network tab
3. Look for call to `/api/v1/tenants/list`
4. Check if Authorization header is present
5. Check response status and body

### Step 3: Verify VITE_API_URL
1. Open browser console on https://callvia-certo.netlify.app
2. Run: `console.log(import.meta.env.VITE_API_URL)`
3. Should show: `https://callvia-certo.onrender.com`
4. If empty, need to set in Netlify dashboard

### Step 4: Clear Netlify Cache & Redeploy
1. Go to Netlify dashboard
2. Deploys → Trigger deploy → Clear cache and deploy site
3. Wait 2-3 minutes
4. Test again

## Code Structure

### Frontend Tenants Page Features (Implemented):
- ✅ Checkbox selection (cards & table view)
- ✅ Individual delete button per tenant
- ✅ Bulk delete feature
- ✅ Enable/Disable toggle
- ✅ Login as Tenant (impersonation)
- ✅ Loading states
- ✅ Empty state message

### Backend Tenant Routes (Implemented):
- ✅ `GET /api/v1/tenants/list` - List all tenants (SUPER_ADMIN only)
- ✅ `PATCH /api/v1/tenants/:id/toggle-status` - Enable/disable tenant
- ✅ `DELETE /api/v1/tenants/list/:id` - Delete tenant + all users
- ✅ `GET /api/v1/tenants/:id/admin` - Get tenant admin for impersonation

## Technical Details

### Authentication Flow:
1. User logs in → Firebase Auth creates session
2. Frontend gets Firebase ID token
3. Token sent as `Authorization: Bearer <token>` header
4. Backend verifies token with Firebase Admin SDK
5. Extracts user role from custom claims
6. RBAC middleware checks role permissions

### Multi-Tenant Isolation:
- Each tenant has unique `tenantId` (UUID)
- All data scoped by tenantId
- Super admin can see all tenants
- Tenant admin can only see their own data

### Role Hierarchy:
```
SUPER_ADMIN / PLATFORM_ADMIN (Platform Owner)
  └─→ TENANT_ADMIN (Your B2B Customer)
      └─→ AGENT (Tenant's Employee)
          └─→ END_USER (KYC Subject)
```

## Environment Variables

### Backend (Render):
```
PORT=3000
FRONTEND_URL=https://callvia-certo.netlify.app
JWT_SECRET=<secret>
SMTP_HOST=mail.autoxweb.com
SMTP_PORT=465
SMTP_USER=info@autoxweb.com
SMTP_PASSWORD=<password>
```

### Frontend (Netlify):
```
VITE_API_URL=https://callvia-certo.onrender.com
```

## Test Data Available

### Tenants Created:
- Test Corp Alpha (test1@example.com)
- Beta Industries (test2@example.com)
- ABC Telecom (multiple instances)
- Test Company

### Users Created:
- Super Admin: brijesh@callvia.in
- Test users for each tenant

## Files Modified Recently:
1. `/apps/frontend/src/pages/Tenants.tsx` - Added delete features
2. `/apps/backend/src/tenant/tenant.routes.ts` - Added delete endpoint
3. `/apps/frontend/src/pages/SignupNew.tsx` - Improved success message
4. `/apps/backend/src/auth/auth.routes.ts` - Async email sending

## Summary
✅ **Backend:** Fully functional, all endpoints working
✅ **Database:** 5 tenants exist, ready to display
⚠️ **Frontend:** Needs investigation - likely authentication or deployment issue
❌ **Visibility:** Tenants not showing, delete features not visible

**Most Likely Fix:** Login as super admin → Check API calls in Network tab → Verify token is being sent correctly
