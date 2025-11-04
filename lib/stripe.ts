import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  priceId: process.env.STRIPE_PRICE_ID!, // $29.99 monthly subscription
};

// Helper function to create or get Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const { createServerSupabaseClient } = await import('./supabase-server');
  const supabase = createServerSupabaseClient();
  
  // Check if customer already exists
  const { data: existing, error } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  // Handle case where no subscription exists (error is OK here)
  if (error && !error.message?.includes('No rows')) {
    console.error('Subscription check error:', error);
  }

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // Save to database
  await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      stripe_customer_id: customer.id,
    });

  return customer.id;
}

// Helper function to check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { createServerSupabaseClient } = await import('./supabase-server');
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('stripe_status, current_period_end, premium_access')
    .eq('user_id', userId)
    .single();

  // Handle case where no subscription exists (error is OK here)
  if (error && !error.message?.includes('No rows')) {
    console.error('Subscription check error:', error);
    return false;
  }

  if (!data) return false;

  // Check if user has premium_access (manual premium grant)
  if (data.premium_access === true) {
    return true;
  }

  // Check if Stripe subscription is active and not expired
  const isActive = ['active', 'trialing'].includes(data.stripe_status);
  const notExpired = data.current_period_end 
    ? new Date(data.current_period_end) > new Date() 
    : false;

  return isActive && notExpired;
}

