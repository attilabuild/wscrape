import { NextRequest, NextResponse } from 'next/server';
import { ApifyScraper } from '@/lib/apify-scraper';

export async function POST(request: NextRequest) {
  try {
    const { postUrl, platform, count } = await request.json();

    if (!postUrl || !platform) {
      return NextResponse.json(
        { error: 'Post URL and platform are required' },
        { status: 400 }
      );
    }


    const scraper = new ApifyScraper({
      platform,
      username: '', // Not needed for comment scraping
      count: Math.max(count || 100, 100) // Ensure at least 100 comments
    });

    const comments = await scraper.scrapeComments(postUrl);


    return NextResponse.json({
      success: true,
      comments,
      count: comments.length,
      postUrl
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape comments',
        success: false 
      },
      { status: 500 }
    );
  }
}

