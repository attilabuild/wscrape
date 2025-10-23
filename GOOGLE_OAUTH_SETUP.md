# Google OAuth Setup Guide for wscrape

## ✅ Code Already Implemented!

Your login and signup pages already have Google OAuth buttons implemented. We just need to configure the backend.

---

## 🚀 Setup Steps

### Step 1: Get Google OAuth Credentials

#### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### 1.2 Create or Select a Project
- Click the project dropdown at the top
- Click "New Project"
- Name it: `wscrape` (or any name you prefer)
- Click "Create"

#### 1.3 Enable Google+ API (Required)
1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

#### 1.4 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public use)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `wscrape`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. Skip "Scopes" (click **Save and Continue**)
7. Skip "Test users" (click **Save and Continue**)
8. Click **Back to Dashboard**

#### 1.5 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. Name: `wscrape Web Client`
5. Under **Authorized redirect URIs**, add:

   **For Development:**
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```

   **For Production (when deployed):**
   ```
   https://your-production-domain.vercel.app/auth/v1/callback
   ```

   **IMPORTANT**: Replace `qwteebuimebslzzqzgrs` with your actual Supabase project ID

6. Click **Create**
7. **COPY** the Client ID and Client Secret (you'll need these next)

---

### Step 2: Configure Supabase

#### 2.1 Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs

#### 2.2 Enable Google Provider
1. In the sidebar, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click to expand it
4. Toggle **Enable Sign in with Google** to ON

#### 2.3 Add Google Credentials
1. Paste your **Client ID** from Google Cloud Console
2. Paste your **Client Secret** from Google Cloud Console
3. Click **Save**

#### 2.4 Get the Redirect URL (Already Done)
The redirect URL should be:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

This is what you added to Google Cloud Console in Step 1.5.

---

### Step 3: Test Google Sign-In

#### 3.1 Start Your Dev Server (if not running)
```bash
npm run dev
```

#### 3.2 Test Login Flow
1. Open http://localhost:3000
2. Click "Get started" or go to http://localhost:3000/login
3. Click **"Sign in with Google"** button
4. You should see Google's OAuth consent screen
5. Select your Google account
6. Grant permissions
7. You should be redirected to http://localhost:3000/dashboard

#### 3.3 Test Signup Flow
1. Go to http://localhost:3000/signup
2. Click **"Sign up with Google"** button
3. Same flow as above

---

## 🔍 Verification Checklist

After completing the setup, verify:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URI added to Google Cloud
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Test login successful
- [ ] Test signup successful
- [ ] User redirected to dashboard
- [ ] User profile created in database

---

## 📊 Check User in Supabase

After successful Google sign-in:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see your Google account listed
3. Email should match your Google email
4. Provider should show "google"

---

## 🐛 Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Cause**: The redirect URI in Google Cloud doesn't match Supabase

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Add the exact Supabase redirect URL:
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```
4. Save and try again

---

### Issue: "Invalid client" or "Unauthorized"

**Cause**: Client ID or Secret is incorrect

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Copy Client ID and Secret again
3. Go to Supabase → Authentication → Providers → Google
4. Re-paste the credentials
5. Save and try again

---

### Issue: Button doesn't do anything

**Cause**: JavaScript error or Supabase not configured

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://qwteebuimebslzzqzgrs.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Restart dev server

---

### Issue: "Email not verified" error

**Cause**: Google OAuth should auto-verify, but check settings

**Solution**:
1. Go to Supabase → Authentication → Settings
2. Scroll to **Email Auth**
3. Toggle OFF "Enable email confirmations" for testing
4. Try again

---

### Issue: Redirect loop after sign-in

**Cause**: Redirect URL misconfiguration

**Solution**:
Check the code in `login/page.tsx` and `signup/page.tsx`:
```typescript
options: {
  redirectTo: `${window.location.origin}/dashboard`,
}
```

This should work automatically. If not, hardcode for testing:
```typescript
options: {
  redirectTo: 'http://localhost:3000/dashboard',
}
```

---

## 🔒 Security Best Practices

### 1. Protect Your Client Secret
- ✅ Never commit Client Secret to Git
- ✅ Store only in Supabase dashboard
- ✅ Rotate secrets regularly

### 2. Configure Scopes
In Google Cloud Console, you can limit what data your app accesses:
- Email (required)
- Profile (optional)
- Additional scopes as needed

### 3. Production Setup
When deploying to production:

1. **Add Production Domain to Google Cloud**:
   ```
   https://your-app.vercel.app/auth/v1/callback
   ```

2. **Update Redirect in Code** (if needed):
   ```typescript
   redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
   ```

3. **Add Environment Variable**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

---

## 🎯 How It Works (Technical)

### OAuth Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Frontend calls supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Supabase redirects to Google OAuth consent screen
    ↓
User grants permissions
    ↓
Google redirects to Supabase callback URL with auth code
    ↓
Supabase exchanges code for Google access token
    ↓
Supabase creates user in auth.users table
    ↓
Supabase redirects to your app with session token
    ↓
App receives session and redirects to /dashboard
    ↓
User is logged in! 🎉
```

---

## 📝 Code Reference

### Current Implementation (Already in Your Code)

#### Login Button (`app/login/page.tsx`)
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

#### Signup Button (`app/signup/page.tsx`)
```typescript
const signUpWithGoogle = async () => {
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

#### Protected Route Check (`components/ProtectedRoute.tsx`)
```typescript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    setAuthenticated(true);
    setLoading(false);
  };

  checkAuth();
}, [router]);
```

This works for both email/password AND Google OAuth users!

---

## 🚀 Advanced: Add More OAuth Providers

After Google works, you can easily add:

### GitHub OAuth
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Add to Supabase → Authentication → Providers

### Twitter/X OAuth
1. Go to Twitter Developer Portal
2. Create app and get credentials
3. Add to Supabase

### Discord OAuth
Similar process!

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs**:
   - Supabase Dashboard → Logs → Auth

2. **Check Browser Console**:
   - Press F12 → Console tab

3. **Verify Configuration**:
   - Google Cloud credentials match Supabase
   - Redirect URLs are exact matches
   - Provider is enabled in Supabase

4. **Test with Different Google Account**:
   - Some corporate Google accounts have restrictions

---

## ✅ Final Checklist

Before considering it "done":

- [ ] Google OAuth working on localhost
- [ ] Users can sign in with Google
- [ ] Users can sign up with Google
- [ ] Proper redirect to dashboard
- [ ] User session persists (refresh page stays logged in)
- [ ] Logout works correctly
- [ ] Profile data accessible
- [ ] Ready for production deployment

---

## 🎉 Success!

Once you see this flow work smoothly:

1. Click "Sign in with Google"
2. Google consent screen appears
3. Select account and grant access
4. Redirected to dashboard
5. Logged in successfully

**You're done!** 🎊

Your users can now sign in with Google in addition to email/password!

---

**Need help?** Open browser console and check for errors. Most issues are redirect URL mismatches.

