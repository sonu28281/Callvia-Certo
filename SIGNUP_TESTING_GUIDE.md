# 🚀 Signup Testing Guide - Netlify Frontend

## Frontend URL
**Live Frontend**: https://callvia-certo.netlify.app/

---

## ✅ Signup Fixed - What Changed?

### 1. **CORS Configuration**
Backend now allows requests from:
- ✅ `https://callvia-certo.netlify.app` (Netlify production)
- ✅ `http://localhost:5173` (Local development)
- ✅ `http://localhost:5174` (Local preview)

### 2. **Email Configuration**
- ✅ Temporary password automatically generated (8 characters)
- ✅ Welcome email sent with login credentials
- ✅ Email includes direct login link to Netlify frontend
- ✅ FRONTEND_URL updated to `https://callvia-certo.netlify.app`

### 3. **Code Quality**
- ✅ Used new error handling utilities (`asyncHandler`)
- ✅ Added validation (`validateRequired`, `validateEmail`)
- ✅ Consistent response format (`sendSuccess`)
- ✅ Better error messages

---

## 📧 Signup Flow

### Step 1: User Signs Up
**URL**: https://callvia-certo.netlify.app/signup

**Fields**:
- Company Name: `Test Company`
- Your Name: `John Doe`
- Email: `your-email@example.com`
- KYC Package: `Standard` (or other option)

### Step 2: Backend Creates Account
1. ✅ Validates input (email format, required fields)
2. ✅ Generates 8-character temp password (e.g., `aBc4eF7h`)
3. ✅ Creates Firebase Auth user
4. ✅ Creates Firestore documents (user + tenant)
5. ✅ Sets custom claims (role: TENANT_ADMIN)
6. ✅ Configures KYC package based on selection

### Step 3: Email Sent
**Subject**: 🎉 Welcome to Callvia Certo - Your Account Credentials

**Email Contains**:
- ✅ Personalized greeting
- ✅ Login credentials (email + temp password)
- ✅ Security warning to change password
- ✅ Direct login button to Netlify frontend
- ✅ Next steps instructions

**Example Email**:
```
Hello John Doe,

Your account has been successfully created for Test Company!

🔐 Your Login Credentials:
Email: your-email@example.com
Temporary Password: aBc4eF7h

⚠️ Important Security Notice:
This is a temporary password. For your security, please change it 
immediately after your first login.

[🚀 Login to Your Account]
(https://callvia-certo.netlify.app/login)
```

### Step 4: User Logs In
1. Click login button in email OR go to https://callvia-certo.netlify.app/login
2. Enter email from signup
3. Enter temporary password from email
4. Access dashboard

---

## 🧪 Testing Checklist

### Before Testing:
- [ ] Backend running on Render: https://your-backend.onrender.com
- [ ] Frontend deployed on Netlify: https://callvia-certo.netlify.app
- [ ] SMTP email configured (check backend logs)

### Test Signup:
1. [ ] Go to https://callvia-certo.netlify.app/signup
2. [ ] Fill in all fields
3. [ ] Click "Create Account"
4. [ ] Check for success message
5. [ ] Wait 1-2 minutes for email
6. [ ] Check inbox for welcome email
7. [ ] Verify email contains temp password
8. [ ] Click login link in email
9. [ ] Login with temp credentials
10. [ ] Access dashboard successfully

### Expected Results:
- ✅ Success message: "Account created successfully! Check your email for login credentials."
- ✅ Email received within 1-2 minutes
- ✅ Temp password is 8 characters (letters + numbers)
- ✅ Login works with temp credentials
- ✅ User redirected to dashboard after login

---

## 🔧 Troubleshooting

### "CORS Error" in Browser Console
**Problem**: Browser blocking requests from Netlify to backend

**Solution**: Backend already configured with CORS. Make sure:
```typescript
// apps/backend/src/index.ts
origin: [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://callvia-certo.netlify.app'  // ✅ This is set
]
```

### "Email Not Received"
**Problem**: Email not arriving in inbox

**Check**:
1. Backend logs for "Email sent successfully"
2. Check spam/junk folder
3. Verify SMTP configuration in backend `.env`:
   ```
   SMTP_HOST=mail.autoxweb.com
   SMTP_PORT=465
   SMTP_USER=info@autoxweb.com
   SMTP_PASSWORD=<your-password>
   ```

### "Signup Failed" Error
**Problem**: Backend returning 500 error

**Check Backend Logs**:
```bash
# On Render dashboard, check logs
# Or locally:
cd apps/backend
pnpm dev
```

**Common Issues**:
- Firebase not initialized (check service account keys)
- Invalid email format
- Network timeout

### "Can't Login After Signup"
**Problem**: Firebase Auth user created but can't login

**Solutions**:
1. Check email in Firebase Console → Authentication → Users
2. Verify custom claims were set (role: TENANT_ADMIN)
3. Check Firestore for user document
4. Try password reset if needed

---

## 📊 Backend Logs to Check

### Successful Signup Logs:
```
📥 Received signup request: { email: 'test@example.com', ... }
✅ Firebase user created: abc123xyz
✅ Custom claims set
✅ Firestore documents created
📤 Sending welcome email to: test@example.com
✅ Welcome email sent successfully: <message-id>
📧 Email result: { success: true }
```

### Email Sending Logs:
```
📧 Initializing email service...
SMTP Host: mail.autoxweb.com
SMTP Port: 465
SMTP User: info@autoxweb.com
SMTP Password set: true
```

---

## 🎯 Quick Test Command (for dev testing)

If testing locally, you can use curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup/reseller \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "displayName": "John Doe",
    "email": "test@example.com",
    "kycPackage": "standard"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userId": "firebase-user-id",
    "tenantId": "tenant-uuid",
    "companyName": "Test Company",
    "email": "test@example.com",
    "message": "Account created successfully! Check your email for login credentials.",
    "emailSent": true,
    "kycConfig": {
      "methods": ["digilocker", "liveness"],
      "pricing": {
        "totalPrice": 8.5,
        "breakdown": {...}
      }
    }
  },
  "meta": {
    "request_id": "...",
    "timestamp": "2026-02-02T15:10:00.000Z"
  }
}
```

---

## 🔐 Security Notes

1. **Temporary Password**: 
   - Auto-generated 8 characters
   - Mix of uppercase, lowercase, and numbers
   - User should change after first login

2. **Email Security**:
   - Sent via SMTP with TLS
   - Password visible only once in email
   - Login link is direct to Netlify (HTTPS)

3. **Account Activation**:
   - Account active immediately after signup
   - Email verified by default
   - Custom claims set for role-based access

---

## 📞 Support

If signup still fails after following this guide:

1. Check backend deployment logs on Render
2. Verify Firebase configuration
3. Check SMTP credentials
4. Test CORS in browser DevTools Network tab

---

**Last Updated**: February 2, 2026  
**Frontend**: https://callvia-certo.netlify.app  
**Signup Status**: ✅ Fixed and Ready for Testing
