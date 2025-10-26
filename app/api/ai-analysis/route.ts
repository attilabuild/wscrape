import { NextRequest, NextResponse } from 'next/server';
import { AIAnalysisEngine } from '@/lib/ai-analysis';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { requireActiveSubscription } from '@/lib/subscription-guard';

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

interface AIAnalysisRequest {
  action: 'analyze_content' | 'generate_suggestions' | 'optimize_content' | 'competitor_analysis' | 'hashtag_strategy';
  payload: any;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify user authentication - Use service role client to bypass RLS
    const supabase = await createSupabaseFromRequest(request);
    
    // Get auth header from request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('AI Analysis: No token in Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }
    
    // Get user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('AI Analysis auth failed:', { error: authError, hasUser: !!user });
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Debug: Log user ID
    console.log('AI Analysis - User ID from session:', user.id);
    
    // 🔒 SECURITY: Verify active subscription (SERVER-SIDE - CANNOT BE BYPASSED)
    const subscriptionCheck = await requireActiveSubscription(user.id);
    
    if (!subscriptionCheck.authorized) {
      console.log('AI Analysis subscription check failed:', subscriptionCheck);
      return NextResponse.json(
        { error: subscriptionCheck.error },
        { status: subscriptionCheck.status }
      );
    }
    
    console.log('AI Analysis - Subscription authorized!');

    const body: AIAnalysisRequest = await request.json();
    const { action, payload } = body;

    // Initialize AI Analysis Engine
    if (!OPENAI_API_KEY) {
      // Using fallback analysis
    }
    const aiEngine = new AIAnalysisEngine(OPENAI_API_KEY || '');

    switch (action) {
      case 'analyze_content':
        return await handleContentAnalysis(aiEngine, payload);
      
      case 'generate_suggestions':
        return await handleContentSuggestions(aiEngine, payload);
      
      case 'optimize_content':
        return await handleContentOptimization(aiEngine, payload);
      
      case 'competitor_analysis':
        return await handleCompetitorAnalysis(aiEngine, payload);
      
      case 'hashtag_strategy':
        return await handleHashtagStrategy(aiEngine, payload);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze_content, generate_suggestions, optimize_content, competitor_analysis, hashtag_strategy' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process AI analysis' },
      { status: 500 }
    );
  }
}

/**
 * Handle comprehensive content analysis
 */
async function handleContentAnalysis(aiEngine: AIAnalysisEngine, payload: {
  videos: VideoData[];
  username: string;
  niche: string;
}) {
  const { videos, username, niche } = payload;

  // Guard: handle empty video list gracefully
  if (!videos || videos.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        analysis: {
          overallScore: 0,
          viralPotential: 'low',
          keyInsights: ['No videos provided for analysis. Add content to analyze performance.'],
          recommendations: { immediate: [], mediumTerm: [], longTerm: [] },
          contentStrategy: { strengths: [], weaknesses: [], opportunities: [] }
        },
        metrics: {
          totalViews: 0,
          totalLikes: 0,
          avgViews: 0,
          avgLikes: 0,
          avgEngagement: 0,
          topVideo: null,
          consistency: 0,
          trendDirection: 'stable'
        },
        summary: {
          totalVideos: 0,
          averageViews: 0,
          averageLikes: 0,
          averageEngagement: 0,
          topPerformer: null,
          overallScore: 0,
          viralPotential: 'low'
        },
        actionableInsights: {
          quickWins: [],
          keyOpportunities: [],
          criticalIssues: ['Upload recent videos to enable analysis']
        },
        meta: {
          isAIAnalysis: false,
          analysisType: 'no-data',
          notice: 'No videos available for analysis'
        }
      }
    });
  }

  // Calculate additional metrics
  const enhancedVideos = videos.map(video => ({
    ...video,
    engagementRate: video.views > 0 ? (video.likes / video.views) * 100 : 0
  }));

  // Run AI analysis (with fallback if API unavailable)
  let analysis;
  try {
    analysis = await aiEngine.analyzeScrapedContent(enhancedVideos, username, niche);
  } catch (error) {
    // Use fallback analysis if AI fails
    analysis = {
      overallScore: 50,
      viralPotential: 'Low' as const,
      keyInsights: ['Analysis temporarily unavailable - using basic metrics'],
      contentStrategy: {
        strengths: ['Content uploaded successfully'],
        weaknesses: ['Analysis pending'],
        opportunities: ['Upload more content for better analysis']
      },
      recommendations: {
        immediate: ['Try the analysis again'],
        shortTerm: ['Upload more content'],
        longTerm: ['Build content library']
      },
      competitorAnalysis: {
        positioning: 'Analysis pending',
        differentiation: ['Content uploaded'],
        gaps: ['Analysis needed']
      },
      contentOptimization: {
        hookSuggestions: ['Analysis pending'],
        engagementTactics: ['Analysis pending'],
        hashtagStrategy: ['Analysis pending']
      },
      trendAnalysis: {
        currentTrends: ['Analysis pending'],
        emergingOpportunities: ['Analysis pending'],
        contentGaps: ['Analysis pending']
      }
    };
  }
  
  // Check if we're using fallback analysis due to API issues
  const isUsingFallback = !OPENAI_API_KEY || !analysis.keyInsights || analysis.keyInsights.some(insight => 
    insight.includes('average engagement rate') && insight.includes('consistency score')
  );

  // Determine the specific reason for fallback
  let fallbackReason = 'AI-powered analysis complete';
  let analysisType = 'ai-powered';
  
  if (!OPENAI_API_KEY) {
    fallbackReason = 'No API key configured. Using data-driven analysis.';
    analysisType = 'no-api-key';
  } else if (isUsingFallback) {
    // Check if this was due to quota issues by looking at recent errors
    fallbackReason = 'OpenAI API temporarily unavailable. Using enhanced data-driven analysis with performance insights.';
    analysisType = 'api-fallback';
  }

  // Calculate performance metrics
  const metrics = calculatePerformanceMetrics(enhancedVideos);

  return NextResponse.json({
    success: true,
    data: {
      analysis,
      metrics,
      summary: {
        totalVideos: videos.length,
        averageViews: metrics.avgViews,
        averageLikes: metrics.avgLikes,
        averageEngagement: metrics.avgEngagement,
        topPerformer: metrics.topVideo,
        overallScore: analysis.overallScore,
        viralPotential: analysis.viralPotential
      },
      actionableInsights: {
        quickWins: analysis.recommendations.immediate.slice(0, 3),
        keyOpportunities: analysis.contentStrategy.opportunities.slice(0, 3),
        criticalIssues: analysis.contentStrategy.weaknesses
      },
      meta: {
        isAIAnalysis: !isUsingFallback,
        analysisType,
        notice: fallbackReason
      }
    }
  });
}

/**
 * Handle AI content suggestions
 */
async function handleContentSuggestions(aiEngine: AIAnalysisEngine, payload: {
  niche: string;
  targetAudience?: string;
  contentStyle?: string;
  competitorData?: VideoData[];
  count?: number;
  profileContext?: any;
  savedContent?: any[];
}) {
  const {
    niche,
    targetAudience = 'general audience',
    contentStyle = 'educational and entertaining',
    competitorData,
    count = 5,
    profileContext,
    savedContent = []
  } = payload;

  // Use profile niche if available, otherwise use provided niche
  const effectiveNiche = profileContext?.niche || niche;
  
  // Enhanced target audience and content style based on profile
  const enhancedTargetAudience = profileContext?.targetAudience || targetAudience;
  const enhancedContentStyle = profileContext?.bio || contentStyle;

  const suggestions = await aiEngine.generateContentSuggestions(
    effectiveNiche,
    enhancedTargetAudience,
    enhancedContentStyle,
    savedContent.length > 0 ? savedContent : competitorData
  );

  // Rank suggestions by expected engagement
  let rankedSuggestions = suggestions
    .sort((a, b) => b.expectedEngagement - a.expectedEngagement)
    .slice(0, count); // Only return up to the requested count, no duplicates

  return NextResponse.json({
    success: true,
    data: {
      suggestions: rankedSuggestions,
      metadata: {
        niche,
        targetAudience,
        contentStyle,
        generated: new Date().toISOString(),
        averageExpectedEngagement: rankedSuggestions.reduce((sum, s) => sum + s.expectedEngagement, 0) / rankedSuggestions.length
      },
      insights: {
        topPerformer: rankedSuggestions[0],
        avgEngagementPrediction: rankedSuggestions.reduce((sum, s) => sum + s.expectedEngagement, 0) / rankedSuggestions.length,
        contentThemes: extractContentThemes(rankedSuggestions)
      }
    }
  });
}

/**
 * Handle content optimization
 */
async function handleContentOptimization(aiEngine: AIAnalysisEngine, payload: {
  content: string;
  niche: string;
  targetMetrics?: any;
  currentPerformance?: any;
  profileContext?: any;
}) {
  const { content, niche, targetMetrics, currentPerformance, profileContext } = payload;

  // Run optimization
  const optimization = await aiEngine.optimizeForViral(content, niche, targetMetrics);

  // Generate hashtag strategy for optimized content
  const hashtagStrategy = await aiEngine.generateHashtagStrategy(optimization.optimizedContent, niche);

  return NextResponse.json({
    success: true,
    data: {
      original: {
        content,
        estimatedScore: currentPerformance?.score || 60
      },
      optimized: {
        content: optimization.optimizedContent,
        viralScore: optimization.viralScore,
        improvements: optimization.improvements,
        reasoning: optimization.reasoningChain
      },
      hashtagStrategy,
      implementation: {
        keyChanges: optimization.improvements.slice(0, 3),
        expectedImprovement: Math.max(0, optimization.viralScore - (currentPerformance?.score || 60)),
        confidenceLevel: optimization.viralScore > 80 ? 'High' : optimization.viralScore > 60 ? 'Medium' : 'Low'
      }
    }
  });
}

/**
 * Handle competitor analysis
 */
async function handleCompetitorAnalysis(aiEngine: AIAnalysisEngine, payload: {
  competitors: { username: string; videos: VideoData[] }[];
  yourNiche: string;
  yourContent?: VideoData[];
}) {
  const { competitors, yourNiche, yourContent } = payload;

  // Run competitor analysis
  const competitorAnalysis = await aiEngine.analyzeCompetitorStrategy(competitors, yourNiche);

  // Calculate competitive metrics
  const competitiveMetrics = calculateCompetitiveMetrics(competitors, yourContent);

  return NextResponse.json({
    success: true,
    data: {
      analysis: competitorAnalysis,
      metrics: competitiveMetrics,
      positioning: {
        marketPosition: determineMarketPosition(competitiveMetrics),
        strengthsVsCompetitors: identifyCompetitiveStrengths(competitiveMetrics),
        improvementAreas: identifyImprovementAreas(competitiveMetrics)
      },
      actionPlan: {
        immediate: competitorAnalysis.strategicRecommendations.slice(0, 3),
        opportunities: competitorAnalysis.contentGaps.slice(0, 3),
        differentiators: competitorAnalysis.differentiationOpportunities.slice(0, 3)
      }
    }
  });
}

/**
 * Handle hashtag strategy generation
 */
async function handleHashtagStrategy(aiEngine: AIAnalysisEngine, payload: {
  content: string;
  niche: string;
  targetAudience?: string;
  competitorHashtags?: string[];
}) {
  const { content, niche, targetAudience, competitorHashtags } = payload;

  // Generate AI-powered hashtag strategy
  const strategy = await aiEngine.generateHashtagStrategy(content, niche);

  // Analyze hashtag performance potential
  const hashtagAnalysis = analyzeHashtagPotential(strategy, competitorHashtags);

  return NextResponse.json({
    success: true,
    data: {
      strategy,
      analysis: hashtagAnalysis,
      implementation: {
        optimalHashtagCount: strategy.primaryHashtags.length + strategy.secondaryHashtags.length,
        mixRatio: {
          primary: strategy.primaryHashtags.length,
          secondary: strategy.secondaryHashtags.length,
          trending: strategy.trendingHashtags.length,
          community: strategy.nicheCommunityTags.length
        },
        expectedReach: estimateHashtagReach(strategy),
        competitiveAdvantage: compareWithCompetitors(strategy, competitorHashtags)
      }
    }
  });
}

// HELPER FUNCTIONS

function calculatePerformanceMetrics(videos: VideoData[]) {
  if (!videos || videos.length === 0) {
    return {
      totalViews: 0,
      totalLikes: 0,
      avgViews: 0,
      avgLikes: 0,
      avgEngagement: 0,
      topVideo: null,
      consistency: 0,
      trendDirection: 'stable'
    } as any;
  }

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
  const avgViews = totalViews / videos.length;
  const avgLikes = totalLikes / videos.length;
  const avgEngagement = videos.reduce((sum, v) => sum + (v.engagementRate || 0), 0) / videos.length;
  
  const topVideo = videos.reduce((top, current) => 
    current.views > top.views ? current : top
  );

  return {
    totalViews,
    totalLikes,
    avgViews: Math.round(avgViews),
    avgLikes: Math.round(avgLikes),
    avgEngagement: Math.round(avgEngagement * 100) / 100,
    topVideo: {
      hook: topVideo.hook,
      views: topVideo.views,
      likes: topVideo.likes,
      engagementRate: topVideo.engagementRate
    },
    consistency: calculateConsistency(videos),
    trendDirection: calculateTrendDirection(videos)
  };
}

function calculateConsistency(videos: VideoData[]): number {
  if (videos.length < 2) return 100;
  
  const avgViews = videos.reduce((sum, v) => sum + v.views, 0) / videos.length;
  const variance = videos.reduce((sum, v) => sum + Math.pow(v.views - avgViews, 2), 0) / videos.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to consistency score (0-100, higher is more consistent)
  const consistencyScore = Math.max(0, 100 - (stdDev / avgViews) * 100);
  return Math.round(consistencyScore);
}

function calculateTrendDirection(videos: VideoData[]): 'upward' | 'downward' | 'stable' {
  if (!videos || videos.length < 3) return 'stable';
  
  // Sort by upload date
  const sortedVideos = [...videos].sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
  
  const firstHalf = sortedVideos.slice(0, Math.floor(sortedVideos.length / 2));
  const secondHalf = sortedVideos.slice(Math.floor(sortedVideos.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v.views, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v.views, 0) / secondHalf.length;
  
  const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  if (changePercent > 15) return 'upward';
  if (changePercent < -15) return 'downward';
  return 'stable';
}

function extractContentThemes(suggestions: any[]): string[] {
  const themes = suggestions.map(s => {
    const hook = s.hook.toLowerCase();
    if (hook.includes('secret') || hook.includes('hack')) return 'insider knowledge';
    if (hook.includes('mistake') || hook.includes('avoid')) return 'cautionary advice';
    if (hook.includes('transform') || hook.includes('change')) return 'transformation';
    if (hook.includes('?')) return 'curiosity-driven';
    return 'educational';
  });
  
  return [...new Set(themes)];
}

function calculateCompetitiveMetrics(competitors: any[], yourContent?: VideoData[]) {
  const competitorMetrics = competitors.map(comp => ({
    username: comp.username,
    avgViews: comp.videos.reduce((sum: number, v: VideoData) => sum + v.views, 0) / comp.videos.length,
    avgLikes: comp.videos.reduce((sum: number, v: VideoData) => sum + v.likes, 0) / comp.videos.length,
    avgEngagement: comp.videos.reduce((sum: number, v: VideoData) => sum + ((v.likes / v.views) * 100), 0) / comp.videos.length
  }));

  const yourMetrics = yourContent ? {
    avgViews: yourContent.reduce((sum, v) => sum + v.views, 0) / yourContent.length,
    avgLikes: yourContent.reduce((sum, v) => sum + v.likes, 0) / yourContent.length,
    avgEngagement: yourContent.reduce((sum, v) => sum + ((v.likes / v.views) * 100), 0) / yourContent.length
  } : null;

  return {
    competitors: competitorMetrics,
    yours: yourMetrics,
    marketAverages: {
      avgViews: competitorMetrics.reduce((sum, c) => sum + c.avgViews, 0) / competitorMetrics.length,
      avgLikes: competitorMetrics.reduce((sum, c) => sum + c.avgLikes, 0) / competitorMetrics.length,
      avgEngagement: competitorMetrics.reduce((sum, c) => sum + c.avgEngagement, 0) / competitorMetrics.length
    }
  };
}

function determineMarketPosition(metrics: any): string {
  if (!metrics.yours) return 'Analysis needed - no personal content data';
  
  const yourEngagement = metrics.yours.avgEngagement;
  const marketAvg = metrics.marketAverages.avgEngagement;
  
  if (yourEngagement > marketAvg * 1.5) return 'Market Leader';
  if (yourEngagement > marketAvg * 1.2) return 'Strong Performer';
  if (yourEngagement > marketAvg * 0.8) return 'Market Average';
  return 'Growth Opportunity';
}

function identifyCompetitiveStrengths(metrics: any): string[] {
  if (!metrics.yours) return ['Conduct personal content analysis first'];
  
  const strengths = [];
  const yourMetrics = metrics.yours;
  const marketAvg = metrics.marketAverages;
  
  if (yourMetrics.avgEngagement > marketAvg.avgEngagement) {
    strengths.push('Above-average engagement rate');
  }
  if (yourMetrics.avgViews > marketAvg.avgViews) {
    strengths.push('Strong reach and visibility');
  }
  if (yourMetrics.avgLikes > marketAvg.avgLikes) {
    strengths.push('High audience appreciation');
  }
  
  return strengths.length > 0 ? strengths : ['Focus on building foundational strengths'];
}

function identifyImprovementAreas(metrics: any): string[] {
  if (!metrics.yours) return ['Upload personal content for comparison'];
  
  const improvements = [];
  const yourMetrics = metrics.yours;
  const marketAvg = metrics.marketAverages;
  
  if (yourMetrics.avgEngagement < marketAvg.avgEngagement) {
    improvements.push('Boost engagement through better hooks and CTAs');
  }
  if (yourMetrics.avgViews < marketAvg.avgViews) {
    improvements.push('Improve reach through hashtag optimization');
  }
  if (yourMetrics.avgLikes < marketAvg.avgLikes) {
    improvements.push('Create more likeable, shareable content');
  }
  
  return improvements.length > 0 ? improvements : ['Maintain current performance level'];
}

function analyzeHashtagPotential(strategy: any, competitorHashtags?: string[]) {
  const allHashtags = [
    ...strategy.primaryHashtags,
    ...strategy.secondaryHashtags,
    ...strategy.trendingHashtags,
    ...strategy.nicheCommunityTags
  ];

  return {
    totalHashtags: allHashtags.length,
    uniqueHashtags: [...new Set(allHashtags)].length,
    competitorOverlap: competitorHashtags ? 
      allHashtags.filter(tag => competitorHashtags.includes(tag)).length : 0,
    estimatedReach: 'Medium to High',
    competitionLevel: 'Moderate'
  };
}

function estimateHashtagReach(strategy: any): string {
  const totalTags = strategy.primaryHashtags.length + 
                   strategy.secondaryHashtags.length + 
                   strategy.trendingHashtags.length + 
                   strategy.nicheCommunityTags.length;

  if (totalTags > 20) return 'Very High';
  if (totalTags > 15) return 'High';
  if (totalTags > 10) return 'Medium';
  return 'Low';
}

function compareWithCompetitors(strategy: any, competitorHashtags?: string[]): string {
  if (!competitorHashtags) return 'No competitor data available';
  
  const yourHashtags = [
    ...strategy.primaryHashtags,
    ...strategy.secondaryHashtags,
    ...strategy.trendingHashtags,
    ...strategy.nicheCommunityTags
  ];

  const overlap = yourHashtags.filter(tag => competitorHashtags.includes(tag)).length;
  const overlapPercent = (overlap / yourHashtags.length) * 100;

  if (overlapPercent > 70) return 'High similarity - consider differentiation';
  if (overlapPercent > 40) return 'Moderate similarity - good market alignment';
  return 'Low similarity - unique positioning';
}
