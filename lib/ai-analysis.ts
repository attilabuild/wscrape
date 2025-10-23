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
  username?: string;
  comments?: number;
  shares?: number;
  engagementRate?: number;
}

interface AIAnalysis {
  overallScore: number; // 0-100
  viralPotential: 'Low' | 'Medium' | 'High' | 'Viral';
  keyInsights: string[];
  contentStrategy: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  competitorAnalysis: {
    positioning: string;
    differentiation: string[];
    gaps: string[];
  };
  contentOptimization: {
    hookSuggestions: string[];
    engagementTactics: string[];
    hashtagStrategy: string[];
  };
  trendAnalysis: {
    currentTrends: string[];
    emergingOpportunities: string[];
    contentGaps: string[];
  };
}

interface ContentSuggestion {
  hook: string;
  fullContent: string;
  hashtags: string[];
  postingStrategy: string;
  expectedEngagement: number;
  reasoning: string;
}

export class AIAnalysisEngine {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Comprehensive AI analysis of scraped videos
   */
  async analyzeScrapedContent(videos: VideoData[], username: string, niche: string): Promise<AIAnalysis> {
    console.log(`🧠 Running AI analysis for @${username} in ${niche} niche...`);

    const analysisPrompt = this.buildAnalysisPrompt(videos, username, niche);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert social media strategist and viral content analyst with deep expertise in TikTok and Instagram algorithms. You have analyzed thousands of viral posts and understand what makes content go viral across different niches.

Your analysis should be data-driven, actionable, and focused on creating viral content. Provide specific, tactical advice that can be implemented immediately.

Respond ONLY with valid JSON in the exact format specified, with no additional text or explanation.`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Parse error for cleaner logging
        let errorType = 'unknown';
        try {
          const errorObj = JSON.parse(errorText);
          errorType = errorObj.error?.type || errorObj.error?.code || 'api_error';
        } catch {
          errorType = 'parse_error';
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorType}`);
      }

      const result = await response.json();
      const analysisText = result.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis received from AI');
      }

      // Parse the JSON response
      const analysis: AIAnalysis = JSON.parse(analysisText);
      
      console.log(`✅ AI analysis complete - Overall Score: ${analysis.overallScore}/100`);
      return analysis;

    } catch (error) {
      // Log specific error types with clean messaging
      if (error instanceof Error) {
        if (error.message.includes('insufficient_quota') || error.message.includes('429')) {
          console.log('💳 OpenAI quota exceeded - using fallback analysis');
        } else if (error.message.includes('401')) {
          console.log('🔑 OpenAI authentication failed - using fallback analysis');
        } else {
          console.log('🚫 OpenAI API error - using fallback analysis');
          console.log(`   Error: ${error.message.split(' - ')[0]}`); // Only show the error type, not full JSON
        }
      }
      
      // Return fallback analysis
      return this.getFallbackAnalysis(videos, username, niche);
    }
  }

  /**
   * Generate AI-powered content suggestions
   */
  async generateContentSuggestions(
    niche: string, 
    targetAudience: string, 
    contentStyle: string,
    competitorData?: VideoData[]
  ): Promise<ContentSuggestion[]> {
    console.log(`🎯 Generating AI content suggestions for ${niche} niche...`);

    // If no API key, use fallback immediately
    if (!this.apiKey) {
      console.log('🔑 No OpenAI API key - using fallback suggestions');
      return this.getFallbackSuggestions(niche, competitorData);
    }

    const suggestionPrompt = this.buildSuggestionPrompt(niche, targetAudience, contentStyle, competitorData);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a viral content creation expert who has helped creators generate millions of views. You understand psychology, trends, and what makes content go viral. You consistently generate content with 69-95% viral potential.

Create content that is:
- Attention-grabbing and scroll-stopping
- Emotionally engaging
- Actionable and valuable
- Optimized for the specific platform algorithms
- Trend-aware and timely

Respond ONLY with valid JSON array of content suggestions, no additional text.`
            },
            {
              role: 'user',
              content: suggestionPrompt
            }
          ],
          max_tokens: 2500,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Parse error for cleaner logging
        let errorType = 'unknown';
        try {
          const errorObj = JSON.parse(errorText);
          errorType = errorObj.error?.type || errorObj.error?.code || 'api_error';
        } catch {
          errorType = 'parse_error';
        }
        console.log(`🔑 OpenAI API error (${response.status}) - using fallback suggestions`);
        return this.getFallbackSuggestions(niche, competitorData);
      }

      const result = await response.json();
      const suggestionsText = result.choices[0]?.message?.content;

      if (!suggestionsText) {
        console.log('⚠️ No suggestions from AI - using fallback');
        return this.getFallbackSuggestions(niche, competitorData);
      }

      const suggestions: ContentSuggestion[] = JSON.parse(suggestionsText);
      
      console.log(`✅ Generated ${suggestions.length} AI content suggestions`);
      return suggestions;

    } catch (error) {
      console.log('🔄 AI error - using fallback suggestions');
      return this.getFallbackSuggestions(niche, competitorData);
    }
  }

  /**
   * Analyze competitor content and provide strategic insights
   */
  async analyzeCompetitorStrategy(
    competitors: { username: string; videos: VideoData[] }[],
    yourNiche: string
  ): Promise<{
    competitorInsights: { [username: string]: any };
    strategicRecommendations: string[];
    contentGaps: string[];
    differentiationOpportunities: string[];
  }> {
    console.log(`🕵️ Analyzing ${competitors.length} competitors...`);

    const competitorPrompt = this.buildCompetitorPrompt(competitors, yourNiche);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a competitive intelligence expert specializing in social media strategy. You analyze competitor content to identify gaps, opportunities, and strategic advantages.

Your analysis should reveal:
- What competitors are doing well
- What they're missing
- Untapped opportunities
- Strategic differentiation opportunities
- Content gaps in the market

Provide actionable insights that can be used to outperform competitors.

Respond ONLY with valid JSON, no additional text.`
            },
            {
              role: 'user',
              content: competitorPrompt
            }
          ],
          max_tokens: 2500,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Parse error for cleaner logging
        let errorType = 'unknown';
        try {
          const errorObj = JSON.parse(errorText);
          errorType = errorObj.error?.type || errorObj.error?.code || 'api_error';
        } catch {
          errorType = 'parse_error';
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorType}`);
      }

      const result = await response.json();
      const analysisText = result.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No competitor analysis received from AI');
      }

      const analysis = JSON.parse(analysisText);
      
      console.log(`✅ Competitor analysis complete`);
      return analysis;

    } catch (error) {
      console.error('Competitor analysis failed:', error);
      return this.getFallbackCompetitorAnalysis();
    }
  }

  /**
   * Optimize content for maximum viral potential
   */
  async optimizeForViral(content: string, niche: string, targetMetrics?: any): Promise<{
    optimizedContent: string;
    videoTimeline: {
      "0-3s": string;
      "3-6s": string;
      "6-10s": string;
      "10-13s": string;
      "13-17s": string;
      "17-21s": string;
      "21-25s": string;
      "25-28s": string;
      "28-30s": string;
    };
    improvements: string[];
    viralScore: number;
    reasoningChain: string[];
  }> {
    console.log(`⚡ Optimizing content for viral potential...`);

    const optimizationPrompt = `
Transform this content idea into a viral 30-second video script for the ${niche} niche:

CONTENT TO TRANSFORM:
"${content}"

TARGET METRICS: ${targetMetrics ? JSON.stringify(targetMetrics) : 'Maximum engagement and reach'}

IMPORTANT: Use the specific hook, description, and hashtags provided above. Do NOT create a generic story. Base your script on the actual content idea provided.

Create a detailed 30-second viral video script with precise timing, visual cues, and keywords for each segment. Follow this exact format:

FORMAT EXAMPLE:
0–3s (Hook): "Two teenagers in Ireland…" → Teenagers / Ireland
3–6s: "Payments killed their startups…" → Problem / Blocked
6–10s: "Built Stripe in 2010, 7 lines of code…" → Code / 2010
10–13s: "Everyone said payments was boring…" → Boring / Banks
13–17s: "Developers loved it, ditched PayPal…" → Dev Love / PayPal
17–21s: "Stripe became default in Silicon Valley…" → Default / Startups
21–25s: "Now processes hundreds of billions…" → Billions / Growth
25–28s: "Brothers = billionaires before 30…" → Billionaires / <30
28–30s (Loop Hook): "All started because they couldn't get paid…" → Can't Pay / Start Again

REQUIREMENTS:
- Each segment must have: "exact script text…" → Visual Keyword 1 / Visual Keyword 2
- Visual keywords should be 1-2 words that can be displayed on screen
- Create a compelling story arc with clear progression
- Include a loop hook at the end to encourage re-watching
- Make it easy to film: one quick visual per beat
- Optimize for TikTok/Instagram Reels format

Provide your response as JSON with this exact structure:
{
  "optimizedContent": "Complete 30-second video script with visual cues and keywords",
  "videoTimeline": {
    "0-3s": "Hook script with visual cues → Keyword1 / Keyword2",
    "3-6s": "Problem/Setup script → Keyword1 / Keyword2", 
    "6-10s": "Development script → Keyword1 / Keyword2",
    "10-13s": "Challenge script → Keyword1 / Keyword2",
    "13-17s": "Success script → Keyword1 / Keyword2",
    "17-21s": "Impact script → Keyword1 / Keyword2",
    "21-25s": "Scale script → Keyword1 / Keyword2",
    "25-28s": "Result script → Keyword1 / Keyword2",
    "28-30s": "Loop hook script → Keyword1 / Keyword2"
  },
  "improvements": ["list of specific improvements made"],
  "viralScore": number (0-100),
  "reasoningChain": ["step by step reasoning for each optimization"]
}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a viral content optimization expert. Your optimizations have helped content achieve millions of views. You understand psychology, algorithms, and what makes people stop scrolling and engage. You consistently optimize content to achieve 69-95% viral potential.

CRITICAL: You must base your script on the EXACT content provided. Do not create generic stories. Use the specific hook, description, hashtags, and reasoning provided to create a relevant viral script.

Focus on creating content that:
- Stops the scroll immediately using the provided hook
- Builds on the specific content idea provided
- Triggers strong emotional responses
- Encourages comments and shares
- Aligns with platform algorithms
- Has high replay value

CRITICAL: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or additional text. The response must be parseable JSON that starts with { and ends with }.`
            },
            {
              role: 'user',
              content: optimizationPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Parse error for cleaner logging
        let errorType = 'unknown';
        try {
          const errorObj = JSON.parse(errorText);
          errorType = errorObj.error?.type || errorObj.error?.code || 'api_error';
        } catch {
          errorType = 'parse_error';
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorType}`);
      }

      const result = await response.json();
      const optimizationText = result.choices[0]?.message?.content;

      if (!optimizationText) {
        throw new Error('No optimization received from AI');
      }

      // Clean the response text before parsing
      let cleanOptimizationText = optimizationText.trim();
      
      // Remove any markdown code blocks if present
      if (cleanOptimizationText.startsWith('```json')) {
        cleanOptimizationText = cleanOptimizationText.replace(/```json\n?/, '').replace(/```$/, '');
      }
      
      // Try to find JSON object in the response
      const jsonMatch = cleanOptimizationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanOptimizationText = jsonMatch[0];
      }
      
      let optimization;
      try {
        optimization = JSON.parse(cleanOptimizationText);
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON, using fallback:', parseError);
        // Fallback to a default optimization structure
        optimization = {
          optimizedContent: content,
          viralScore: 75,
          improvements: ["Enhanced hook for better engagement", "Improved call-to-action", "Better pacing"],
          videoTimeline: {
            "0-3s": "Hook: Start with a compelling statement → Attention / Impact",
            "3-6s": "Setup: Establish the problem → Problem / Challenge", 
            "6-10s": "Development: Show the journey → Journey / Process",
            "10-15s": "Climax: Reveal the solution → Solution / Transformation",
            "15-20s": "Resolution: Show the result → Result / Success"
          },
          hashtags: ["#viral", "#success", "#motivation"],
          callToAction: "Follow for more tips!",
          engagementTips: ["Use trending sounds", "Post at peak hours", "Engage with comments quickly"]
        };
      }
      
      console.log(`✅ Content optimized - Viral Score: ${optimization.viralScore || 75}/100`);
      return optimization;

    } catch (error) {
      console.error('Content optimization failed:', error);
      return {
        optimizedContent: content,
        videoTimeline: {
          "0-3s": "Hook: Start with a compelling statement → Attention / Impact",
          "3-6s": "Setup: Establish the problem → Problem / Challenge",
          "6-10s": "Development: Show the journey → Journey / Process",
          "10-13s": "Challenge: Address obstacles → Obstacle / Struggle",
          "13-17s": "Success: Highlight achievement → Success / Win",
          "17-21s": "Impact: Show the results → Results / Impact",
          "21-25s": "Scale: Demonstrate growth → Growth / Scale",
          "25-28s": "Result: Final outcome → Outcome / Success",
          "28-30s": "Loop Hook: End with rewatch trigger → Loop / Restart"
        },
        improvements: ['AI optimization unavailable - using original content'],
        viralScore: 60,
        reasoningChain: ['Fallback optimization applied']
      };
    }
  }

  /**
   * Generate trending hashtag strategy
   */
  async generateHashtagStrategy(content: string, niche: string): Promise<{
    primaryHashtags: string[];
    secondaryHashtags: string[];
    trendingHashtags: string[];
    nicheCommunityTags: string[];
    strategy: string;
  }> {
    console.log(`🏷️ Generating hashtag strategy for ${niche} content...`);

    const hashtagPrompt = `
Create a comprehensive hashtag strategy for this ${niche} content:

CONTENT: "${content}"

Generate hashtags that:
1. Primary tags (5-8): High volume, relevant to content
2. Secondary tags (8-12): Medium volume, niche-specific
3. Trending tags (3-5): Currently trending, contextually relevant
4. Community tags (5-8): Niche community, engagement-focused

Consider:
- Current trending topics
- Niche-specific communities
- Engagement potential vs competition
- Mix of broad and specific tags
- Platform best practices

Respond as JSON with this structure:
{
  "primaryHashtags": ["array of primary hashtags"],
  "secondaryHashtags": ["array of secondary hashtags"],
  "trendingHashtags": ["array of trending hashtags"],
  "nicheCommunityTags": ["array of community hashtags"],
  "strategy": "explanation of the hashtag strategy"
}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a hashtag strategy expert who understands platform algorithms and community dynamics. Your hashtag strategies have helped content reach millions of people.

Create strategic hashtag mixes that:
- Balance reach vs. competition
- Target the right communities
- Leverage trending opportunities
- Maximize discoverability

Respond ONLY with valid JSON, no additional text.`
            },
            {
              role: 'user',
              content: hashtagPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Parse error for cleaner logging
        let errorType = 'unknown';
        try {
          const errorObj = JSON.parse(errorText);
          errorType = errorObj.error?.type || errorObj.error?.code || 'api_error';
        } catch {
          errorType = 'parse_error';
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorType}`);
      }

      const result = await response.json();
      const hashtagText = result.choices[0]?.message?.content;

      if (!hashtagText) {
        throw new Error('No hashtag strategy received from AI');
      }

      const strategy = JSON.parse(hashtagText);
      
      console.log(`✅ Hashtag strategy generated`);
      return strategy;

    } catch (error) {
      console.error('Hashtag strategy generation failed:', error);
      return this.getFallbackHashtagStrategy(niche);
    }
  }

  // PRIVATE HELPER METHODS

  private buildAnalysisPrompt(videos: VideoData[], username: string, niche: string): string {
    const videoSummary = videos.slice(0, 10).map((video, idx) => `
Video ${idx + 1}:
- Hook: "${video.hook}"
- Caption: "${video.caption.substring(0, 200)}..."
- Views: ${video.views.toLocaleString()}
- Likes: ${video.likes.toLocaleString()}
- Engagement Rate: ${video.engagementRate || 'Unknown'}%
- Upload Date: ${video.uploadDate}
`).join('\n');

    return `
Analyze this social media creator's content performance and provide strategic insights:

CREATOR: @${username}
NICHE: ${niche}
ANALYZED VIDEOS: ${videos.length}

CONTENT SAMPLE:
${videoSummary}

AGGREGATE STATS:
- Total Views: ${videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
- Total Likes: ${videos.reduce((sum, v) => sum + v.likes, 0).toLocaleString()}
- Average Views: ${Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length).toLocaleString()}
- Average Likes: ${Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length).toLocaleString()}

Provide your analysis in this EXACT JSON structure:
{
  "overallScore": number (0-100),
  "viralPotential": "Low" | "Medium" | "High" | "Viral",
  "keyInsights": ["array of 3-5 key insights about their content strategy"],
  "contentStrategy": {
    "strengths": ["array of 3-4 content strengths"],
    "weaknesses": ["array of 2-3 areas for improvement"],
    "opportunities": ["array of 3-4 growth opportunities"]
  },
  "recommendations": {
    "immediate": ["array of 3-4 immediate actionable recommendations"],
    "shortTerm": ["array of 2-3 short-term strategic moves"],
    "longTerm": ["array of 2-3 long-term growth strategies"]
  },
  "competitorAnalysis": {
    "positioning": "string describing their market position",
    "differentiation": ["array of 2-3 unique differentiators"],
    "gaps": ["array of 2-3 gaps competitors could exploit"]
  },
  "contentOptimization": {
    "hookSuggestions": ["array of 3-4 hook improvement strategies"],
    "engagementTactics": ["array of 3-4 engagement boosting tactics"],
    "hashtagStrategy": ["array of 3-4 hashtag optimization tips"]
  },
  "trendAnalysis": {
    "currentTrends": ["array of 3-4 trends they're following/missing"],
    "emergingOpportunities": ["array of 2-3 emerging trends to leverage"],
    "contentGaps": ["array of 2-3 content types missing from their strategy"]
  }
}`;
  }

  private buildSuggestionPrompt(niche: string, targetAudience: string, contentStyle: string, competitorData?: any[]): string {
    const competitorInsights = competitorData && competitorData.length > 0 ? `
REFERENCE CONTENT ANALYSIS:
${competitorData.slice(0, 5).map(item => {
  // Handle both scraped videos and saved content
  const hook = item.hook || item.caption || 'Content idea';
  const metric = item.views 
    ? `${item.views.toLocaleString()} views` 
    : item.viral_score 
      ? `viral score: ${item.viral_score}` 
      : 'high engagement';
  return `- ${hook} (${metric})`;
}).join('\n')}
` : '';

    return `
Generate 5 HIGH-VIRAL content suggestions for:

NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience}
CONTENT STYLE: ${contentStyle}

${competitorInsights}

Each suggestion should be designed to:
- Stop the scroll within 3 seconds
- Generate EXTREMELY HIGH engagement (comments, shares, saves)
- Appeal to the ${niche} audience
- Leverage current trends and psychology
- Be optimized for TikTok/Instagram algorithms
- Have VIRAL POTENTIAL of 69-95% engagement rate

Respond with JSON array of exactly 5 suggestions in this format:
[
  {
    "hook": "compelling hook text",
    "fullContent": "complete content script/caption",
    "hashtags": ["array of 8-12 strategic hashtags"],
    "postingStrategy": "when and how to post for maximum impact",
    "expectedEngagement": number (estimated viral engagement rate 69-95 - aim for high percentages),
    "reasoning": "why this content will perform well and go viral"
  }
]`;
  }

  private buildCompetitorPrompt(competitors: { username: string; videos: VideoData[] }[], niche: string): string {
    const competitorData = competitors.map(comp => `
COMPETITOR: @${comp.username}
Top Performing Content:
${comp.videos.slice(0, 3).map(v => `- "${v.hook}" (${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes)`).join('\n')}
Average Performance: ${Math.round(comp.videos.reduce((sum, v) => sum + v.views, 0) / comp.videos.length).toLocaleString()} views
`).join('\n');

    return `
Analyze these competitors in the ${niche} space:

${competitorData}

Provide strategic competitive analysis in this JSON format:
{
  "competitorInsights": {
    ${competitors.map(comp => `"${comp.username}": {
      "strengths": ["array of their key strengths"],
      "contentStrategy": "description of their approach",
      "audience": "their target audience",
      "weaknesses": ["array of potential weaknesses"]
    }`).join(',\n    ')}
  },
  "strategicRecommendations": ["array of 4-5 strategic recommendations to outperform them"],
  "contentGaps": ["array of 3-4 content opportunities they're missing"],
  "differentiationOpportunities": ["array of 3-4 ways to differentiate and stand out"]
}`;
  }

  private getFallbackAnalysis(videos: VideoData[], username: string, niche: string): AIAnalysis {
    const avgViews = videos.reduce((sum, v) => sum + v.views, 0) / videos.length;
    const avgLikes = videos.reduce((sum, v) => sum + v.likes, 0) / videos.length;
    const engagementRate = avgViews > 0 ? (avgLikes / avgViews) * 100 : 0;
    
    // Analyze content patterns from real data
    const hooks = videos.map(v => v.hook.toLowerCase());
    const hasQuestions = hooks.some(h => h.includes('?'));
    const hasNumbers = hooks.some(h => /\d/.test(h));
    const hasEmotionalWords = hooks.some(h => 
      h.includes('secret') || h.includes('mistake') || h.includes('huge') || 
      h.includes('never') || h.includes('always') || h.includes('best') || h.includes('worst')
    );
    
    // Sort videos by performance
    const sortedVideos = [...videos].sort((a, b) => b.views - a.views);
    const topPerformer = sortedVideos[0];
    const bottomPerformer = sortedVideos[sortedVideos.length - 1];
    const performanceRatio = topPerformer.views / bottomPerformer.views;
    
    // Calculate consistency score
    const viewVariance = videos.reduce((sum, v) => sum + Math.pow(v.views - avgViews, 2), 0) / videos.length;
    const consistencyScore = Math.max(0, 100 - (Math.sqrt(viewVariance) / avgViews) * 100);
    
    // Generate data-driven insights
    const dataInsights = [
      `${engagementRate.toFixed(1)}% average engagement rate ${engagementRate > 10 ? '(Above average)' : '(Room for improvement)'}`,
      `Content consistency score: ${consistencyScore.toFixed(0)}/100`,
      `Top performer achieved ${(topPerformer.views / avgViews).toFixed(1)}x average views`
    ];
    
    if (performanceRatio > 5) {
      dataInsights.push('High performance variance suggests opportunity to identify winning patterns');
    }
    
    // Data-driven strengths analysis
    const strengths = [];
    if (engagementRate > 8) strengths.push('Strong audience engagement');
    if (consistencyScore > 70) strengths.push('Consistent content quality');
    if (hasEmotionalWords) strengths.push('Uses compelling emotional hooks');
    if (videos.length >= 10) strengths.push('Regular posting schedule');
    
    // Data-driven weaknesses
    const weaknesses = [];
    if (engagementRate < 5) weaknesses.push('Low engagement rate needs improvement');
    if (consistencyScore < 50) weaknesses.push('Inconsistent performance patterns');
    if (!hasQuestions) weaknesses.push('Limited use of question-based hooks');
    if (performanceRatio > 10) weaknesses.push('High variance suggests unclear content strategy');
    
    // Smart opportunities based on data
    const opportunities = [];
    if (!hasQuestions) opportunities.push('Add question hooks (can boost engagement 15-20%)');
    if (!hasNumbers) opportunities.push('Use number-based hooks (proven high performers)');
    if (topPerformer.engagementRate! > engagementRate * 1.5) {
      opportunities.push(`Replicate top performer patterns: "${topPerformer.hook.substring(0, 50)}..."`);
    }
    opportunities.push('Optimize posting times based on audience activity');

    return {
      overallScore: Math.min(Math.round((engagementRate * 8) + (consistencyScore * 0.2)), 100),
      viralPotential: engagementRate > 15 ? 'High' : engagementRate > 8 ? 'Medium' : 'Low',
      keyInsights: dataInsights,
      contentStrategy: {
        strengths: strengths.length > 0 ? strengths : ['Building audience foundation', 'Consistent posting'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Fine-tune content strategy'],
        opportunities
      },
      recommendations: {
        immediate: [
          hasQuestions ? 'Continue question-based hooks' : 'Add more question hooks',
          `Study top performer: "${topPerformer.hook.substring(0, 40)}..."`,
          'Post during peak audience hours (6-9 PM)'
        ],
        shortTerm: [
          'Analyze which content types drive highest engagement',
          'Develop content series around winning themes',
          'A/B test different hook styles'
        ],
        longTerm: [
          'Build personal brand narrative',
          'Create signature content formats',
          'Expand to complementary platforms'
        ]
      },
      competitorAnalysis: {
        positioning: `${engagementRate > 10 ? 'Strong' : 'Developing'} position in ${niche} space`,
        differentiation: [
          hasEmotionalWords ? 'Emotional storytelling approach' : 'Opportunity for emotional hooks',
          'Authentic voice and perspective'
        ],
        gaps: [
          consistencyScore < 70 ? 'Content consistency' : 'Advanced engagement tactics',
          'Trend integration and timing'
        ]
      },
      contentOptimization: {
        hookSuggestions: [
          hasQuestions ? 'Strengthen question hooks' : 'Add question-based hooks',
          hasNumbers ? 'Continue number strategies' : 'Include specific numbers/stats',
          'Create curiosity gaps and cliffhangers',
          'Use power words and emotional triggers'
        ],
        engagementTactics: [
          'Add clear calls-to-action',
          'Create shareable quote moments',
          'Ask specific questions in captions',
          'Use controversial but valuable takes'
        ],
        hashtagStrategy: [
          `Research ${niche}-specific trending tags`,
          'Mix 3-5 broad tags with 5-8 niche tags',
          'Monitor competitor hashtag performance',
          'Test different hashtag combinations'
        ]
      },
      trendAnalysis: {
        currentTrends: this.getNicheTrends(niche),
        emergingOpportunities: this.getEmergingOpportunities(niche),
        contentGaps: [
          performanceRatio > 5 ? 'Consistent high-performers' : 'Interactive content formats',
          'Behind-the-scenes content',
          'User-generated content campaigns'
        ]
      }
    };
  }
  
  private getNicheTrends(niche: string): string[] {
    if (!niche || typeof niche !== 'string') {
      niche = 'business';
    }
    const trendMap: { [key: string]: string[] } = {
      business: ['AI automation tools', 'Remote work strategies', 'Personal branding'],
      motivation: ['Mental health awareness', 'Productivity systems', 'Goal achievement'],
      fitness: ['Home workouts', 'Nutrition tracking', 'Mental wellness'],
      lifestyle: ['Sustainable living', 'Work-life balance', 'Digital minimalism']
    };
    return trendMap[niche.toLowerCase()] || trendMap.business;
  }
  
  private getEmergingOpportunities(niche: string): string[] {
    if (!niche || typeof niche !== 'string') {
      niche = 'business';
    }
    const opportunityMap: { [key: string]: string[] } = {
      business: ['AI tool reviews', 'Founder story series', 'Industry predictions'],
      motivation: ['Science-backed habits', 'Success case studies', 'Mindset shifts'],
      fitness: ['Biohacking trends', 'Recovery protocols', 'Nutrition myths'],
      lifestyle: ['Digital detox strategies', 'Minimalist approaches', 'Eco-friendly living']
    };
    return opportunityMap[niche.toLowerCase()] || opportunityMap.business;
  }

  private getFallbackSuggestions(niche: string, savedContent?: any[]): ContentSuggestion[] {
    // If user has saved content, create variations and fresh ideas inspired by their style
    if (savedContent && savedContent.length > 0) {
      console.log(`📊 Creating unique suggestions inspired by ${savedContent.length} saved content patterns`);
      
      // Extract patterns from saved content
      const commonHashtags = new Set<string>();
      const contentTypes = new Set<string>();
      let avgViralScore = 0;
      
      savedContent.forEach(content => {
        if (content.hashtags) {
          content.hashtags.forEach((tag: string) => commonHashtags.add(tag));
        }
        if (content.content_type) contentTypes.add(content.content_type);
        avgViralScore += content.viral_score || 70;
      });
      
      avgViralScore = Math.floor(avgViralScore / savedContent.length);
      const userHashtags = Array.from(commonHashtags).slice(0, 5);
      
      // Create diverse suggestions inspired by user's style but with unique content
      const variations = [
        {
          hook: `The one thing that changed everything for me in ${niche}`,
          fullContent: `After analyzing hundreds of successful ${niche} strategies, I discovered this game-changing approach. Here's what you need to know...`,
          hashtags: userHashtags.length > 0 ? userHashtags : [`#${niche}`, '#viral', '#trending'],
          postingStrategy: 'Post during peak engagement hours (9-11 AM or 7-9 PM)',
          expectedEngagement: Math.min(95, avgViralScore + 8),
          reasoning: `Fresh angle inspired by your ${niche} content style`
        },
        {
          hook: `Why everyone is doing ${niche} wrong (and how to fix it)`,
          fullContent: `The biggest mistakes I see people making... and the simple solution that's been hiding in plain sight. Are you making these errors too?`,
          hashtags: userHashtags.length > 0 ? userHashtags : [`#${niche}`, '#tips', '#howto'],
          postingStrategy: 'Post Tuesday-Thursday for maximum reach',
          expectedEngagement: Math.min(92, avgViralScore + 6),
          reasoning: `Contrarian approach based on your successful patterns`
        },
        {
          hook: `The ${niche} secret nobody talks about`,
          fullContent: `This underground strategy is how the top 1% get results 10x faster. I'm revealing it all in this post...`,
          hashtags: userHashtags.length > 0 ? userHashtags : [`#${niche}`, '#secrets', '#growth'],
          postingStrategy: 'Post Monday morning to start the week strong',
          expectedEngagement: Math.min(94, avgViralScore + 7),
          reasoning: `Authority-building content matching your viral style`
        },
        {
          hook: `3 ${niche} trends that will dominate 2024`,
          fullContent: `I've analyzed the data, and these 3 trends are about to explode. Position yourself now before everyone catches on...`,
          hashtags: userHashtags.length > 0 ? userHashtags : [`#${niche}`, '#trends', '#2024'],
          postingStrategy: 'Post mid-week for professional audience',
          expectedEngagement: Math.min(90, avgViralScore + 5),
          reasoning: `Trend-focused content aligned with your niche`
        },
        {
          hook: `From zero to results: My ${niche} journey`,
          fullContent: `12 months ago, I knew nothing about ${niche}. Today, I'm sharing the exact roadmap that got me here. Save this post!`,
          hashtags: userHashtags.length > 0 ? userHashtags : [`#${niche}`, '#journey', '#transformation'],
          postingStrategy: 'Post weekend for inspirational content',
          expectedEngagement: Math.min(88, avgViralScore + 4),
          reasoning: `Story-based approach inspired by your engagement patterns`
        }
      ];
      
      return variations;
    }

    // Default fallback suggestions
    const suggestions = {
      business: [
        {
          hook: "The $10M mistake I made so you don't have to",
          fullContent: "Last year, I lost $10M because I ignored this one principle. Here's what every entrepreneur needs to know...",
          hashtags: ['#entrepreneur', '#business', '#startup', '#money', '#success'],
          postingStrategy: 'Post Monday 9-11 AM for maximum business audience reach',
          expectedEngagement: 85,
          reasoning: 'Combines personal story with valuable lesson - highly shareable'
        },
        {
          hook: "What if I told you most entrepreneurs fail because they focus on the wrong metrics?",
          fullContent: "95% of startups fail because they're tracking vanity metrics instead of what actually matters. Here are the 3 metrics that predict success...",
          hashtags: ['#startup', '#entrepreneur', '#metrics', '#business', '#success'],
          postingStrategy: 'Post Tuesday 9 AM-1 PM for business audience',
          expectedEngagement: 92,
          reasoning: 'Question hooks combined with statistics create curiosity'
        },
        {
          hook: "Unpopular opinion: Working 80 hours a week is destroying your business",
          fullContent: "Everyone glorifies the hustle, but here's why working smarter beats working harder every single time...",
          hashtags: ['#entrepreneur', '#productivity', '#worklife', '#hustle', '#business'],
          postingStrategy: 'Post Wednesday 10 AM-2 PM for engagement',
          expectedEngagement: 96,
          reasoning: 'Controversial takes against common beliefs drive engagement'
        },
        {
          hook: "The secret that changed everything for my business",
          fullContent: "After 5 years of struggling, I discovered this one principle that completely transformed my approach to building a business...",
          hashtags: ['#entrepreneur', '#business', '#secret', '#transformation', '#success'],
          postingStrategy: 'Post Thursday 8-10 PM for evening engagement',
          expectedEngagement: 88,
          reasoning: 'Secret/transformation content with personal story performs well'
        },
        {
          hook: "Why I stopped following every business advice on social media",
          fullContent: "The business advice you see online is mostly wrong. Here's what actually works based on real results...",
          hashtags: ['#business', '#advice', '#entrepreneur', '#reality', '#truth'],
          postingStrategy: 'Post Friday 6-8 PM for weekend planning audience',
          expectedEngagement: 94,
          reasoning: 'Contrarian takes on popular advice generate strong engagement'
        }
      ],
      motivation: [
        {
          hook: "Your 2024 glow-up starts with this mindset shift",
          fullContent: "Stop waiting for motivation. Start building discipline. Here's how to transform your life in 90 days...",
          hashtags: ['#motivation', '#mindset', '#success', '#goals', '#transformation'],
          postingStrategy: 'Post Sunday evening for weekly motivation boost',
          expectedEngagement: 89,
          reasoning: 'Appeals to transformation desire and provides actionable advice'
        },
        {
          hook: "The habit that changed my life in 21 days",
          fullContent: "I was stuck in the same routine for years until I discovered this simple daily practice. Here's exactly what I did...",
          hashtags: ['#habits', '#motivation', '#selfimprovement', '#success', '#mindset'],
          postingStrategy: 'Post Monday morning for fresh start motivation',
          expectedEngagement: 87,
          reasoning: 'Specific timeframes and personal transformation stories are engaging'
        },
        {
          hook: "What successful people do differently at 5 AM",
          fullContent: "I studied 100 successful people and found one common morning routine that changed everything. Here's what they all do...",
          hashtags: ['#success', '#morning', '#routine', '#productivity', '#motivation'],
          postingStrategy: 'Post Tuesday 5-7 AM to catch early risers',
          expectedEngagement: 91,
          reasoning: 'Morning routine content with research backing performs well'
        }
      ],
      fitness: [
        {
          hook: "Challenge your friends with this workout!",
          fullContent: "Tag 3 friends who need to try this intense HIIT workout with you! Get ready to sweat and feel the burn together. Don't forget to share your post-workout selfies! 📸💦 #HIIT #FitnessFriends",
          hashtags: ['#HIITWorkout', '#FitnessChallenge', '#SweatTogether', '#FitFriends', '#Accountability', '#WorkoutBuddies'],
          postingStrategy: 'Post Tuesday/Thursday 6-8 PM for maximum fitness audience',
          expectedEngagement: 92,
          reasoning: 'Tagging friends boosts engagement and extends reach through social connections'
        },
        {
          hook: "Reveal the secret to staying motivated!",
          fullContent: "Struggling to stay consistent with your workouts? Learn the top 3 tips from fitness experts on how to stay motivated and crush your fitness goals. Which tip resonates with you the most? 🤔💥 #FitnessTips #Motivation",
          hashtags: ['#FitnessMotivation', '#StayActive', '#HealthyHabits', '#FitnessJourney', '#GoalSetting', '#SuccessMindset'],
          postingStrategy: 'Post Monday morning for fresh start motivation',
          expectedEngagement: 89,
          reasoning: 'Psychology of motivation and expert tips create value and conversation among the audience'
        },
        {
          hook: "Transform your body in 30 days!",
          fullContent: "Join the #30DayFitnessChallenge and watch your body change before your eyes! Follow along for daily workouts, meal prep ideas, and motivation. Are you ready to commit to a healthier you? 💪🔥 #FitnessJourney #TransformationTuesday",
          hashtags: ['#FitnessChallenge', '#WorkoutMotivation', '#HealthyEating', '#FitnessGoals', '#BodyTransformation', '#GetFit', '#MotivationMonday'],
          postingStrategy: 'Post Sunday evening for weekend motivation boost',
          expectedEngagement: 94,
          reasoning: 'Challenges create a sense of community and commitment, driving high engagement and participation'
        },
        {
          hook: "Guess the calorie burn challenge!",
          fullContent: "Watch me do this intense workout and guess how many calories I burned! Comment your guess below and stay tuned for the reveal at the end. Let's see who's the closest! 🔥💪 #CalorieBurn #FitnessChallenge",
          hashtags: ['#WorkoutChallenge', '#FitnessFun', '#CalorieCount', '#FitnessGame', '#GuessTheBurn', '#HealthyLiving'],
          postingStrategy: 'Post Wednesday/Friday 7-9 PM for evening engagement',
          expectedEngagement: 87,
          reasoning: 'Interactive challenges encourage audience participation and create suspense for higher engagement'
        },
        {
          hook: "The ultimate home workout hack!",
          fullContent: "No equipment? No problem! Try these 5 bodyweight exercises for a full-body workout you can do anywhere. Share this with a friend who needs some #FitnessMotivation! 💪🏡 #HomeWorkout",
          hashtags: ['#BodyweightWorkout', '#NoEquipment', '#FitnessAtHome', '#WorkoutTips', '#ExerciseAnywhere', '#FitLife'],
          postingStrategy: 'Post Saturday morning for weekend workout motivation',
          expectedEngagement: 91,
          reasoning: 'Home workout content is trending due to convenience and accessibility'
        }
      ]
    };

    return suggestions[niche as keyof typeof suggestions] || suggestions.business;
  }

  private getFallbackCompetitorAnalysis() {
    return {
      competitorInsights: {},
      strategicRecommendations: [
        'Focus on unique value proposition',
        'Optimize content for algorithm preferences',
        'Build stronger community engagement',
        'Leverage trending topics in your niche'
      ],
      contentGaps: [
        'Interactive content opportunities',
        'Behind-the-scenes content',
        'User-generated content campaigns'
      ],
      differentiationOpportunities: [
        'Unique perspective or experience',
        'Innovative content formats',
        'Deeper expertise demonstration',
        'Stronger personal brand storytelling'
      ]
    };
  }

  private getFallbackHashtagStrategy(niche: string) {
    const strategies = {
      business: {
        primaryHashtags: ['#entrepreneur', '#business', '#startup', '#success', '#money'],
        secondaryHashtags: ['#businesstips', '#entrepreneurlife', '#hustle', '#mindset'],
        trendingHashtags: ['#2024goals', '#productivity', '#growth'],
        nicheCommunityTags: ['#businessowner', '#startuplife', '#entrepreneurs'],
        strategy: 'Mix high-volume business tags with niche-specific community hashtags'
      },
      motivation: {
        primaryHashtags: ['#motivation', '#inspiration', '#success', '#mindset', '#goals'],
        secondaryHashtags: ['#motivational', '#inspirational', '#successmindset', '#achieve'],
        trendingHashtags: ['#transformation', '#growth', '#winning'],
        nicheCommunityTags: ['#motivated', '#inspired', '#successstory'],
        strategy: 'Focus on aspirational and transformation-oriented hashtags'
      }
    };

    return strategies[niche as keyof typeof strategies] || strategies.business;
  }
}
