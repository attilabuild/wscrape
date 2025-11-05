# Environment Variables Setup

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Supabase Service Role Key:**
   - Open `.env.local` in your editor
   - Replace `your-service-role-key-here` with your actual service role key:
     ```
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dGVlYnVpbWVic2x6enF6Z3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ4Mjc3MywiZXhwIjoyMDc2MDU4NzczfQ.7KvJMN2FVlNCwfyD9ixKhwLSSeAXYxP6DNtxgD_wOC0
     ```
   - **Important:** Make sure there are NO spaces around the `=` sign
   - **Important:** Make sure the key is on a single line (no line breaks)

3. **Add other required variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret
   - `APIFY_API_KEY` - Your Apify API key

## For Production (Vercel/Other Hosting)

1. Go to your hosting platform's environment variables settings
2. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key
3. Make sure all other required environment variables are also set
4. Redeploy your application

## Security Notes

⚠️ **CRITICAL:** The service role key bypasses all Row Level Security (RLS) policies!
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Never expose the service role key in client-side code
- Only use it in server-side API routes
- Rotate the key if it's ever exposed

## Verify It's Working

After setting up the environment variable, restart your development server and check the logs. You should see:
```
✅ Service client created successfully
```

If you see errors, double-check:
1. The key is correct (220 characters, starts with `eyJ`)
2. No extra spaces or quotes around the value
3. The key is on a single line
