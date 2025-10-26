import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a Supabase client for server-side use in API routes
 * This uses the service role key to bypass RLS (use with caution)
 */
export function createServerSupabaseClient() {
  console.log('Creating server client with service role key');
  console.log('Service key length:', supabaseServiceKey?.length);
  console.log('Service key starts with:', supabaseServiceKey?.substring(0, 20));
  
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  
  console.log('Supabase URL:', supabaseUrl);
  
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('Service client created successfully');
  return client;
}

/**
 * Create a Supabase client from Next.js request for authenticated API routes
 * This respects RLS policies based on the user's auth token
 */
export async function createSupabaseFromRequest(request: NextRequest) {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Get all cookies using Next.js cookies() API
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // Get the auth token from the Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storage: {
        getItem: async (key) => {
          const value = cookieStore.get(key)?.value;
          return value || null;
        },
        setItem: async (key, value) => {
          // Not implemented for server-side
        },
        removeItem: async (key) => {
          // Not implemented for server-side
        }
      }
    },
    global: {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(cookieString && { Cookie: cookieString })
      }
    }
  });

  return supabase;
}

