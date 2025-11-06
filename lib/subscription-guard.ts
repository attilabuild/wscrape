/**
 * Server-side subscription validation
 * This CANNOT be bypassed by client-side manipulation
 */

import { createServerSupabaseClient } from './supabase-server';

export interface SubscriptionStatus {
  isActive: boolean;
  status?: string;
  periodEnd?: string;
}

/**
 * Verify user has active subscription (SERVER-SIDE ONLY)
 * This runs on the server and cannot be bypassed by client
 */
export async function verifyActiveSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    // Check if service role key is available
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Service role key exists:', !!serviceKey);
    
    // Create server-side Supabase client WITH SERVICE ROLE KEY (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    console.log('Checking subscription for user:', userId);
    
    // Query subscription from database
    // Use maybeSingle() instead of single() to handle "no rows" gracefully
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_status, current_period_end, cancel_at_period_end, premium_access')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Subscription query result:', { subscription, error });

    if (error) {
      console.log('Subscription query error:', error);
      
      // Check if error is invalid API key - this is a configuration issue
      if (error.message?.includes('Invalid API key')) {
        console.error('⚠️ CRITICAL: Invalid Supabase service role key!');
        console.error('Please check your SUPABASE_SERVICE_ROLE_KEY in environment variables.');
        console.error('Get the correct key from: Supabase Dashboard → Project Settings → API → service_role key');
        // Return false but log the issue clearly
        return { isActive: false };
      }
      
      // If error is because no row exists, that's OK
      if (error.message?.includes('No rows')) {
        console.log('No subscription row found for user (this is OK for new users)');
        return { isActive: false };
      }
      
      // Other errors - return false
      console.error('Unexpected subscription query error:', error);
      return { isActive: false };
    }

    if (!subscription) {
      console.log('No subscription found for user');
      return { isActive: false };
    }

    console.log('Raw subscription data:', JSON.stringify(subscription));

    // Check if user has manual premium access (granted without subscription)
    if (subscription.premium_access === true || subscription.premium_access === 'true') {
      console.log('User has premium_access enabled');
      return {
        isActive: true,
        status: 'premium',
        periodEnd: subscription.current_period_end || '2099-12-31'
      };
    }

    // Check if subscription is active
    const isActiveStatus = ['active', 'trialing'].includes(subscription.stripe_status);
    
    // Check if not expired
    let notExpired = false;
    if (subscription.current_period_end) {
      const periodEndDate = new Date(subscription.current_period_end);
      const now = new Date();
      notExpired = periodEndDate > now;
      
      console.log('Period end check:', {
        periodEnd: periodEndDate.toISOString(),
        now: now.toISOString(),
        differenceMs: periodEndDate.getTime() - now.getTime(),
        differenceDays: (periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        notExpired
      });
    } else {
      console.log('⚠️ No current_period_end date found - cannot check expiration');
      // If no period_end but status is active, still allow (might be newly created)
      if (isActiveStatus) {
        console.log('✅ Status is active/trialing but no period_end - allowing access');
        notExpired = true;
      }
    }

    const isActive = isActiveStatus && notExpired;
    
    console.log('Subscription status check:', { 
      isActive, 
      stripe_status: subscription.stripe_status, 
      notExpired, 
      premium_access: subscription.premium_access,
      hasPeriodEnd: !!subscription.current_period_end
    });

    // If subscription exists but is not active, log detailed info for debugging
    if (!isActive && subscription) {
      console.error('❌ Subscription check failed:', {
        userId,
        stripe_status: subscription.stripe_status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        isActiveStatus,
        notExpired
      });
    }

    return {
      isActive,
      status: subscription.stripe_status,
      periodEnd: subscription.current_period_end,
    };
  } catch (error) {
    console.log('Error in subscription check:', error);
    return { isActive: false };
  }
}

/**
 * Middleware-like function to protect API routes
 * Use this at the start of every protected API route
 */
export async function requireActiveSubscription(userId: string | null): Promise<{
  authorized: boolean;
  error?: string;
  status?: number;
}> {
  // Check if user is authenticated
  if (!userId) {
    return {
      authorized: false,
      error: 'Unauthorized - Please login',
      status: 401,
    };
  }

  // Verify subscription
  const subscription = await verifyActiveSubscription(userId);
  
  // Debug: Log subscription check result
  if (!subscription.isActive) {
    // Give a grace period - check if subscription might be processing
    // If subscription was created/updated recently (within last 30 minutes), allow access
    // This handles the race condition where webhook hasn't processed yet
    const supabase = createServerSupabaseClient();
    const { data: recentSubscription } = await supabase
      .from('user_subscriptions')
      .select('updated_at, created_at, stripe_status, stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (recentSubscription) {
      // If subscription exists with a Stripe subscription ID, allow access
      // This handles cases where webhook saved subscription but with incomplete/incorrect data
      if (recentSubscription.stripe_subscription_id) {
        console.log(`⏳ Subscription exists with Stripe ID (${recentSubscription.stripe_subscription_id}) - allowing access (may need webhook update)`, {
          status: recentSubscription.stripe_status,
          updatedAt: recentSubscription.updated_at,
          createdAt: recentSubscription.created_at
        });
        return { authorized: true };
      }
      
      // If subscription exists at all, check if it's recent
      const updatedAt = recentSubscription.updated_at ? new Date(recentSubscription.updated_at) : null;
      const createdAt = recentSubscription.created_at ? new Date(recentSubscription.created_at) : null;
      const mostRecent = updatedAt || createdAt;
      
      if (mostRecent) {
        const minutesAgo = (Date.now() - mostRecent.getTime()) / (1000 * 60);
        if (minutesAgo < 30) {
          console.log(`⏳ Subscription recently created/updated (${minutesAgo.toFixed(1)} min ago) - allowing access during grace period`, {
            status: recentSubscription.stripe_status,
            subscriptionId: recentSubscription.stripe_subscription_id
          });
          return { authorized: true };
        }
      }
      
      // If subscription exists but is older than 30 minutes and no Stripe ID, log detailed info
      console.warn('⚠️ Subscription exists but is not active and outside grace period:', {
        status: recentSubscription.stripe_status,
        updatedAt: recentSubscription.updated_at,
        createdAt: recentSubscription.created_at,
        subscriptionId: recentSubscription.stripe_subscription_id
      });
    } else {
      // No subscription record exists at all - this means webhook completely failed
      console.warn(`⚠️ No subscription record found for user ${userId}. Webhook may have failed or user hasn't subscribed yet.`);
    }
    
    return {
      authorized: false,
      error: subscription.status ? `Subscription status: ${subscription.status}. Please subscribe at /pricing` : 'Active subscription required. Please subscribe at /pricing',
      status: 403, // Forbidden
    };
  }

  return { authorized: true };
}

/**
 * Check subscription with detailed error messages
 */
export async function getSubscriptionDetails(userId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Handle case where no subscription exists (error is OK here)
  if (error && !error.message?.includes('No rows')) {
    console.error('Subscription check error:', error);
  }

  if (!subscription) {
    return {
      hasSubscription: false,
      message: 'No subscription found',
    };
  }

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);

  if (subscription.stripe_status === 'canceled') {
    return {
      hasSubscription: false,
      message: 'Subscription has been canceled',
    };
  }

  if (subscription.stripe_status === 'past_due') {
    return {
      hasSubscription: false,
      message: 'Payment failed. Please update your payment method',
    };
  }

  if (periodEnd < now) {
    return {
      hasSubscription: false,
      message: 'Subscription has expired',
    };
  }

  if (!['active', 'trialing'].includes(subscription.stripe_status)) {
    return {
      hasSubscription: false,
      message: `Invalid subscription status: ${subscription.stripe_status}`,
    };
  }

  return {
    hasSubscription: true,
    subscription,
    message: 'Active subscription',
  };
}

