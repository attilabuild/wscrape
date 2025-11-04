# Fixing Stripe Webhook 307 Redirect Errors

## Problem
Stripe webhooks are returning 307 (Temporary Redirect) errors instead of 200 OK responses.

## Root Cause Identified
**The webhook URL in Stripe is configured as:** `https://wscrape.com/api/webhooks/stripe` (no www)
**But the server redirects to:** `https://www.wscrape.com/api/webhooks/stripe` (with www)

This www → non-www (or vice versa) redirect is causing the 307 error!

## Solution

### Fix the Webhook URL in Stripe Dashboard

1. Go to **Stripe Dashboard → Webhooks → Your webhook endpoint**
2. Click **"Edit destination"**
3. Change the **Endpoint URL** from:
   ```
   https://wscrape.com/api/webhooks/stripe
   ```
   To:
   ```
   https://www.wscrape.com/api/webhooks/stripe
   ```
4. Click **"Save"**
5. Test by clicking **"Send test webhook"** - should now show 200 OK instead of 307

**Important:** The URL must match EXACTLY what your server expects. Since your server is redirecting to `www.wscrape.com`, the webhook URL must include `www`.

### 2. Test the Endpoint
Visit `https://www.wscrape.com/api/webhooks/stripe` in your browser. You should see:
```json
{
  "message": "Stripe webhook endpoint is active",
  "instructions": "This endpoint should receive POST requests from Stripe, not GET requests."
}
```

If you get redirected, that's the problem!

### 3. Check Hosting Platform Settings
If using **Vercel**:
- Go to Project Settings → Domains
- Check for any redirect rules
- Ensure the webhook URL domain matches exactly

If using **Cloudflare**:
- Check Page Rules for redirects
- Disable any redirects for `/api/webhooks/*`

If using **other hosting**:
- Check for HTTP to HTTPS redirects
- Check for trailing slash redirects
- Ensure POST requests aren't being redirected

### 4. Fix "Invalid signature" (400 Error)

If you're seeing **400 "Invalid signature"** errors after fixing the redirect:

1. **Get the correct webhook signing secret:**
   - Go to Stripe Dashboard → Webhooks → Your webhook endpoint
   - Find the **"Signing secret"** section
   - Click **"Reveal"** to see the full secret (starts with `whsec_`)
   - Example: `whsec_ArlJS9AUJxjAnsargjFF8FnQGozWLXXu`

2. **Update your environment variable:**
   - In your hosting platform (Vercel, etc.), go to Environment Variables
   - Set `STRIPE_WEBHOOK_SECRET` to the exact signing secret from step 1
   - Make sure there are no extra spaces or quotes
   - **Important:** Use the **live mode** secret if you're in live mode, or the **test mode** secret if you're in test mode

3. **Redeploy your application** after updating the environment variable

4. **Verify the secret matches:**
   - Check your server logs - you should see logs showing the webhook secret (first/last few characters)
   - Compare with the signing secret in Stripe Dashboard
   - They must match exactly

### 5. Test Manually
After updating the webhook URL in Stripe:
1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Check if it succeeds (should show 200 OK)

## Current Status
The webhook handler code is correct and properly configured. The issue is purely with the webhook URL configuration in Stripe Dashboard or hosting redirects.

