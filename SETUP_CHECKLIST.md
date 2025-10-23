# ✅ Google OAuth Setup Checklist

Copy and paste these URLs as you go through the setup:

---

## 📋 Part 1: Google Cloud Console

### URL to Visit:
```
https://console.cloud.google.com/apis/credentials
```

### Steps:
- [ ] Click "+ CREATE CREDENTIALS"
- [ ] Select "OAuth client ID"
- [ ] If needed: Configure consent screen (app name + email)
- [ ] Choose "Web application"
- [ ] Name: `wscrape OAuth Client`

### Authorized JavaScript origins (copy/paste):
```
http://localhost:3000
```

### Authorized redirect URIs (copy/paste):
```
https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
```

### After Creating:
- [ ] Copy the **Client ID** → _______________________
- [ ] Copy the **Client Secret** → _______________________

---

## 📋 Part 2: Supabase Dashboard

### Enable Google Provider:
```
https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/providers
```

### Steps:
- [ ] Find "Google" in the list
- [ ] Toggle it **ON**
- [ ] Paste **Client ID** from Google Console
- [ ] Paste **Client Secret** from Google Console
- [ ] Click **"Save"**

---

### Configure URLs:
```
https://app.supabase.com/project/qwteebuimebslzzqzgrs/auth/url-configuration
```

### Site URL (copy/paste):
```
http://localhost:3000
```

### Redirect URLs (copy/paste both):
```
http://localhost:3000/dashboard
http://localhost:3000/*
```

### Steps:
- [ ] Set Site URL
- [ ] Add both Redirect URLs
- [ ] Click **"Save"**

---

## 📋 Part 3: Test

### Commands to run:
```bash
npm run dev
```

### URL to test:
```
http://localhost:3000/login
```

### Steps:
- [ ] Dev server is running
- [ ] Go to login page
- [ ] Click "Sign in with Google"
- [ ] Choose Google account
- [ ] ✅ Redirected to `/dashboard`

---

## 🎉 Done!

If all checkboxes are ticked, your Google OAuth is working!

---

## 🆘 If Something's Wrong

1. **"Redirect URI mismatch"**
   → Double-check the callback URL in Google Console:
   ```
   https://qwteebuimebslzzqzgrs.supabase.co/auth/v1/callback
   ```

2. **"Access blocked"**
   → Configure OAuth consent screen in Google Console

3. **Not redirecting**
   → Check Site URL in Supabase is set to: `http://localhost:3000`

4. **Still stuck?**
   → Check browser console for errors
   → Check Supabase logs: Authentication → Logs
   → Make sure all URLs match EXACTLY (no trailing slashes)

---

**Time to complete**: ~5 minutes
**Difficulty**: Easy
**Result**: One-click Google login! 🚀

