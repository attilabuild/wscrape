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
        router.push('/login');
        return;
      }
      
      // Check for active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_end')
        .eq('user_id', session.user.id)
        .single();

      const hasActiveSubscription = subscription && 
        ['active', 'trialing'].includes(subscription.stripe_status) &&
        new Date(subscription.current_period_end) > new Date();

      if (!hasActiveSubscription) {
        router.push('/pricing');
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        // Re-check subscription on auth state change
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('stripe_status, current_period_end')
          .eq('user_id', session.user.id)
          .single();

        const hasActiveSubscription = subscriptionData && 
          ['active', 'trialing'].includes(subscriptionData.stripe_status) &&
          new Date(subscriptionData.current_period_end) > new Date();

        if (!hasActiveSubscription) {
          router.push('/pricing');
        } else {
          setAuthenticated(true);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
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

