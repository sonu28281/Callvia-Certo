# Email Configuration Guide

## 🚀 Setup Gmail for Sending KYC Emails

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable it

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Callvia Certo Backend**
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File

```bash
# .env
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Remove spaces from app password
```

### Step 4: Install Dependencies

```bash
cd apps/backend
pnpm install
```

### Step 5: Test Email

Start backend:
```bash
cd apps/backend
pnpm dev
```

Then from frontend, initiate a KYC verification!

## 📧 Email Templates Included:

1. **KYC Verification Link Email**
   - Beautiful HTML design
   - Clear CTA button
   - Document requirements
   - Expiry notice

2. **KYC Result Email**
   - Approval notification
   - Rejection with reason
   - Next steps

## 🔐 Security Notes:

- ✅ Never commit actual passwords to git
- ✅ Use App Passwords (not your Gmail password)
- ✅ Keep `.env` in `.gitignore`
- ✅ For production, use SendGrid/AWS SES

## 🎯 Alternative Email Services:

### SendGrid (Recommended for Production)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_smtp_username
SMTP_PASSWORD=your_aws_smtp_password
```

## ✅ Test Checklist:

- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] `.env` file updated
- [ ] Dependencies installed
- [ ] Backend running
- [ ] Test email sent successfully

**Happy Testing!** 🎉
