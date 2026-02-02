# 🎯 Real Email Testing Setup - Quick Start

## ✅ Status: Email Service Ready!

I've added **real email sending functionality** to your KYC system! Here's how to test it:

---

## 📧 Option 1: Gmail (Easiest for Testing)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**

### Step 2: Generate App Password  
1. Go to https://myaccount.google.com/apppasswords
2. Select **App: Mail**, **Device: Other**
3. Name it: **Callvia Certo**
4. Click **Generate**
5. **Copy the 16-character password** (remove spaces)

### Step 3: Update .env File
```bash
# Open .env file in root folder
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Your app password (no spaces)
```

---

## 🚀 How to Test

### 1. Start Backend Server
```bash
cd /workspaces/Callvia-Certo/apps/backend
pnpm dev
```

### 2. Start Frontend (in another terminal)
```bash
cd /workspaces/Callvia-Certo/apps/frontend
pnpm dev
```

### 3. Initiate KYC Verification
1. Go to **KYC Page** in the app
2. Click **"Start New Verification"**
3. Fill in customer details:
   - Name: Test Customer
   - Email: **your-test-email@gmail.com** (use a real email you can check)
   - Phone: +91-9876543210
   - Select document types
4. Click **"Initiate Verification"**

### 4. Check Email Inbox 📬
- You'll receive a beautiful HTML email with:
  - ✅ KYC verification link
  - 📋 Required documents list
  - 🛡️ Security information
  - ⏱️ Expiry notice

---

## 📧 What the Email Looks Like

```
Subject: 🛡️ Complete Your Identity Verification

Dear Test Customer,

You have been requested to complete your identity verification (KYC) process.

📋 Required Documents:
• Passport
• Driving License

What you need to do:
1. Click the verification button below
2. Upload the required documents
3. Take a selfie for identity confirmation
4. Submit for review

[✅ Complete Verification Now]

⏱️ Important:
• This link will expire in 7 days
• Session ID: kyc_1234567890
• Estimated time: 5-10 minutes
```

---

## 🔧 Alternative: SendGrid (Production Recommended)

If Gmail doesn't work or for production use:

1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Generate API Key
3. Update `.env`:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here
```

---

## ✅ Backend Email Service Features

✨ **Email Templates Included:**
- ✅ KYC Verification Link Email (beautiful HTML)
- ✅ KYC Approval Notification
- ✅ KYC Rejection Notification with reason

📁 **Files Created:**
- `/apps/backend/src/services/email.service.ts` - Email service
- `/apps/backend/src/kyc/inhouse-kyc.routes.ts` - Updated with email sending
- `/EMAIL_SETUP_GUIDE.md` - Detailed setup guide

---

## 🎯 Testing Checklist

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated  
- [ ] `.env` file updated with credentials
- [ ] Backend running (`pnpm dev`)
- [ ] Frontend running
- [ ] KYC verification initiated
- [ ] Email received in inbox ✅

---

## 🐛 Troubleshooting

### "Invalid login" error:
- Make sure you're using **App Password**, not your Gmail password
- Remove spaces from the app password
- Check that 2-Step Verification is enabled

### No email received:
- Check spam folder
- Verify `.env` file has correct credentials
- Check backend console for error messages
- Try a different email address

### Still not working?
- Use SendGrid instead (more reliable for development)
- Check backend logs: `cd apps/backend && pnpm dev`

---

## 🎉 Ready to Test!

**Ab aap real KYC test kar sakte ho!** (Now you can test real KYC!)

Just set up Gmail app password, update `.env`, and send a real verification email to yourself! 📧✨
