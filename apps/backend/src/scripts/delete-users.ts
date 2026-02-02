import { auth, db } from '../config/firebase-admin.config';

const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.log('❌ Please provide email addresses to delete');
  console.log('Usage: npx tsx src/scripts/delete-users.ts email1@example.com email2@example.com');
  process.exit(1);
}

async function deleteUsers() {
  console.log(`🗑️  Deleting ${emails.length} user(s)...\n`);
  
  for (const email of emails) {
    try {
      // Get user from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      const uid = userRecord.uid;
      
      console.log(`📧 Processing: ${email}`);
      console.log(`   User ID: ${uid}`);
      
      // Get user's tenant ID
      const userDoc = await db.collection('users').doc(uid).get();
      let tenantId = null;
      
      if (userDoc.exists) {
        tenantId = userDoc.data()?.tenantId;
        
        // Delete user document from Firestore
        await db.collection('users').doc(uid).delete();
        console.log(`   ✅ Deleted Firestore user doc`);
      }
      
      // Delete tenant document if exists and user was admin
      if (tenantId) {
        const tenantDoc = await db.collection('tenants').doc(tenantId).get();
        if (tenantDoc.exists) {
          await db.collection('tenants').doc(tenantId).delete();
          console.log(`   ✅ Deleted tenant doc (${tenantId})`);
        }
      }
      
      // Delete from Firebase Auth
      await auth.deleteUser(uid);
      console.log(`   ✅ Deleted from Firebase Auth`);
      console.log(`   ✅ ${email} completely deleted!\n`);
      
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`   ⚠️  User not found: ${email}\n`);
      } else {
        console.log(`   ❌ Error deleting ${email}:`, error.message, '\n');
      }
    }
  }
}

deleteUsers()
  .then(() => {
    console.log('✅ Delete operation complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
