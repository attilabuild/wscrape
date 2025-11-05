# Environment Variables Setup

## Required Environment Variables

Set these in your production environment (Vercel, etc.):

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (SECRET - keep private!)

### Stripe
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_live_` or `rk_live_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_live_`)
- `STRIPE_PRICE_ID` - Your Stripe price ID (starts with `price_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)

### Other
- `NEXT_PUBLIC_APP_URL` - Your app URL (should be `https://www.wscrape.com` for production)
- `OPENAI_API_KEY` - OpenAI API key
- `APIFY_API_KEY` - Apify API key

## Important Notes

1. **NEXT_PUBLIC_APP_URL** should be set to `https://www.wscrape.com` (not `http://wscrape.com`)
2. **SUPABASE_SERVICE_ROLE_KEY** is critical for webhooks - make sure it's set correctly
3. Never commit these values to git
4. After setting environment variables, redeploy your application

## Verification

After setting these variables, check:
1. Webhooks should return 200 OK (not 500 errors)
2. Subscriptions should be saved to the database after payment
3. Users should have premium access after successful payment

