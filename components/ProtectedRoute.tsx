'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const isFromCheckoutRef = useRef(false);

  useEffect(() => {
    // Check for checkout success FIRST, before any other checks
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const isFromStripeCheckout = success === 'true' || !!sessionId;
    
    // If coming from checkout, store in localStorage to persist across reloads
    if (isFromStripeCheckout) {
      console.log('✅ Detected Stripe checkout success - will allow access');
      isFromCheckoutRef.current = true;
      // Store checkout success timestamp in localStorage (expires after 10 minutes)
      localStorage.setItem('stripe_checkout_success', Date.now().toString());
      // Clear URL params after storing
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
    
    // Check localStorage for recent checkout success (within last 10 minutes)
    const storedCheckoutTime = localStorage.getItem('stripe_checkout_success');
    if (storedCheckoutTime) {
      const checkoutTime = parseInt(storedCheckoutTime, 10);
      const minutesSinceCheckout = (Date.now() - checkoutTime) / (1000 * 60);
      if (minutesSinceCheckout < 10) {
        console.log(`✅ Found recent checkout success in localStorage (${minutesSinceCheckout.toFixed(1)} min ago) - allowing access`);
        isFromCheckoutRef.current = true;
      } else {
        // Remove expired checkout flag
        localStorage.removeItem('stripe_checkout_success');
      }
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      
      // If coming from checkout (URL params or localStorage), allow access immediately
      if (isFromCheckoutRef.current) {
        console.log('✅ Payment successful! Allowing access - webhook will process subscription in background');
        setAuthenticated(true);
        setLoading(false);
        
        // Poll for subscription in background (non-blocking) - try multiple times
        let pollCount = 0;
        const maxPolls = 10; // Try for up to 30 seconds (10 polls × 3 seconds)
        const pollInterval = setInterval(async () => {
          pollCount++;
          const { data: retrySubscription } = await supabase
            .from('user_subscriptions')
            .select('stripe_status, current_period_end, premium_access')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (retrySubscription) {
            console.log('✅ Subscription found! Webhook processed successfully');
            clearInterval(pollInterval);
            // Clear the checkout flag once subscription is found
            localStorage.removeItem('stripe_checkout_success');
            isFromCheckoutRef.current = false;
          } else if (pollCount >= maxPolls) {
            console.log('⏳ Subscription still not found after multiple attempts. Webhook may need manual intervention.');
            clearInterval(pollInterval);
          } else {
            console.log(`⏳ Subscription still processing... (attempt ${pollCount}/${maxPolls})`);
          }
        }, 3000);
        
        return; // Don't check subscription - allow access
      }
      
      // Check for active subscription (only if not from checkout)
      // Query all columns we might need
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_end, premium_access, stripe_customer_id, user_id, stripe_subscription_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Log detailed info for debugging
      if (subError) {
        if (subError.code === 'PGRST116') {
          console.log('ℹ️ No subscription found in database for user:', session.user.id);
        } else {
          console.error('❌ Subscription query error:', subError);
        }
      } else if (!subscription) {
        console.log('ℹ️ Subscription query returned null (no subscription found)');
      } else {
        console.log('✅ Subscription found in database:', {
          userId: subscription.user_id,
          status: subscription.stripe_status,
          periodEnd: subscription.current_period_end,
          subscriptionId: subscription.stripe_subscription_id
        });
      }

      // Log subscription data for debugging
      console.log('🔍 Subscription check:', {
        hasSubscription: !!subscription,
        status: subscription?.stripe_status,
        periodEnd: subscription?.current_period_end,
        premiumAccess: subscription?.premium_access
      });

      // Check if user has premium_access OR active Stripe subscription
      const hasPremiumAccess = subscription?.premium_access === true;
      
      // Check if subscription is active and not expired
      let hasActiveStripe = false;
      if (subscription) {
        const isValidStatus = ['active', 'trialing'].includes(subscription.stripe_status);
        if (isValidStatus) {
          if (subscription.current_period_end) {
            const periodEnd = new Date(subscription.current_period_end);
            const now = new Date();
            const isNotExpired = periodEnd > now;
            hasActiveStripe = isNotExpired;
            
            console.log('🔍 Stripe subscription check:', {
              isValidStatus,
              periodEnd: periodEnd.toISOString(),
              now: now.toISOString(),
              isNotExpired,
              hasActiveStripe
            });
          } else {
            // If no period_end, assume active if status is active/trialing
            hasActiveStripe = isValidStatus;
            console.log('⚠️ No period_end date, using status only:', { isValidStatus });
          }
        }
      }
      
      const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

      if (!hasActiveSubscription) {
        console.log('❌ No active subscription found - redirecting to pricing', {
          hasPremiumAccess,
          hasActiveStripe,
          subscriptionStatus: subscription?.stripe_status,
          periodEnd: subscription?.current_period_end
        });
        router.push('/pricing');
        return;
      }

      console.log('✅ Active subscription found - allowing access', {
        hasPremiumAccess,
        hasActiveStripe,
        subscriptionStatus: subscription?.stripe_status
      });
      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Check localStorage for recent checkout success
      const storedCheckoutTime = localStorage.getItem('stripe_checkout_success');
      if (storedCheckoutTime) {
        const checkoutTime = parseInt(storedCheckoutTime, 10);
        const minutesSinceCheckout = (Date.now() - checkoutTime) / (1000 * 60);
        if (minutesSinceCheckout < 10) {
          isFromCheckoutRef.current = true;
        }
      }
      
      // If coming from checkout, always allow access (don't redirect)
      if (isFromCheckoutRef.current) {
        console.log('✅ Allowing access from checkout - webhook will process subscription');
        setAuthenticated(true);
        setLoading(false);
        return;
      }

      if (!session) {
        router.push('/');
        return;
      }
      
      // Re-check subscription on auth state change (only if not from checkout)
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_end, premium_access')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Only log actual errors (not "no rows" which is expected)
      if (subError && subError.code !== 'PGRST116') {
        console.error('Subscription check error:', subError);
      }

      // Log subscription data for debugging
      console.log('🔍 Auth change subscription check:', {
        hasSubscription: !!subscriptionData,
        status: subscriptionData?.stripe_status,
        periodEnd: subscriptionData?.current_period_end,
        premiumAccess: subscriptionData?.premium_access
      });

      // Check if user has premium_access OR active Stripe subscription
      const hasPremiumAccess = subscriptionData?.premium_access === true;
      
      // Check if subscription is active and not expired
      let hasActiveStripe = false;
      if (subscriptionData) {
        const isValidStatus = ['active', 'trialing'].includes(subscriptionData.stripe_status);
        if (isValidStatus) {
          if (subscriptionData.current_period_end) {
            const periodEnd = new Date(subscriptionData.current_period_end);
            const now = new Date();
            const isNotExpired = periodEnd > now;
            hasActiveStripe = isNotExpired;
            
            console.log('🔍 Auth change Stripe subscription check:', {
              isValidStatus,
              periodEnd: periodEnd.toISOString(),
              now: now.toISOString(),
              isNotExpired,
              hasActiveStripe
            });
          } else {
            // If no period_end, assume active if status is active/trialing
            hasActiveStripe = isValidStatus;
            console.log('⚠️ No period_end date, using status only:', { isValidStatus });
          }
        }
      }
      
      const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

      if (!hasActiveSubscription) {
        console.log('❌ No subscription in auth change - redirecting to pricing', {
          hasPremiumAccess,
          hasActiveStripe,
          subscriptionStatus: subscriptionData?.stripe_status,
          periodEnd: subscriptionData?.current_period_end
        });
        router.push('/pricing');
      } else {
        console.log('✅ Subscription found in auth change - allowing access', {
          hasPremiumAccess,
          hasActiveStripe,
          subscriptionStatus: subscriptionData?.stripe_status
        });
        setAuthenticated(true);
        setLoading(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

