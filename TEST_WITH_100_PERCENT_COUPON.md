# Test Stripe Subscription with 100% Coupon

## Create a 100% Off Coupon in Stripe

### Step 1: Create the Coupon
1. Go to **Stripe Dashboard** → **Products** → **Coupons**
2. Click **"+ New"** or **"Create coupon"**
3. Fill in the form:
   - **Name**: `TEST100` or `FREE_TEST`
   - **Discount type**: Percentage
   - **Percent off**: `100`
   - **Duration**: One time (or "Forever" if testing multiple purchases)
   - **Code**: `TEST100` (or any code you want)
4. Click **"Create coupon"**

### Step 2: Test the Subscription Flow

Now you can test with a real card without being charged:

1. Go to **https://wscrape.com/pricing**
2. Click **"Subscribe Now"**
3. When redirected to Stripe Checkout:
   - **Enter real card details** (your card won't be charged with 100% off coupon)
   - **Enter the promo code**: `TEST100`
4. Complete the checkout
5. Check that:
   - You're redirected back to dashboard
   - Subscription is created in Stripe Dashboard
   - You have access to premium features

### Step 3: Verify in Stripe Dashboard

1. Go to **Stripe Dashboard** → **Customers**
2. Find your customer (your email)
3. Check the subscription:
   - Status should be "Active"
   - Amount charged should be $0.00
   - Next billing date should show correctly

### Step 4: Cancel or Keep

You can either:
- **Cancel immediately** in Stripe Dashboard to end the subscription
- **Keep it** for ongoing testing (it will stay at $0/month)

## Benefits of This Approach

✅ Test with REAL card numbers (no fake cards)  
✅ No money changes hands (100% off)  
✅ Tests the COMPLETE flow (webhooks, database updates, etc.)  
✅ Safe to test repeatedly  
✅ Can test with real email/payment details  

## Other Coupon Options

You can also create:
- **50% off**: Test pricing display
- **Free trial**: Set duration to "Once" for a free month
- **Multiple codes**: TEST1, TEST2, etc. for different scenarios

## Troubleshooting

**Coupon not applying?**
- Check the coupon is active (not expired)
- Verify you're entering the code correctly
- Make sure the coupon is compatible with your price ID

**Still getting charged?**
- Double-check coupon is 100% off
- Verify coupon is applied before completing checkout
- Check Stripe logs for any errors

## Recommended Test Workflow

1. Create coupon: `TEST100` (100% off, one time)
2. Subscribe with your real card using the coupon
3. Verify subscription is created and active
4. Test all premium features work correctly
5. Cancel subscription in Stripe Dashboard
6. Test that premium access is revoked after cancellation

This gives you confidence the entire subscription system works end-to-end!
