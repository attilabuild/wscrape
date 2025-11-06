import { NextRequest, NextResponse } from 'next/server';
import { ApifyScraper } from '@/lib/apify-scraper';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { requireActiveSubscription } from '@/lib/subscription-guard';
import { logger } from '@/lib/logger';
import { withRateLimit, RATE_LIMITS, getUserIdentifier } from '@/lib/rate-limit';
import { validateRequest, scrapeSchema } from '@/lib/validation';

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
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(
      request,
      RATE_LIMITS.scraping,
      getUserIdentifier
    );

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Input validation
    const validation = await validateRequest(request, scrapeSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { username, platform: reqPlatform } = validation.data;
    
    // Only allow Instagram scraping
    if (reqPlatform && reqPlatform !== 'instagram') {
      return NextResponse.json(
        { error: 'Only Instagram scraping is supported. TikTok scraping has been removed.' },
        { status: 400 }
      );
    }
    
    const platform: 'instagram' = 'instagram'; // Force Instagram only
    
    // 🔒 SECURITY: Verify user authentication
    const supabase = await createSupabaseFromRequest(request);
    
    // Get auth header from request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Scrape: No token in Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    // Get user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logger.warn('Scrape: Authentication failed', { error: authError?.message });
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    logger.debug('Scrape request', { userId: user.id, username });
    
    // 🔒 SECURITY: Verify active subscription (SERVER-SIDE - CANNOT BE BYPASSED)
    const subscriptionCheck = await requireActiveSubscription(user.id);
    
    if (!subscriptionCheck.authorized) {
      logger.warn('Scrape: Subscription check failed', { userId: user.id, reason: subscriptionCheck.error });
      return NextResponse.json(
        { error: subscriptionCheck.error },
        { status: subscriptionCheck.status }
      );
    }
    
    logger.debug('Scrape: Subscription authorized', { userId: user.id });
    
    // Clean the username (remove @ if present)
    const cleanUser = cleanUsername(username);
    
    // Always fetch the latest 10 real videos
    const validCount = 10;
    
    logger.info('Scraping Instagram content', { username: cleanUser, userId: user.id });
    
    // Use real Apify scraper
    const scraper = new ApifyScraper({
      platform,
      username: cleanUser,
      count: validCount
    });
    
    const { videos, dataSource } = await scraper.scrapeVideos();
    
    if (!videos || videos.length === 0) {
      logger.warn('No videos found', { username: cleanUser, platform });
      return NextResponse.json(
        { error: `No videos found for @${cleanUser} on ${platform}` },
        { status: 404 }
      );
    }

    logger.info('Scraping completed', { 
      username: cleanUser, 
      videoCount: videos.length,
      userId: user.id 
    });

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
    logger.error('Scrape API error', error, { 
      endpoint: '/api/scrape' 
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('No real TikTok videos found') || errorMessage.includes('Failed to scrape real') ? 404 : 500 }
    );
  }
}
