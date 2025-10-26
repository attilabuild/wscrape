# 🔗 Stripe Webhook Setup Guide

This guide will help you set up Stripe webhooks for your wscrape application.

## 📋 Prerequisites

- Stripe account with API keys
- Local development server running on `localhost:3000`
- Stripe CLI installed (for local development)

---

## 🚀 Option 1: Local Development (Using Stripe CLI)

### Step 1: Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download latest version
curl -L https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.31.0_linux_amd64.tar.gz -o stripe.tar.gz
tar -xzf stripe.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Download the installer from: https://github.com/stripe/stripe-cli/releases

### Step 2: Login to Stripe
```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### Step 3: Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Webhook Secret to Environment Variables

Copy the webhook signing secret (`whsec_...`) and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Restart Your Development Server
```bash
npm run dev
```

---

## 🌐 Option 2: Production Setup (Vercel/Deployed)

### Step 1: Deploy Your Application

Deploy to Vercel or your hosting platform:
```bash
vercel deploy
```

### Step 2: Get Your Production URL

Your webhook endpoint will be:
```
https://yourdomain.com/api/webhooks/stripe
```

### Step 3: Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
5. Select the following events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**

### Step 4: Copy Webhook Signing Secret

1. In the webhook endpoint page, click **"Reveal"** next to "Signing secret"
2. Copy the signing secret (starts with `whsec_...`)
3. Add it to your production environment variables:
   - In Vercel: Project → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET` = `whsec_...`

### Step 5: Redeploy (If Needed)

```bash
vercel --prod
```

---

## ✅ Testing Your Webhook Setup

### Test Webhook Delivery (Local)

With Stripe CLI running (`stripe listen`), trigger a test event:

```bash
stripe trigger checkout.session.completed
```

You should see the event appear in your terminal and be forwarded to your local server.

### Test Full Subscription Flow

1. **Start local server**: `npm run dev`
2. **Start Stripe CLI**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. **Visit**: http://localhost:3000/pricing
4. **Click**: "Subscribe Now"
5. **Use test card**: `4242 4242 4242 4242`
6. **Complete checkout**
7. **Verify**: Check your server logs for webhook events
8. **Verify**: Check Supabase `user_subscriptions` table for new entry

---

## 🔍 Webhook Events Handled

Your application handles these Stripe webhook events:

| Event | Handler | Purpose |
|-------|---------|---------|
| `checkout.session.completed` | `handleCheckoutCompleted` | Creates subscription when checkout completes |
| `customer.subscription.created` | `handleSubscriptionUpdated` | Updates subscription when created |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Updates subscription status/period |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Marks subscription as canceled |
| `invoice.payment_succeeded` | `handlePaymentSucceeded` | Updates subscription period on payment |
| `invoice.payment_failed` | `handlePaymentFailed` | Sets subscription status to `past_due` |

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Webhook endpoint URL is correct
2. Webhook secret matches in environment variables
3. Server is running and accessible
4. Correct events are selected in Stripe Dashboard

### Signature Verification Failed

**Error:** `Invalid signature`

**Fix:**
- Ensure `STRIPE_WEBHOOK_SECRET` environment variable is set
- Make sure the secret matches what Stripe shows in the webhook details
- For local development, use the secret from `stripe listen`

### Database Not Updating

**Check:**
1. Webhook is being received (check server logs)
2. Supabase connection is working
3. `user_subscriptions` table exists
4. Row Level Security (RLS) policies allow inserts/updates

---

## 📝 Environment Variables Checklist

Make sure these are set:

### Local Development (`.env.local`)
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎯 Next Steps

Once webhooks are set up:

1. ✅ Test the full subscription flow
2. ✅ Verify subscription appears in database
3. ✅ Check user can access dashboard
4. ✅ Test subscription cancellation
5. ✅ Test subscription renewal

---

## 📚 Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

