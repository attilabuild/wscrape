# Stripe Integration Setup Guide

## 🎯 Overview

This guide will walk you through setting up Stripe payments for your wscrape application with a **$29.99/month subscription** that gates access to the dashboard.

---

## 📋 Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a new Stripe account
3. Complete the email verification
4. You'll start in **Test Mode** (perfect for development)

---

## 💳 Step 2: Create Product and Price in Stripe

### Option A: Using Stripe Dashboard (Recommended)

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add product**
3. Fill in the details:
   - **Name**: wscrape Pro
   - **Description**: Professional social media analytics and content generation
   - **Pricing**: Recurring
   - **Price**: $29.99 USD
   - **Billing period**: Monthly
4. Click **Add product**
5. **COPY THE PRICE ID** (starts with `price_...`) - you'll need this for the env variables

### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Create product
stripe products create \
  --name="wscrape Pro" \
  --description="Professional social media analytics and content generation"

# Create price (replace PRODUCT_ID with the ID from previous command)
stripe prices create \
  --product=PRODUCT_ID \
  --unit-amount=2999 \
  --currency=usd \
  --recurring='{"interval":"month"}'
```

---

## 🔑 Step 3: Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

---

## 🌐 Step 4: Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Development**: `http://localhost:3000/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Click **Select events** and choose these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **COPY THE SIGNING SECRET** (starts with `whsec_...`)

### For Local Development with Stripe CLI

Instead of exposing localhost, use Stripe CLI:

```bash
# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret (whsec_...)
```

---

## 🔧 Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID=price_your_price_id_here

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Your existing OpenAI API key
OPENAI_API_KEY=your_openai_api_key
```

### Production Environment Variables

For production, update these in your deployment platform (Vercel, etc.):

```env
# Use LIVE keys (pk_live_... and sk_live_...)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_PRICE_ID=price_your_live_price_id
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🗄️ Step 6: Set Up Database

Run the updated schema in your Supabase SQL Editor:

```bash
# The schema is already updated in supabase-schema.sql
# Just run it in Supabase SQL Editor or use the Supabase CLI:
```

Go to your Supabase project → SQL Editor → Paste and run the contents of `supabase-schema.sql`

This will create the `user_subscriptions` table with all necessary columns and indexes.

---

## 🧪 Step 7: Test the Integration

### Test Mode Testing (Recommended First)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Create a test user account in your app

4. Go to `/pricing` and click "Subscribe Now"

5. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires 3DS**: `4000 0025 0000 3155`
   - **CVV**: Any 3 digits
   - **Date**: Any future date
   - **ZIP**: Any 5 digits

6. Complete the checkout

7. Check that:
   - ✅ You're redirected to `/dashboard?success=true`
   - ✅ The webhook event is received (check terminal with stripe listen)
   - ✅ Subscription is created in Supabase `user_subscriptions` table
   - ✅ You can access the dashboard
   - ✅ Billing page shows subscription details

### Test Subscription Cancellation

1. Go to Billing page in your app
2. Click "Manage Subscription"
3. Cancel the subscription in Stripe portal
4. Check that you're redirected to `/pricing` on next page load

---

## 🚀 Step 8: Go Live

### Prerequisites

Before switching to live mode:

1. ✅ Complete Stripe account verification (identity verification)
2. ✅ Add bank account for payouts
3. ✅ Test thoroughly in test mode
4. ✅ Set up production webhook endpoint
5. ✅ Configure live environment variables

### Switch to Live Mode

1. In Stripe Dashboard, toggle to **Live mode** (top right)
2. Get your LIVE API keys (Developers → API keys)
3. Create the same product/price in live mode
4. Set up webhook for production URL
5. Update environment variables in your production deployment
6. Deploy to production

---

## 🎨 Step 9: Configure Stripe Branding (Optional)

1. Go to **Settings** → **Branding**
2. Upload your logo
3. Set brand colors
4. These will appear in Checkout and Customer Portal

---

## 📊 Monitoring Your Subscriptions

### Stripe Dashboard

- **Payments**: View all payments
- **Subscriptions**: Monitor active subscriptions
- **Customers**: View customer details
- **Revenue**: Track monthly recurring revenue (MRR)

### Your Application

Users can manage their subscriptions through:
- `/dashboard/billing` - View subscription status
- Stripe Customer Portal - Manage payment methods, view invoices, cancel subscription

---

## 🔒 Security Best Practices

1. ✅ **Never expose secret keys** - Only use them server-side
2. ✅ **Validate webhook signatures** - Already implemented in the webhook route
3. ✅ **Use HTTPS in production** - Required for webhooks
4. ✅ **Enable Row Level Security** - Already configured in Supabase
5. ✅ **Monitor webhook delivery** - Check Stripe Dashboard → Developers → Webhooks

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint URL is correct
2. Ensure server is running and accessible
3. Check Stripe CLI is forwarding (for local dev)
4. Verify webhook secret in `.env.local`

### User Can't Access Dashboard

1. Check `user_subscriptions` table has entry
2. Verify `stripe_status` is 'active' or 'trialing'
3. Check `current_period_end` is in the future
4. Check browser console for errors

### Checkout Session Not Creating

1. Verify `STRIPE_SECRET_KEY` is set correctly
2. Check `STRIPE_PRICE_ID` is correct
3. Ensure user is authenticated
4. Check server logs for errors

### Test Card Not Working

1. Ensure you're in **Test Mode** in Stripe Dashboard
2. Use test API keys (pk_test_... and sk_test_...)
3. Try different test card numbers from [Stripe Testing Docs](https://stripe.com/docs/testing)

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

---

## ✅ Setup Checklist

- [ ] Created Stripe account
- [ ] Created product and price in Stripe
- [ ] Copied API keys (publishable and secret)
- [ ] Set up webhook endpoint
- [ ] Configured environment variables in `.env.local`
- [ ] Ran updated database schema in Supabase
- [ ] Tested checkout flow with test cards
- [ ] Verified webhook events are received
- [ ] Tested subscription shows in dashboard
- [ ] Tested billing page subscription management
- [ ] Tested access control (no subscription = redirected to pricing)
- [ ] Ready for production deployment

---

## 🎉 You're All Set!

Your Stripe integration is complete! Users will now need an active $29.99/month subscription to access your dashboard and all its features.

**Flow Summary:**
1. User signs up → Redirected to `/pricing`
2. User subscribes → Stripe Checkout
3. Payment successful → Webhook creates subscription in DB
4. User redirected to `/dashboard` → Access granted
5. User can manage subscription in `/dashboard/billing`

