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
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_end, premium_access')
        .eq('user_id', session.user.id)
        .single();

      // Handle case where no subscription exists (error is OK here)
      if (subError && !subError.message?.includes('No rows')) {
        console.error('Subscription check error:', subError);
      }

      // Check if user has premium_access OR active Stripe subscription
      const hasPremiumAccess = subscription?.premium_access === true;
      const hasActiveStripe = subscription && 
        ['active', 'trialing'].includes(subscription.stripe_status) &&
        new Date(subscription.current_period_end) > new Date();
      
      const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

      // If coming from Stripe checkout but no subscription yet, wait and retry
      if (!hasActiveSubscription && isFromStripeCheckout) {
        console.log('⏳ Payment successful, waiting for webhook to process subscription...');
        // Wait 3 seconds and retry
        setTimeout(async () => {
          const { data: retrySubscription, error: retryError } = await supabase
            .from('user_subscriptions')
            .select('stripe_status, current_period_end, premium_access')
            .eq('user_id', session.user.id)
            .single();

          if (retryError && !retryError.message?.includes('No rows')) {
            console.error('Retry subscription check error:', retryError);
          }

          const retryHasPremiumAccess = retrySubscription?.premium_access === true;
          const retryHasActiveStripe = retrySubscription && 
            ['active', 'trialing'].includes(retrySubscription.stripe_status) &&
            new Date(retrySubscription.current_period_end) > new Date();
          
          const retryHasActiveSubscription = retryHasPremiumAccess || retryHasActiveStripe;

          if (retryHasActiveSubscription) {
            setAuthenticated(true);
            setLoading(false);
          } else {
            // Still no subscription, but allow access anyway if coming from checkout
            // The webhook will process eventually
            console.log('⚠️ Subscription not found yet, but allowing access due to successful checkout');
            setAuthenticated(true);
            setLoading(false);
          }
        }, 3000);
        return; // Don't redirect yet, wait for retry
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
        // Re-check subscription on auth state change
        const { data: subscriptionData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('stripe_status, current_period_end, premium_access')
          .eq('user_id', session.user.id)
          .single();

        // Handle case where no subscription exists (error is OK here)
        if (subError && !subError.message?.includes('No rows')) {
          console.error('Subscription check error:', subError);
        }

        // Check if user has premium_access OR active Stripe subscription
        const hasPremiumAccess = subscriptionData?.premium_access === true;
        const hasActiveStripe = subscriptionData && 
          ['active', 'trialing'].includes(subscriptionData.stripe_status) &&
          new Date(subscriptionData.current_period_end) > new Date();
        
        const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

        if (!hasActiveSubscription) {
          router.push('/pricing');
        } else {
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

