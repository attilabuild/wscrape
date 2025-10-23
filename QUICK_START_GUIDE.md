# 🚀 Quick Start Guide - Testing Your Stripe Integration

## ✅ Checklist Before Testing

### 1. Environment Variables Set?
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard → Developers → API Keys
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard → Developers → API Keys
- [ ] `STRIPE_PRICE_ID` - From your created product (price_...)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your existing Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your existing Supabase key
- [ ] `OPENAI_API_KEY` - Your existing OpenAI key

### 2. Database Migration Run?
- [ ] Ran `stripe-subscription-migration.sql` in Supabase SQL Editor
- [ ] Table `user_subscriptions` created successfully

### 3. Stripe Product Created?
- [ ] Created product "wscrape Pro" in Stripe
- [ ] Set price to $29.99/month
- [ ] Copied Price ID

---

## 🧪 Testing Flow (Without Webhooks First)

Since we don't have webhooks set up yet, let's test the checkout flow:

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Test the Pricing Page
1. Open: http://localhost:3000/pricing
2. You should see:
   - ✅ Beautiful pricing page
   - ✅ $29.99/month price
   - ✅ List of features
   - ✅ "Subscribe Now" button

### Step 3: Test Checkout Flow
1. Click **"Subscribe Now"**
2. Should redirect to Stripe Checkout
3. Use Stripe test card:
   - **Card**: `4242 4242 4242 4242`
   - **Date**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)
   - **Email**: Any email
4. Click "Subscribe"

### Step 4: What Happens?
- ✅ Payment will succeed
- ❌ **BUT** you'll be redirected back without subscription active
- **Why?** Webhooks aren't set up yet, so the database doesn't get updated

---

## 🔧 Setting Up Webhooks (Complete the Integration)

### Option 1: Install Stripe CLI Manually (Recommended for Local Dev)

Download and install manually:
```bash
# Download
curl -L -o stripe.tar.gz https://github.com/stripe/stripe-cli/releases/download/v1.31.0/stripe_1.31.0_mac-os_arm64.tar.gz

# Extract
tar -xzf stripe.tar.gz

# Move to a directory in your PATH (requires password)
sudo mv stripe /usr/local/bin/stripe

# Verify installation
stripe --version
```

Then:
```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (whsec_...) and update .env.local
```

### Option 2: Deploy First, Then Set Up Webhooks

1. Deploy your app to Vercel/production
2. In Stripe Dashboard:
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (whsec_...)
   - Add to your production environment variables

---

## ✅ Full Testing (With Webhooks)

Once webhooks are set up:

### Test Flow:
1. **Sign Up**: Create a new account
2. **Redirected**: Should go to `/pricing`
3. **Subscribe**: Click "Subscribe Now"
4. **Checkout**: Complete payment with test card
5. **Webhook**: Fires and creates subscription in database
6. **Redirect**: Back to `/dashboard?success=true`
7. **Access Granted**: Can now use all dashboard features! 🎉

### Verify:
- Check Supabase `user_subscriptions` table for new entry
- Billing page shows active subscription
- Can access all dashboard features

---

## 🧪 Test Cases to Try

### ✅ Happy Path
- [ ] New user signs up → Redirected to pricing
- [ ] User subscribes → Checkout succeeds
- [ ] User redirected to dashboard → Has access
- [ ] Billing page shows subscription details

### ✅ Access Control
- [ ] User without subscription → Can't access dashboard
- [ ] User with subscription → Can access dashboard
- [ ] Subscription expires → Access revoked

### ✅ Subscription Management
- [ ] User can open Stripe Customer Portal
- [ ] User can update payment method
- [ ] User can view invoices
- [ ] User can cancel subscription

---

## 🎯 Quick Commands Reference

```bash
# Start dev server
npm run dev

# Run Stripe CLI webhook forwarding (after installing CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# View Stripe logs
stripe logs tail

# Test webhook manually
stripe trigger checkout.session.completed
```

---

## 🔍 Troubleshooting

### "Unauthorized" Error
- Check Supabase keys in `.env.local`
- Make sure user is logged in

### Checkout Doesn't Open
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check `STRIPE_PRICE_ID` matches your product
- Check browser console for errors

### No Access After Payment
- Webhooks not set up yet (see above)
- Check Stripe Dashboard → Webhooks for delivery status
- Check Supabase table for subscription entry

### Can't Access Dashboard
- Check `user_subscriptions` table in Supabase
- Verify subscription status is "active" or "trialing"
- Check `current_period_end` is in the future

---

## 📚 Next Steps

1. ✅ Test pricing page works
2. ✅ Test checkout flow
3. ✅ Set up webhooks (Option 1 or 2 above)
4. ✅ Complete full test with subscription creation
5. ✅ Test subscription management features
6. 🚀 Deploy to production!

---

## 🎉 You're Ready!

Once webhooks are working, your Stripe integration is complete! Users will need an active $29.99/month subscription to access your dashboard.

**Need help?** Check:
- `STRIPE_SETUP_GUIDE.md` - Detailed setup
- `STRIPE_IMPLEMENTATION_SUMMARY.md` - Technical overview
- [Stripe Testing Docs](https://stripe.com/docs/testing)

