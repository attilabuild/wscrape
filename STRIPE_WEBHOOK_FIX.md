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

### 4. Verify Webhook Secret
Ensure `STRIPE_WEBHOOK_SECRET` environment variable is set correctly:
- For **live mode**: Use the webhook signing secret from Stripe Dashboard (starts with `whsec_`)
- For **test mode**: Use the test webhook signing secret

### 5. Test Manually
After updating the webhook URL in Stripe:
1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Check if it succeeds (should show 200 OK)

## Current Status
The webhook handler code is correct and properly configured. The issue is purely with the webhook URL configuration in Stripe Dashboard or hosting redirects.

