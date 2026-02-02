import { auth, db, setCustomClaims } from '../src/config/firebase-admin.config';

const TEST_TENANT_EMAIL = 'admin@abctelekom.in';
const TEST_TENANT_PASSWORD = 'AbcTelecom@123';
const TEST_TENANT_NAME = 'ABC Admin';
const TEST_TENANT_ID = 'abc_telecom_001';
const TEST_COMPANY_NAME = 'ABC Telecom';

async function createSecondTestTenantUser() {
  try {
    console.log('🚀 Creating second test tenant user...\n');
    
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(TEST_TENANT_EMAIL);
      console.log('⚠️  User already exists:', userRecord.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: TEST_TENANT_EMAIL,
          password: TEST_TENANT_PASSWORD,
          displayName: TEST_TENANT_NAME,
          emailVerified: true
        });
        console.log('✅ Firebase user created:', userRecord.uid);
      } else {
        throw error;
      }
    }

    await setCustomClaims(userRecord.uid, {
      role: 'TENANT_ADMIN',
      tenantId: TEST_TENANT_ID
    });
    console.log('✅ Custom claims set');

    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: TEST_TENANT_EMAIL,
      displayName: TEST_TENANT_NAME,
      role: 'TENANT_ADMIN',
      tenantId: TEST_TENANT_ID,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
    }, { merge: true });
    console.log('✅ User document created');

    await db.collection('tenants').doc(TEST_TENANT_ID).set({
      tenantId: TEST_TENANT_ID,
      companyName: TEST_COMPANY_NAME,
      companyEmail: TEST_TENANT_EMAIL,
      isActive: true,
      status: 'enabled',
      kycConfig: {
        methods: ['digilocker', 'liveness', 'aadhaar_otp'],
        allowOverrides: true
      },
      wallet: { balance: 10000, currency: 'INR' },
      createdAt: new Date(),
    }, { merge: true });
    console.log('✅ Tenant document created');

    console.log('\n' + '═'.repeat(50));
    console.log('✨ SECOND TEST TENANT CREATED!\n');
    console.log('📧 Email:    ' + TEST_TENANT_EMAIL);
    console.log('🔑 Password: ' + TEST_TENANT_PASSWORD);
    console.log('🏢 Company:  ' + TEST_COMPANY_NAME);
    console.log('👨‍💼 Role:     TENANT_ADMIN\n');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSecondTestTenantUser().then(() => process.exit(0));
