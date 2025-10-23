# 🚀 Google OAuth Quick Start (5 Minutes)

## Part 1: Google Cloud Console (2 minutes)

### Step 1: Create OAuth Credentials
1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Click: **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure consent screen first (just fill in app name and your email)
4. Choose: **"Web application"**
5. Add this **Authorized redirect URI**:
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```
6. Add **Authorized JavaScript origin**:
   ```
   http://localhost:3000
   ```
7. Click **"Create"**
8. 📋 **Copy the Client ID and Client Secret**

---

## Part 2: Supabase Dashboard (1 minute)

### Step 2: Enable Google in Supabase
1. Go to: **https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/providers**
2. Find **"Google"** and toggle it **ON**
3. Paste your:
   - **Client ID**: (from Google Console)
   - **Client Secret**: (from Google Console)
4. Click **"Save"**

### Step 3: Configure URLs
1. Go to: **https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/url-configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/*`
4. Click **"Save"**

---

## Part 3: Test It! (30 seconds)

### Step 4: Try Logging In
1. Run: `npm run dev`
2. Go to: **http://localhost:3000/login**
3. Click: **"Sign in with Google"**
4. Choose your Google account
5. ✅ You should be redirected to the dashboard!

---

## 🎉 Done!

That's it! Your Google OAuth is now working.

---

## 🔧 Troubleshooting

### Error: "Redirect URI mismatch"
**Fix**: Make sure you added this EXACT URL in Google Console:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### Error: "Access blocked"
**Fix**: Configure the OAuth consent screen in Google Console first:
- Go to: https://console.cloud.google.com/apis/credentials/consent
- Fill in app name and email
- Save

### Not redirecting after login?
**Fix**: Check Supabase URL Configuration has:
- Site URL: `http://localhost:3000`
- Redirect URLs include: `http://localhost:3000/dashboard`

---

## 📝 What You Just Did

1. ✅ Created Google OAuth app
2. ✅ Connected it to Supabase
3. ✅ Configured redirect URLs
4. ✅ Tested the login flow

Your app can now:
- Sign in with Google
- Sign up with Google
- Auto-create user profiles
- Handle authentication state

All the code is already in place in `/app/login/page.tsx` and `/app/signup/page.tsx`!

