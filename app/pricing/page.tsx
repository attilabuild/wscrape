'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we're coming from Stripe with a canceled parameter
      const urlParams = new URLSearchParams(window.location.search);
      const canceled = urlParams.get('canceled');
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      
      // If payment was successful, redirect to dashboard immediately
      // (webhook will handle the subscription update in the background)
      if (success === 'true' || sessionId) {
        // Remove query params and redirect to dashboard
        window.history.replaceState({}, '', '/dashboard');
        router.push('/dashboard?success=true');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      // If user is logged in, check if they have premium access
      if (session?.user) {
        // Wait a bit before checking subscription to allow webhook to process
        // This prevents race condition where user lands on pricing before webhook completes
        setTimeout(async () => {
          const { data: subscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select('premium_access, stripe_status')
            .eq('user_id', session.user.id)
            .single();
          
          // Handle case where no subscription exists (error is OK here)
          if (subError && !subError.message?.includes('No rows')) {
            console.error('Subscription check error:', subError);
          }
          
          // If user has premium access, redirect to dashboard
          // Only redirect if not canceled (to avoid redirecting after user cancels)
          if (!canceled && (subscription?.premium_access === true || subscription?.stripe_status === 'active')) {
            router.push('/dashboard');
          }
        }, 2000); // Wait 2 seconds for webhook to process
      }
    };
    checkAuth();
  }, [router]);

  const handleSubscribe = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      router.push('/signup');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-white">
                wscrape
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <a 
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={() => {
                      supabase.auth.signOut();
                      router.push('/');
                    }}
                    className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </a>
                  <a 
                    href="/signup"
                    className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all"
                  >
                    Get started
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background Grid */}
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 pt-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get unlimited access to all features for just $29.99/month
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/5 border-2 border-white/20 rounded-2xl p-8 backdrop-blur-sm hover:border-white/40 transition-all">
            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">
                $29.99
              </div>
              <div className="text-gray-400 text-lg">per month</div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Unlimited Content Scraping</div>
                  <div className="text-sm text-gray-400">Scrape from TikTok, Instagram, YouTube and more</div>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">AI-Powered Idea Analysis</div>
                  <div className="text-sm text-gray-400">Advanced viral content predictions and insights</div>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">AI Content Generation</div>
                  <div className="text-sm text-gray-400">Generate viral content ideas and scripts</div>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Content Calendar</div>
                  <div className="text-sm text-gray-400">Schedule and organize your content strategy</div>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm text-gray-400">Download your analysis as CSV or JSON</div>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Priority Support</div>
                  <div className="text-sm text-gray-400">Get help when you need it</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLoggedIn ? (
                'Subscribe Now'
              ) : (
                'Sign Up to Subscribe'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-400">
                Cancel anytime. No long-term contracts.
              </p>
              <p className="text-sm text-gray-400">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards through our secure payment processor, Stripe.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">Currently, we don't offer a free trial, but you can cancel anytime during your first month for a full refund.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What platforms do you support?</h3>
              <p className="text-gray-400">We support TikTok, Instagram, YouTube, and more platforms are coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

