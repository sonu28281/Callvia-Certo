import { auth, db } from '../src/config/firebase-admin.config';

const TEST_TENANT_EMAIL = 'tenant.admin@testcorp.in';
const TEST_TENANT_ID = 'test_tenant_001';

async function fixTenantUser() {
  try {
    console.log('🔧 Fixing tenant user...\n');
    
    // Get the user
    const userRecord = await auth.getUserByEmail(TEST_TENANT_EMAIL);
    console.log('👤 Found user:', userRecord.uid);
    console.log('📧 Email:', userRecord.email);
    console.log('📝 Current claims:', userRecord.customClaims);
    
    // Set correct custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'TENANT_ADMIN',
      tenantId: TEST_TENANT_ID
    });
    console.log('✅ Custom claims updated to TENANT_ADMIN');
    
    // Update Firestore user document
    await db.collection('users').doc(userRecord.uid).update({
      role: 'TENANT_ADMIN',
      tenantId: TEST_TENANT_ID,
      updatedAt: new Date()
    });
    console.log('✅ Firestore user document updated');
    
    // Verify
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log('\n✨ Updated claims:', updatedUser.customClaims);
    
    console.log('\n🎉 User fixed successfully!');
    console.log('📧 Email: ' + TEST_TENANT_EMAIL);
    console.log('👨‍💼 Role: TENANT_ADMIN');
    console.log('🏢 Tenant ID: ' + TEST_TENANT_ID);
    console.log('\n⚠️  User needs to logout and login again to refresh their session');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTenantUser().then(() => process.exit(0));
