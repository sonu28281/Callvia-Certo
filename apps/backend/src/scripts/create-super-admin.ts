/**
 * Script to create a Super Admin (PLATFORM_ADMIN) user
 * This user can manage all tenants and has system-wide access
 * 
 * Usage: npx tsx src/scripts/create-super-admin.ts
 */

import { auth, db, setCustomClaims } from '../config/firebase-admin.config';

const SUPER_ADMIN_EMAIL = 'brijesh@callvia.in';
const SUPER_ADMIN_PASSWORD = 'brijesH#callviA';
const SUPER_ADMIN_NAME = 'Brijesh';

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin...');
    
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
      console.log('⚠️  User already exists with UID:', existingUser.uid);
      
      // Update role to SUPER_ADMIN
      await setCustomClaims(existingUser.uid, {
        role: 'SUPER_ADMIN',
        tenantId: null // Super admin has no specific tenant
      });
      
      // Update Firestore document
      await db.collection('users').doc(existingUser.uid).set({
        userId: existingUser.uid,
        email: SUPER_ADMIN_EMAIL,
        displayName: SUPER_ADMIN_NAME,
        role: 'SUPER_ADMIN',
        tenantId: null,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: null,
        permissions: ['manage_all_tenants', 'system_settings', 'view_all_data']
      }, { merge: true });
      
      console.log('✅ Existing user upgraded to SUPER_ADMIN');
      console.log('📧 Email:', SUPER_ADMIN_EMAIL);
      console.log('🔑 Password: (unchanged)');
      console.log('🎭 Role: SUPER_ADMIN');
      
      return;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create new Firebase user
    const userRecord = await auth.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      displayName: SUPER_ADMIN_NAME,
      emailVerified: true // Auto-verify super admin
    });

    console.log('✅ Firebase user created:', userRecord.uid);

    // Set custom claims
    await setCustomClaims(userRecord.uid, {
      role: 'SUPER_ADMIN',
      tenantId: null
    });

    console.log('✅ Custom claims set');

    // Create Firestore user document
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: SUPER_ADMIN_EMAIL,
      displayName: SUPER_ADMIN_NAME,
      role: 'SUPER_ADMIN',
      tenantId: null,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
      permissions: [
        'manage_all_tenants',
        'create_tenants',
        'delete_tenants',
        'system_settings',
        'view_all_data',
        'manage_users',
        'audit_logs'
      ]
    });

    console.log('✅ Firestore document created');

    console.log('\n🎉 Super Admin created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ', SUPER_ADMIN_EMAIL);
    console.log('🔑 Password: ', SUPER_ADMIN_PASSWORD);
    console.log('🎭 Role:     ', 'PLATFORM_ADMIN (Super Admin)');
    console.log('═══════════════════════════════════════');
    console.log('\n✨ Login at: http://localhost:5174/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
