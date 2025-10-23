'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    
    const { error } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage('Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-white/5">
          <div className="rounded-2xl bg-black/70 backdrop-blur border border-white/10 p-5">
            <div className="text-center mb-5">
              <div className="text-xs tracking-wider text-gray-400 mb-1">wscrape</div>
              <h1 className="text-lg font-semibold">Set new password</h1>
              <p className="text-xs text-gray-400 mt-1">Enter your new password</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
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
                <label className="block text-xs text-gray-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  placeholder="••••••••"
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
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-gray-400">
              <a href="/login" className="text-white underline">Back to sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

