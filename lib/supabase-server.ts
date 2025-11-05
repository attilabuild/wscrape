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
  
  if (!supabaseServiceKey) {
    const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables';
    console.error(`❌ ${errorMsg}`);
    console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
    console.error('Get it from: Supabase Dashboard → Project Settings → API → service_role key');
    throw new Error(errorMsg);
  }
  
  if (!supabaseUrl) {
    const errorMsg = 'NEXT_PUBLIC_SUPABASE_URL is not set in environment variables';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  // Validate service key format (should be a long string, typically starts with 'eyJ...')
  if (supabaseServiceKey.length < 50) {
    console.error(`❌ SUPABASE_SERVICE_ROLE_KEY appears to be too short (${supabaseServiceKey.length} chars). Expected ~200+ characters.`);
    console.error('Service key preview:', supabaseServiceKey.substring(0, 20) + '...');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)');
  }
  
  // Log minimal info for debugging (don't log the full key)
  console.log('Service key length:', supabaseServiceKey.length);
  console.log('Service key format check:', supabaseServiceKey.startsWith('eyJ') ? 'JWT format ✓' : 'Non-JWT format');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Service client created successfully');
    return client;
  } catch (error: any) {
    console.error('❌ Failed to create Supabase client:', error.message);
    if (error.message?.includes('Invalid API key')) {
      console.error('⚠️ DIAGNOSIS: The SUPABASE_SERVICE_ROLE_KEY is invalid or incorrect.');
      console.error('⚠️ SOLUTION:');
      console.error('   1. Go to Supabase Dashboard → Your Project → Settings → API');
      console.error('   2. Find the "service_role" key (NOT the anon key)');
      console.error('   3. Copy the entire key (it should be a long JWT string)');
      console.error('   4. Set it in your environment variables as SUPABASE_SERVICE_ROLE_KEY');
      console.error('   5. Make sure there are no extra spaces, quotes, or newlines');
    }
    throw error;
  }
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

