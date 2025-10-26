# 🔧 Fix: Google OAuth "redirect_uri_mismatch" Error

## ❌ Problem
```
Error 400: redirect_uri_mismatch
```

## ✅ Solution: Add ALL Redirect URIs

Google needs to know **all possible redirect URIs** your app uses.

---

## 📝 Step 1: Go to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID:
   - **Name**: wscrape-app
   - **Client ID**: `336609450383-urvveqap6f4dfe6l89u4i89jq7646phj`

---

## 📝 Step 2: Add These Authorized Redirect URIs

Click **"+ ADD URI"** and add **ALL** of these:

### For Local Development:
```
http://localhost:3000/auth/callback
```

### For Production:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### If Using Custom Domain:
```
https://wscrape.com/auth/callback
```

---

## 📝 Step 3: Add Authorized JavaScript Origins

While you're there, also update **Authorized JavaScript origins** to include:

### For Local Development:
```
http://localhost:3000
```

### For Production:
```
https://wscrape.com
```

---

## 📝 Step 4: Save and Wait

1. Click **"SAVE"**
2. Wait **5-10 minutes** for changes to propagate
3. Try signing in with Google again

---

## 🔍 Alternative: Check Supabase Redirect URL

The error might be because Supabase uses a different redirect URL.

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/qwteebuimebslzzqzgrs
2. Navigate to: **Authentication** → **URL Configuration**
3. Check the "Site URL" and "Redirect URLs"
4. Copy the exact redirect URL and add it to Google Cloud Console

---

## 🎯 Complete List of URIs to Add

Add these in Google Cloud Console under **Authorized redirect URIs**:

```
http://localhost:3000/auth/callback
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
https://wscrape.com/auth/callback
```

And under **Authorized JavaScript origins**:

```
http://localhost:3000
https://wscrape.com
```

---

## ✅ Quick Test

After adding the URIs and waiting 5-10 minutes:

1. Go to: http://localhost:3000/signup
2. Click: "Sign up with Google"
3. Should work! ✅

---

## 📝 Notes

- **Don't add a trailing slash** to the URIs
- **Wait 5-10 minutes** after saving for changes to take effect
- Make sure the URIs match **exactly** (including http vs https)
- Check for typos in the URIs

---

## 🔍 Still Not Working?

If it still doesn't work after 10 minutes:

1. Check the exact error in the browser console
2. Look at the "redirect_uri_mismatch" error details
3. Google will show you what URI it received - add that exact URI
4. Make sure your Supabase Site URL is set correctly

