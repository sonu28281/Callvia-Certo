# Firebase Integration - Complete Implementation Guide

## 🔥 Step 1: Firebase Console Setup

### 1.1 Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click on **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file as `serviceAccountKey.json`

### 1.2 Get Web App Config

1. In Project Settings
2. Click **Add app** → **Web** (</> icon)
3. Register app name: "Callvia Certo Web"
4. Copy the config object

---

## 🔑 Step 2: Environment Variables

### Backend `.env` (add these)
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Or use service account file path
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Frontend `.env` (add these)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 📝 Step 3: Implementation Checklist

### Backend Tasks
- [ ] Create Firebase Admin service (`firebase-admin.service.ts`)
- [ ] Update auth middleware to verify Firebase tokens
- [ ] Create user management endpoints
- [ ] Integrate Firestore with existing services
- [ ] Add custom claims for roles

### Frontend Tasks
- [ ] Create Firebase client config (`firebase.ts`)
- [ ] Build Login page with email/password
- [ ] Build Signup page with role selection
- [ ] Add Firebase Auth context provider
- [ ] Update protected routes
- [ ] Add logout functionality

---

## 🔐 Authentication Flow

### Signup Flow
```
User fills form → Firebase Auth createUser → 
→ Add user to Firestore users collection → 
→ Set custom claims (role, tenantId) → 
→ Login automatically
```

### Login Flow
```
User enters credentials → Firebase signInWithEmailAndPassword → 
→ Get ID token → Send to backend → 
→ Backend verifies token → Return user data + session
```

### Protected Route Flow
```
Check if user logged in → Get ID token → 
→ Add token to API headers → Backend verifies → 
→ Allow/Deny access
```

---

## 📊 Next Steps

1. **Add Firebase credentials to `.env` files**
2. **Run the implementation commands below**
3. **Test signup with a new user**
4. **Test login with created user**
5. **Verify Firestore data is created**

---

Credentials add karne ke baad batana, main complete code implement kar dunga! 🚀
