# 🔐 Google OAuth Setup Guide for wscrape

## ✅ Current Implementation Status

Your app **already has Google OAuth implemented** in the code! You just need to configure it in:
1. **Supabase Dashboard** (enable Google provider)
2. **Google Cloud Console** (get OAuth credentials)

---

## 🚀 Quick Setup Steps

### Step 1: Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `qwteebuimebslzzqzgrs`
3. Navigate to: **Authentication** → **Providers**
4. Find **Google** in the list
5. Click **Enable**
6. You'll need to add Google OAuth credentials (next step)

---

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select or create a project
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth Client ID:
   - Go to **APIs & Services** → **Credentials**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - If prompted, configure the OAuth consent screen first

5. **OAuth Consent Screen Configuration:**
   - **User Type**: External
   - **App name**: wscrape
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through all steps
   - Click **"Back to Dashboard"**

6. **Create OAuth Client ID:**
   - **Application type**: Web application
   - **Name**: wscrape-app
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://wscrape.com
   ```
   
   **Authorized redirect URIs:**
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```
   ⚠️ **CRITICAL**: Copy this EXACTLY - no trailing slash!

7. Click **"Create"** and **SAVE** the credentials:
   - **Client ID**: `xxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `xxxxxxxxxxxxxx`

---

### Step 3: Add Credentials to Supabase

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Paste your credentials:
   - **Client ID (for OAuth)**: Your Google Client ID
   - **Client Secret (for OAuth)**: Your Google Client Secret
3. Click **"Save"**

---

### Step 4: Test Google OAuth

1. Start your dev server:
   ```bash
   npm run dev
   ```
2. Go to: `http://localhost:3000/signup`
3. Click **"Sign up with Google"**
4. Should redirect to Google login
5. After authentication, should redirect to `/pricing`
6. Test login flow at: `http://localhost:3000/login`

---

## 🎯 How It Works

### Sign Up Flow:
```
User clicks "Sign up with Google"
  ↓
Supabase redirects to Google OAuth
  ↓
User authenticates with Google
  ↓
Google redirects to Supabase callback
  ↓
Supabase creates session and redirects to /pricing
  ↓
User can subscribe
```

### Login Flow:
```
User clicks "Sign in with Google"
  ↓
Same OAuth flow
  ↓
Redirects to /dashboard
```

---

## 📝 Code Implementation

Your Google OAuth is already implemented in:

### `app/signup/page.tsx` (lines 109-119):
```typescript
const signUpWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/pricing`,
    },
  });
  if (error) {
    setError(error.message);
  }
};
```

### `app/login/page.tsx` (lines 37-47):
```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) {
    setError(error.message);
  }
};
```

### `app/auth/callback/route.ts`:
Handles the OAuth callback and redirects to dashboard.

---

## 🔧 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Make sure the redirect URI in Google Cloud Console **exactly** matches:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### Issue: "OAuth consent screen not configured"

**Solution**: 
1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Complete the setup form

### Issue: "Error: signup_disabled"

**Solution**:
1. Go to Supabase Dashboard
2. **Authentication** → **Settings**
3. Enable "Enable email signups" or "Enable Google signups"

### Issue: Not redirecting after OAuth

**Solution**:
1. Check Supabase logs in Dashboard
2. Verify callback route is working
3. Test with: `npm run dev` first

---

## 🔒 Security Notes

1. **Client Secret**: Never expose your Google Client Secret
2. **Redirect URI**: Must match exactly in Google Console
3. **HTTPS**: Production must use HTTPS (Vercel does this automatically)
4. **Environment Variables**: Keep secrets in `.env.local` (not in Git)

---

## 📋 Environment Variables Checklist

You don't need to add any environment variables! Supabase handles OAuth configuration.

Just make sure these are set:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qwteebuimebslzzqzgrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎉 Testing Checklist

- [ ] Google provider enabled in Supabase
- [ ] OAuth credentials added to Supabase
- [ ] Authorized redirect URI configured in Google Console
- [ ] "Sign up with Google" button works
- [ ] "Sign in with Google" button works
- [ ] Redirect to `/pricing` after signup
- [ ] Redirect to `/dashboard` after login

---

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard → Authentication → Logs
2. Check Google Cloud Console → Credentials
3. Check browser console for errors
4. Verify redirect URI matches exactly

**Your Google OAuth is 100% ready - just add the credentials!** 🚀
