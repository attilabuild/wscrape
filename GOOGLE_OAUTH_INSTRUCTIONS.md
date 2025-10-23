# Google OAuth Setup Instructions for wscrape

## Overview
This guide will walk you through setting up Google OAuth authentication for your wscrape application.

## Prerequisites
- Supabase project: `qwteebuimebslzzqzgrs`
- Supabase URL: `https://qwteebuimebslzzqzgrs.supabase.co`
- Your app is running on: `http://localhost:3000` (development)

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 1.2 Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it: `wscrape` (or any name you prefer)
4. Click "Create"

### 1.3 Enable Google+ API
1. In the left sidebar, go to: **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.4 Configure OAuth Consent Screen
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: wscrape
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. **Scopes**: Skip this step (click "Save and Continue")
7. **Test users**: Skip this step (click "Save and Continue")
8. Click "Back to Dashboard"

### 1.5 Create OAuth Credentials
1. Go to: **APIs & Services** → **Credentials**
2. Click "**+ CREATE CREDENTIALS**" at the top
3. Select "**OAuth client ID**"
4. Choose **Application type**: "Web application"
5. **Name**: wscrape OAuth Client
6. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
   - Add: `https://your-production-domain.com` (when you deploy)
7. **Authorized redirect URIs** (IMPORTANT):
   - Add: `https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback`
8. Click "**Create**"
9. A popup will show your **Client ID** and **Client Secret**
   - ⚠️ **SAVE THESE** - You'll need them in the next step!

---

## Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
1. Visit: https://app.supabase.com/project/qwteebuimebslzzqzgrs
2. Log in to your Supabase account

### 2.2 Add Google Provider
1. In the left sidebar, go to: **Authentication** → **Providers**
2. Find "Google" in the list
3. Toggle it to **Enabled**
4. Paste your Google OAuth credentials:
   - **Client ID**: (from Step 1.5)
   - **Client Secret**: (from Step 1.5)
5. Click "**Save**"

---

## Step 3: Update Site URL in Supabase (Important!)

### 3.1 Configure Site URL
1. Still in Supabase, go to: **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
4. Click "**Save**"

---

## Step 4: Test Google OAuth

### 4.1 Start Your Dev Server
```bash
npm run dev
```

### 4.2 Test the Flow
1. Go to: `http://localhost:3000/login`
2. Click "**Sign in with Google**"
3. You should see a Google sign-in popup
4. Sign in with your Google account
5. After successful authentication, you should be redirected to `/dashboard`

---

## Common Issues & Solutions

### Issue 1: "Redirect URI mismatch"
**Solution**: Make sure the redirect URI in Google Console exactly matches:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### Issue 2: "Access blocked: This app's request is invalid"
**Solution**: 
- Make sure you've enabled the Google+ API
- Check that your OAuth consent screen is configured
- Verify the authorized origins include `http://localhost:3000`

### Issue 3: Redirects to wrong page after login
**Solution**: 
- Check Supabase URL Configuration (Site URL and Redirect URLs)
- Make sure your code uses the correct redirectTo URL

### Issue 4: "The OAuth client was deleted"
**Solution**: 
- Create new OAuth credentials in Google Console
- Update them in Supabase

---

## Production Deployment

When deploying to production:

### Update Google Console:
1. Add your production domain to **Authorized JavaScript origins**:
   - `https://your-domain.com`
2. Redirect URI stays the same (Supabase callback URL)

### Update Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to: `https://your-domain.com`
3. Add production **Redirect URLs**:
   - `https://your-domain.com/dashboard`
   - `https://your-domain.com/auth/callback`

---

## Summary

Your Google OAuth is now configured! Here's what happens:

1. User clicks "Sign in with Google"
2. Supabase redirects to Google's OAuth page
3. User authorizes the app
4. Google redirects back to: `https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback`
5. Supabase processes the authentication
6. User is redirected to: `http://localhost:3000/dashboard`

The code in your app already handles all of this! ✅

---

## Quick Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created (Client ID + Secret)
- [ ] Google credentials added to Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] Tested login flow

---

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs: **Authentication** → **Logs**
3. Verify all URLs match exactly (no trailing slashes)
4. Make sure cookies are enabled in your browser

---

**Last Updated**: Today
**Supabase Project**: qwteebuimebslzzqzgrs
**Environment**: Development (localhost:3000)

