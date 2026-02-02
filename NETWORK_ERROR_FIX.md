# 🚀 Quick Fix: Network Error Issues

## ❌ Problem

You're seeing these errors:
1. **Signup page**: "Failed to fetch" 
2. **Send KYC Link button**: "Network Error: Failed to fetch - Backend is running on port 3000"

## ✅ Root Cause

The Netlify frontend is trying to connect to `localhost:3000` instead of your actual Render backend URL.

---

## 🔧 Solution: Update Environment Variables

### Step 1: Find Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your `callvia-certo` service
3. Copy the URL at the top (looks like: `https://callvia-certo.onrender.com`)

### Step 2: Update Netlify Environment Variable

**Option A: Via Netlify Dashboard (Recommended)**

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your `callvia-certo` site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://callvia-certo.onrender.com` (your actual Render URL)
6. Click **Save**
7. Go to **Deploys** tab
8. Click **Trigger deploy** → **Clear cache and deploy site**

**Option B: Via netlify.toml (Already Updated)**

The `netlify.toml` file has been updated with the backend URL. Just push to git and Netlify will redeploy automatically.

---

## 📝 Changes Already Made

### ✅ File 1: `netlify.toml`

```toml
[build.environment]
  VITE_API_URL = "https://callvia-certo.onrender.com"

[[redirects]]
  from = "/api/*"
  to = "https://callvia-certo.onrender.com/api/:splat"
```

### ✅ File 2: `render.yaml`

```yaml
- key: FRONTEND_URL
  value: https://callvia-certo.netlify.app
```

---

## 🚀 Deploy the Fix

### Step 1: Commit and Push

```bash
cd /workspaces/Callvia-Certo
git add netlify.toml render.yaml
git commit -m "Fix: Configure backend URL for Netlify deployment"
git push origin main
```

### Step 2: Wait for Deployments

1. **Netlify** will auto-deploy (2-3 minutes)
2. **Render** will auto-deploy (5-10 minutes)

### Step 3: Test Again

After both deployments complete:

1. Go to https://callvia-certo.netlify.app/signup
2. Fill in the form
3. Click "Create account"
4. Should work now! ✅

---

## 🧪 How to Verify Backend URL

### Test Backend Directly

```bash
# Test backend health endpoint
curl https://callvia-certo.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### Check Frontend API Config

Open browser console on https://callvia-certo.netlify.app/:

```javascript
// Check if VITE_API_URL is set
console.log(import.meta.env.VITE_API_URL)
// Should show: https://callvia-certo.onrender.com
```

---

## 🔍 Troubleshooting

### Issue: "Still getting Failed to fetch"

**Check 1: Backend is running**
```bash
curl https://callvia-certo.onrender.com/health
```

If this fails, your backend is down. Check Render logs.

**Check 2: CORS is configured**
Backend should allow `https://callvia-certo.netlify.app` in CORS.

Already configured in `apps/backend/src/index.ts`:
```typescript
origin: [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://callvia-certo.netlify.app'  // ✅
]
```

**Check 3: Netlify environment variable is set**

Go to Netlify Dashboard → Site settings → Environment variables

Should see:
- `VITE_API_URL` = `https://callvia-certo.onrender.com`

If missing, add it manually and redeploy.

### Issue: "CORS Error"

If you see CORS error in browser console:

1. Check backend logs on Render
2. Verify CORS configuration includes Netlify URL
3. Backend must be deployed with latest changes

### Issue: "Backend URL returns 404"

Check the URL format:
- ✅ Correct: `https://callvia-certo.onrender.com`
- ❌ Wrong: `http://callvia-certo.onrender.com` (no https)
- ❌ Wrong: `https://callvia-certo.onrender.com/` (trailing slash)

---

## 📋 Quick Checklist

Before testing, verify:

- [ ] Render backend URL is copied correctly
- [ ] `netlify.toml` has correct VITE_API_URL
- [ ] Changes committed and pushed to git
- [ ] Netlify redeployed (check deploy status)
- [ ] Render redeployed (check deploy status)
- [ ] Backend health endpoint responds: `curl https://callvia-certo.onrender.com/health`
- [ ] Both deployments show "Live" status

---

## 🎯 Expected Results After Fix

### Signup Flow:
1. User goes to https://callvia-certo.netlify.app/signup
2. Fills form and clicks "Create account"
3. ✅ Success message appears
4. ✅ Email sent with temporary password
5. ✅ User can login

### Send KYC Link:
1. User fills KYC form
2. Clicks "Send KYC Link"
3. ✅ Link sent to customer email
4. ✅ No network errors

---

## 📞 Need Different Backend URL?

If your Render backend has a different URL, update these locations:

1. **netlify.toml**: Line 9 - `VITE_API_URL`
2. **netlify.toml**: Line 13 - API redirect
3. **Netlify Dashboard**: Environment variables
4. **render.yaml**: Line 29 - `FRONTEND_URL`

Then commit, push, and wait for redeployments.

---

## ✅ Status After This Fix

- ✅ Frontend knows where backend is
- ✅ API calls go to Render, not localhost
- ✅ Signup will work
- ✅ Send KYC Link will work
- ✅ All API endpoints accessible

**Just push the changes and wait for deployments!** 🚀

---

**Last Updated**: February 2, 2026  
**Status**: Ready to deploy
