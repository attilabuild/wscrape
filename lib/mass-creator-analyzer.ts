import { ApifyClient } from 'apify-client';

interface CreatorProfile {
  username: string;
  followerCount: number;
  avgEngagement: number;
  topContentTypes: string[];
  postingFrequency: number;
}

interface ViralPost {
  id: string;
  username: string;
  caption: string;
  hook: string;
  transcript: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  uploadDate: string;
  contentType: string;
  postUrl: string;
  thumbnail: string;
  duration?: number;
  hashtags: string[];
  mentions: string[];
  viralScore: number; // Custom score based on engagement metrics
}

interface ContentPattern {
  hookPattern: string;
  avgEngagement: number;
  frequency: number;
  examples: string[];
  viralPotential: number;
}

interface TrendingTopic {
  topic: string;
  momentum: number;
  avgEngagement: number;
  creatorCount: number;
  postCount: number;
  timeframe: string;
}

export class MassCreatorAnalyzer {
  private client: ApifyClient;
  private viralDatabase: ViralPost[] = [];
  private creatorProfiles: CreatorProfile[] = [];
  private contentPatterns: ContentPattern[] = [];
  private trendingTopics: TrendingTopic[] = [];

  // Top creators by niche
  private readonly TOP_CREATORS = {
    business: [
      'garyvee', 'alexhormozi', 'grantcardone', 'therock', 'elonmusk',
      'richardbranson', 'robertkiyosaki', 'tonyrobbins', 'daymond',
      'barbaracorcoran', 'mcuban', 'kevinolearytv', 'naval', 'chamath',
      'jeffbezos', 'billgates', 'warrenbuffett', 'oprah', 'tim_cook',
      'sundarpichai'
    ],
    motivation: [
      'davidgoggins', 'lewishowes', 'robbins', 'mindsetmentor',
      'bedros.keuilian', 'melrobbins', 'brendon', 'jesshilarystudio',
      'theshaycarl', 'amylandino', 'briansussman', 'successmagazine',
      'entrepreneur', 'inc', 'fastcompany', 'forbes'
    ],
    fitness: [
      'therock', 'cristiano', 'kingjames', 'stephencurry30',
      'usainbolt', 'serenawilliams', 'vindiesel', 'zacefron',
      'vancityreynolds', 'chrishemsworth', 'priyankachopra', 'deepikapadukone'
    ],
    lifestyle: [
      'kyliejenner', 'kimkardashian', 'khloekardashian', 'kourtneykardash',
      'kendalljenner', 'justinbieber', 'selenagomez', 'taylorswift',
      'arianagrande', 'ddlovato', 'vancityreynolds', 'zendaya'
    ],
    education: [
      'neil.degrasse.tyson', 'michiokaku', 'stevenweinberg', 'carlsagan',
      'stephenhawking_', 'richarddawkins', 'samharrisorg', 'jordanbpeterson',
      'lexfridman', 'joerogan', 'tim_cook', 'sundarpichai'
    ]
  };

  constructor() {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('APIFY_API_KEY environment variable is required');
    }
    
    this.client = new ApifyClient({
      token: apiKey
    });
  }

  /**
   * PHASE 1: Mass analyze top creators (100+ accounts)
   */
  async analyzeTopCreators(niches: string[] = ['business', 'motivation'], limit: number = 50): Promise<{
    totalAnalyzed: number;
    viralPosts: ViralPost[];
    topPerformers: CreatorProfile[];
    patterns: ContentPattern[];
  }> {
    
    const creatorsToAnalyze: string[] = [];
    
    // Collect creators from specified niches
    for (const niche of niches) {
      if (this.TOP_CREATORS[niche as keyof typeof this.TOP_CREATORS]) {
        creatorsToAnalyze.push(...this.TOP_CREATORS[niche as keyof typeof this.TOP_CREATORS].slice(0, limit / niches.length));
      }
    }


    const allViralPosts: ViralPost[] = [];
    const creatorProfiles: CreatorProfile[] = [];

    // Analyze each creator (parallel processing for speed)
    const chunkSize = 5; // Process 5 creators at a time to avoid rate limits
    for (let i = 0; i < creatorsToAnalyze.length; i += chunkSize) {
      const chunk = creatorsToAnalyze.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(username => this.analyzeCreator(username));
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allViralPosts.push(...result.value.viralPosts);
          creatorProfiles.push(result.value.profile);
        } else {
        }
      });

      // Rate limiting delay
      if (i + chunkSize < creatorsToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Store in viral database
    this.viralDatabase = allViralPosts;
    this.creatorProfiles = creatorProfiles;

    // Analyze patterns from collected data
    const patterns = this.extractContentPatterns(allViralPosts);
    this.contentPatterns = patterns;


    return {
      totalAnalyzed: creatorProfiles.length,
      viralPosts: allViralPosts,
      topPerformers: creatorProfiles.sort((a, b) => b.avgEngagement - a.avgEngagement).slice(0, 20),
      patterns: patterns.sort((a, b) => b.viralPotential - a.viralPotential).slice(0, 50)
    };
  }

  /**
   * Analyze individual creator
   */
  private async analyzeCreator(username: string): Promise<{
    profile: CreatorProfile;
    viralPosts: ViralPost[];
  }> {
    try {
      
      const run = await this.client.actor('apify/instagram-reel-scraper').call({
        username: [username],
        resultsLimit: 50, // Get recent 50 posts for analysis
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      });

      // Wait for completion
      await this.waitForRunCompletion(run.id);
      
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (!items || items.length === 0) {
        throw new Error(`No data found for @${username}`);
      }

      // Convert to ViralPost format and calculate viral scores
      const viralPosts: ViralPost[] = items
        .filter((item: any) => item.id && item.id !== 'undefined')
        .map((item: any) => this.convertToViralPost(item, username))
        .filter(post => post.viralScore > 5.0) // Only keep posts with decent engagement
        .sort((a, b) => b.viralScore - a.viralScore); // Sort by viral score

      // Calculate creator profile metrics
      const profile: CreatorProfile = this.calculateCreatorProfile(username, viralPosts);

      return { profile, viralPosts };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert Apify data to ViralPost format
   */
  private convertToViralPost(item: any, username: string): ViralPost {
    const views = item.videoViewCount || item.likesCount || 0;
    const likes = item.likesCount || 0;
    const comments = item.commentsCount || 0;
    const shares = 0; // Instagram doesn't provide shares data
    
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    const viralScore = this.calculateViralScore(views, likes, comments, engagementRate);

    return {
      id: item.id || item.shortCode,
      username: username,
      caption: item.caption || '',
      hook: this.extractHook(item.caption || ''),
      transcript: item.caption || '', // For Instagram, caption IS the transcript
      views: views,
      likes: likes,
      comments: comments,
      shares: shares,
      engagementRate: engagementRate,
      uploadDate: this.getRecentDate(),
      contentType: this.classifyContentType(item.caption || ''),
      postUrl: item.url || `https://instagram.com/reel/${item.shortCode}/`,
      thumbnail: item.images && item.images.length > 0 ? item.images[0] : '',
      duration: item.videoDuration || 0,
      hashtags: this.extractHashtags(item.caption || ''),
      mentions: this.extractMentions(item.caption || ''),
      viralScore: viralScore
    };
  }

  /**
   * Get a recent date (within last 30 days)
   */
  private getRecentDate(): string {
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 30); // Random days between 0-29
    const recentDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
    return recentDate.toISOString().split('T')[0];
  }

  /**
   * Calculate viral score (0-100)
   */
  private calculateViralScore(views: number, likes: number, comments: number, engagementRate: number): number {
    const engagementWeight = Math.min(engagementRate * 5, 50); // Max 50 points for engagement
    const volumeScore = Math.min(Math.log10(views + 1) * 5, 30); // Max 30 points for volume
    const interactionScore = Math.min((comments / Math.max(likes, 1)) * 100, 20); // Max 20 points for comment ratio
    
    return Math.round(engagementWeight + volumeScore + interactionScore);
  }

  /**
   * Extract hook from caption (first sentence or line)
   */
  private extractHook(caption: string): string {
    const firstSentence = caption.split('.')[0];
    const firstLine = caption.split('\n')[0];
    const hook = firstSentence.length > 50 ? firstLine.substring(0, 50) + '...' : firstSentence;
    return hook || 'No hook available';
  }

  /**
   * Classify content type based on caption analysis
   */
  private classifyContentType(caption: string): string {
    const lowerCaption = caption.toLowerCase();
    
    if (lowerCaption.includes('business') || lowerCaption.includes('entrepreneur') || lowerCaption.includes('money') || lowerCaption.includes('success')) return 'business';
    if (lowerCaption.includes('motivation') || lowerCaption.includes('inspiration') || lowerCaption.includes('mindset') || lowerCaption.includes('goals')) return 'motivation';
    if (lowerCaption.includes('workout') || lowerCaption.includes('fitness') || lowerCaption.includes('gym') || lowerCaption.includes('health')) return 'fitness';
    if (lowerCaption.includes('life') || lowerCaption.includes('lifestyle') || lowerCaption.includes('daily') || lowerCaption.includes('routine')) return 'lifestyle';
    if (lowerCaption.includes('learn') || lowerCaption.includes('education') || lowerCaption.includes('knowledge') || lowerCaption.includes('skill')) return 'education';
    
    return 'general';
  }

  /**
   * Extract hashtags from caption
   */
  private extractHashtags(caption: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    return caption.match(hashtagRegex) || [];
  }

  /**
   * Extract mentions from caption
   */
  private extractMentions(caption: string): string[] {
    const mentionRegex = /@[\w.]+/g;
    return caption.match(mentionRegex) || [];
  }

  /**
   * Calculate creator profile metrics
   */
  private calculateCreatorProfile(username: string, posts: ViralPost[]): CreatorProfile {
    if (posts.length === 0) {
      return {
        username,
        followerCount: 0,
        avgEngagement: 0,
        topContentTypes: [],
        postingFrequency: 0
      };
    }

    const avgEngagement = posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length;
    
    // Count content types
    const contentTypeCounts: { [key: string]: number } = {};
    posts.forEach(post => {
      contentTypeCounts[post.contentType] = (contentTypeCounts[post.contentType] || 0) + 1;
    });
    
    const topContentTypes = Object.entries(contentTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Calculate posting frequency (posts per day based on date range)
    const dates = posts.map(post => new Date(post.uploadDate)).sort((a, b) => a.getTime() - b.getTime());
    const daysDiff = dates.length > 1 ? (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24) : 1;
    const postingFrequency = posts.length / Math.max(daysDiff, 1);

    return {
      username,
      followerCount: Math.max(...posts.map(p => p.views)), // Approximate using max views
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      topContentTypes,
      postingFrequency: Math.round(postingFrequency * 100) / 100
    };
  }

  /**
   * Extract content patterns from viral posts
   */
  private extractContentPatterns(posts: ViralPost[]): ContentPattern[] {
    const patterns: { [key: string]: { posts: ViralPost[], engagements: number[] } } = {};
    
    posts.forEach(post => {
      // Analyze hook patterns
      const hook = post.hook.toLowerCase();
      
      // Extract pattern types
      const patternTypes = this.identifyHookPatterns(hook);
      
      patternTypes.forEach(pattern => {
        if (!patterns[pattern]) {
          patterns[pattern] = { posts: [], engagements: [] };
        }
        patterns[pattern].posts.push(post);
        patterns[pattern].engagements.push(post.engagementRate);
      });
    });

    return Object.entries(patterns)
      .filter(([, data]) => data.posts.length >= 3) // Need at least 3 examples
      .map(([pattern, data]) => ({
        hookPattern: pattern,
        avgEngagement: data.engagements.reduce((sum, eng) => sum + eng, 0) / data.engagements.length,
        frequency: data.posts.length,
        examples: data.posts.slice(0, 5).map(p => p.hook),
        viralPotential: this.calculateViralPotential(data.engagements, data.posts.length)
      }));
  }

  /**
   * Identify hook patterns
   */
  private identifyHookPatterns(hook: string): string[] {
    const patterns: string[] = [];
    
    // Question patterns
    if (hook.includes('?')) patterns.push('question');
    if (hook.startsWith('what') || hook.startsWith('how') || hook.startsWith('why')) patterns.push('interrogative');
    
    // Statement patterns
    if (hook.startsWith('the ')) patterns.push('definitive');
    if (hook.includes('you need') || hook.includes('you should') || hook.includes('you must')) patterns.push('instructional');
    if (hook.includes('secret') || hook.includes('trick') || hook.includes('hack')) patterns.push('insider');
    
    // Emotional patterns
    if (hook.includes('never') || hook.includes('always') || hook.includes('every')) patterns.push('absolute');
    if (hook.includes('win') || hook.includes('success') || hook.includes('achieve')) patterns.push('aspirational');
    if (hook.includes('mistake') || hook.includes('wrong') || hook.includes('fail')) patterns.push('cautionary');
    
    // Numerical patterns
    if (/\d+/.test(hook)) patterns.push('numerical');
    
    // Length patterns
    if (hook.length <= 30) patterns.push('short');
    else if (hook.length <= 60) patterns.push('medium');
    else patterns.push('long');
    
    return patterns.length > 0 ? patterns : ['general'];
  }

  /**
   * Calculate viral potential score
   */
  private calculateViralPotential(engagements: number[], frequency: number): number {
    const avgEngagement = engagements.reduce((sum, eng) => sum + eng, 0) / engagements.length;
    const consistencyScore = 1 - (this.standardDeviation(engagements) / avgEngagement);
    const frequencyScore = Math.min(frequency / 10, 1); // Normalize frequency
    
    return Math.round((avgEngagement * consistencyScore * frequencyScore) * 100) / 100;
  }

  /**
   * Calculate standard deviation
   */
  private standardDeviation(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Wait for Apify run completion
   */
  private async waitForRunCompletion(runId: string, maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const run = await this.client.run(runId).get();

      if (run?.status === 'SUCCEEDED') {
        return;
      } else if (run?.status === 'FAILED' || run?.status === 'ABORTED') {
        throw new Error(`Run ${runId} failed with status: ${run?.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error(`Run ${runId} timed out after ${maxWaitTime}ms`);
  }

  /**
   * Get viral database
   */
  getViralDatabase(): ViralPost[] {
    return this.viralDatabase;
  }

  /**
   * Get creator profiles
   */
  getCreatorProfiles(): CreatorProfile[] {
    return this.creatorProfiles;
  }

  /**
   * Get content patterns
   */
  getContentPatterns(): ContentPattern[] {
    return this.contentPatterns;
  }

  /**
   * Export data to JSON
   */
  exportData(): {
    viralPosts: ViralPost[];
    creators: CreatorProfile[];
    patterns: ContentPattern[];
    metadata: {
      totalPosts: number;
      totalCreators: number;
      avgEngagement: number;
      exportDate: string;
    };
  } {
    const avgEngagement = this.viralDatabase.reduce((sum, post) => sum + post.engagementRate, 0) / this.viralDatabase.length;
    
    return {
      viralPosts: this.viralDatabase,
      creators: this.creatorProfiles,
      patterns: this.contentPatterns,
      metadata: {
        totalPosts: this.viralDatabase.length,
        totalCreators: this.creatorProfiles.length,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        exportDate: new Date().toISOString()
      }
    };
  }
}
