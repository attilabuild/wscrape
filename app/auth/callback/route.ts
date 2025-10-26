import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Check if we have OAuth tokens in the hash or as URL params
  const accessToken = requestUrl.searchParams.get('access_token');
  const refreshToken = requestUrl.searchParams.get('refresh_token');
  const code = requestUrl.searchParams.get('code');
  
  // If we have tokens in the URL, redirect to client-side handling
  if (accessToken || code) {
    // This means the OAuth flow is complete and tokens are in the URL
    // The client-side code will handle storing the session
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  }

  // Default redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}

