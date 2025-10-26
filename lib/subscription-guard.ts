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
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Query subscription from database
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return { isActive: false };
    }

    // Check if subscription is active
    const isActiveStatus = ['active', 'trialing'].includes(subscription.stripe_status);
    
    // Check if not expired
    const notExpired = subscription.current_period_end 
      ? new Date(subscription.current_period_end) > new Date() 
      : false;

    const isActive = isActiveStatus && notExpired;

    return {
      isActive,
      status: subscription.stripe_status,
      periodEnd: subscription.current_period_end,
    };
  } catch (error) {
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

  if (!subscription.isActive) {
    return {
      authorized: false,
      error: 'Active subscription required. Please subscribe at /pricing',
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
  
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

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

