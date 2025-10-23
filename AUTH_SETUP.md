# Authentication Setup Guide

## ✅ No Database Tables Required!

**Good news:** Supabase authentication works completely without any custom database tables! Supabase automatically manages all the auth tables (`auth.users`, `auth.sessions`, etc.) in a separate schema. You just need to sign up users and everything works.

## What I've Implemented

I've set up a complete authentication flow for your wscrape application using Supabase. Here's what's now working:

### ✅ Features Implemented

1. **Login Page** (`/login`)
   - Email/password authentication
   - Google OAuth sign-in
   - "Forgot password?" link
   - Redirects to dashboard on successful login
   - Redirects to dashboard if already logged in

2. **Signup Page** (`/signup`)
   - Email/password registration with password confirmation
   - Google OAuth sign-up
   - Email confirmation message
   - Redirects to dashboard if already logged in

3. **Forgot Password Flow** (`/forgot-password`)
   - Send password reset email
   - Password reset page (`/reset-password`)
   - Confirms password update and redirects to login

4. **Protected Routes**
   - Dashboard is now protected - requires authentication
   - Unauthenticated users are redirected to `/login`
   - Loading state while checking authentication

5. **Homepage Redirect**
   - Logged-in users visiting homepage are automatically redirected to dashboard
   - Logged-out users see the landing page

6. **Logout Functionality**
   - Logout button in Profile section
   - Properly clears session and redirects to homepage

## Authentication Flow

### For New Users:
1. Visit homepage → Click "Get started" → Signup page
2. Create account with email/password or Google
3. Automatic redirect to dashboard

### For Existing Users:
1. Visit homepage → Click "Get started" → Login page
2. Sign in with email/password or Google
3. Automatic redirect to dashboard

### For Logged-in Users:
- Homepage automatically redirects to dashboard
- Dashboard accessible directly
- Logout from Profile section

## Required Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qwteebuimebslzzqzgrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dGVlYnVpbWVic2x6enF6Z3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODI3NzMsImV4cCI6MjA3NjA1ODc3M30.KQA_dczij6ZbP2F2MOj90O4e1z044GTrCwz_DPNKB3Q

# Apify Configuration (already set up)
APIFY_API_TOKEN=your_apify_token_here

# OpenAI Configuration (if needed)
OPENAI_API_KEY=your_openai_key_here
```

## Supabase Configuration

### Email Authentication
Email/password authentication should work out of the box with your Supabase project.

### Google OAuth Setup (Optional)
To enable Google sign-in, you need to:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Get Google OAuth credentials:
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Create a new project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase
6. Save the configuration

### Email Confirmation (Optional)
By default, Supabase requires email confirmation. To disable for testing:

1. Go to **Authentication** → **Settings** in Supabase
2. Under **Email Auth**, toggle **Enable email confirmations** to OFF
3. Save changes

## Testing the Flow

**The dev server is already running!**

1. **Test signup:**
   - Go to http://localhost:3000
   - Click "Get started"
   - Click "Sign up"
   - Create an account (use any email, even fake ones work for testing)
   - Check if redirected to dashboard
   - Go to Profile to see your account info

3. **Test login:**
   - Logout from Profile
   - Go to homepage
   - Click "Get started"
   - Login with your credentials
   - Check if redirected to dashboard

4. **Test protected routes:**
   - Logout
   - Try to access http://localhost:3000/dashboard directly
   - Should redirect to login

5. **Test password reset:**
   - Go to login
   - Click "Forgot password?"
   - Enter your email
   - Check email for reset link

## Files Modified

### New Files:
- `/components/ProtectedRoute.tsx` - Protected route wrapper component
- `/app/forgot-password/page.tsx` - Forgot password page
- `/app/reset-password/page.tsx` - Reset password page

### Updated Files:
- `/app/page.tsx` - Added redirect for logged-in users
- `/app/dashboard/page.tsx` - Wrapped with ProtectedRoute
- `/app/login/page.tsx` - Added Google OAuth, redirect logic
- `/app/signup/page.tsx` - Added password confirmation, Google OAuth, redirect logic
- `/components/dashboard/Profile.tsx` - Updated logout to use router
- `/lib/supabase.ts` - Already configured (client-side)

## Next Steps

1. **Create `.env.local`** with the Supabase credentials above
2. **Restart your dev server** after adding env vars
3. **Test the authentication flow**
4. **(Optional) Set up Google OAuth** following the steps above
5. **(Optional) Configure email templates** in Supabase for better UX

## Troubleshooting

### "supabaseUrl is required" error:
- Make sure `.env.local` exists with correct variables
- Restart dev server after creating `.env.local`
- Variables must start with `NEXT_PUBLIC_` for client-side access

### Redirects not working:
- Clear browser cache and cookies
- Check browser console for errors
- Make sure all imports are correct

### Email not sending:
- Check Supabase email settings
- For development, check Supabase Dashboard → Authentication → Users for confirmation links
- Consider disabling email confirmation for testing

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase Dashboard → Logs
3. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

