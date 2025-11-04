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

