# Super Admin Setup Guide

## ⚠️ Firebase Authentication Setup Required

Firebase Console mein authentication enable karna padega pehle!

### Step 1: Enable Firebase Authentication

1. Open: https://console.firebase.google.com/project/callvia-certo/authentication
2. Click **"Get Started"** button
3. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle ON
   - Save

### Step 2: Run Super Admin Creation Script

Backend directory se script run karo:

```bash
cd /workspaces/Callvia-Certo/apps/backend
node --import tsx src/scripts/create-super-admin.ts
```

**Output:**
```
✅ Firebase user created: abc123xyz
✅ Custom claims set
✅ Firestore document created

🎉 Super Admin created successfully!

═══════════════════════════════════════
📧 Email:     admin@callvia.com
🔑 Password:  Admin@123456
🎭 Role:      PLATFORM_ADMIN (Super Admin)
═══════════════════════════════════════

✨ Login at: http://localhost:5174/login
```

## Super Admin Credentials

**After Firebase Auth is enabled:**

```
Email:    admin@callvia.com
Password: Admin@123456
Role:     PLATFORM_ADMIN (Super Admin)
```

## Alternative: Manual Creation via Firebase Console

### Option A: Firebase Console

1. Go to: https://console.firebase.google.com/project/callvia-certo/authentication/users
2. Click "Add User"
3. Enter:
   - Email: `admin@callvia.com`
   - Password: `Admin@123456`
4. Click "Add User"

### Option B: Then Add Firestore Document

Firebase Console → Firestore → Create document:

**Collection:** `users`  
**Document ID:** (Copy Firebase Auth UID)

**Fields:**
```json
{
  "userId": "FIREBASE_AUTH_UID",
  "email": "admin@callvia.com",
  "displayName": "Platform Admin",
  "role": "PLATFORM_ADMIN",
  "tenantId": null,
  "isActive": true,
  "createdAt": "2026-02-01T00:00:00Z",
  "lastLoginAt": null,
  "permissions": ["manage_all_tenants", "system_settings", "view_all_data"]
}
```

## Role Comparison

| Feature | PLATFORM_ADMIN | TENANT_ADMIN | TENANT_USER |
|---------|---------------|--------------|-------------|
| Manage All Tenants | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| View All Data | ✅ | ❌ | ❌ |
| Manage Own Tenant | ✅ | ✅ | ❌ |
| KYC Config | ✅ | ✅ | ❌ |
| Run KYC | ✅ | ✅ | ✅ |
| View Audit Logs | ✅ | Own Only | Own Only |

## Quick Start

1. **Enable Firebase Auth** (⚠️ REQUIRED FIRST)
2. Run script or manually create user
3. Login at http://localhost:5174/login
4. Change password after first login!

---

**Status:** Waiting for Firebase Authentication to be enabled in Console
