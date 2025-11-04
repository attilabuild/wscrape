'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is logged in, redirect based on subscription status
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

        if (hasActiveSubscription) {
          router.push('/dashboard');
        } else {
          router.push('/pricing');
        }
      }
      // If no session, stay on signup page
    };
    checkAuth();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Enhanced email validation - more permissive and robust
    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic validation only - let Supabase handle the rest
    if (!trimmedEmail) {
      setError('Please enter an email address');
      setLoading(false);
      return;
    }
    
    // Very basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address (e.g., user@example.com)');
      setLoading(false);
      return;
    }
    

    // Password length check
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signUp({ 
      email: trimmedEmail, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pricing`,
      }
    });
    setLoading(false);
    if (error) {
      // Provide more specific error messages
      if (error.message.includes('invalid email')) {
        setError('Please enter a valid email address');
      } else if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (error.message.includes('password')) {
        setError('Password must be at least 6 characters long');
      } else {
        setError(error.message);
      }
      return;
    }
    setMessage('Account created! Please subscribe to access the dashboard...');
    setTimeout(() => {
      router.push('/pricing');
    }, 1000);
  };

  const signUpWithGoogle = async () => {
    // Always use current origin to ensure localhost works correctly
    const redirectUrl = window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/oauth-callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-white/5">
          <div className="rounded-2xl bg-black/70 backdrop-blur border border-white/10 p-5">
            <div className="text-center mb-5">
              <div className="text-xs tracking-wider text-gray-400 mb-1">wscrape</div>
              <h1 className="text-lg font-semibold">Create an account</h1>
              <p className="text-xs text-gray-400 mt-1">Join wscrape</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  placeholder="user@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use a valid email format (e.g., name@domain.com)</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400">{message}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
              >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black/70 text-gray-400 py-4">Or continue with</span>
            </div>
          </div>

          <button
            onClick={signUpWithGoogle}
            type="button"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Already have an account? <a href="/login" className="text-white underline">Sign in</a>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
