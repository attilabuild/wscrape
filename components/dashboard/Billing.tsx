'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SubscriptionData {
  stripe_status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string;
  premium_access?: boolean;
}

export default function Billing() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data } = await supabase
        .from('user_subscriptions')
        .select('stripe_status, current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id, premium_access')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setManagingBilling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      active: 'bg-green-500/20 text-green-400',
      trialing: 'bg-blue-500/20 text-blue-400',
      past_due: 'bg-red-500/20 text-red-400',
      canceled: 'bg-gray-500/20 text-gray-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="border border-white/10 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
              {subscription && getStatusBadge(subscription.stripe_status)}
            </div>
            <p className="text-gray-400">Unlimited AI analysis, viral templates, and content generation</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">$29.99</div>
            <div className="text-gray-400">per month</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">AI Analysis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">Content Scraping</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">Content Generation</div>
          </div>
        </div>
        
        {subscription && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="space-y-1">
              {subscription.premium_access ? (
                <div className="text-sm text-green-400">
                  ✅ Premium Access - Lifetime
                </div>
              ) : subscription.cancel_at_period_end ? (
                <div className="text-sm text-yellow-400">
                  ⚠️ Your subscription will end on {formatDate(subscription.current_period_end)}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  Next billing: {formatDate(subscription.current_period_end)}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Current period: {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </div>
            </div>
            {subscription.stripe_customer_id && (
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
              >
                {managingBilling ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Features Included */}
      <div className="border border-white/10 rounded-lg p-8">
        <h3 className="text-xl font-bold text-white mb-6">Features Included</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">Unlimited Content Scraping</div>
              <div className="text-sm text-gray-400">Scrape from all supported platforms</div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">AI-Powered Analysis</div>
              <div className="text-sm text-gray-400">Advanced viral predictions</div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">AI Content Generation</div>
              <div className="text-sm text-gray-400">Generate viral content ideas</div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">Instagram Content Scraping</div>
              <div className="text-sm text-gray-400">Scrape viral content from Instagram</div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">Export Data</div>
              <div className="text-sm text-gray-400">CSV and JSON exports</div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="text-white font-medium">Priority Support</div>
              <div className="text-sm text-gray-400">Get help when you need it</div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Info */}
      {subscription?.stripe_customer_id && (
        <div className="border border-white/10 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-4">Billing Management</h3>
          <p className="text-gray-400 mb-6">
            Manage your payment methods, view invoices, and update billing information through the Stripe Customer Portal.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={managingBilling}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {managingBilling ? 'Loading...' : 'Open Billing Portal'}
          </button>
        </div>
      )}
    </div>
  );
}
