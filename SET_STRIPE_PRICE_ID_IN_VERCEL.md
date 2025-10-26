# Fix Stripe Price ID Error in Vercel

## Error
"No such price: 'price_YOUR_ACTUAL_PRICE_ID_HERE'"

## Cause
The Vercel environment variable `STRIPE_PRICE_ID` is set to the placeholder value instead of your actual Stripe price ID.

## Solution

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Find `STRIPE_PRICE_ID` and update it to:
   ```
   price_1SITd0B6ArUEh15JHgG1xIu8
   ```

3. **Redeploy** your project (or it will auto-redeploy if configured)

## Alternative: Create a New Price in Stripe

If the price ID above doesn't exist in your Stripe account:

1. Go to **Stripe Dashboard** → **Products** → **Create Product**
2. Name: "wscrape Premium"
3. Price: $29.99
4. Billing period: Monthly
5. Copy the new Price ID
6. Update `STRIPE_PRICE_ID` in Vercel with the new price ID
7. Redeploy

## Verify

After setting the correct price ID:
- Go to https://wscrape.com/pricing
- Click "Subscribe Now"
- You should be redirected to Stripe Checkout instead of seeing an error
