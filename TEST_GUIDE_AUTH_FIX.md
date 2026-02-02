# Test Guide - Authentication & Tenants Issues

## Issues Fixed

1. ✅ **Token Refresh**: Now forces refresh to get updated custom claims after login
2. ✅ **Debug Logging**: Console shows what role is being received from Firebase token
3. ✅ **Role-Based Routing**: TENANT_ADMIN users now redirected to tenant dashboard (not admin dashboard)

---

## 🧪 How to Test

### Step 1: Clear Everything
```
1. Open https://callvia-certo.netlify.app
2. Open DevTools: F12 → Console tab
3. Clear cookies/cache:
   - Settings → Cookies and site data → Clear all
   - Or Shift+Ctrl+Delete
4. Close and reopen the browser tab
```

### Step 2: Test Tenant Login

**Login Credentials:**
- Email: `tenant.admin@testcorp.in`
- Password: `TestCorp@123`

**Expected behavior:**
1. Click "Sign In"
2. Check console logs for:
   ```
   👤 Login successful: {
     email: "tenant.admin@testcorp.in",
     role: "TENANT_ADMIN",
     tenantId: "test_tenant_001",
     ...
   }
   ```
3. After a moment, should automatically redirect to **Tenant Dashboard** (not admin dashboard)
4. You should see the sidebar with menu items:
   - Dashboard
   - Verifications
   - Reports
   - Audit Logs
   - Team
   - Settings

---

### Step 3: Verify User Profile

In console, check:
```javascript
// Type in console:
console.log(JSON.stringify({...window.__AUTH__?.userProfile}, null, 2))

// Or look for this log:
👤 User profile from claims: {
  role: "TENANT_ADMIN",
  tenantId: "test_tenant_001",
  ...
}
```

---

### Step 4: Test Super Admin Login

**Super Admin Credentials:**
- Email: `brijesh@callvia.in`
- Password: `brijesH#callviA`

**Expected behavior:**
1. Click "Sign In"
2. Should go to Dashboard (admin dashboard)
3. Check console for:
   ```
   👤 Login successful: {
     email: "brijesh@callvia.in",
     role: "SUPER_ADMIN",
     tenantId: null,
     ...
   }
   ```
4. Can click on `/tenants` page to see tenant list
5. Should see all tenants (including "Test Corp Alpha")

---

### Step 5: Test Tenant Impersonation

As Super Admin:
1. Go to `/tenants` page
2. Look for "Test Corp Alpha" card
3. Click "Login" button
4. Should redirect to `/tenant-impersonation`
5. Should show "Viewing as Test Corp Alpha" 
6. Sidebar with tenant management options

---

## 🔍 Troubleshooting

### Problem: Still see admin dashboard after tenant login
**Cause**: Custom claims not being loaded properly  
**Solution**:
1. Check console for role value
2. If role is `TENANT_ADMIN` → routing should work (check browser console errors)
3. If role is `undefined` → custom claims not in token
   - Go to Firebase Console
   - Check the user's custom claims are set correctly

### Problem: No tenants showing on admin page
**Cause**: Role might be wrong or API call failing  
**Solution**:
1. Make sure you're logged in as SUPER_ADMIN
2. Check console for:
   - `👤 Current user on Tenants page: {role: "SUPER_ADMIN", isSuperAdmin: true}`
   - Any network errors in Network tab
3. Check backend logs (if accessible)

### Problem: Getting 403 errors
**Cause**: Backend RBAC rejecting the request  
**Solution**:
1. Check token has correct custom claims
2. Check middleware is setting role correctly
3. Look at backend logs for RBAC rejection details

---

## 📋 What's Changed

### Frontend Changes
1. **AuthContext.tsx**
   - Added `forceRefresh: true` when getting token
   - Added console logging of custom claims
   - Logs now show all claims in token

2. **Dashboard.tsx**
   - Added role check
   - TENANT_ADMIN users redirected to `/tenant-dashboard`
   - Added debug logging

3. **Tenants.tsx**
   - Added console log to show current user role
   - Helps debug why no tenants are showing

### Backend (No Changes Yet)
- Auth middleware already extracting role from token correctly
- Just needed frontend fixes

---

## 📊 Expected Console Output

### For Tenant Login:
```
👤 Login successful: {
  email: "tenant.admin@testcorp.in",
  role: "TENANT_ADMIN",
  tenantId: "test_tenant_001",
  allClaims: {
    role: "TENANT_ADMIN",
    tenantId: "test_tenant_001",
    iss: "https://securetoken.google.com/callvia-certo",
    ...
  }
}

👤 User profile from claims: {
  uid: "test_tenant_user_001",
  email: "tenant.admin@testcorp.in",
  role: "TENANT_ADMIN",
  tenantId: "test_tenant_001",
  ...
}

🔄 Redirecting TENANT_ADMIN to tenant dashboard
```

### For Super Admin Login:
```
👤 Login successful: {
  email: "brijesh@callvia.in",
  role: "SUPER_ADMIN",
  tenantId: null,
  ...
}

👤 Current user on Tenants page: {
  role: "SUPER_ADMIN",
  isSuperAdmin: true,
  ...
}
```

---

## ✅ Success Criteria

- [ ] Tenant login → redirects to tenant dashboard (not admin)
- [ ] Super admin login → goes to admin dashboard
- [ ] Super admin can see tenants on `/tenants` page
- [ ] Super admin can click "Login" on tenant card
- [ ] Impersonation dashboard shows with tenant's data
- [ ] Console shows correct role for each user
- [ ] No 403 errors

---

## Next Steps After Testing

Once all above tests pass:

1. **Backend API Integration**
   - Connect real tenant data from Firestore
   - Add actual API endpoints for dashboard stats

2. **Error Handling**
   - Better error messages
   - Handle missing custom claims gracefully

3. **Performance**
   - Code splitting for large bundle
   - Lazy loading of routes

---

**Last Updated**: 2026-02-02  
**Status**: ✅ Ready for testing
