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
  viralScore: number;
}

interface PredictionResult {
  viralProbability: number; // 0-100
  expectedEngagement: number; // percentage
  expectedViews: number;
  expectedLikes: number;
  expectedComments: number;
  viralFactors: ViralFactor[];
  recommendations: string[];
  confidence: number; // 0-100
  benchmarkComparison: BenchmarkData;
}

interface ViralFactor {
  factor: string;
  score: number; // 0-100
  weight: number; // importance in final calculation
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface BenchmarkData {
  similarPostsCount: number;
  avgEngagementInNiche: number;
  topPerformerEngagement: number;
  competitorComparison: string;
}

interface ContentMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  hashtagCount: number;
  mentionCount: number;
  emojiCount: number;
  questionCount: number;
  exclamationCount: number;
  readabilityScore: number;
}

interface TimeBasedFactors {
  dayOfWeek: number;
  hourOfDay: number;
  isWeekend: boolean;
  isPeakHour: boolean;
  seasonality: string;
}

export class ViralPredictor {
  private viralDatabase: ViralPost[] = [];
  private modelWeights: { [key: string]: number } = {};
  
  // Pre-trained weights based on viral content analysis
  private readonly DEFAULT_WEIGHTS = {
    hookStrength: 0.25,
    emotionalImpact: 0.20,
    contentLength: 0.10,
    hashtags: 0.08,
    timeFactors: 0.12,
    engagement: 0.15,
    niche: 0.10
  };

  // Viral performance benchmarks by niche
  private readonly NICHE_BENCHMARKS = {
    business: { avgEngagement: 8.5, topPerformer: 25.0, viralThreshold: 15.0 },
    motivation: { avgEngagement: 11.2, topPerformer: 30.0, viralThreshold: 18.0 },
    fitness: { avgEngagement: 9.8, topPerformer: 28.0, viralThreshold: 16.0 },
    lifestyle: { avgEngagement: 7.3, topPerformer: 22.0, viralThreshold: 12.0 },
    education: { avgEngagement: 6.9, topPerformer: 20.0, viralThreshold: 11.0 }
  };

  // Optimal posting times by day of week (in hours)
  private readonly OPTIMAL_TIMES: Record<number, number[]> = {
    0: [10, 14, 19], // Sunday
    1: [9, 12, 17],  // Monday
    2: [9, 13, 18],  // Tuesday
    3: [10, 14, 20], // Wednesday
    4: [9, 13, 17],  // Thursday
    5: [10, 15, 21], // Friday
    6: [11, 15, 20]  // Saturday
  };

  constructor(viralDatabase: ViralPost[] = []) {
    this.viralDatabase = viralDatabase;
    this.modelWeights = { ...this.DEFAULT_WEIGHTS };
    this.trainModel();
  }

  /**
   * Predict viral potential of content before posting
   */
  predictViral(
    content: string, 
    contentType: string, 
    scheduledTime?: Date,
    creatorFollowers?: number
  ): PredictionResult {
    console.log(`🔮 Predicting viral potential for ${contentType} content...`);
    
    // Analyze content metrics
    const contentMetrics = this.analyzeContentMetrics(content);
    
    // Analyze viral factors
    const viralFactors = this.calculateViralFactors(content, contentType, contentMetrics);
    
    // Consider timing factors
    const timeFactors = scheduledTime ? this.analyzeTimeFactors(scheduledTime) : null;
    if (timeFactors) {
      viralFactors.push(...this.getTimeBasedFactors(timeFactors));
    }
    
    // Calculate overall viral probability
    const viralProbability = this.calculateViralProbability(viralFactors);
    
    // Predict engagement metrics
    const engagementPrediction = this.predictEngagementMetrics(
      viralFactors, 
      contentType, 
      creatorFollowers
    );
    
    // Get benchmark comparison
    const benchmarkComparison = this.getBenchmarkComparison(contentType, viralProbability);
    
    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(viralFactors, contentType);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(viralFactors, this.viralDatabase.length);
    
    return {
      viralProbability,
      expectedEngagement: engagementPrediction.engagementRate,
      expectedViews: engagementPrediction.views,
      expectedLikes: engagementPrediction.likes,
      expectedComments: engagementPrediction.comments,
      viralFactors,
      recommendations,
      confidence,
      benchmarkComparison
    };
  }

  /**
   * Batch predict multiple content pieces
   */
  batchPredict(contents: { text: string; type: string; time?: Date }[]): PredictionResult[] {
    console.log(`🚀 Batch predicting ${contents.length} content pieces...`);
    
    return contents.map(content => 
      this.predictViral(content.text, content.type, content.time)
    ).sort((a, b) => b.viralProbability - a.viralProbability);
  }

  /**
   * Find optimal posting time for content
   */
  findOptimalPostingTime(content: string, contentType: string): {
    recommendedTime: Date;
    expectedBoost: number;
    timeFactors: { time: Date; score: number; reasoning: string }[];
  } {
    const baseScore = this.predictViral(content, contentType).viralProbability;
    const timeOptions: { time: Date; score: number; reasoning: string }[] = [];
    
    // Test next 7 days at optimal hours
    for (let day = 0; day < 7; day++) {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + day);
      
      const optimalHours = this.OPTIMAL_TIMES[testDate.getDay()];
      
      for (const hour of optimalHours) {
        const testTime = new Date(testDate);
        testTime.setHours(hour, 0, 0, 0);
        
        const prediction = this.predictViral(content, contentType, testTime);
        const reasoning = this.getTimeRecommendationReasoning(testTime, contentType);
        
        timeOptions.push({
          time: testTime,
          score: prediction.viralProbability,
          reasoning
        });
      }
    }
    
    // Sort by score and get best option
    timeOptions.sort((a, b) => b.score - a.score);
    const best = timeOptions[0];
    
    return {
      recommendedTime: best.time,
      expectedBoost: best.score - baseScore,
      timeFactors: timeOptions.slice(0, 5) // Top 5 options
    };
  }

  /**
   * Analyze competitor posting patterns
   */
  analyzeCompetitorPatterns(competitors: string[]): {
    bestPerformingTimes: Date[];
    contentPatterns: { pattern: string; avgEngagement: number }[];
    gapOpportunities: string[];
    competitorInsights: { username: string; avgEngagement: number; topContent: string }[];
  } {
    const competitorPosts = this.viralDatabase.filter(post => 
      competitors.includes(post.username)
    );
    
    // Analyze posting times
    const timePerformance: { [key: string]: { total: number; count: number } } = {};
    
    competitorPosts.forEach(post => {
      const postTime = new Date(post.uploadDate);
      const timeKey = `${postTime.getDay()}-${postTime.getHours()}`;
      
      if (!timePerformance[timeKey]) {
        timePerformance[timeKey] = { total: 0, count: 0 };
      }
      
      timePerformance[timeKey].total += post.engagementRate;
      timePerformance[timeKey].count += 1;
    });
    
    // Find best performing times
    const bestTimes = Object.entries(timePerformance)
      .map(([timeKey, data]) => ({
        timeKey,
        avgEngagement: data.total / data.count,
        count: data.count
      }))
      .filter(item => item.count >= 3) // Need at least 3 posts
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5)
      .map(item => {
        const [day, hour] = item.timeKey.split('-').map(Number);
        const date = new Date();
        date.setDate(date.getDate() + (day - date.getDay() + 7) % 7);
        date.setHours(hour, 0, 0, 0);
        return date;
      });
    
    // Analyze content patterns
    const patterns = this.extractContentPatterns(competitorPosts);
    
    // Find gap opportunities
    const gaps = this.findGapOpportunities(competitorPosts);
    
    // Competitor insights
    const insights = this.getCompetitorInsights(competitors, competitorPosts);
    
    return {
      bestPerformingTimes: bestTimes,
      contentPatterns: patterns,
      gapOpportunities: gaps,
      competitorInsights: insights
    };
  }

  /**
   * Train model on new viral data
   */
  trainModel(newData?: ViralPost[]): void {
    if (newData) {
      this.viralDatabase.push(...newData);
    }
    
    console.log(`🧠 Training viral prediction model on ${this.viralDatabase.length} posts...`);
    
    if (this.viralDatabase.length < 100) {
      console.log('⚠️  Insufficient data for training. Using default weights.');
      return;
    }
    
    // Analyze correlation between factors and viral success
    const correlations = this.calculateFactorCorrelations();
    
    // Update model weights based on correlations
    this.updateModelWeights(correlations);
    
    console.log('✅ Model training complete. Updated weights:', this.modelWeights);
  }

  // PRIVATE METHODS

  /**
   * Analyze content metrics
   */
  private analyzeContentMetrics(content: string): ContentMetrics {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hashtags = (content.match(/#\w+/g) || []).length;
    const mentions = (content.match(/@\w+/g) || []).length;
    const emojis = (content.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu) || []).length;
    const questions = (content.match(/\?/g) || []).length;
    const exclamations = (content.match(/!/g) || []).length;
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
      hashtagCount: hashtags,
      mentionCount: mentions,
      emojiCount: emojis,
      questionCount: questions,
      exclamationCount: exclamations,
      readabilityScore: this.calculateReadabilityScore(words.length, sentences.length)
    };
  }

  /**
   * Calculate readability score (simplified Flesch score)
   */
  private calculateReadabilityScore(wordCount: number, sentenceCount: number): number {
    if (sentenceCount === 0) return 0;
    
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Simplified readability - lower score is better for social media
    let score = 100;
    
    if (avgSentenceLength > 20) score -= 20;
    else if (avgSentenceLength > 15) score -= 10;
    else if (avgSentenceLength < 8) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate viral factors
   */
  private calculateViralFactors(
    content: string, 
    contentType: string, 
    metrics: ContentMetrics
  ): ViralFactor[] {
    const factors: ViralFactor[] = [];
    
    // Hook strength
    const hookStrength = this.analyzeHookStrength(content);
    factors.push({
      factor: 'Hook Strength',
      score: hookStrength,
      weight: this.modelWeights.hookStrength,
      impact: hookStrength > 70 ? 'positive' : hookStrength < 40 ? 'negative' : 'neutral',
      description: 'Strength of opening statement to capture attention'
    });
    
    // Emotional impact
    const emotionalImpact = this.analyzeEmotionalImpact(content);
    factors.push({
      factor: 'Emotional Impact',
      score: emotionalImpact,
      weight: this.modelWeights.emotionalImpact,
      impact: emotionalImpact > 70 ? 'positive' : emotionalImpact < 40 ? 'negative' : 'neutral',
      description: 'Emotional resonance and engagement potential'
    });
    
    // Content length optimization
    const lengthScore = this.analyzeLengthOptimization(metrics.wordCount, contentType);
    factors.push({
      factor: 'Content Length',
      score: lengthScore,
      weight: this.modelWeights.contentLength,
      impact: lengthScore > 70 ? 'positive' : lengthScore < 40 ? 'negative' : 'neutral',
      description: 'Optimal length for engagement and readability'
    });
    
    // Hashtag optimization
    const hashtagScore = this.analyzeHashtagOptimization(metrics.hashtagCount);
    factors.push({
      factor: 'Hashtag Usage',
      score: hashtagScore,
      weight: this.modelWeights.hashtags,
      impact: hashtagScore > 70 ? 'positive' : hashtagScore < 40 ? 'negative' : 'neutral',
      description: 'Strategic hashtag usage for discoverability'
    });
    
    // Engagement elements
    const engagementScore = this.analyzeEngagementElements(metrics);
    factors.push({
      factor: 'Engagement Elements',
      score: engagementScore,
      weight: this.modelWeights.engagement,
      impact: engagementScore > 70 ? 'positive' : engagementScore < 40 ? 'negative' : 'neutral',
      description: 'Call-to-action strength and engagement drivers'
    });
    
    // Niche performance
    const nicheScore = this.analyzeNichePerformance(content, contentType);
    factors.push({
      factor: 'Niche Alignment',
      score: nicheScore,
      weight: this.modelWeights.niche,
      impact: nicheScore > 70 ? 'positive' : nicheScore < 40 ? 'negative' : 'neutral',
      description: 'Alignment with high-performing content in niche'
    });
    
    return factors;
  }

  /**
   * Analyze time-based factors
   */
  private analyzeTimeFactors(scheduledTime: Date): TimeBasedFactors {
    const dayOfWeek = scheduledTime.getDay();
    const hourOfDay = scheduledTime.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const optimalHours = this.OPTIMAL_TIMES[dayOfWeek];
    const isPeakHour = optimalHours.includes(hourOfDay);
    
    // Simple seasonality (could be enhanced with more data)
    const month = scheduledTime.getMonth();
    let seasonality = 'normal';
    if (month >= 11 || month <= 1) seasonality = 'holiday';
    else if (month >= 5 && month <= 7) seasonality = 'summer';
    else if (month >= 8 && month <= 10) seasonality = 'back_to_school';
    
    return {
      dayOfWeek,
      hourOfDay,
      isWeekend,
      isPeakHour,
      seasonality
    };
  }

  /**
   * Get time-based viral factors
   */
  private getTimeBasedFactors(timeFactors: TimeBasedFactors): ViralFactor[] {
    const factors: ViralFactor[] = [];
    
    // Peak hour timing
    const timingScore = timeFactors.isPeakHour ? 85 : 45;
    factors.push({
      factor: 'Posting Time',
      score: timingScore,
      weight: this.modelWeights.timeFactors,
      impact: timeFactors.isPeakHour ? 'positive' : 'neutral',
      description: `Posted ${timeFactors.isPeakHour ? 'during' : 'outside'} peak engagement hours`
    });
    
    // Day of week impact
    const weekendBonus = timeFactors.isWeekend ? 10 : 0;
    const dayScore = 60 + weekendBonus;
    factors.push({
      factor: 'Day of Week',
      score: dayScore,
      weight: this.modelWeights.timeFactors * 0.5,
      impact: timeFactors.isWeekend ? 'positive' : 'neutral',
      description: `Posted on ${timeFactors.isWeekend ? 'weekend' : 'weekday'}`
    });
    
    return factors;
  }

  /**
   * Calculate viral probability
   */
  private calculateViralProbability(factors: ViralFactor[]): number {
    const weightedScore = factors.reduce((total, factor) => {
      return total + (factor.score * factor.weight);
    }, 0);
    
    const totalWeights = factors.reduce((total, factor) => total + factor.weight, 0);
    const normalizedScore = weightedScore / totalWeights;
    
    // Apply viral threshold adjustment
    let viralProbability = normalizedScore;
    
    // Boost for high-performing combinations
    const positiveFactors = factors.filter(f => f.impact === 'positive').length;
    if (positiveFactors >= 4) {
      viralProbability *= 1.2;
    }
    
    // Penalty for negative factors
    const negativeFactors = factors.filter(f => f.impact === 'negative').length;
    if (negativeFactors >= 2) {
      viralProbability *= 0.8;
    }
    
    return Math.min(100, Math.max(0, Math.round(viralProbability)));
  }

  /**
   * Predict engagement metrics
   */
  private predictEngagementMetrics(
    factors: ViralFactor[], 
    contentType: string, 
    followerCount: number = 10000
  ): {
    engagementRate: number;
    views: number;
    likes: number;
    comments: number;
  } {
    const viralProbability = this.calculateViralProbability(factors);
    const benchmarks = this.NICHE_BENCHMARKS[contentType as keyof typeof this.NICHE_BENCHMARKS] || 
      this.NICHE_BENCHMARKS.business;
    
    // Base engagement rate from niche benchmark
    let engagementRate = benchmarks.avgEngagement;
    
    // Adjust based on viral probability
    const multiplier = viralProbability / 50; // 50 is average
    engagementRate *= multiplier;
    
    // Cap at realistic maximum
    engagementRate = Math.min(engagementRate, benchmarks.topPerformer);
    
    // Estimate views based on follower count and viral potential
    const baseReach = followerCount * 0.1; // 10% organic reach
    const viralBoost = viralProbability > 70 ? (viralProbability / 100) * 5 : 1;
    const views = Math.round(baseReach * viralBoost);
    
    // Calculate likes and comments
    const likes = Math.round(views * (engagementRate / 100));
    const comments = Math.round(likes * 0.05); // Rough 5% comment rate
    
    return {
      engagementRate: Math.round(engagementRate * 100) / 100,
      views,
      likes,
      comments
    };
  }

  /**
   * Get benchmark comparison
   */
  private getBenchmarkComparison(contentType: string, viralProbability: number): BenchmarkData {
    const benchmark = this.NICHE_BENCHMARKS[contentType as keyof typeof this.NICHE_BENCHMARKS] || 
      this.NICHE_BENCHMARKS.business;
    
    const nichePosts = this.viralDatabase.filter(post => post.contentType === contentType);
    const similarPostsCount = nichePosts.length;
    
    let competitorComparison = 'Average';
    if (viralProbability > benchmark.viralThreshold) {
      competitorComparison = 'Above average - likely to outperform competitors';
    } else if (viralProbability < benchmark.avgEngagement) {
      competitorComparison = 'Below average - may struggle against competitors';
    }
    
    return {
      similarPostsCount,
      avgEngagementInNiche: benchmark.avgEngagement,
      topPerformerEngagement: benchmark.topPerformer,
      competitorComparison
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    factors: ViralFactor[], 
    contentType: string
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze weak factors
    const weakFactors = factors.filter(f => f.score < 50);
    
    weakFactors.forEach(factor => {
      switch (factor.factor) {
        case 'Hook Strength':
          recommendations.push('🎯 Strengthen your hook with a question, number, or controversial statement');
          break;
        case 'Emotional Impact':
          recommendations.push('💝 Add more emotional language, personal stories, or surprising facts');
          break;
        case 'Content Length':
          recommendations.push('📝 Optimize length - aim for 80-150 words for maximum engagement');
          break;
        case 'Hashtag Usage':
          recommendations.push('🏷️ Use 5-8 relevant hashtags strategically placed at the end');
          break;
        case 'Engagement Elements':
          recommendations.push('📢 Add clear call-to-action: ask questions, request comments, or encourage shares');
          break;
        case 'Niche Alignment':
          recommendations.push(`🎨 Study top-performing ${contentType} content and adapt successful patterns`);
          break;
      }
    });
    
    // Add positive reinforcement
    const strongFactors = factors.filter(f => f.score > 75);
    if (strongFactors.length > 0) {
      recommendations.unshift('🔥 Strong foundation detected! Small tweaks could make this viral');
    }
    
    // Add timing recommendations
    recommendations.push('⏰ Consider posting during peak hours (9-11 AM or 2-4 PM)');
    
    return recommendations;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(factors: ViralFactor[], datasetSize: number): number {
    let confidence = 70; // Base confidence
    
    // More data = higher confidence
    if (datasetSize > 1000) confidence += 20;
    else if (datasetSize > 500) confidence += 10;
    else if (datasetSize < 100) confidence -= 20;
    
    // Factor consistency
    const factorVariance = this.calculateVariance(factors.map(f => f.score));
    if (factorVariance < 400) confidence += 10; // Low variance = consistent factors
    
    // Strong signals boost confidence
    const strongSignals = factors.filter(f => f.score > 80 || f.score < 20).length;
    confidence += strongSignals * 3;
    
    return Math.min(95, Math.max(30, confidence));
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  }

  // Additional analysis methods...
  private analyzeHookStrength(content: string): number {
    const firstLine = content.split('\n')[0];
    let score = 50;
    
    // Question hooks are powerful
    if (firstLine.includes('?')) score += 15;
    
    // Numbers attract attention
    if (/\d+/.test(firstLine)) score += 10;
    
    // Power words
    const powerWords = ['secret', 'hack', 'mistake', 'truth', 'shocking', 'incredible'];
    powerWords.forEach(word => {
      if (firstLine.toLowerCase().includes(word)) score += 8;
    });
    
    // Length optimization
    if (firstLine.length >= 20 && firstLine.length <= 60) score += 10;
    
    return Math.min(100, score);
  }

  private analyzeEmotionalImpact(content: string): number {
    let score = 40;
    
    const emotionalWords = [
      'amazing', 'incredible', 'shocking', 'unbelievable', 'mind-blowing',
      'life-changing', 'game-changing', 'powerful', 'inspiring'
    ];
    
    emotionalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 7;
    });
    
    // Personal pronouns increase connection
    if (content.includes(' I ') || content.includes(' my ') || content.includes(' me ')) score += 12;
    
    // Exclamation points add energy
    const exclamations = (content.match(/!/g) || []).length;
    score += Math.min(exclamations * 4, 16);
    
    return Math.min(100, score);
  }

  private analyzeLengthOptimization(wordCount: number, contentType: string): number {
    const optimal = {
      business: { min: 80, max: 150 },
      motivation: { min: 60, max: 120 },
      fitness: { min: 50, max: 100 },
      lifestyle: { min: 40, max: 80 },
      education: { min: 100, max: 200 }
    };
    
    const range = optimal[contentType as keyof typeof optimal] || optimal.business;
    
    if (wordCount >= range.min && wordCount <= range.max) return 90;
    if (wordCount >= range.min * 0.8 && wordCount <= range.max * 1.2) return 70;
    if (wordCount < range.min * 0.5 || wordCount > range.max * 2) return 30;
    
    return 50;
  }

  private analyzeHashtagOptimization(hashtagCount: number): number {
    if (hashtagCount >= 5 && hashtagCount <= 8) return 90;
    if (hashtagCount >= 3 && hashtagCount <= 10) return 70;
    if (hashtagCount === 0 || hashtagCount > 15) return 30;
    
    return 50;
  }

  private analyzeEngagementElements(metrics: ContentMetrics): number {
    let score = 40;
    
    // Questions encourage engagement
    score += metrics.questionCount * 15;
    
    // Emojis add personality
    score += Math.min(metrics.emojiCount * 5, 20);
    
    // Mentions can increase reach
    score += Math.min(metrics.mentionCount * 8, 16);
    
    return Math.min(100, score);
  }

  private analyzeNichePerformance(content: string, contentType: string): number {
    const nichePosts = this.viralDatabase.filter(post => post.contentType === contentType);
    
    if (nichePosts.length === 0) return 50; // No data available
    
    // Analyze keyword overlap with successful posts
    const contentWords = content.toLowerCase().split(/\s+/);
    const successfulWords = new Set();
    
    nichePosts
      .filter(post => post.viralScore > 70)
      .forEach(post => {
        post.caption.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3) successfulWords.add(word);
        });
      });
    
    const overlap = contentWords.filter(word => successfulWords.has(word)).length;
    const overlapRatio = overlap / Math.max(contentWords.length, 1);
    
    return Math.min(100, 30 + (overlapRatio * 70));
  }

  private getTimeRecommendationReasoning(time: Date, contentType: string): string {
    const hour = time.getHours();
    const day = time.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const reasons = [];
    
    if (this.OPTIMAL_TIMES[day].includes(hour)) {
      reasons.push('Peak engagement hour');
    }
    
    if (hour >= 9 && hour <= 11) {
      reasons.push('Morning scroll time');
    } else if (hour >= 14 && hour <= 16) {
      reasons.push('Afternoon break time');
    } else if (hour >= 19 && hour <= 21) {
      reasons.push('Evening wind-down');
    }
    
    if (day === 0 || day === 6) {
      reasons.push('Weekend leisure browsing');
    }
    
    return `${dayNames[day]} ${hour}:00 - ${reasons.join(', ')}`;
  }

  private extractContentPatterns(posts: ViralPost[]): { pattern: string; avgEngagement: number }[] {
    const patterns: { [key: string]: number[] } = {};
    
    posts.forEach(post => {
      // Analyze hook patterns
      if (post.hook.includes('?')) {
        patterns['Question Hook'] = patterns['Question Hook'] || [];
        patterns['Question Hook'].push(post.engagementRate);
      }
      
      if (/\d+/.test(post.hook)) {
        patterns['Numbered Hook'] = patterns['Numbered Hook'] || [];
        patterns['Numbered Hook'].push(post.engagementRate);
      }
      
      if (post.hook.toLowerCase().includes('secret') || post.hook.toLowerCase().includes('hack')) {
        patterns['Secret/Hack Hook'] = patterns['Secret/Hack Hook'] || [];
        patterns['Secret/Hack Hook'].push(post.engagementRate);
      }
    });
    
    return Object.entries(patterns)
      .map(([pattern, engagements]) => ({
        pattern,
        avgEngagement: engagements.reduce((sum, eng) => sum + eng, 0) / engagements.length
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private findGapOpportunities(posts: ViralPost[]): string[] {
    const gaps: string[] = [];
    
    // Analyze posting frequency by time
    const timeSlots: { [key: string]: number } = {};
    posts.forEach(post => {
      const date = new Date(post.uploadDate);
      const slot = `${date.getDay()}-${Math.floor(date.getHours() / 4)}`;
      timeSlots[slot] = (timeSlots[slot] || 0) + 1;
    });
    
    // Find underutilized time slots
    const avgPostsPerSlot = Object.values(timeSlots).reduce((sum, count) => sum + count, 0) / Object.keys(timeSlots).length;
    
    Object.entries(timeSlots).forEach(([slot, count]) => {
      if (count < avgPostsPerSlot * 0.5) {
        const [day, timeBlock] = slot.split('-');
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)];
        const timeRange = ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late evening', 'Night'][parseInt(timeBlock)];
        gaps.push(`Underutilized: ${dayName} ${timeRange}`);
      }
    });
    
    return gaps;
  }

  private getCompetitorInsights(
    competitors: string[], 
    posts: ViralPost[]
  ): { username: string; avgEngagement: number; topContent: string }[] {
    return competitors.map(username => {
      const userPosts = posts.filter(post => post.username === username);
      
      if (userPosts.length === 0) {
        return { username, avgEngagement: 0, topContent: 'No data available' };
      }
      
      const avgEngagement = userPosts.reduce((sum, post) => sum + post.engagementRate, 0) / userPosts.length;
      const topPost = userPosts.sort((a, b) => b.engagementRate - a.engagementRate)[0];
      
      return {
        username,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        topContent: topPost.hook
      };
    }).sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private calculateFactorCorrelations(): { [factor: string]: number } {
    // This would analyze correlations between factors and viral success
    // For now, returning default correlations
    return {
      hookStrength: 0.65,
      emotionalImpact: 0.58,
      contentLength: 0.42,
      hashtags: 0.35,
      timeFactors: 0.48,
      engagement: 0.71,
      niche: 0.39
    };
  }

  private updateModelWeights(correlations: { [factor: string]: number }): void {
    const totalCorrelation = Object.values(correlations).reduce((sum, val) => sum + val, 0);
    
    // Normalize correlations to weights
    Object.entries(correlations).forEach(([factor, correlation]) => {
      const normalizedWeight = correlation / totalCorrelation;
      
      // Map factor names to model weight keys
      const weightKey = {
        hookStrength: 'hookStrength',
        emotionalImpact: 'emotionalImpact',
        contentLength: 'contentLength',
        hashtags: 'hashtags',
        timeFactors: 'timeFactors',
        engagement: 'engagement',
        niche: 'niche'
      }[factor];
      
      if (weightKey) {
        this.modelWeights[weightKey] = normalizedWeight;
      }
    });
  }
}
