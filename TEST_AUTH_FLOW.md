# Testing Auth Flow - Step by Step

## ✅ What's Been Fixed
- Auth middleware now verifies real Firebase tokens (not mocked)
- Backend deployed to Render with logging enabled
- Super admin role set to SUPER_ADMIN in Firebase

## 🧪 Test Steps

### Step 1: Logout Completely
```bash
# In browser at https://callvia-certo.netlify.app
1. Click Logout
2. Wait for redirect to login page
3. Clear browser cache (Ctrl+Shift+Delete)
   - Select "Cookies and other site data"
   - Select timeframe: "All time"
   - Click "Clear data"
```

### Step 2: Login Again
```
Email: brijesh@callvia.in
Password: brijesH#callviA
```

This gets a FRESH Firebase token with updated custom claims:
```json
{
  "uid": "Yw8qMnTZAvOFvfqzwGcQCE4mtzW2",
  "email": "brijesh@callvia.in",
  "role": "SUPER_ADMIN",
  "tenantId": null
}
```

### Step 3: Check Browser Console
Open DevTools (F12) → Console tab

Look for:
```
✅ Token verified successfully {
  user_id: "Yw8qMnTZAvOFvfqzwGcQCE4mtzW2",
  role: "SUPER_ADMIN",
  email: "brijesh@callvia.in"
}
```

### Step 4: Navigate to /tenants Page
```
https://callvia-certo.netlify.app/tenants
```

### Step 5: Check Results

**Expected Behavior** ✅:
```
- Page loads
- No 403 error
- Tenant list displays with all tenants
- Can see delete buttons
- Can download reports
```

**If Still Getting 403** ❌:
Check the Render backend logs at:
```
https://dashboard.render.com/services/callvia-certo
  → Logs tab
```

Look for error messages:
```
❌ Token verification failed: ...
❌ RBAC DENIED: ...
```

### Step 6: If Token Verification Fails

The issue might be:
1. **Token claims not updated** → Run create-super-admin again
2. **Old token in browser** → Clear cache + logout/login
3. **Render not deployed** → Check deployment status
4. **Firebase config issue** → Check environment variables

---

## 🔧 Manual Testing (If Needed)

### Get Your Token from Browser Console
```javascript
// In browser console while logged in:
auth.currentUser.getIdToken().then(token => {
  console.log("Your token:");
  console.log(token);
  console.log("\nCopy this and use in curl:");
  console.log(`curl -H "Authorization: Bearer ${token}" https://callvia-certo.onrender.com/api/v1/tenants/list`);
});
```

### Test with Curl
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
  https://callvia-certo.onrender.com/api/v1/tenants/list \
  -w "\n\nStatus: %{http_code}\n"
```

Expected response (200):
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "tenant1",
        "companyName": "Test Corp",
        "status": "enabled",
        ...
      }
    ],
    "total": 5
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-02-02T..."
  }
}
```

---

## 📊 If Still 403 - Debugging Steps

### Check Render Logs for Auth Errors
```bash
# SSH into Render and check logs (if needed)
# Or visit: https://dashboard.render.com → Logs
```

Look for these patterns:
```
✅ Token verified successfully → Good
❌ Token verification failed → Firebase config issue
❌ RBAC DENIED → Role not matching
🔐 RBAC Check → Shows what role was received
```

### Verify Firebase Custom Claims
```bash
cd apps/backend
npx tsx src/scripts/create-super-admin.ts
```

Look for:
```
✅ Custom claims set for user: Yw8qMnTZAvOFvfqzwGcQCE4mtzW2
✅ Existing user upgraded to SUPER_ADMIN
```

### Force Clear Cloud Sessions
```bash
# In Firebase Console:
# 1. Go to Authentication
# 2. Find brijesh@callvia.in
# 3. Click "Delete user"
# 4. Re-create via create-super-admin script
```

---

## ✅ Success Checklist

- [ ] Render deployment complete (green status)
- [ ] Logged out completely
- [ ] Logged back in with fresh credentials
- [ ] Browser cache cleared
- [ ] Navigate to /tenants page
- [ ] Tenant list displays (no 403 error)
- [ ] Can see all 5 tenants
- [ ] Can click delete buttons

---

## 🚀 Next Steps After Success

Once 403 is fixed:

1. **Start Building Tenant Dashboard**
   - Create React components from design doc
   - Add Dashboard layout
   - Add Service Cards grid
   - Connect to backend APIs

2. **Implement Verification Flows**
   - Aadhaar verification wizard
   - PAN verification
   - Bank account verification

3. **Add Settings Page**
   - API keys display
   - Webhook configuration
   - Team management

