import admin from 'firebase-admin';

// Firebase Admin SDK credentials
const serviceAccount = {
  type: "service_account",
  project_id: "callvia-certo",
  private_key_id: "17b4b53d2e3ba0e71c93f4f1b0597ff53ec52a27",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkFrImCOiD0OSP\n/9G9An7VhS4b4gkccekXPLXxmF8z9H8SJmWPufMIBqU1EH8PlUAlWoo5Vm0iOjcJ\nqoFU/xoDjlWZA9o3XfY6U5I9jA/E1XaXpNwvbA/gopAfjt8+h6rWqoOWD24LLnMU\nYMQoINVc9ev0TyBOZ5wkgDsU7VRaorAQLQp6zP0x2n/pVtNKgfvF+0IAFlsiX2Dz\nd/iGa30Hw+1boPSL7fCjahLHsQ7UWlx7o5j3FDP7Tw0TubP7u5IkyvYXNLg9XjQg\nz+bv/LMfo+IUptdx07tifvWpnKgI3s/uJxJCrcUg856aBNAvcrTL29Xg2RPI40vC\nkFm3dvh1AgMBAAECggEAA67aus3SYjsLFkxYqdRngmVl3oxZRgEsiS/8qXqREHp5\na6/e8bXrxY9Yn/NJ1tCzyuLYXWcaNf12hMoF8yFytQe51iBnAn0ibLa5fpYpOHLO\nIaM6qfnT9WfQslSjoCStafoT0Adyod+eB6QQYxIxl8+RRz+LaxcaQxt5uAOHtC0P\nZP3oSsb2lLCQy0Ryg6PDTy4ud/T7vEhXZfSWXGCYl8++I4DhC59wx3ZKYHdqXFZz\nktXnRrPZJYjqH0S7qt/0lwD6hEV7FB0VQuuajzXmZEqG5nQ5uRadhvPe0Z8duCFk\n3kdiij04lpj/l4KfDrezRGgaz/Ldmrcz+D/lqqchlQKBgQDi8McmuqpO1gj4uYXT\nF/6N/ktDfYaI43AlPHUTrnNcDJUXjJKhClgObpqS42UIEejuXBMKDBVBWt2I9mOX\nsvbN88rz8N6HIUwBFOHGWCYGVWTG2jmhsfPe/DUupymokhQAvAd2UQqAtZQbNfef\n5VcFA0/Pa9aF9z/ai3LuPy/m6wKBgQC5GZo5QTjlEJyJ04mvmw7WNWpxWLc0s4Wm\n3dKh2QVcQUJV2l1qN4mhqFrtOchQl310Khj6tj4luarVAd1YC5NCuB+XbNHd/kib\nHeD90bYGux60B++HUMibj6NxeX94Blkqyw2Kmy+RBlU2YWdpfJ6PkamSiv50e7NV\ndy59TKGGHwKBgHRDVFPUF8IxxwDd0uCVj1ThbV+TJGRm2KJK+dPucK08yPj6jHgy\nW3BxW4FbO/xJaKMMyrg//nev/ITZbaZfCi/y8QvOX8Ks3UpEj3JU4I4oG2wAirv6\n9exMG1beTupMhDDoI46K8C2GWO0j1cu168Hms3GZVprlU3I8NNI3zuunAoGBALVs\nNbBGkChcVsH0V7CJ70nfgxvjk3YROz9pjejamJlq0UTqycKw+rI7HBwGFaOASBNS\nq7cYZuN9DsbGlBeXCNhNNZGqtCy87pcy+vJs2NfSEe7tFEXx1R479DvllR2kQ0Nh\nUD15i26+4UhywfQvlA4t/CHJIEw1bnmnXiartGmLAoGAdNZvTKCTKvWj0ghHR/Qg\neaDhBuTyiyRe+ns6s4xlmjCr49CSpCd4Hawg8PwisBfu1qz5LrN/XBT4nmjlCpm9\nzxWk8Xy/BDsJFXn/ei0VJKR4nsB9QkX2ew498I8aqhw8qFERAxEcn/uA/Q9la0r7\nKGKLNtOct1ERrJtF+G2r2wE=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@callvia-certo.iam.gserviceaccount.com",
  client_id: "116818418755812060257",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40callvia-certo.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'callvia-certo'
  });
  console.log('🔥 Firebase Admin initialized successfully');
}

export const auth: admin.auth.Auth = admin.auth();
export const db: admin.firestore.Firestore = admin.firestore();

// Helper functions
export const verifyIdToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid authentication token');
  }
};

export const setCustomClaims = async (uid: string, claims: object) => {
  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
};

export default admin;
