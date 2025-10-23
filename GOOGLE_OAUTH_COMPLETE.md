# ✅ Google OAuth Setup - Complete Guide

## 🎯 What We've Set Up

Your app is now **ready for Google OAuth**! Here's what's configured:

### Code Changes Made:
1. ✅ Login page with Google button (`/app/login/page.tsx`)
2. ✅ Signup page with Google button (`/app/signup/page.tsx`)
3. ✅ Auth callback route (`/app/auth/callback/route.ts`)
4. ✅ Supabase client configuration (`/lib/supabase.ts`)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Google Cloud Console

1. **Go to**: https://console.cloud.google.com/apis/credentials

2. **Click**: "+ CREATE CREDENTIALS" → "OAuth client ID"

3. **If prompted**, configure OAuth consent screen:
   - App name: `wscrape`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" through all steps

4. **Choose**: "Web application"

5. **Name**: `wscrape OAuth Client`

6. **Add Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```

7. **Add Authorized redirect URI** (⚠️ EXACT URL):
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```

8. **Click "Create"**

9. **📋 Copy** the Client ID and Client Secret (you'll need these next!)

---

### Step 2: Supabase Dashboard

1. **Go to**: https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/providers

2. **Find "Google"** and toggle it **ON**

3. **Paste** your credentials:
   - Client ID: (from Step 1)
   - Client Secret: (from Step 1)

4. **Click "Save"**

5. **Go to**: https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/url-configuration

6. **Set Site URL**:
   ```
   http://localhost:3000
   ```

7. **Add Redirect URLs**:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/*
   ```

8. **Click "Save"**

---

### Step 3: Test It!

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to**: http://localhost:3000/login

3. **Click**: "Sign in with Google"

4. **Choose** your Google account

5. **✅ Success!** You should be redirected to `/dashboard`

---

## 🔧 How It Works

### User Flow:
```
1. User clicks "Sign in with Google"
   ↓
2. Redirects to Google OAuth page
   ↓
3. User authorizes the app
   ↓
4. Google redirects to Supabase callback:
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ↓
5. Supabase creates/authenticates user
   ↓
6. Supabase redirects to your app:
   http://localhost:3000/auth/callback?code=xxx
   ↓
7. Your callback route exchanges code for session
   ↓
8. User is redirected to /dashboard
```

### Code Files:

**Login Button** (`app/login/page.tsx`):
```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) setError(error.message);
};
```

**Callback Handler** (`app/auth/callback/route.ts`):
```typescript
export async function GET(request: NextRequest) {
  const code = request.searchParams.get('code');
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect('/dashboard');
}
```

---

## 🐛 Troubleshooting

### Error: "Redirect URI mismatch"

**Cause**: The redirect URI in Google Console doesn't match Supabase's callback URL

**Fix**: Make sure this EXACT URL is in Google Console:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```
⚠️ No spaces, no trailing slash, must be exact!

---

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured

**Fix**: 
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Fill in app name and email
3. Save and continue through all steps

---

### Error: "The OAuth client was deleted"

**Cause**: OAuth credentials were deleted or expired

**Fix**: 
1. Create new OAuth credentials in Google Console
2. Update Client ID and Secret in Supabase

---

### Not redirecting after login

**Cause**: Site URL or Redirect URLs not configured in Supabase

**Fix**: 
1. Go to Supabase → Authentication → URL Configuration
2. Set Site URL: `http://localhost:3000`
3. Add Redirect URLs:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/*`

---

### Infinite redirect loop

**Cause**: Callback route not working or session not being set

**Fix**: 
1. Check `/app/auth/callback/route.ts` exists
2. Check browser console for errors
3. Clear browser cookies and try again

---

## 🌐 Production Deployment

When you deploy to production, you need to update a few URLs:

### Google Cloud Console:
1. Go to your OAuth client settings
2. Add production origin:
   ```
   https://your-domain.com
   ```
3. The callback URL stays the same (Supabase handles it)

### Supabase:
1. Go to Authentication → URL Configuration
2. Update Site URL:
   ```
   https://your-domain.com
   ```
3. Update Redirect URLs:
   ```
   https://your-domain.com/dashboard
   https://your-domain.com/*
   ```

### Environment Variables:
Make sure your production environment has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qwteebuimebslzzqzgrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 📱 What Users See

### Login Page:
- Email/password form
- "Or continue with" divider
- "Sign in with Google" button (with Google logo)

### Signup Page:
- Email/password/confirm password form
- "Or continue with" divider
- "Sign up with Google" button (with Google logo)

### After Google Auth:
- User is automatically:
  - Created in Supabase `auth.users` table
  - Logged in
  - Redirected to dashboard
  - Profile can be completed in `/profile`

---

## 🔐 Security Notes

1. **Client Secret**: Keep it secret! Never expose in client-side code
2. **Supabase handles**: All OAuth token exchange securely
3. **HTTPS required**: In production (Google requires it)
4. **Cookies**: Supabase uses httpOnly cookies for session management

---

## 📊 What's Created in Supabase

When a user signs in with Google:

1. **User entry** in `auth.users`:
   - `id`: UUID
   - `email`: From Google
   - `raw_user_meta_data`: Name, avatar, etc.

2. **Session** created automatically

3. **Profile entry** (if you have RLS policies set up):
   - User can complete profile in `/profile` page

---

## ✅ Final Checklist

Before going live:

- [ ] Google OAuth credentials created
- [ ] OAuth consent screen configured
- [ ] Authorized redirect URI added
- [ ] Authorized JavaScript origins added
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] Tested login flow locally
- [ ] Tested signup flow locally
- [ ] Checked user is redirected to dashboard
- [ ] Verified user session persists
- [ ] Ready for production!

---

## 📚 Additional Resources

- **Supabase OAuth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Google OAuth Setup**: https://console.cloud.google.com/apis/credentials
- **Supabase Dashboard**: https://app.supabase.com/project/qwteebuimebslzzqzgrs

---

## 🎉 You're All Set!

Your Google OAuth integration is complete! Users can now:
- ✅ Sign in with Google
- ✅ Sign up with Google
- ✅ Skip the email/password flow
- ✅ One-click authentication

All the code is in place, just follow the setup steps above to enable it! 🚀

---

**Created**: Today
**Last Updated**: Today
**Supabase Project**: qwteebuimebslzzqzgrs
**Status**: ✅ Ready to Enable

