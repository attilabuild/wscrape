import fs from 'fs/promises';
import path from 'path';

export interface ViralPost {
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
  viralScore: number;
}

interface DatabaseStats {
  totalPosts: number;
  totalCreators: number;
  avgEngagement: number;
  topContentTypes: { [key: string]: number };
  dateRange: { start: string; end: string };
  lastUpdated: string;
}

interface SearchFilters {
  contentType?: string[];
  minViralScore?: number;
  minEngagement?: number;
  dateRange?: { start: string; end: string };
  creators?: string[];
  hashtags?: string[];
  keywords?: string[];
}

interface ViralPattern {
  pattern: string;
  examples: string[];
  avgEngagement: number;
  frequency: number;
  viralPotential: number;
}

export class ViralDatabase {
  private dbPath: string;
  private posts: ViralPost[] = [];
  private stats: DatabaseStats | null = null;
  private patterns: ViralPattern[] = [];

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'viral-database.json');
  }

  /**
   * Initialize database (create directory if needed)
   */
  async initialize(): Promise<void> {
    try {
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Try to load existing database
      await this.loadDatabase();
      console.log(`📊 Viral Database loaded: ${this.posts.length} posts`);
    } catch (error) {
      console.log('📝 Creating new viral database...');
      this.posts = [];
      this.stats = this.calculateStats();
      await this.saveDatabase();
    }
  }

  /**
   * Add viral posts to database
   */
  async addPosts(newPosts: ViralPost[]): Promise<void> {
    console.log(`📝 Adding ${newPosts.length} new posts to viral database...`);
    
    // Filter out duplicates
    const existingIds = new Set(this.posts.map(p => p.id));
    const uniquePosts = newPosts.filter(post => !existingIds.has(post.id));
    
    console.log(`🆕 ${uniquePosts.length} unique posts after deduplication`);
    
    // Add unique posts
    this.posts.push(...uniquePosts);
    
    // Sort by viral score
    this.posts.sort((a, b) => b.viralScore - a.viralScore);
    
    // Keep only top 10,000 posts to manage size
    if (this.posts.length > 10000) {
      this.posts = this.posts.slice(0, 10000);
      console.log('🗃️  Trimmed database to top 10,000 viral posts');
    }
    
    // Update stats and patterns
    this.stats = this.calculateStats();
    this.patterns = this.extractPatterns();
    
    // Save to disk
    await this.saveDatabase();
    
    console.log(`✅ Database updated: ${this.posts.length} total posts`);
  }

  /**
   * Search viral posts with filters
   */
  searchPosts(filters: SearchFilters = {}, limit: number = 100): ViralPost[] {
    let filteredPosts = [...this.posts];

    // Filter by content type
    if (filters.contentType && filters.contentType.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.contentType!.includes(post.contentType)
      );
    }

    // Filter by viral score
    if (filters.minViralScore !== undefined) {
      filteredPosts = filteredPosts.filter(post => 
        post.viralScore >= filters.minViralScore!
      );
    }

    // Filter by engagement rate
    if (filters.minEngagement !== undefined) {
      filteredPosts = filteredPosts.filter(post => 
        post.engagementRate >= filters.minEngagement!
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.uploadDate);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return postDate >= startDate && postDate <= endDate;
      });
    }

    // Filter by creators
    if (filters.creators && filters.creators.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.creators!.includes(post.username)
      );
    }

    // Filter by hashtags
    if (filters.hashtags && filters.hashtags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.hashtags!.some(hashtag => 
          post.hashtags.some(postHashtag => 
            postHashtag.toLowerCase().includes(hashtag.toLowerCase())
          )
        )
      );
    }

    // Filter by keywords
    if (filters.keywords && filters.keywords.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.keywords!.some(keyword => 
          post.caption.toLowerCase().includes(keyword.toLowerCase()) ||
          post.hook.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    return filteredPosts.slice(0, limit);
  }

  /**
   * Get viral hooks by pattern
   */
  getViralHooks(pattern?: string, limit: number = 50): { hook: string; engagement: number; views: number }[] {
    let posts = this.posts;
    
    if (pattern) {
      posts = posts.filter(post => 
        this.matchesPattern(post.hook, pattern)
      );
    }
    
    return posts
      .slice(0, limit)
      .map(post => ({
        hook: post.hook,
        engagement: post.engagementRate,
        views: post.views
      }));
  }

  /**
   * Get content suggestions based on viral patterns
   */
  getContentSuggestions(niche: string, count: number = 10): {
    hook: string;
    contentType: string;
    expectedEngagement: number;
    viralPotential: number;
    inspiration: string;
  }[] {
    // Get top viral posts from niche
    const nichePosts = this.searchPosts({ 
      contentType: [niche], 
      minViralScore: 70 
    }, 100);

    const suggestions = [];
    
    for (let i = 0; i < count && i < nichePosts.length; i++) {
      const post = nichePosts[i];
      const variations = this.generateHookVariations(post.hook);
      
      suggestions.push({
        hook: variations[0] || post.hook,
        contentType: post.contentType,
        expectedEngagement: post.engagementRate,
        viralPotential: post.viralScore,
        inspiration: `Based on @${post.username}'s post with ${post.likes.toLocaleString()} likes`
      });
    }
    
    return suggestions;
  }

  /**
   * Analyze viral trends
   */
  getViralTrends(): {
    trendingHooks: ViralPattern[];
    risingContentTypes: { type: string; growth: number; avgEngagement: number }[];
    topPerformers: { username: string; avgViralScore: number; postCount: number }[];
    insights: string[];
  } {
    // Trending hook patterns
    const trendingHooks = this.patterns
      .filter(p => p.viralPotential > 50)
      .sort((a, b) => b.viralPotential - a.viralPotential)
      .slice(0, 10);

    // Content type performance
    const contentTypeStats: { [key: string]: { posts: ViralPost[]; totalEngagement: number } } = {};
    
    this.posts.forEach(post => {
      if (!contentTypeStats[post.contentType]) {
        contentTypeStats[post.contentType] = { posts: [], totalEngagement: 0 };
      }
      contentTypeStats[post.contentType].posts.push(post);
      contentTypeStats[post.contentType].totalEngagement += post.engagementRate;
    });

    const risingContentTypes = Object.entries(contentTypeStats)
      .map(([type, data]) => ({
        type,
        growth: data.posts.length,
        avgEngagement: data.totalEngagement / data.posts.length
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    // Top performing creators
    const creatorStats: { [key: string]: { scores: number[]; posts: number } } = {};
    
    this.posts.forEach(post => {
      if (!creatorStats[post.username]) {
        creatorStats[post.username] = { scores: [], posts: 0 };
      }
      creatorStats[post.username].scores.push(post.viralScore);
      creatorStats[post.username].posts++;
    });

    const topPerformers = Object.entries(creatorStats)
      .map(([username, data]) => ({
        username,
        avgViralScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
        postCount: data.posts
      }))
      .filter(creator => creator.postCount >= 3) // Need at least 3 posts
      .sort((a, b) => b.avgViralScore - a.avgViralScore)
      .slice(0, 20);

    // Generate insights
    const insights = this.generateInsights();

    return {
      trendingHooks,
      risingContentTypes,
      topPerformers,
      insights
    };
  }

  /**
   * Get all viral posts
   */
  getAllPosts(): ViralPost[] {
    return this.posts;
  }

  /**
   * Get database statistics
   */
  getStats(): DatabaseStats | null {
    return this.stats;
  }

  /**
   * Export database for backup
   */
  async exportDatabase(filePath?: string): Promise<string> {
    const exportPath = filePath || path.join(process.cwd(), 'exports', `viral-db-${Date.now()}.json`);
    
    const exportData = {
      posts: this.posts,
      stats: this.stats,
      patterns: this.patterns,
      exported: new Date().toISOString()
    };
    
    await fs.mkdir(path.dirname(exportPath), { recursive: true });
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`📁 Database exported to: ${exportPath}`);
    return exportPath;
  }

  // PRIVATE METHODS

  /**
   * Load database from disk
   */
  private async loadDatabase(): Promise<void> {
    const data = await fs.readFile(this.dbPath, 'utf-8');
    const parsed = JSON.parse(data);
    
    this.posts = parsed.posts || [];
    this.stats = parsed.stats || null;
    this.patterns = parsed.patterns || [];
  }

  /**
   * Save database to disk
   */
  private async saveDatabase(): Promise<void> {
    const data = {
      posts: this.posts,
      stats: this.stats,
      patterns: this.patterns,
      lastSaved: new Date().toISOString()
    };
    
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  /**
   * Calculate database statistics
   */
  private calculateStats(): DatabaseStats {
    if (this.posts.length === 0) {
      return {
        totalPosts: 0,
        totalCreators: 0,
        avgEngagement: 0,
        topContentTypes: {},
        dateRange: { start: '', end: '' },
        lastUpdated: new Date().toISOString()
      };
    }

    const uniqueCreators = new Set(this.posts.map(p => p.username));
    const avgEngagement = this.posts.reduce((sum, post) => sum + post.engagementRate, 0) / this.posts.length;
    
    const contentTypeCounts: { [key: string]: number } = {};
    this.posts.forEach(post => {
      contentTypeCounts[post.contentType] = (contentTypeCounts[post.contentType] || 0) + 1;
    });

    const dates = this.posts.map(p => p.uploadDate).sort();
    
    return {
      totalPosts: this.posts.length,
      totalCreators: uniqueCreators.size,
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      topContentTypes: contentTypeCounts,
      dateRange: {
        start: dates[0] || '',
        end: dates[dates.length - 1] || ''
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Extract viral patterns from posts
   */
  private extractPatterns(): ViralPattern[] {
    const patternMap: { [key: string]: { posts: ViralPost[]; engagements: number[] } } = {};
    
    this.posts.forEach(post => {
      const patterns = this.identifyHookPatterns(post.hook);
      
      patterns.forEach(pattern => {
        if (!patternMap[pattern]) {
          patternMap[pattern] = { posts: [], engagements: [] };
        }
        patternMap[pattern].posts.push(post);
        patternMap[pattern].engagements.push(post.engagementRate);
      });
    });

    return Object.entries(patternMap)
      .filter(([, data]) => data.posts.length >= 5) // Need at least 5 examples
      .map(([pattern, data]) => ({
        pattern,
        examples: data.posts.slice(0, 3).map(p => p.hook),
        avgEngagement: data.engagements.reduce((sum, eng) => sum + eng, 0) / data.engagements.length,
        frequency: data.posts.length,
        viralPotential: this.calculateViralPotential(data.engagements, data.posts.length)
      }))
      .sort((a, b) => b.viralPotential - a.viralPotential);
  }

  /**
   * Identify hook patterns (reused from analyzer)
   */
  private identifyHookPatterns(hook: string): string[] {
    const patterns: string[] = [];
    const lowerHook = hook.toLowerCase();
    
    // Question patterns
    if (hook.includes('?')) patterns.push('question');
    if (lowerHook.startsWith('what') || lowerHook.startsWith('how') || lowerHook.startsWith('why')) patterns.push('interrogative');
    
    // Statement patterns
    if (lowerHook.startsWith('the ')) patterns.push('definitive');
    if (lowerHook.includes('you need') || lowerHook.includes('you should') || lowerHook.includes('you must')) patterns.push('instructional');
    if (lowerHook.includes('secret') || lowerHook.includes('trick') || lowerHook.includes('hack')) patterns.push('insider');
    
    // Emotional patterns
    if (lowerHook.includes('never') || lowerHook.includes('always') || lowerHook.includes('every')) patterns.push('absolute');
    if (lowerHook.includes('win') || lowerHook.includes('success') || lowerHook.includes('achieve')) patterns.push('aspirational');
    if (lowerHook.includes('mistake') || lowerHook.includes('wrong') || lowerHook.includes('fail')) patterns.push('cautionary');
    
    // Numerical patterns
    if (/\d+/.test(hook)) patterns.push('numerical');
    
    return patterns.length > 0 ? patterns : ['general'];
  }

  /**
   * Check if hook matches pattern
   */
  private matchesPattern(hook: string, pattern: string): boolean {
    const patterns = this.identifyHookPatterns(hook);
    return patterns.includes(pattern);
  }

  /**
   * Generate hook variations
   */
  private generateHookVariations(originalHook: string): string[] {
    const variations = [originalHook];
    
    // Simple variation techniques
    if (originalHook.includes('you')) {
      variations.push(originalHook.replace(/\byou\b/g, 'people'));
      variations.push(originalHook.replace(/\byou\b/g, 'everyone'));
    }
    
    if (originalHook.includes('never')) {
      variations.push(originalHook.replace('never', 'rarely'));
      variations.push(originalHook.replace('never', 'seldom'));
    }
    
    if (originalHook.includes('always')) {
      variations.push(originalHook.replace('always', 'often'));
      variations.push(originalHook.replace('always', 'usually'));
    }
    
    return variations.slice(0, 3); // Return top 3 variations
  }

  /**
   * Calculate viral potential score
   */
  private calculateViralPotential(engagements: number[], frequency: number): number {
    const avgEngagement = engagements.reduce((sum, eng) => sum + eng, 0) / engagements.length;
    const consistencyScore = 1 - (this.standardDeviation(engagements) / Math.max(avgEngagement, 0.1));
    const frequencyScore = Math.min(frequency / 20, 1);
    
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
   * Generate insights from data
   */
  private generateInsights(): string[] {
    const insights: string[] = [];
    
    if (this.stats) {
      // Engagement insights
      if (this.stats.avgEngagement > 10) {
        insights.push(`🔥 Database contains high-engagement content (${this.stats.avgEngagement}% avg engagement)`);
      }
      
      // Content type insights
      const topType = Object.entries(this.stats.topContentTypes)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topType) {
        insights.push(`📈 "${topType[0]}" content performs best with ${topType[1]} viral posts`);
      }
      
      // Pattern insights
      if (this.patterns.length > 0) {
        const topPattern = this.patterns[0];
        insights.push(`🎯 "${topPattern.pattern}" hooks have ${topPattern.avgEngagement.toFixed(1)}% avg engagement`);
      }
      
      // Creator insights
      const creatorCount = this.stats.totalCreators;
      const postsPerCreator = this.stats.totalPosts / creatorCount;
      
      if (postsPerCreator > 5) {
        insights.push(`👑 Top creators average ${postsPerCreator.toFixed(1)} viral posts each`);
      }
      
      // Temporal insights
      const { start, end } = this.stats.dateRange;
      if (start && end) {
        const daysDiff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
        const postsPerDay = this.stats.totalPosts / Math.max(daysDiff, 1);
        
        if (postsPerDay > 10) {
          insights.push(`⚡ High activity period: ${postsPerDay.toFixed(1)} viral posts per day`);
        }
      }
    }
    
    return insights;
  }
}
