    import { NextRequest, NextResponse } from 'next/server';
import { ViralDatabase, ViralPost } from '@/lib/viral-database';

/**
 * Get a recent date (within last 30 days)
 */
function getRecentDate(): string {
  const now = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30); // Random days between 0-29
  const recentDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
  return recentDate.toISOString().split('T')[0];
}

interface ContentRequest {
  action: 'get_all' | 'get_by_niche' | 'get_by_creator' | 'search' | 'add';
  filters?: {
    niche?: string;
    creator?: string;
    minViralScore?: number;
    minEngagement?: number;
    searchQuery?: string;
    limit?: number;
    sortBy?: 'viralScore' | 'engagement' | 'views' | 'uploadDate';
    sortOrder?: 'asc' | 'desc';
  };
  payload?: Partial<ViralPost>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();
    const { action, filters = {}, payload } = body;


    const database = new ViralDatabase();
    await database.initialize();

    switch (action) {
      case 'get_all':
        return await handleGetAllContent(database, filters);
      
      case 'get_by_niche':
        return await handleGetByNiche(database, filters);
      
      case 'get_by_creator':
        return await handleGetByCreator(database, filters);
      
      case 'search':
        return await handleSearchContent(database, filters);
      
      case 'add':
        return await handleAddContent(database, payload || {});
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: get_all, get_by_niche, get_by_creator, search, add' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve content' },
      { status: 500 }
    );
  }
}
/**
 * Add a manual content entry
 */
async function handleAddContent(database: ViralDatabase, payload: Partial<ViralPost>) {
  // Basic validation
  if (!payload.hook || !payload.caption) {
    return NextResponse.json(
      { error: 'hook and caption are required' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newPost: ViralPost = {
    id: payload.id || `manual-${Date.now()}`,
    username: payload.username || 'manual_entry',
    caption: payload.caption || '',
    hook: payload.hook,
    transcript: payload.transcript || payload.caption || payload.hook,
    views: payload.views ?? 0,
    likes: payload.likes ?? 0,
    comments: payload.comments ?? 0,
    shares: payload.shares ?? 0,
    engagementRate: payload.engagementRate ?? 0,
    uploadDate: payload.uploadDate || getRecentDate(),
    contentType: payload.contentType || 'general',
    postUrl: payload.postUrl || '',
    thumbnail: payload.thumbnail || '',
    duration: payload.duration,
    hashtags: payload.hashtags || [],
    mentions: payload.mentions || [],
    viralScore: payload.viralScore ?? 50
  };

  await database.addPosts([newPost]);

  return NextResponse.json({ success: true, data: newPost });
}

/**
 * Get all content with optional filters
 */
async function handleGetAllContent(database: ViralDatabase, filters: any) {
  const {
    limit = 50,
    sortBy = 'viralScore',
    sortOrder = 'desc',
    minViralScore,
    minEngagement
  } = filters;


  let posts = database.getAllPosts();

  // Apply filters
  if (minViralScore) {
    posts = posts.filter(post => post.viralScore >= minViralScore);
  }

  if (minEngagement) {
    posts = posts.filter(post => post.engagementRate >= minEngagement);
  }

  // Sort posts
  posts.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a] as number;
    const bValue = b[sortBy as keyof typeof b] as number;
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Limit results
  const limitedPosts = posts.slice(0, limit);

  // Get stats
  const stats = database.getStats();

  // Group by content type for summary
  const contentTypeStats = limitedPosts.reduce((acc, post) => {
    acc[post.contentType] = (acc[post.contentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    data: {
      posts: limitedPosts,
      totalPosts: posts.length,
      filteredCount: limitedPosts.length,
      stats: {
        database: stats,
        contentTypes: contentTypeStats,
        avgViralScore: limitedPosts.reduce((sum, p) => sum + p.viralScore, 0) / limitedPosts.length,
        avgEngagement: limitedPosts.reduce((sum, p) => sum + p.engagementRate, 0) / limitedPosts.length
      },
      metadata: {
        retrieved: new Date().toISOString(),
        sortBy,
        sortOrder,
        limit
      }
    }
  });
}

/**
 * Get content by niche/content type
 */
async function handleGetByNiche(database: ViralDatabase, filters: any) {
  const { niche, limit = 50, sortBy = 'viralScore', sortOrder = 'desc' } = filters;

  if (!niche) {
    return NextResponse.json(
      { error: 'Niche is required for get_by_niche action' },
      { status: 400 }
    );
  }


  const searchFilters = {
    contentType: [niche]
  };

  const posts = database.searchPosts(searchFilters, limit);

  return NextResponse.json({
    success: true,
    data: {
      posts,
      niche,
      count: posts.length,
      metadata: {
        retrieved: new Date().toISOString(),
        niche,
        sortBy,
        sortOrder
      }
    }
  });
}

/**
 * Get content by creator
 */
async function handleGetByCreator(database: ViralDatabase, filters: any) {
  const { creator, limit = 50, sortBy = 'viralScore', sortOrder = 'desc' } = filters;

  if (!creator) {
    return NextResponse.json(
      { error: 'Creator username is required for get_by_creator action' },
      { status: 400 }
    );
  }


  const searchFilters = {
    creators: [creator]
  };

  const posts = database.searchPosts(searchFilters, limit);

  return NextResponse.json({
    success: true,
    data: {
      posts,
      creator,
      count: posts.length,
      metadata: {
        retrieved: new Date().toISOString(),
        creator,
        sortBy,
        sortOrder
      }
    }
  });
}

/**
 * Search content by query
 */
async function handleSearchContent(database: ViralDatabase, filters: any) {
  const { searchQuery, limit = 50, sortBy = 'viralScore', sortOrder = 'desc' } = filters;

  if (!searchQuery) {
    return NextResponse.json(
      { error: 'Search query is required for search action' },
      { status: 400 }
    );
  }


  let posts = database.getAllPosts();

  // Filter by search query (search in hook, caption, and transcript)
  const query = searchQuery.toLowerCase();
  posts = posts.filter(post => 
    post.hook.toLowerCase().includes(query) ||
    post.caption.toLowerCase().includes(query) ||
    post.transcript.toLowerCase().includes(query)
  );

  // Sort posts
  posts.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a] as number;
    const bValue = b[sortBy as keyof typeof b] as number;
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Limit results
  const limitedPosts = posts.slice(0, limit);

  return NextResponse.json({
    success: true,
    data: {
      posts: limitedPosts,
      searchQuery,
      totalMatches: posts.length,
      count: limitedPosts.length,
      metadata: {
        retrieved: new Date().toISOString(),
        searchQuery,
        sortBy,
        sortOrder,
        limit
      }
    }
  });
}
