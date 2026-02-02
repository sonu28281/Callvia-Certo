import { auth, db } from '../config/firebase-admin.config';

const emails = ['sonu28281@gmail.com', 'purnimabrh@gmail.com'];

async function checkUsers() {
  console.log('🔍 Checking for users in Firebase...\n');
  
  for (const email of emails) {
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log('✅ Found in Firebase Auth:', email);
      console.log('   User ID:', userRecord.uid);
      console.log('   Created:', userRecord.metadata.creationTime);
      console.log('   Display Name:', userRecord.displayName);
      
      // Check Firestore users collection
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('   📄 Firestore User Doc:');
        console.log('      Tenant ID:', userData?.tenantId);
        console.log('      Role:', userData?.role);
        console.log('      Active:', userData?.isActive);
        
        // Check tenant document
        if (userData?.tenantId) {
          const tenantDoc = await db.collection('tenants').doc(userData.tenantId).get();
          if (tenantDoc.exists) {
            const tenantData = tenantDoc.data();
            console.log('   🏢 Tenant Doc:');
            console.log('      Company:', tenantData?.companyName);
            console.log('      Status:', tenantData?.status);
          }
        }
      } else {
        console.log('   ⚠️ No Firestore user doc found');
      }
      console.log('');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Not found in Firebase Auth:', email);
      } else {
        console.log('❌ Error checking', email, ':', error.message);
      }
      console.log('');
    }
  }
}

checkUsers()
  .then(() => {
    console.log('✅ Check complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
