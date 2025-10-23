import { NextRequest, NextResponse } from 'next/server';
import { MassCreatorAnalyzer } from '@/lib/mass-creator-analyzer';
import { ViralDatabase } from '@/lib/viral-database';
import { AIContentGenerator } from '@/lib/ai-content-generator';
import { ViralPredictor } from '@/lib/viral-predictor';
import { ContentVariationGenerator } from '@/lib/content-variations';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { requireActiveSubscription } from '@/lib/subscription-guard';

interface AnalysisRequest {
  action: 'mass_analyze' | 'generate_content' | 'predict_viral' | 'create_variations' | 'get_insights';
  payload: any;
}

export async function POST(request: NextRequest) {
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

    // TEMPORARY: Subscription check disabled for testing
    // TODO: Re-enable before production
    /*
    // 🔒 SECURITY: Verify active subscription (SERVER-SIDE - CANNOT BE BYPASSED)
    const subscriptionCheck = await requireActiveSubscription(user.id);
    
    if (!subscriptionCheck.authorized) {
      return NextResponse.json(
        { error: subscriptionCheck.error },
        { status: subscriptionCheck.status }
      );
    }
    */

    const body: AnalysisRequest = await request.json();
    const { action, payload } = body;

    console.log(`🚀 Viral Analysis API: ${action}`);

    switch (action) {
      case 'mass_analyze':
        return await handleMassAnalysis(payload);
      
      case 'generate_content':
        return await handleContentGeneration(payload);
      
      case 'predict_viral':
        return await handleViralPrediction(payload);
      
      case 'create_variations':
        return await handleContentVariations(payload);
      
      case 'get_insights':
        return await handleGetInsights(payload);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: mass_analyze, generate_content, predict_viral, create_variations, get_insights' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Viral analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process viral analysis' },
      { status: 500 }
    );
  }
}

/**
 * Handle mass creator analysis
 */
async function handleMassAnalysis(payload: {
  niches?: string[];
  creators?: string[];
  limit?: number;
  saveToDatabase?: boolean;
}) {
  const analyzer = new MassCreatorAnalyzer();
  const database = new ViralDatabase();
  
  await database.initialize();
  
  const {
    niches = ['business', 'motivation'],
    creators,
    limit = 50,
    saveToDatabase = true
  } = payload;

  console.log(`🔍 Mass analyzing ${limit} creators in niches: ${niches.join(', ')}`);

  // If specific creators provided, analyze them
  let results;
  if (creators && creators.length > 0) {
    results = {
      totalAnalyzed: creators.length,
      viralPosts: [],
      topPerformers: [],
      patterns: []
    };
    
    // This would be implemented to analyze specific creators
    console.log(`Analyzing specific creators: ${creators.join(', ')}`);
  } else {
    // Analyze top creators by niche
    results = await analyzer.analyzeTopCreators(niches, limit);
  }

  // Save to viral database if requested
  if (saveToDatabase && results.viralPosts.length > 0) {
    await database.addPosts(results.viralPosts);
    console.log(`💾 Saved ${results.viralPosts.length} viral posts to database`);
  }

  return NextResponse.json({
    success: true,
    data: {
      analysis: results,
      summary: {
        totalPosts: results.viralPosts.length,
        totalCreators: results.totalAnalyzed,
        topPerformers: results.topPerformers.slice(0, 10),
        bestPatterns: results.patterns.slice(0, 5),
        avgEngagement: results.viralPosts.length > 0 
          ? results.viralPosts.reduce((sum, post) => sum + post.engagementRate, 0) / results.viralPosts.length
          : 0
      }
    }
  });
}

/**
 * Handle AI content generation
 */
async function handleContentGeneration(payload: {
  niche: string;
  tone?: 'motivational' | 'educational' | 'entertaining' | 'controversial' | 'inspirational';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  targetAudience?: string;
  keywords?: string[];
  count?: number;
  generateCalendar?: boolean;
  calendarDays?: number;
}) {
  const database = new ViralDatabase();
  await database.initialize();
  
  const viralPosts = database.getAllPosts();
  const generator = new AIContentGenerator(viralPosts);

  const {
    niche,
    tone = 'motivational',
    length = 'medium',
    includeHashtags = true,
    targetAudience = 'general',
    keywords = [],
    count = 5,
    generateCalendar = false,
    calendarDays = 30
  } = payload;

  console.log(`🤖 Generating ${count} pieces of ${niche} content (${tone}, ${length})`);

  const contentRequest = {
    niche,
    tone,
    length,
    includeHashtags,
    targetAudience,
    keywords
  };

  const generatedContent = generator.generateContent(contentRequest);

  let calendar = null;
  if (generateCalendar) {
    console.log(`📅 Generating ${calendarDays}-day content calendar`);
    calendar = generator.generateContentCalendar(niche, calendarDays);
  }

  return NextResponse.json({
    success: true,
    data: {
      content: generatedContent.slice(0, count),
      calendar,
      metadata: {
        niche,
        tone,
        length,
        generated: new Date().toISOString(),
        totalVariations: generatedContent.length
      }
    }
  });
}

/**
 * Handle viral prediction
 */
async function handleViralPrediction(payload: {
  content: string;
  contentType: string;
  scheduledTime?: string;
  creatorFollowers?: number;
  findOptimalTime?: boolean;
  analyzeCompetitors?: string[];
}) {
  const database = new ViralDatabase();
  await database.initialize();
  
  const viralPosts = database.getAllPosts();
  const predictor = new ViralPredictor(viralPosts);

  const {
    content,
    contentType,
    scheduledTime,
    creatorFollowers,
    findOptimalTime = false,
    analyzeCompetitors = []
  } = payload;

  console.log(`🔮 Predicting viral potential for ${contentType} content`);

  const scheduledDate = scheduledTime ? new Date(scheduledTime) : undefined;
  const prediction = predictor.predictViral(content, contentType, scheduledDate, creatorFollowers);

  let optimalTiming = null;
  if (findOptimalTime) {
    console.log(`⏰ Finding optimal posting time`);
    optimalTiming = predictor.findOptimalPostingTime(content, contentType);
  }

  let competitorAnalysis = null;
  if (analyzeCompetitors.length > 0) {
    console.log(`🕵️ Analyzing ${analyzeCompetitors.length} competitors`);
    competitorAnalysis = predictor.analyzeCompetitorPatterns(analyzeCompetitors);
  }

  return NextResponse.json({
    success: true,
    data: {
      prediction,
      optimalTiming,
      competitorAnalysis,
      recommendations: {
        immediate: prediction.recommendations.slice(0, 3),
        longTerm: prediction.recommendations.slice(3),
        confidence: prediction.confidence
      }
    }
  });
}

/**
 * Handle content variations
 */
async function handleContentVariations(payload: {
  originalContent: string;
  targetNiche?: string;
  targetTone?: 'professional' | 'casual' | 'motivational' | 'educational' | 'entertaining';
  targetLength?: 'shorter' | 'longer' | 'same';
  variationTypes?: string[];
  count?: number;
  adaptToNiches?: string[];
  generateABTests?: boolean;
  useViralFormulas?: boolean;
}) {
  const variationGenerator = new ContentVariationGenerator();

  const {
    originalContent,
    targetNiche,
    targetTone,
    targetLength = 'same',
    variationTypes = ['synonym_replacement', 'structure_change', 'emotional_amplification', 'hook_transformation', 'cta_enhancement'],
    count = 10,
    adaptToNiches = [],
    generateABTests = false,
    useViralFormulas = false
  } = payload;

  console.log(`🎨 Generating ${count} content variations`);

  const variationRequest = {
    originalContent,
    targetNiche,
    targetTone,
    targetLength,
    variationTypes: variationTypes as any[],
    count
  };

  const variations = variationGenerator.generateVariations(variationRequest);

  let nicheAdaptations = null;
  if (adaptToNiches.length > 0) {
    console.log(`🎯 Adapting to ${adaptToNiches.length} niches`);
    nicheAdaptations = variationGenerator.adaptToNiches(originalContent, adaptToNiches);
  }

  let abTests = null;
  if (generateABTests) {
    console.log(`🧪 Generating A/B test variations`);
    abTests = variationGenerator.generateABTestVariations(originalContent);
  }

  let viralFormulas = null;
  if (useViralFormulas) {
    console.log(`🧬 Applying viral formulas`);
    viralFormulas = variationGenerator.applyViralFormulas(originalContent);
  }

  return NextResponse.json({
    success: true,
    data: {
      variations: variations.slice(0, count),
      nicheAdaptations,
      abTests,
      viralFormulas: viralFormulas?.slice(0, 5),
      analytics: {
        avgViralPrediction: variations.reduce((sum, v) => sum + v.viralPrediction, 0) / variations.length,
        bestVariation: variations[0],
        variationTypes: [...new Set(variations.map(v => v.variationType))],
        confidenceRange: {
          min: Math.min(...variations.map(v => v.confidenceScore)),
          max: Math.max(...variations.map(v => v.confidenceScore))
        }
      }
    }
  });
}

/**
 * Handle insights retrieval
 */
async function handleGetInsights(payload: {
  type: 'database_stats' | 'viral_trends' | 'content_suggestions' | 'benchmark_comparison';
  niche?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
}) {
  const database = new ViralDatabase();
  await database.initialize();

  const { type, niche = 'business', timeframe = 'month', limit = 10 } = payload;

  console.log(`📊 Getting ${type} insights for ${niche}`);

  switch (type) {
    case 'database_stats':
      const stats = database.getStats();
      return NextResponse.json({
        success: true,
        data: {
          stats,
          breakdown: stats ? {
            postsPerDay: stats.totalPosts / 30, // Rough estimate
            creatorsAnalyzed: stats.totalCreators,
            topNiches: Object.entries(stats.topContentTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([niche, count]) => ({ niche, count }))
          } : null
        }
      });

    case 'viral_trends':
      const trends = database.getViralTrends();
      return NextResponse.json({
        success: true,
        data: {
          trends,
          summary: {
            hottestPattern: trends.trendingHooks[0]?.pattern || 'No pattern data',
            risingNiche: trends.risingContentTypes[0]?.type || 'No niche data',
            topCreator: trends.topPerformers[0]?.username || 'No creator data',
            keyInsights: trends.insights.slice(0, 3)
          }
        }
      });

    case 'content_suggestions':
      const suggestions = database.getContentSuggestions(niche, limit);
      return NextResponse.json({
        success: true,
        data: {
          suggestions,
          metadata: {
            niche,
            generated: new Date().toISOString(),
            avgViralPotential: suggestions.reduce((sum, s) => sum + s.viralPotential, 0) / suggestions.length
          }
        }
      });

    case 'benchmark_comparison':
      const posts = database.searchPosts({ contentType: [niche] }, 100);
      const benchmark = {
        avgEngagement: posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length,
        topPerformer: Math.max(...posts.map(p => p.engagementRate)),
        medianViews: posts.sort((a, b) => a.views - b.views)[Math.floor(posts.length / 2)]?.views || 0,
        viralThreshold: posts.filter(p => p.viralScore > 80).length / posts.length * 100
      };

      return NextResponse.json({
        success: true,
        data: {
          benchmark,
          sampleSize: posts.length,
          niche,
          lastUpdated: new Date().toISOString()
        }
      });

    default:
      return NextResponse.json(
        { error: 'Invalid insight type' },
        { status: 400 }
      );
  }
}
