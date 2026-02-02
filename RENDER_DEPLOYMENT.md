# Callvia Certo Backend - Render Deployment

## Quick Deploy to Render

### Method 1: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `sonu28281/Callvia-Certo`
4. Render will detect `render.yaml` automatically
5. Click "Apply" and deployment will start!

### Method 2: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `sonu28281/Callvia-Certo`
4. Configure:
   - **Name**: `callvia-certo-backend`
   - **Root Directory**: Leave empty (use root)
   - **Environment**: `Node`
   - **Build Command**: `npm install -g pnpm && pnpm install && cd apps/backend && pnpm build`
   - **Start Command**: `cd apps/backend && node dist/index.js`
   - **Plan**: Free

### Required Environment Variables

Add these in Render dashboard (Environment section):

```bash
# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Email Configuration
SMTP_HOST=mail.autoxweb.com
SMTP_PORT=465
SMTP_USER=info@autoxweb.com
SMTP_PASSWORD=your-smtp-password

# Frontend URL (Update after deploying frontend)
FRONTEND_URL=https://your-app.netlify.app

# Node Environment
NODE_ENV=production
PORT=3000
```

### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy values from the JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### After Deployment

1. Copy your Render backend URL (e.g., `https://callvia-certo-backend.onrender.com`)
2. Update Netlify environment variable:
   ```
   VITE_API_URL=https://callvia-certo-backend.onrender.com
   ```
3. Redeploy frontend on Netlify

### Troubleshooting

- **Build fails**: Check if all dependencies are in package.json
- **Service crashes**: Check environment variables are set correctly
- **CORS errors**: Ensure FRONTEND_URL is set correctly
