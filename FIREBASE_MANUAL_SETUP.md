/**
 * Manual test - add these Firebase documents directly
 */

// Use the Firebase Console UI to manually add:

// 1. CREATE FIREBASE AUTH USER:
// Go to: https://console.firebase.google.com/project/callvia-certo/authentication/users
// Click "Create User"
// Email: tenant.admin@testcorp.in
// Password: TestCorp@123
// Enabled: checked
// Click "Create user"
// Get the UID from the list

// 2. SET CUSTOM CLAIMS:
// Go to: https://console.firebase.google.com/project/callvia-certo/firestore/data
// Open "Custom claims" editor for the user (or use Firebase CLI)
// Add:
// {
//   "role": "TENANT_ADMIN",
//   "tenantId": "test_tenant_001"
// }

// 3. CREATE FIRESTORE DOCUMENTS:

// Document 1: users/{userId}
// Collection: users
// Document ID: [use the UID from step 1]
// Fields:
{
  "userId": "YOUR_UID_HERE",
  "email": "tenant.admin@testcorp.in",
  "displayName": "Test Admin",
  "role": "TENANT_ADMIN",
  "tenantId": "test_tenant_001",
  "isActive": true,
  "isEmailVerified": true,
  "createdAt": new Date()
}

// Document 2: tenants/test_tenant_001
// Collection: tenants
// Document ID: test_tenant_001
// Fields:
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
  "createdAt": new Date()
}
