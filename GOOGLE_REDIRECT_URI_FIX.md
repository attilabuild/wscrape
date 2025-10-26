# 🔧 Fix Google OAuth Redirect URI Error

## ⚠️ Current Error
```
Error 400: redirect_uri_mismatch
redirect_uri: https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

## ✅ Solution: Add the Exact Redirect URI

You need to add the EXACT redirect URI that Google is showing in the error message.

---

## 📝 Step-by-Step Fix

### Step 1: Go to Google Cloud Console
URL: https://console.cloud.google.com/apis/credentials

### Step 2: Edit Your OAuth Client
1. Find your OAuth 2.0 Client ID
2. Client ID: `336609450383-urvveqap6f4dfe6l89u4i89jq7646phj`
3. Click on it to edit

### Step 3: Add the Redirect URI

In the **"Authorized redirect URIs"** section, click **"+ ADD URI"** and add:

```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

⚠️ **IMPORTANT**: 
- Copy this URL **EXACTLY** as shown
- NO trailing slash
- NO spaces
- Must match exactly what Google is expecting

### Step 4: Save Changes
1. Click **"SAVE"**
2. Wait **5-10 minutes** for changes to take effect

---

## 📋 Complete List of URIs to Add

Add ALL of these redirect URIs:

### For Supabase (REQUIRED):
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### For Local Development:
```
http://localhost:3000/auth/callback
```

### For Production (if you have a custom domain):
```
https://wscrape.com/auth/callback
```

---

## ⏰ After Adding

1. **Wait 5-10 minutes** for changes to propagate
2. **Clear your browser cache** or use incognito mode
3. **Try signing in again** with Google

---

## 🔍 Why This Error Happens

Google OAuth is **very strict** about redirect URIs. They must match **exactly** what you register in Google Cloud Console.

The error shows Google is receiving:
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

But this URI is NOT in your list of authorized redirect URIs in Google Cloud Console.

---

## ✅ Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Found your OAuth Client ID
- [ ] Clicked "+ ADD URI"
- [ ] Added: `https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback`
- [ ] Clicked "SAVE"
- [ ] Waited 5-10 minutes
- [ ] Tested Google sign-in again

---

## 🆘 Still Not Working?

If you still get the error after 10 minutes:

1. **Double-check the URI** - Copy it EXACTLY from the error message
2. **Check for typos** - Even one character off will fail
3. **Try in incognito mode** - Cache might be preventing the update
4. **Wait longer** - Sometimes takes up to 15 minutes

The redirect URI from the error message MUST be in your Google Cloud Console!

