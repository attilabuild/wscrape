'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      
      // Check if user is coming from Stripe checkout (success parameter or session_id)
      // Give them a grace period to allow webhook to process
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const isFromStripeCheckout = success === 'true' || sessionId;
      
      // Check for active subscription
      // Use .maybeSingle() instead of .single() to handle "no rows" gracefully
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_end, premium_access')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Only log actual errors (not "no rows" which is expected)
      if (subError && subError.code !== 'PGRST116') {
        console.error('Subscription check error:', subError);
      }

      // Check if user has premium_access OR active Stripe subscription
      const hasPremiumAccess = subscription?.premium_access === true;
      const hasActiveStripe = subscription && 
        ['active', 'trialing'].includes(subscription.stripe_status) &&
        new Date(subscription.current_period_end) > new Date();
      
      const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

      // If coming from Stripe checkout but no subscription yet, allow access immediately
      // The webhook will process the subscription in the background
      if (!hasActiveSubscription && isFromStripeCheckout) {
        console.log('✅ Payment successful! Allowing access - webhook will process subscription in background');
        // Allow access immediately while webhook processes
        setAuthenticated(true);
        setLoading(false);
        
        // Also poll for subscription in background (non-blocking)
        setTimeout(async () => {
          const { data: retrySubscription } = await supabase
            .from('user_subscriptions')
            .select('stripe_status, current_period_end, premium_access')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (retrySubscription) {
            console.log('✅ Subscription found! Webhook processed successfully');
          } else {
            console.log('⏳ Subscription still processing... webhook may take a few more seconds');
          }
        }, 3000);
        
        return; // Don't redirect to pricing
      }

      if (!hasActiveSubscription) {
        router.push('/pricing');
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push('/');
      } else {
        // Check if user is coming from Stripe checkout (success parameter or session_id)
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const sessionId = urlParams.get('session_id');
        const isFromStripeCheckout = success === 'true' || sessionId;
        
        // Re-check subscription on auth state change
        // Use .maybeSingle() instead of .single() to handle "no rows" gracefully
        const { data: subscriptionData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('stripe_status, current_period_end, premium_access')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // Only log actual errors (not "no rows" which is expected)
        if (subError && subError.code !== 'PGRST116') {
          console.error('Subscription check error:', subError);
        }

        // Check if user has premium_access OR active Stripe subscription
        const hasPremiumAccess = subscriptionData?.premium_access === true;
        const hasActiveStripe = subscriptionData && 
          ['active', 'trialing'].includes(subscriptionData.stripe_status) &&
          new Date(subscriptionData.current_period_end) > new Date();
        
        const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

        // Don't redirect if coming from checkout (allow webhook to process)
        if (!hasActiveSubscription && !isFromStripeCheckout) {
          router.push('/pricing');
        } else if (hasActiveSubscription) {
          setAuthenticated(true);
          setLoading(false);
        } else if (isFromStripeCheckout) {
          // Coming from checkout but no subscription yet - allow access while webhook processes
          console.log('✅ Allowing access from checkout - webhook will process subscription');
          setAuthenticated(true);
          setLoading(false);
        }
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

