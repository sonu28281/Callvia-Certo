# Quick Reference for Mobile Users

## 📱 When You're on Mobile (Now)

Just review these files to understand the project:
- **PROJECT_MASTER_PROMPT.md** - Complete specification
- **PROJECT_STATUS.md** - What's been done
- **GETTING_STARTED.md** - Setup instructions
- **README_DEV.md** - API documentation

## 💻 When You're on Laptop (Later)

### Option 1: One Command Start
```bash
cd /workspaces/Callvia-Certo
bash start.sh
```

### Option 2: Manual Steps
```bash
# 1. Navigate to project
cd /workspaces/Callvia-Certo

# 2. Install dependencies
pnpm install

# 3. Start backend
pnpm backend:dev
```

### Then Test the API
Open a new terminal:
```bash
# Health check
curl http://localhost:3000/health

# Get wallet balance
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer user_123:tenant_abc:TENANT_ADMIN"
```

## 📂 Directory Structure

```
/workspaces/Callvia-Certo/          👈 YOU ARE HERE (root)
├── apps/
│   └── backend/                     👈 Backend app
├── packages/
│   ├── types/                       👈 Shared types
│   └── constants/                   👈 Shared constants
├── start.sh                         👈 Quick start script
└── package.json                     👈 Root config
```

## 🎯 All Commands Run From Root

**Root directory**: `/workspaces/Callvia-Certo`

Every command starts here:
- `pnpm install` - From root
- `pnpm backend:dev` - From root
- `bash start.sh` - From root

## ✅ What's Ready

- [x] All code written
- [x] All config files created
- [x] All documentation ready
- [x] Backend fully implemented
- [ ] Dependencies not installed yet
- [ ] Server not running yet

## 🚦 Status

**You can't run anything right now (mobile)** ✋

**When on laptop**: Just run `bash start.sh` ✅

---

Bookmark this file for later! 🔖
