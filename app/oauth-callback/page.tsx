'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles OAuth callbacks from URL hash or query params
        // Get the session which Supabase should have already stored from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          // Clear any URL params/hash to clean up the URL
          window.history.replaceState({}, '', '/oauth-callback');
          // Redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // If no session yet, check if we have auth tokens/code in the URL
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const code = searchParams.get('code');
        const errorParam = hashParams.get('error') || searchParams.get('error');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam);
          router.push(`/login?error=${encodeURIComponent(errorParam)}`);
          return;
        }
        
        if (accessToken && refreshToken) {
          // Set the session with tokens from URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            router.push('/login?error=' + encodeURIComponent(error.message));
            return;
          }
          
          // Clear URL and redirect
          window.history.replaceState({}, '', '/oauth-callback');
          router.push('/dashboard');
        } else if (code) {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code:', error);
            router.push('/login?error=' + encodeURIComponent(error.message));
            return;
          }
          
          if (data.session) {
            window.history.replaceState({}, '', '/oauth-callback');
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        } else {
          // Wait a bit for Supabase to process the URL, then check again
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              window.history.replaceState({}, '', '/oauth-callback');
              router.push('/dashboard');
            } else {
              router.push('/login?error=no_session');
            }
          }, 500);
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        router.push('/login?error=' + encodeURIComponent(error?.message || 'callback_error'));
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}

