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
    
    if (isFromStripeCheckout) {
      console.log('✅ Detected Stripe checkout success - will allow access');
      isFromCheckoutRef.current = true;
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      
      // If coming from checkout, allow access immediately
      if (isFromCheckoutRef.current) {
        console.log('✅ Payment successful! Allowing access - webhook will process subscription in background');
        setAuthenticated(true);
        setLoading(false);
        
        // Poll for subscription in background (non-blocking)
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
        
        return; // Don't check subscription - allow access
      }
      
      // Check for active subscription (only if not from checkout)
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

      if (!hasActiveSubscription) {
        console.log('❌ No active subscription found - redirecting to pricing');
        router.push('/pricing');
        return;
      }

      console.log('✅ Active subscription found - allowing access');
      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

      // Check if user has premium_access OR active Stripe subscription
      const hasPremiumAccess = subscriptionData?.premium_access === true;
      const hasActiveStripe = subscriptionData && 
        ['active', 'trialing'].includes(subscriptionData.stripe_status) &&
        new Date(subscriptionData.current_period_end) > new Date();
      
      const hasActiveSubscription = hasPremiumAccess || hasActiveStripe;

      if (!hasActiveSubscription) {
        console.log('❌ No subscription in auth change - redirecting to pricing');
        router.push('/pricing');
      } else {
        console.log('✅ Subscription found in auth change - allowing access');
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

