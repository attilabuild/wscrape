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

    console.log(`Starting comment scrape for ${platform} post: ${postUrl}`);

    const scraper = new ApifyScraper({
      platform,
      username: '', // Not needed for comment scraping
      count: count || 50
    });

    const comments = await scraper.scrapeComments(postUrl);

    console.log(`Successfully scraped ${comments.length} comments`);

    return NextResponse.json({
      success: true,
      comments,
      count: comments.length,
      postUrl
    });

  } catch (error) {
    console.error('Comment scraping API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape comments',
        success: false 
      },
      { status: 500 }
    );
  }
}

