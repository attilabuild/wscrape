import { NextRequest, NextResponse } from 'next/server';
import { ApifyScraper } from '@/lib/apify-scraper';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { requireActiveSubscription } from '@/lib/subscription-guard';

interface ScrapeRequest {
  username: string;
  platform: 'tiktok' | 'instagram';
  count: number;
}

interface VideoData {
  id: string;
  caption: string;
  postUrl: string;
  hook: string;
  transcript: string;
  views: number;
  likes: number;
  uploadDate: string;
  thumbnail: string;
  username: string;
  duration?: number;
  comments?: number;
  shares?: number;
}

// Clean username input (remove @ symbol if present)
function cleanUsername(username: string): string {
  return username.replace('@', '').trim();
}

// Note: No mock/demo fallback. API returns only real scraped videos.


export async function POST(request: NextRequest) {
  let cleanUser = '';
  let platform: 'tiktok' | 'instagram' = 'tiktok';
  let validCount = 5;
  
  try {
    // 🔒 SECURITY: Verify user authentication
    const supabase = await createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Verify active subscription (SERVER-SIDE - CANNOT BE BYPASSED)
    const subscriptionCheck = await requireActiveSubscription(user.id);
    
    if (!subscriptionCheck.authorized) {
      return NextResponse.json(
        { error: subscriptionCheck.error },
        { status: subscriptionCheck.status }
      );
    }

    const body: ScrapeRequest = await request.json();
    const { username, platform: reqPlatform } = body;
    platform = reqPlatform;
    
    if (!username || !platform) {
      return NextResponse.json(
        { error: 'Username and platform are required' },
        { status: 400 }
      );
    }
    
    // Clean the username (remove @ if present)
    cleanUser = cleanUsername(username);
    
    // Always fetch the latest 10 real videos
    validCount = 10;
    
    // Use real Apify scraper
    const scraper = new ApifyScraper({
      platform,
      username: cleanUser,
      count: validCount
    });
    
    const { videos, dataSource } = await scraper.scrapeVideos();
    
    if (!videos || videos.length === 0) {
      return NextResponse.json(
        { error: `No videos found for @${cleanUser} on ${platform}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        videos,
        metadata: {
          username: cleanUser,
          platform,
          count: videos.length,
          scrapedAt: new Date().toISOString(),
          dataSource: dataSource
        }
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos';
    
    // For other errors, return the error
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('No real TikTok videos found') || errorMessage.includes('Failed to scrape real') ? 404 : 500 }
    );
  }
}
