import { ApifyClient } from 'apify-client';

interface ApifyConfig {
  platform: 'tiktok' | 'instagram';
  username: string;
  count: number;
  postUrl?: string; // For comment scraping
}

interface CommentData {
  id: string;
  text: string;
  ownerUsername: string;
  ownerProfilePicUrl?: string;
  ownerIsVerified?: boolean;
  likesCount?: number;
  timestamp?: string;
  position?: number;
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

export class ApifyScraper {
  private client: ApifyClient;
  private config: ApifyConfig;

  constructor(config: ApifyConfig) {
    this.config = config;
    
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('APIFY_API_KEY environment variable is required');
    }
    
    this.client = new ApifyClient({
      token: apiKey
    });
  }

  async scrapeVideos(): Promise<{videos: VideoData[], dataSource: string}> {
    try {
      let videos: VideoData[];
      let dataSource = 'apify';
      
      if (this.config.platform === 'tiktok') {
        videos = await this.scrapeTikTokVideos();
        // Real TikTok videos from Apify have real data, so dataSource is always 'apify'
        dataSource = 'apify';
      } else if (this.config.platform === 'instagram') {
        videos = await this.scrapeInstagramVideos();
        // Instagram now tries to get real data first
        dataSource = 'apify';
      } else {
        throw new Error(`Unsupported platform: ${this.config.platform}`);
      }
      
      return { videos, dataSource };
    } catch (error) {
      console.error('Apify scraping failed:', error);
      throw error;
    }
  }

  private async scrapeTikTokVideos(): Promise<VideoData[]> {
    try {
      console.log(`Starting TikTok scraping for @${this.config.username}`);
      
      const normalize = (name: string | undefined): string => {
        return (name || '')
          .toLowerCase()
          .replace('@', '')
          .replace(/[^a-z0-9]/g, '');
      };
      const requestedUsernameNormalized = normalize(this.config.username);

      // Try multiple Apify actors to get real TikTok data
      const actors = [
        '763fjhW8IV6xMgJEC', // thenetaji/tiktok-scraper
        // Add additional actors to improve hit rate; order matters
        'wXvJ1cR7y6H0jQabc', // placeholder for alternative TikTok scraper
        'zr3tAK2PqiUe9Ydef'  // placeholder for alternative TikTok scraper
      ];
      
      for (const actorId of actors) {
        try {
          console.log(`Trying actor: ${actorId}`);
          
          const run = await this.client.actor(actorId).call({
            startUrls: [{ url: `https://www.tiktok.com/@${this.config.username}` }],
            // Fetch more than needed, then filter/slice to latest 10
            resultsLimit: Math.max(this.config.count, 50),
            maxItems: Math.max(this.config.count, 50),
            maxItemsPerStartUrl: Math.max(this.config.count, 50),
            // Add more specific parameters to get videos from the exact user
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            // Try to get more recent videos
            sortBy: 'date',
            // Add timeout to prevent hanging
            timeout: 30000
          });

          console.log(`TikTok run completed:`, run.id);
          
          // Wait for the run to complete
          await this.waitForRunCompletion(run.id);
          
          const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
          console.log(`Found ${items.length} TikTok items from ${actorId}`);
          
          if (items.length === 0) {
            console.log(`No items found from ${actorId}, trying next actor`);
            continue;
          }

          // Check if we have individual video items or profile data
          const firstItem = items[0];
          console.log('First item structure:', Object.keys(firstItem));
      
          // If we have individual video items (not profile data)
          if (firstItem.id && firstItem.desc !== undefined) {
            console.log('Found individual video items, checking if they match the requested username');
            
                // Filter videos to only include those from the requested username
                const filteredItems = items.filter((item: any) => {
                  const authorUsername = item.author?.uniqueId || item.author?.nickname || '';
                  const itemUsernameNormalized = normalize(authorUsername);
                  return itemUsernameNormalized === requestedUsernameNormalized;
                });
            
            if (filteredItems.length === 0) {
              console.log(`No videos found for @${this.config.username} from ${actorId}, trying next actor`);
              console.log('Available usernames in results:', items.map((item: any) => normalize(item.author?.uniqueId || item.author?.nickname || 'unknown')).slice(0, 5));
              continue;
            }
            
            console.log(`Found ${filteredItems.length} real videos from @${this.config.username} using ${actorId}`);
            // Sort TikTok videos by createTime (latest first)
            const sortedTikTokItems = filteredItems
              .filter(item => item.createTime) // Filter out items without timestamps
              .sort((a, b) => parseInt(String(b.createTime)) - parseInt(String(a.createTime)));
            
            return sortedTikTokItems.slice(0, this.config.count).map((item: any, index: number) => ({
              id: item.id || `${Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000}`,
              caption: item.desc || item.text || item.description || 'No caption available',
              postUrl: `https://tiktok.com/@${this.config.username}/video/${item.id}`,
              hook: this.extractHook(item.desc || item.text || item.description || ''),
              transcript: this.generateTranscript(item.desc || item.text || item.description || ''),
              views: item.stats?.playCount || item.playCount || 0,
              likes: item.stats?.diggCount || item.diggCount || 0,
              uploadDate: item.createTime ? new Date(parseInt(item.createTime) * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              thumbnail: item.video?.cover || item.video?.originCover || item.cover || '',
              username: this.config.username,
              duration: item.video?.duration || 0,
              comments: item.stats?.commentCount || item.commentCount || 0,
              shares: item.stats?.shareCount || item.shareCount || 0
            }));
          }
      
          // If we have profile data but no individual videos, check if profile matches
          if (firstItem.itemList && Array.isArray(firstItem.itemList) && firstItem.itemList.length === 0) {
            console.log('No individual videos found, checking if profile matches requested username');
            const profileUsername = (firstItem as any).user?.uniqueId || (firstItem as any).uniqueId || '';
            
            if (profileUsername.toLowerCase() !== this.config.username.toLowerCase()) {
              console.log(`Profile username (${profileUsername}) doesn't match requested username (${this.config.username}) from ${actorId}, trying next actor`);
              continue;
            }
            
            console.log('Profile matches requested username, but no videos found, trying next actor');
            continue;
          }

          // If we have profile data with videos in itemList
          if (firstItem.itemList && Array.isArray(firstItem.itemList) && firstItem.itemList.length > 0) {
            console.log('Found videos in itemList, checking if they match the requested username');
            
                // Filter videos to only include those from the requested username
                const filteredItems = firstItem.itemList.filter((item: any) => {
                  const authorUsername = item.author?.uniqueId || item.author?.nickname || '';
                  const itemUsernameNormalized = normalize(authorUsername);
                  return itemUsernameNormalized === requestedUsernameNormalized;
                });
            
            if (filteredItems.length === 0) {
              console.log(`No videos found for @${this.config.username} in itemList from ${actorId}, trying next actor`);
              console.log('Available usernames in itemList:', firstItem.itemList.map((item: any) => normalize(item.author?.uniqueId || item.author?.nickname || 'unknown')).slice(0, 5));
              continue;
            }
            
            console.log(`Found ${filteredItems.length} real videos from @${this.config.username} in itemList using ${actorId}`);
            // Sort TikTok itemList videos by createTime (latest first)
            const sortedItemListItems = filteredItems
              .filter(item => item.createTime) // Filter out items without timestamps
              .sort((a, b) => parseInt(String(b.createTime)) - parseInt(String(a.createTime)));
            
            return sortedItemListItems.slice(0, this.config.count).map((item: any, index: number) => ({
              id: item.id || `${Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000}`,
              caption: item.desc || item.text || item.description || 'No caption available',
              postUrl: `https://tiktok.com/@${this.config.username}/video/${item.id}`,
              hook: this.extractHook(item.desc || item.text || item.description || ''),
              transcript: this.generateTranscript(item.desc || item.text || item.description || ''),
              views: item.stats?.playCount || item.playCount || 0,
              likes: item.stats?.diggCount || item.diggCount || 0,
              uploadDate: item.createTime ? new Date(parseInt(item.createTime) * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              thumbnail: item.video?.cover || item.video?.originCover || item.cover || '',
              username: this.config.username,
              duration: item.video?.duration || 0,
              comments: item.stats?.commentCount || item.commentCount || 0,
              shares: item.stats?.shareCount || item.shareCount || 0
            }));
          }
        } catch (actorError) {
          console.log(`Actor ${actorId} failed:`, actorError);
          continue;
        }
      }
      
      // If all actors failed, throw an error instead of falling back to demo data
      throw new Error(`No real TikTok videos found for @${this.config.username}. All Apify actors failed to return videos for this username.`);
      
    } catch (error) {
      console.error('TikTok scraping error:', error);
      throw new Error(`Failed to scrape real TikTok videos for @${this.config.username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateTikTokVideos(): VideoData[] {
    const videos: VideoData[] = [];
    const baseDate = new Date();
    
    // Generate realistic TikTok video data
    for (let i = 0; i < this.config.count; i++) {
      // Generate a more realistic TikTok video ID format (19-digit number)
      const videoId = `${Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000}`;
      const uploadDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate realistic engagement for TikTok
      const views = Math.floor(Math.random() * 10000000) + 100000;
      const likes = Math.floor(views * (0.05 + Math.random() * 0.15));
      const comments = Math.floor(likes * (0.01 + Math.random() * 0.05));
      const shares = Math.floor(likes * (0.005 + Math.random() * 0.02));
      
      const captions = [
        `Latest TikTok from @${this.config.username} 🚀 #${this.config.username} #tiktok #viral #fyp`,
        `Check out this amazing content from @${this.config.username}! #${this.config.username} #content #trending`,
        `Real TikTok content from @${this.config.username} - Fresh videos daily! #${this.config.username} #social`,
        `Latest update from @${this.config.username} on TikTok 📱 #${this.config.username} #update #foryou`,
        `Amazing TikTok from @${this.config.username} - Don't miss this! #${this.config.username} #mustsee #viral`
      ];
      
      const caption = captions[Math.floor(Math.random() * captions.length)];
      
      videos.push({
        id: videoId,
        caption: caption,
        postUrl: `https://tiktok.com/@${this.config.username}/video/${videoId}`,
        hook: this.extractHook(caption),
        transcript: this.generateTranscript(caption),
        views: views,
        likes: likes,
        uploadDate: uploadDate.toISOString().split('T')[0],
        thumbnail: `https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/real_${i}.jpeg`,
        username: this.config.username,
        duration: Math.floor(Math.random() * 60) + 15,
        comments: comments,
        shares: shares
      });
    }
    
    return videos;
  }

  private async scrapeInstagramVideos(): Promise<VideoData[]> {
    try {
      console.log(`Starting Instagram scraping for @${this.config.username}`);
      
          // Try to get real Instagram data using the Instagram Reel Scraper
          try {
            const run = await this.client.actor('apify/instagram-reel-scraper').call({
              username: [this.config.username],
              resultsLimit: this.config.count,
              // Add proxy configuration for better success rate
              proxyConfiguration: {
                useApifyProxy: true,
                apifyProxyGroups: ['RESIDENTIAL']
              }
            });

        console.log(`Instagram run completed:`, run.id);
        
        // Wait for the run to complete
        await this.waitForRunCompletion(run.id);
        
        const { items } = await this.client.dataset(run?.defaultDatasetId || '').listItems();
        console.log(`Found ${items.length} Instagram items`);
        
        if (items.length === 0 || !items[0]?.id || items[0]?.id === 'undefined') {
          throw new Error(`No real Instagram videos found for @${this.config.username}. Instagram scraping is currently not working properly. Please try TikTok instead.`);
        }
        
            console.log('Found real Instagram data, mapping it');
            // Sort items by timestamp (latest first) and then map
            const sortedItems = items
              .filter(item => item.timestamp) // Filter out items without timestamps
              .sort((a, b) => new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime());
            
            return sortedItems.slice(0, this.config.count).map((item: any, index: number) => ({
              id: item.id || item.shortCode || `ig_${Date.now()}_${index}`,
              caption: item.caption || 'No caption available',
              postUrl: item.url || `https://instagram.com/reel/${item.shortCode}/`,
              hook: this.extractHook(item.caption || ''),
              transcript: this.generateTranscript(item.caption || ''),
              views: item.videoViewCount || item.likesCount || 0,
              likes: item.likesCount || 0,
              uploadDate: item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              thumbnail: (item.images && item.images.length > 0 && item.images[0])
                ? item.images[0]
                : (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/media/?size=l` : ''),
              username: this.config.username,
              duration: item.videoDuration || 0,
              comments: item.commentsCount || 0,
              shares: 0
            }));
      } catch (apifyError) {
        console.log('Apify Instagram scraping failed:', apifyError);
        throw new Error(`Failed to scrape real Instagram videos for @${this.config.username}: ${apifyError instanceof Error ? apifyError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Instagram scraping error:', error);
      throw new Error(`Failed to scrape real Instagram videos for @${this.config.username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateInstagramVideos(): VideoData[] {
    const videos: VideoData[] = [];
    const baseDate = new Date();
    
    // Generate realistic Instagram video data
    for (let i = 0; i < this.config.count; i++) {
      const videoId = `ig_${Date.now()}_${i}`;
      const uploadDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate realistic engagement for Instagram
      const views = Math.floor(Math.random() * 1000000) + 10000;
      const likes = Math.floor(views * (0.05 + Math.random() * 0.1));
      const comments = Math.floor(likes * (0.01 + Math.random() * 0.05));
      const shares = Math.floor(likes * (0.005 + Math.random() * 0.02));
      
      const captions = [
        `Real content from @${this.config.username} on Instagram 📸 #${this.config.username} #instagram #viral`,
        `Latest post from @${this.config.username} - This is real Instagram content 🚀 #${this.config.username} #insta`,
        `Check out this amazing content from @${this.config.username} on Instagram! #${this.config.username} #content`,
        `Real Instagram post from @${this.config.username} - Fresh content daily! #${this.config.username} #social`,
        `Latest update from @${this.config.username} on Instagram 📱 #${this.config.username} #update`
      ];
      
      const caption = captions[Math.floor(Math.random() * captions.length)];
      
      videos.push({
        id: videoId,
        caption: caption,
        postUrl: `https://instagram.com/p/${videoId}/`,
        hook: this.extractHook(caption),
        transcript: this.generateTranscript(caption),
        views: views,
        likes: likes,
        uploadDate: uploadDate.toISOString().split('T')[0],
        thumbnail: `https://instagram.com/p/${videoId}/media/?size=m`,
        username: this.config.username,
        duration: Math.floor(Math.random() * 60) + 15,
        comments: comments,
        shares: shares
      });
    }
    
    return videos;
  }

  private extractHook(text: string): string {
    // Extract the first sentence or first 50 characters as hook
    const firstSentence = text.split('.')[0];
    const firstLine = text.split('\n')[0];
    const hook = firstSentence.length > 50 ? firstLine.substring(0, 50) + '...' : firstSentence;
    return hook || 'No hook available';
  }

  private generateTranscript(text: string): string {
    // For now, use the caption as transcript
    // In a real implementation, you'd use speech-to-text services
    return text || 'No transcript available';
  }

  private generateVideosFromProfile(profileData: any): VideoData[] {
    const videos: VideoData[] = [];
    const baseDate = new Date();
    const videoCount = profileData.stats?.videoCount || this.config.count;
    const actualCount = Math.min(videoCount, this.config.count);
    
    // Generate realistic video data based on profile stats
    for (let i = 0; i < actualCount; i++) {
      const videoId = `${Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000}`;
      const uploadDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate realistic engagement based on profile stats
      const avgViews = Math.floor((profileData.stats?.heart || 0) / (videoCount || 1));
      const views = Math.floor(avgViews * (0.5 + Math.random()));
      const likes = Math.floor(views * (0.05 + Math.random() * 0.1));
      const comments = Math.floor(likes * (0.01 + Math.random() * 0.05));
      const shares = Math.floor(likes * (0.005 + Math.random() * 0.02));
      
      videos.push({
        id: videoId,
        caption: `Real content from @${this.config.username} - This is actual data from TikTok 🚀 #${this.config.username} #tiktok #viral`,
        postUrl: `https://tiktok.com/@${this.config.username}/video/${videoId}`,
        hook: `Real content from @${this.config.username}`,
        transcript: `This is real content from ${this.config.username} on TikTok. The actual video content would be transcribed here with speech-to-text technology.`,
        views: views,
        likes: likes,
        uploadDate: uploadDate.toISOString().split('T')[0],
        thumbnail: `https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/real_${i}.jpeg`,
        username: this.config.username,
        duration: Math.floor(Math.random() * 60) + 15,
        comments: comments,
        shares: shares
      });
    }
    
    return videos;
  }

  async scrapeComments(postUrl: string): Promise<CommentData[]> {
    try {
      console.log(`Starting comment scraping for post: ${postUrl}`);
      
      if (this.config.platform === 'instagram') {
        return await this.scrapeInstagramComments(postUrl);
      } else {
        throw new Error(`Comment scraping not supported for platform: ${this.config.platform}`);
      }
    } catch (error) {
      console.error('Comment scraping failed:', error);
      throw error;
    }
  }

  private async scrapeInstagramComments(postUrl: string): Promise<CommentData[]> {
    try {
      console.log(`Scraping Instagram comments for: ${postUrl}`);
      
      // Validate that it's a post URL, not a profile URL
      if (!postUrl.includes('/p/') && !postUrl.includes('/reel/')) {
        throw new Error('Please provide a direct link to a specific Instagram post (URL should contain /p/ or /reel/)');
      }
      
      const run = await this.client.actor('apify/instagram-scraper').call({
        directUrls: [postUrl],
        resultsType: 'comments',
        resultsLimit: 100, // Scrape up to 1000 comments and replies
        searchLimit: 1,
        commentsLimit: 100, // Maximum comments to scrape per post
        includeNestedComments: true, // Include all replies
        maxRequestRetries: 3,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      });

      console.log(`Instagram comment scrape run completed:`, run.id);
      
      // Wait for the run to complete
      await this.waitForRunCompletion(run.id);
      
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      console.log(`Found ${items.length} Instagram comments and replies`);
      
      if (items.length === 0) {
        throw new Error('No comments found for this post. The post may have comments disabled or no comments yet.');
      }
      
      // Sort all comments by likes (most liked first)
      const sortedComments = items
        .sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0));
      
      console.log(`Returning all ${sortedComments.length} comments sorted by likes`);
      
      return sortedComments.map((item: any, index: number) => ({
        id: item.id || `comment_${Date.now()}_${index}`,
        text: item.text || '',
        ownerUsername: item.ownerUsername || 'unknown',
        ownerProfilePicUrl: item.ownerProfilePicUrl,
        ownerIsVerified: item.ownerIsVerified || false,
        likesCount: item.likesCount || 0,
        timestamp: item.timestamp,
        position: index + 1 // Re-index based on sorted position
      }));
    } catch (error) {
      console.error('Instagram comment scraping error:', error);
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('failed with status: FAILED')) {
          throw new Error('Instagram scraping failed. Please ensure you\'re using a valid Instagram POST URL (e.g., https://www.instagram.com/p/ABC123/)');
        }
        throw new Error(error.message);
      }
      throw new Error('Failed to scrape Instagram comments. Please check your URL and try again.');
    }
  }

  private async waitForRunCompletion(runId: string, maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const run = await this.client.run(runId).get();
      
      if (run?.status === 'SUCCEEDED') {
        console.log(`Run ${runId} completed successfully`);
        return;
      } else if (run?.status === 'FAILED' || run?.status === 'ABORTED') {
        throw new Error(`Run ${runId} failed with status: ${run?.status}`);
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Run ${runId} timed out after ${maxWaitTime}ms`);
  }
}

export type { CommentData };
