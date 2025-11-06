# 🔐 Lightning Platform Admin Setup Guide

## Overview

Your Lightning Platform now has a **hardcoded admin security system** designed for single-admin setups. This provides maximum security by eliminating role management complexity and database dependencies.

## 🚀 Quick Start (Development)

### 1. Enable Dev Mode (Skip Authentication)

```bash
# Enable admin bypass for development
node scripts/setup-admin.js dev

# Start the server
npm run dev
```

**✅ You can now access `/admin` directly without login!**

---

## 🔒 Production Setup (Secure)

### 1. Get Your Admin UUID

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication > Users**
3. Copy your UUID (e.g., `6fa49a38-1234-5678-9abc-def123456789`)

### 2. Configure Your Admin Identity

```bash
# Replace YOUR_UUID_HERE with your actual UUID
node scripts/setup-admin.js 6fa49a38-1234-5678-9abc-def123456789
```

This will:
- ✅ Add your UUID to `.env.local`
- ✅ Disable admin bypass
- ✅ Lock admin access to your account only

### 3. Restart Server

```bash
npm run dev
```

### 4. Test Access

1. Visit `/admin` - you'll be redirected to `/login`
2. Login with your Supabase account
3. Only your UUID will be granted admin access

---

## 🛡️ Security Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Hardcoded UUID** | Only your specific UUID can access admin | No role management needed |
| **Middleware Protection** | Server-side validation on every request | Cannot be bypassed client-side |
| **No Database Flags** | No `is_admin` columns or role tables | Simpler, more secure |
| **Dev Bypass Option** | Skip auth entirely for development | Faster development workflow |

---

## 🔧 Configuration Options

### Environment Variables

```bash
# Required: Your admin UUID
NEXT_PUBLIC_ADMIN_UID=6fa49a38-1234-5678-9abc-def123456789

# Optional: Development bypass
ADMIN_BYPASS=false  # Set to 'true' for dev mode

# Optional: Admin token (future use)
ADMIN_TOKEN=your-secret-token
```

### Admin Setup Script Commands

```bash
# Setup with your UUID
node scripts/setup-admin.js YOUR_UUID_HERE

# Enable development mode
node scripts/setup-admin.js dev

# Show help
node scripts/setup-admin.js
```

---

## 🚨 Security Best Practices

### ✅ DO

- Keep your `.env.local` file secure
- Use a strong Supabase password
- Enable 2FA on your Supabase account
- Set `ADMIN_BYPASS=false` in production
- Regularly rotate your Supabase keys

### ❌ DON'T

- Commit your UUID to public repositories
- Share your `.env.local` file
- Leave `ADMIN_BYPASS=true` in production
- Use weak passwords for your admin account

---

## 🔄 Switching Between Modes

### Development Mode (No Auth)
```bash
node scripts/setup-admin.js dev
npm run dev
# Access /admin directly
```

### Production Mode (Secure Auth)
```bash
# Edit .env.local and set:
ADMIN_BYPASS=false
npm run dev
# Must login at /login first
```

---

## 🐛 Troubleshooting

### "Admin access denied" Error

**Problem**: Getting redirected to login even with correct UUID

**Solutions**:
1. Check your UUID in Supabase Dashboard
2. Verify `.env.local` has correct `NEXT_PUBLIC_ADMIN_UID`
3. Restart the Next.js server
4. Clear browser cookies

### Can't Access Admin in Dev Mode

**Problem**: Still redirected to login with `ADMIN_BYPASS=true`

**Solutions**:
1. Restart the server after setting bypass
2. Check `.env.local` has `ADMIN_BYPASS=true`
3. Verify no caching issues (hard refresh)

### Environment Variables Not Loading

**Problem**: Changes to `.env.local` not taking effect

**Solutions**:
1. Restart the Next.js server completely
2. Check file is named `.env.local` (not `.env`)
3. Verify no syntax errors in the file

---

## 📁 File Structure

```
web/
├── .env.local                 # Your admin configuration
├── src/
│   ├── middleware.ts          # Admin protection logic
│   └── app/
│       ├── admin/             # Admin dashboard pages
│       │   ├── layout.tsx     # Admin layout
│       │   ├── page.tsx       # Main dashboard
│       │   ├── users/         # User management
│       │   └── bots/          # Bot control
│       └── login/
│           └── page.tsx       # Admin login
└── scripts/
    └── setup-admin.js         # Setup wizard
```

---

## 🎯 Next Steps

1. **Set up your UUID** for production security
2. **Test the admin dashboard** functionality
3. **Configure Supabase** with your real credentials
4. **Deploy** with `ADMIN_BYPASS=false`

---

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Verify your environment configuration
3. Test with dev mode first
4. Check server logs for error messages

**Your admin system is now production-ready with maximum security! 🚀** 