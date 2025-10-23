'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage('Check your email for a password reset link.');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-white/5">
          <div className="rounded-2xl bg-black/70 backdrop-blur border border-white/10 p-5">
            <div className="text-center mb-5">
              <div className="text-xs tracking-wider text-gray-400 mb-1">wscrape</div>
              <h1 className="text-lg font-semibold">Reset password</h1>
              <p className="text-xs text-gray-400 mt-1">Enter your email to receive a reset link</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {message && <p className="text-xs text-green-400">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-gray-400">
              Remember your password? <a href="/login" className="text-white underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

