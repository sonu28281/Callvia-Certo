# Tenant Test Credentials 🧪

## ⚠️ IMPORTANT: Create User in Firebase First!

Before testing, you need to create this user in Firebase:

### 🔧 Setup Steps:

1. **Go to Firebase Console**:
   - URL: https://console.firebase.google.com/project/callvia-certo/authentication/users
   - Click **"Create User"** button

2. **Fill in these details**:
   - Email: `tenant.admin@testcorp.in`
   - Password: `TestCorp@123`
   - Check "Enable this user" checkbox
   - Click **"Create user"**

3. **Get the UID**:
   - Copy the User UID from the list (you'll need this)

4. **Set Custom Claims** (using Firebase CLI):
   ```bash
   firebase auth:modify UUID --custom-claims '{"role":"TENANT_ADMIN","tenantId":"test_tenant_001"}' --project callvia-certo
   ```
   Replace `UUID` with the actual user ID

5. **Create Firestore Documents**:
   - Go to: https://console.firebase.google.com/project/callvia-certo/firestore/data
   - Click **"Start collection"**
   - Collection ID: `users`
   - Document ID: paste the UUID from step 3
   - Add these fields:
     ```json
     {
       "userId": "YOUR_UUID",
       "email": "tenant.admin@testcorp.in",
       "displayName": "Test Admin",
       "role": "TENANT_ADMIN",
       "tenantId": "test_tenant_001",
       "isActive": true,
       "isEmailVerified": true,
       "createdAt": timestamp
     }
     ```

6. **Create Tenant Collection**:
   - Click **"Add collection"** → `tenants`
   - Document ID: `test_tenant_001`
   - Add these fields:
     ```json
     {
       "tenantId": "test_tenant_001",
       "companyName": "Test Corp Alpha",
       "companyEmail": "tenant.admin@testcorp.in",
       "isActive": true,
       "status": "enabled",
       "kycConfig": {
         "methods": ["digilocker", "liveness", "aadhaar_otp"],
         "allowOverrides": true
       },
       "wallet": {
         "balance": 5000,
         "currency": "INR"
       },
       "createdAt": timestamp
     }
     ```

---

## Test Tenant User

Once created in Firebase, use these credentials to login:

### 📧 Login Details

```
Email:    tenant.admin@testcorp.in
Password: TestCorp@123
```

### 📊 Tenant Information

```
Company Name: Test Corp Alpha
Tenant ID:    test_tenant_001
Role:         TENANT_ADMIN
```

---

## 🌐 Where to Login

**Frontend URL**: https://callvia-certo.netlify.app/login

### Step-by-Step Login Instructions:

1. Open: https://callvia-certo.netlify.app/login
2. Enter email: `tenant.admin@testcorp.in`
3. Enter password: `TestCorp@123`
4. Click "Sign In"
5. You will be redirected to the tenant dashboard

---

## ✨ What You'll See

After login, you'll see the **Tenant Dashboard** with:

- ✅ Dashboard page with statistics
- ✅ Verifications list 
- ✅ Reports and analytics
- ✅ Audit logs
- ✅ Team members management
- ✅ Settings (API keys, webhooks, billing)

### If You're a Super Admin:

You can also login as **super admin** at `/tenants` page and then:
1. Go to Tenants list
2. Click "Login" button on any tenant
3. See that tenant's dashboard with impersonation

---

## 🔗 Quick Links

| Page | URL |
|------|-----|
| Login | https://callvia-certo.netlify.app/login |
| Tenant Dashboard (after login) | https://callvia-certo.netlify.app/dashboard |
| Tenants List (Super Admin) | https://callvia-certo.netlify.app/tenants |

---

## 💡 Test Scenarios

### Scenario 1: Login as Tenant
1. Use above credentials
2. See tenant's own dashboard
3. View verifications, reports, team
4. Not see other tenants' data (isolated)

### Scenario 2: Impersonate as Super Admin
1. First, verify you have super admin access
2. Go to `/tenants` page
3. Look for tenant card "Test Corp Alpha"
4. Click "Login" button
5. Should see impersonation dashboard
6. Click "Exit Impersonation" to go back

### Scenario 3: Navigate Dashboard Pages
1. After login, click sidebar menu items:
   - Dashboard → See stats
   - Verifications → See KYC list
   - Reports → See analytics
   - Audit Logs → See compliance trail
   - Team → See team members
   - Settings → See API keys, webhooks

---

## 🚀 Next Steps

After testing, you might want to:

1. **Create additional test tenants** using the backend script
2. **Add team members** to the test tenant
3. **Test KYC flows** with the tenant's configured methods
4. **Check audit logs** to see all activities
5. **Manage API keys** in the settings page

---

## 🆘 Troubleshooting

### Issue: Login fails with "Invalid email/password"

**Solution**: 
- Make sure you're using exactly: `tenant.admin@testcorp.in`
- Password is case-sensitive: `TestCorp@123`
- Check if caps lock is on

### Issue: Get redirected to login after login attempt

**Solution**:
- Check browser console (F12) for error messages
- Look for any network errors in Network tab
- Backend might not be running - check if `https://callvia-certo.onrender.com` is accessible
- Clear browser cookies and try again

### Issue: Can't see tenant impersonation option

**Solution**:
- Make sure you're logged in as super admin first
- Go to `/tenants` page (NOT `/tenant-dashboard`)
- Should see list of tenants with "Login" buttons
- Click the "Login" button on a tenant card

---

## 📝 Notes

- The test tenant is pre-configured with KYC methods: Digilocker, Liveness, Aadhaar OTP
- Wallet balance: ₹5,000 INR (mock)
- All dashboard data is currently mock data (for testing UI/UX)
- Real backend integration coming soon

---

**Status**: ✅ Ready for testing!
