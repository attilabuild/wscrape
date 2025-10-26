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

interface ContentVariation {
  id: string;
  originalId: string;
  hook: string;
  caption: string;
  hashtags: string[];
  contentType: string;
  variationType: string;
  viralPrediction: number;
  engagementPrediction: number;
  adaptationStrategy: string;
  confidenceScore: number;
}

interface VariationRequest {
  originalContent: string;
  targetNiche?: string;
  targetTone?: 'professional' | 'casual' | 'motivational' | 'educational' | 'entertaining';
  targetLength?: 'shorter' | 'longer' | 'same';
  variationTypes: VariationType[];
  count: number;
}

type VariationType = 
  | 'synonym_replacement'
  | 'structure_change' 
  | 'tone_shift'
  | 'niche_adaptation'
  | 'length_optimization'
  | 'hook_transformation'
  | 'cta_enhancement'
  | 'emotional_amplification'
  | 'question_reframing'
  | 'storytelling_angle';

interface ViralFormula {
  id: string;
  name: string;
  structure: string[];
  pattern: string;
  examples: string[];
  avgEngagement: number;
  adaptable: boolean;
  variables: { [key: string]: string[] };
}

export class ContentVariationGenerator {
  private viralFormulas: ViralFormula[] = [];
  private synonymDatabase: { [key: string]: string[] } = {};
  private emotionalWords: { [emotion: string]: string[] } = {};
  
  // Pre-loaded viral formulas based on successful patterns
  private readonly VIRAL_FORMULAS: ViralFormula[] = [
    {
      id: 'question_revelation',
      name: 'Question → Revelation',
      structure: ['hook_question', 'surprising_answer', 'explanation', 'call_to_action'],
      pattern: '{question}? {revelation}. {explanation} {cta}',
      examples: [
        'What if I told you? The secret is. Here\'s how it works. Try this today!',
        'Want to know the truth? Most people are wrong. The reality is different. Share if you agree!'
      ],
      avgEngagement: 14.2,
      adaptable: true,
      variables: {
        question: ['What if I told you', 'Want to know the secret', 'Ever wondered why', 'Ready for the truth'],
        revelation: ['The secret is', 'The truth is', 'Here\'s what nobody tells you', 'The reality is'],
        cta: ['Try this today', 'Share if you agree', 'Save this post', 'Tell me what you think']
      }
    },
    {
      id: 'numbered_secrets',
      name: 'Numbered Secrets',
      structure: ['numbered_hook', 'list_items', 'explanation', 'engagement_cta'],
      pattern: '{number} {secrets} {audience} {action}',
      examples: [
        '5 secrets millionaires use to build wealth',
        '3 mistakes killing your content engagement'
      ],
      avgEngagement: 12.8,
      adaptable: true,
      variables: {
        number: ['3', '5', '7', '10'],
        secrets: ['secrets', 'ways', 'strategies', 'methods', 'techniques'],
        audience: ['entrepreneurs', 'creators', 'people', 'professionals'],
        action: ['use to succeed', 'never talk about', 'wish they knew', 'always do']
      }
    },
    {
      id: 'before_after',
      name: 'Before & After Transformation',
      structure: ['past_state', 'transformation_moment', 'current_state', 'lesson_learned'],
      pattern: '{timeframe} ago, {past_situation}. {transformation}. Now, {current_situation}. {lesson}.',
      examples: [
        '2 years ago, I was broke. Everything changed when I learned this. Now I run a 7-figure business. The lesson: mindset is everything.',
        '6 months ago, 0 followers. I discovered this strategy. Today, 100K followers. Here\'s what I learned.'
      ],
      avgEngagement: 16.7,
      adaptable: true,
      variables: {
        timeframe: ['2 years', '6 months', '1 year', '5 years', '90 days'],
        transformation: ['Everything changed when', 'Then I discovered', 'One day I learned', 'The breakthrough came when'],
        lesson: ['The lesson', 'What I learned', 'The key insight', 'The game-changer']
      }
    }
  ];

  // Comprehensive synonym database
  private readonly SYNONYM_DATABASE: { [key: string]: string[] } = {
    'secret': ['trick', 'hack', 'strategy', 'method', 'technique', 'formula'],
    'amazing': ['incredible', 'unbelievable', 'mind-blowing', 'shocking', 'extraordinary'],
    'money': ['wealth', 'income', 'cash', 'revenue', 'profit', 'earnings'],
    'business': ['company', 'venture', 'enterprise', 'startup', 'organization'],
    'success': ['achievement', 'victory', 'triumph', 'accomplishment', 'breakthrough'],
    'people': ['individuals', 'folks', 'everyone', 'most people', 'others'],
    'mistake': ['error', 'blunder', 'oversight', 'failure', 'misstep'],
    'powerful': ['strong', 'effective', 'impactful', 'game-changing', 'transformative'],
    'simple': ['easy', 'straightforward', 'basic', 'effortless', 'uncomplicated'],
    'quick': ['fast', 'rapid', 'instant', 'immediate', 'speedy']
  };

  // Emotional amplification words
  private readonly EMOTIONAL_WORDS: { [emotion: string]: string[] } = {
    excitement: ['incredible', 'amazing', 'unbelievable', 'mind-blowing', 'extraordinary'],
    urgency: ['now', 'today', 'immediately', 'right now', 'instantly'],
    curiosity: ['secret', 'hidden', 'unknown', 'mysterious', 'surprising'],
    fear: ['mistake', 'warning', 'danger', 'avoid', 'never'],
    aspiration: ['success', 'achievement', 'victory', 'breakthrough', 'transformation'],
    exclusivity: ['elite', 'exclusive', 'insider', 'privileged', 'select'],
    authority: ['proven', 'tested', 'verified', 'guaranteed', 'certified']
  };

  constructor() {
    this.viralFormulas = [...this.VIRAL_FORMULAS];
    this.synonymDatabase = { ...this.SYNONYM_DATABASE };
    this.emotionalWords = { ...this.EMOTIONAL_WORDS };
  }

  /**
   * Generate multiple variations from a winning formula
   */
  generateVariations(request: VariationRequest): ContentVariation[] {
    
    const variations: ContentVariation[] = [];
    const originalHook = this.extractHook(request.originalContent);
    
    // Distribute variation types evenly
    const typesPerVariation = Math.ceil(request.variationTypes.length / request.count);
    
    for (let i = 0; i < request.count; i++) {
      const variationType = request.variationTypes[i % request.variationTypes.length];
      const variation = this.createVariation(
        request.originalContent,
        variationType,
        request.targetNiche,
        request.targetTone,
        request.targetLength,
        i
      );
      
      variations.push(variation);
    }
    
    return variations.sort((a, b) => b.viralPrediction - a.viralPrediction);
  }

  /**
   * Auto-adapt content to different niches
   */
  adaptToNiches(originalContent: string, targetNiches: string[]): {
    niche: string;
    adaptedContent: ContentVariation;
    adaptationExplanation: string;
  }[] {
    
    return targetNiches.map(niche => {
      const adaptation = this.createNicheAdaptation(originalContent, niche);
      const explanation = this.generateAdaptationExplanation(originalContent, adaptation, niche);
      
      return {
        niche,
        adaptedContent: adaptation,
        adaptationExplanation: explanation
      };
    });
  }

  /**
   * Create viral formula variations
   */
  applyViralFormulas(originalContent: string, formulaIds?: string[]): {
    formula: ViralFormula;
    variation: ContentVariation;
    applicabilityScore: number;
  }[] {
    
    const targetFormulas = formulaIds 
      ? this.viralFormulas.filter(f => formulaIds.includes(f.id))
      : this.viralFormulas;
    
    return targetFormulas.map(formula => {
      const variation = this.applyFormula(originalContent, formula);
      const applicabilityScore = this.calculateFormulaApplicability(originalContent, formula);
      
      return {
        formula,
        variation,
        applicabilityScore
      };
    }).sort((a, b) => b.applicabilityScore - a.applicabilityScore);
  }

  /**
   * Generate A/B test variations
   */
  generateABTestVariations(originalContent: string): {
    testType: string;
    variationA: ContentVariation;
    variationB: ContentVariation;
    testHypothesis: string;
    expectedWinner: 'A' | 'B';
  }[] {
    
    const tests = [
      {
        testType: 'Hook Style',
        variationA: this.createVariation(originalContent, 'question_reframing'),
        variationB: this.createVariation(originalContent, 'hook_transformation'),
        testHypothesis: 'Question hooks vs statement hooks for engagement',
        expectedWinner: 'A' as const
      },
      {
        testType: 'Emotional Intensity',
        variationA: this.createVariation(originalContent, 'emotional_amplification'),
        variationB: this.createVariation(originalContent, 'tone_shift'),
        testHypothesis: 'High emotional intensity vs moderate tone',
        expectedWinner: 'A' as const
      },
      {
        testType: 'Content Length',
        variationA: this.createVariation(originalContent, 'length_optimization', undefined, undefined, 'shorter'),
        variationB: this.createVariation(originalContent, 'length_optimization', undefined, undefined, 'longer'),
        testHypothesis: 'Short-form vs long-form content engagement',
        expectedWinner: 'A' as const
      }
    ];
    
    return tests;
  }

  /**
   * Batch process winning formulas
   */
  batchGenerateFromWinners(winningPosts: ViralPost[], variationsPerPost: number = 5): {
    originalPost: ViralPost;
    variations: ContentVariation[];
    bestVariation: ContentVariation;
  }[] {
    
    return winningPosts.map(post => {
      const request: VariationRequest = {
        originalContent: post.caption,
        targetNiche: post.contentType,
        variationTypes: ['synonym_replacement', 'structure_change', 'emotional_amplification', 'hook_transformation', 'cta_enhancement'],
        count: variationsPerPost
      };
      
      const variations = this.generateVariations(request);
      const bestVariation = variations[0];
      
      return {
        originalPost: post,
        variations,
        bestVariation
      };
    });
  }

  // PRIVATE METHODS

  /**
   * Create a single content variation
   */
  private createVariation(
    originalContent: string,
    variationType: VariationType,
    targetNiche?: string,
    targetTone?: string,
    targetLength?: string,
    seed: number = 0
  ): ContentVariation {
    let variatedContent = originalContent;
    let adaptationStrategy = '';
    
    switch (variationType) {
      case 'synonym_replacement':
        variatedContent = this.applySynonymReplacement(originalContent);
        adaptationStrategy = 'Replaced key terms with powerful synonyms';
        break;
        
      case 'structure_change':
        variatedContent = this.applyStructureChange(originalContent);
        adaptationStrategy = 'Restructured content flow for better engagement';
        break;
        
      case 'tone_shift':
        variatedContent = this.applyToneShift(originalContent, targetTone || 'motivational');
        adaptationStrategy = `Shifted tone to ${targetTone || 'motivational'}`;
        break;
        
      case 'niche_adaptation':
        variatedContent = this.applyNicheAdaptation(originalContent, targetNiche || 'business');
        adaptationStrategy = `Adapted for ${targetNiche || 'business'} niche`;
        break;
        
      case 'length_optimization':
        variatedContent = this.applyLengthOptimization(originalContent, targetLength || 'same');
        adaptationStrategy = `Optimized length (${targetLength || 'same'})`;
        break;
        
      case 'hook_transformation':
        variatedContent = this.applyHookTransformation(originalContent);
        adaptationStrategy = 'Transformed hook for maximum impact';
        break;
        
      case 'cta_enhancement':
        variatedContent = this.applyCTAEnhancement(originalContent);
        adaptationStrategy = 'Enhanced call-to-action elements';
        break;
        
      case 'emotional_amplification':
        variatedContent = this.applyEmotionalAmplification(originalContent);
        adaptationStrategy = 'Amplified emotional impact';
        break;
        
      case 'question_reframing':
        variatedContent = this.applyQuestionReframing(originalContent);
        adaptationStrategy = 'Reframed as engaging questions';
        break;
        
      case 'storytelling_angle':
        variatedContent = this.applyStorytellingAngle(originalContent);
        adaptationStrategy = 'Added storytelling elements';
        break;
    }
    
    const hook = this.extractHook(variatedContent);
    const hashtags = this.extractHashtags(variatedContent);
    const contentType = targetNiche || this.detectContentType(originalContent);
    
    // Predict viral potential (simplified)
    const viralPrediction = this.predictViralPotential(variatedContent, variationType);
    const engagementPrediction = this.predictEngagement(variatedContent, contentType);
    const confidenceScore = this.calculateConfidence(variationType, variatedContent);
    
    return {
      id: `var_${Date.now()}_${seed}`,
      originalId: `original_${Date.now()}`,
      hook,
      caption: variatedContent,
      hashtags,
      contentType,
      variationType,
      viralPrediction,
      engagementPrediction,
      adaptationStrategy,
      confidenceScore
    };
  }

  /**
   * Apply synonym replacement
   */
  private applySynonymReplacement(content: string): string {
    let result = content;
    
    Object.entries(this.synonymDatabase).forEach(([original, synonyms]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      if (result.match(regex)) {
        const randomSynonym = synonyms[Math.floor(Math.random() * synonyms.length)];
        result = result.replace(regex, randomSynonym);
      }
    });
    
    return result;
  }

  /**
   * Apply structure change
   */
  private applyStructureChange(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) return content;
    
    // Different restructuring strategies
    const strategies = [
      // Move strongest statement to front
      () => {
        const sorted = [...sentences].sort((a, b) => b.length - a.length);
        return [sorted[0], ...sentences.filter(s => s !== sorted[0])].join('. ') + '.';
      },
      // Add question at beginning
      () => {
        const question = this.generateEngagingQuestion(content);
        return `${question} ${content}`;
      },
      // Break into shorter punchy sentences
      () => {
        return sentences.map(s => s.trim()).join('.\n\n') + '.';
      }
    ];
    
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy();
  }

  /**
   * Apply tone shift
   */
  private applyToneShift(content: string, targetTone: string): string {
    const toneAdjustments = {
      professional: {
        replacements: { 'awesome': 'excellent', 'cool': 'effective', 'amazing': 'remarkable' },
        additions: ['Based on research,', 'Studies show that', 'Data indicates']
      },
      casual: {
        replacements: { 'utilize': 'use', 'demonstrate': 'show', 'facilitate': 'help' },
        additions: ['Honestly,', 'Real talk:', 'Here\'s the thing:']
      },
      motivational: {
        replacements: { 'can': 'will', 'might': 'will', 'try': 'commit to' },
        additions: ['You\'ve got this!', 'Believe in yourself!', 'Your future self will thank you!']
      }
    };
    
    const adjustments = toneAdjustments[targetTone as keyof typeof toneAdjustments];
    if (!adjustments) return content;
    
    let result = content;
    
    // Apply replacements
    Object.entries(adjustments.replacements).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      result = result.replace(regex, to);
    });
    
    // Add tone-appropriate intro
    const intro = adjustments.additions[Math.floor(Math.random() * adjustments.additions.length)];
    result = `${intro} ${result}`;
    
    return result;
  }

  /**
   * Apply niche adaptation
   */
  private applyNicheAdaptation(content: string, targetNiche: string): string {
    const nicheTerms = {
      business: ['entrepreneur', 'revenue', 'strategy', 'growth', 'ROI', 'business owner'],
      fitness: ['workout', 'gains', 'transformation', 'strength', 'healthy', 'fitness journey'],
      lifestyle: ['balance', 'wellness', 'self-care', 'mindfulness', 'positive vibes', 'lifestyle'],
      education: ['learn', 'knowledge', 'skill', 'development', 'growth', 'education'],
      motivation: ['mindset', 'goals', 'success', 'achievement', 'motivation', 'inspiration']
    };
    
    const terms = nicheTerms[targetNiche as keyof typeof nicheTerms] || nicheTerms.business;
    
    // Replace generic terms with niche-specific ones
    let result = content;
    
    // Add niche-appropriate context
    const nicheIntros = {
      business: 'As an entrepreneur, ',
      fitness: 'On your fitness journey, ',
      lifestyle: 'For a balanced life, ',
      education: 'When learning new skills, ',
      motivation: 'To achieve your goals, '
    };
    
    const intro = nicheIntros[targetNiche as keyof typeof nicheIntros];
    if (intro && !result.toLowerCase().includes(targetNiche)) {
      result = intro + result.charAt(0).toLowerCase() + result.slice(1);
    }
    
    return result;
  }

  /**
   * Apply length optimization
   */
  private applyLengthOptimization(content: string, targetLength: string): string {
    const words = content.split(/\s+/);
    
    switch (targetLength) {
      case 'shorter':
        // Keep only essential words and most impactful sentences
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const shortestSentences = sentences
          .sort((a, b) => a.length - b.length)
          .slice(0, Math.ceil(sentences.length / 2));
        return shortestSentences.join('. ') + '.';
        
      case 'longer':
        // Add elaboration and examples
        const expansions = [
          '\n\nHere\'s why this matters:',
          '\n\nLet me explain:',
          '\n\nFor example:',
          '\n\nThe bottom line:'
        ];
        const expansion = expansions[Math.floor(Math.random() * expansions.length)];
        return content + expansion + ' ' + this.generateElaboration(content);
        
      default:
        return content;
    }
  }

  /**
   * Apply hook transformation
   */
  private applyHookTransformation(content: string): string {
    const originalHook = this.extractHook(content);
    const restOfContent = content.replace(originalHook, '').trim();
    
    const hookTransformations = [
      // Question hook
      () => this.generateEngagingQuestion(originalHook),
      // Number hook
      () => this.addNumberToHook(originalHook),
      // Curiosity hook
      () => this.addCuriosityGap(originalHook),
      // Emotional hook
      () => this.amplifyEmotionalHook(originalHook),
      // Controversial hook
      () => this.createControversialHook(originalHook)
    ];
    
    const transformation = hookTransformations[Math.floor(Math.random() * hookTransformations.length)];
    const newHook = transformation();
    
    return restOfContent ? `${newHook}\n\n${restOfContent}` : newHook;
  }

  /**
   * Apply CTA enhancement
   */
  private applyCTAEnhancement(content: string): string {
    const strongCTAs = [
      '\n\n💪 Follow for daily motivation!',
      '\n\n🔄 Save this and share with someone who needs it!',
      '\n\n💬 What\'s your biggest challenge? Comment below!',
      '\n\n🎯 Double-tap if this resonates with you!',
      '\n\n📌 Save this for when you need inspiration!',
      '\n\n👇 Tag someone who needs to see this!',
      '\n\n🔥 Follow me for more content like this!',
      '\n\n💯 Share your thoughts in the comments!'
    ];
    
    const randomCTA = strongCTAs[Math.floor(Math.random() * strongCTAs.length)];
    
    // Remove existing weak CTAs
    let enhancedContent = content.replace(/\n\n(Follow for more|Like if you agree|Share this)/gi, '');
    
    return enhancedContent + randomCTA;
  }

  /**
   * Apply emotional amplification
   */
  private applyEmotionalAmplification(content: string): string {
    let amplifiedContent = content;
    
    // Add emotional intensifiers
    const intensifiers = {
      'good': 'incredible',
      'bad': 'devastating',
      'big': 'massive',
      'small': 'tiny',
      'fast': 'lightning-fast',
      'slow': 'painfully slow',
      'easy': 'effortless',
      'hard': 'brutally difficult'
    };
    
    Object.entries(intensifiers).forEach(([mild, intense]) => {
      const regex = new RegExp(`\\b${mild}\\b`, 'gi');
      amplifiedContent = amplifiedContent.replace(regex, intense);
    });
    
    // Add emotional punctuation
    amplifiedContent = amplifiedContent.replace(/\./g, '!');
    
    // Add emotional words from database
    const emotionType = Object.keys(this.emotionalWords)[Math.floor(Math.random() * Object.keys(this.emotionalWords).length)];
    const emotionalWord = this.emotionalWords[emotionType][Math.floor(Math.random() * this.emotionalWords[emotionType].length)];
    
    // Insert emotional word strategically
    const sentences = amplifiedContent.split('!');
    if (sentences.length > 1) {
      sentences[0] = `${emotionalWord} ${sentences[0]}`;
      amplifiedContent = sentences.join('!');
    }
    
    return amplifiedContent;
  }

  /**
   * Apply question reframing
   */
  private applyQuestionReframing(content: string): string {
    const statements = content.split(/[.!]+/).filter(s => s.trim().length > 0);
    
    const questionFrames = [
      'What if I told you',
      'Have you ever wondered',
      'Did you know that',
      'Want to know the secret to',
      'Ever ask yourself why',
      'What\'s the difference between'
    ];
    
    const transformedStatements = statements.map(statement => {
      if (Math.random() > 0.5) { // Transform 50% of statements
        const frame = questionFrames[Math.floor(Math.random() * questionFrames.length)];
        return `${frame} ${statement.trim().toLowerCase()}?`;
      }
      return statement.trim();
    });
    
    return transformedStatements.join(' ');
  }

  /**
   * Apply storytelling angle
   */
  private applyStorytellingAngle(content: string): string {
    const storyStarters = [
      'Last week, I learned something that changed everything:',
      'A friend asked me yesterday:',
      'I used to believe that',
      'Here\'s what nobody told me when I started:',
      'The moment I realized',
      'My biggest mistake was thinking'
    ];
    
    const storyConnectors = [
      'But then I discovered',
      'That\'s when I realized',
      'Everything changed when',
      'The breakthrough came when',
      'Then it hit me'
    ];
    
    const starter = storyStarters[Math.floor(Math.random() * storyStarters.length)];
    const connector = storyConnectors[Math.floor(Math.random() * storyConnectors.length)];
    
    const originalHook = this.extractHook(content);
    const restContent = content.replace(originalHook, '').trim();
    
    return `${starter} ${originalHook.toLowerCase()}\n\n${connector}: ${restContent}`;
  }

  // HELPER METHODS

  private extractHook(content: string): string {
    const firstLine = content.split('\n')[0];
    const firstSentence = content.split(/[.!?]/)[0];
    return firstLine.length <= firstSentence.length ? firstLine : firstSentence;
  }

  private extractHashtags(content: string): string[] {
    return (content.match(/#\w+/g) || []);
  }

  private detectContentType(content: string): string {
    const keywords = {
      business: ['entrepreneur', 'business', 'money', 'revenue', 'profit'],
      fitness: ['workout', 'exercise', 'gym', 'health', 'fitness'],
      motivation: ['success', 'goals', 'mindset', 'motivation', 'achievement'],
      lifestyle: ['life', 'balance', 'wellness', 'happiness', 'lifestyle'],
      education: ['learn', 'education', 'knowledge', 'skill', 'development']
    };
    
    const lowerContent = content.toLowerCase();
    
    for (const [type, typeKeywords] of Object.entries(keywords)) {
      if (typeKeywords.some(keyword => lowerContent.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }

  private predictViralPotential(content: string, variationType: VariationType): number {
    let baseScore = 60;
    
    // Variation type bonuses
    const typeBonus = {
      question_reframing: 15,
      emotional_amplification: 12,
      hook_transformation: 10,
      storytelling_angle: 8,
      cta_enhancement: 6,
      synonym_replacement: 4,
      structure_change: 7,
      tone_shift: 5,
      niche_adaptation: 6,
      length_optimization: 3
    };
    
    baseScore += typeBonus[variationType] || 0;
    
    // Content quality factors
    if (content.includes('?')) baseScore += 5;
    if (/\d+/.test(content)) baseScore += 5;
    if (content.includes('!')) baseScore += 3;
    
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 50 && wordCount <= 150) baseScore += 8;
    
    return Math.min(100, Math.max(0, baseScore));
  }

  private predictEngagement(content: string, contentType: string): number {
    const baselines = {
      business: 8.5,
      motivation: 11.2,
      fitness: 9.8,
      lifestyle: 7.3,
      education: 6.9,
      general: 7.0
    };
    
    let engagement = baselines[contentType as keyof typeof baselines] || baselines.general;
    
    // Content enhancement bonuses
    if (content.includes('?')) engagement *= 1.1;
    if (content.includes('!')) engagement *= 1.05;
    if (/\d+/.test(content)) engagement *= 1.08;
    
    return Math.round(engagement * 100) / 100;
  }

  private calculateConfidence(variationType: VariationType, content: string): number {
    let confidence = 70;
    
    // Variation type confidence levels
    const typeConfidence = {
      synonym_replacement: 85,
      structure_change: 75,
      tone_shift: 80,
      niche_adaptation: 70,
      length_optimization: 90,
      hook_transformation: 65,
      cta_enhancement: 85,
      emotional_amplification: 70,
      question_reframing: 75,
      storytelling_angle: 60
    };
    
    confidence = typeConfidence[variationType] || 70;
    
    // Content quality adjustments
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 20 || wordCount > 200) confidence -= 10;
    
    return Math.min(95, Math.max(30, confidence));
  }

  private generateEngagingQuestion(content: string): string {
    const questionStarters = [
      'What if I told you',
      'Have you ever wondered why',
      'Want to know the secret to',
      'Did you know that',
      'Ever ask yourself',
      'What\'s the one thing'
    ];
    
    const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
    const mainPoint = content.split(/[.!?]/)[0].toLowerCase();
    
    return `${starter} ${mainPoint}?`;
  }

  private addNumberToHook(hook: string): string {
    const numbers = ['3', '5', '7', '10'];
    const number = numbers[Math.floor(Math.random() * numbers.length)];
    
    if (hook.toLowerCase().includes('way') || hook.toLowerCase().includes('method')) {
      return hook.replace(/(way|method)/i, `${number} $1s`);
    }
    
    return `${number} things about ${hook.toLowerCase()}`;
  }

  private addCuriosityGap(hook: string): string {
    const curiosityFrames = [
      'The secret behind',
      'What nobody tells you about',
      'The hidden truth about',
      'The surprising reality of',
      'What I wish I knew about'
    ];
    
    const frame = curiosityFrames[Math.floor(Math.random() * curiosityFrames.length)];
    return `${frame} ${hook.toLowerCase()}`;
  }

  private amplifyEmotionalHook(hook: string): string {
    const amplifiers = ['mind-blowing', 'shocking', 'incredible', 'unbelievable', 'game-changing'];
    const amplifier = amplifiers[Math.floor(Math.random() * amplifiers.length)];
    
    return `This ${amplifier} truth: ${hook.toLowerCase()}`;
  }

  private createControversialHook(hook: string): string {
    const controversialFrames = [
      'Unpopular opinion:',
      'Hot take:',
      'Nobody wants to hear this, but',
      'The uncomfortable truth:',
      'Everyone\'s wrong about this:'
    ];
    
    const frame = controversialFrames[Math.floor(Math.random() * controversialFrames.length)];
    return `${frame} ${hook.toLowerCase()}`;
  }

  private generateElaboration(content: string): string {
    const elaborations = [
      'This changes everything because it shifts your perspective entirely.',
      'Most people miss this crucial detail that makes all the difference.',
      'The reason this works is rooted in basic human psychology.',
      'This principle has been proven time and time again by successful people.',
      'Understanding this concept will transform how you approach challenges.'
    ];
    
    return elaborations[Math.floor(Math.random() * elaborations.length)];
  }

  private createNicheAdaptation(originalContent: string, targetNiche: string): ContentVariation {
    return this.createVariation(originalContent, 'niche_adaptation', targetNiche);
  }

  private generateAdaptationExplanation(original: string, adapted: ContentVariation, niche: string): string {
    return `Adapted the original content to resonate with ${niche} audience by incorporating niche-specific terminology, addressing common ${niche} pain points, and using language that speaks directly to ${niche} enthusiasts. The adapted version maintains the core message while making it more relevant and engaging for the target audience.`;
  }

  private applyFormula(content: string, formula: ViralFormula): ContentVariation {
    // This would apply a specific viral formula to the content
    // For now, return a structure-changed variation
    return this.createVariation(content, 'structure_change');
  }

  private calculateFormulaApplicability(content: string, formula: ViralFormula): number {
    let score = 50;
    
    // Check if content already follows the formula structure
    const contentStructure = this.analyzeContentStructure(content);
    const matchingElements = formula.structure.filter(element => 
      contentStructure.includes(element)
    ).length;
    
    score += (matchingElements / formula.structure.length) * 30;
    
    // Check for formula-specific keywords
    const formulaKeywords = Object.values(formula.variables).flat();
    const contentWords = content.toLowerCase().split(/\s+/);
    const keywordMatches = formulaKeywords.filter(keyword => 
      contentWords.some(word => word.includes(keyword.toLowerCase()))
    ).length;
    
    score += (keywordMatches / formulaKeywords.length) * 20;
    
    return Math.min(100, score);
  }

  private analyzeContentStructure(content: string): string[] {
    const structure = [];
    
    if (content.includes('?')) structure.push('hook_question');
    if (/\d+/.test(content)) structure.push('numbered_list');
    if (content.includes('!')) structure.push('call_to_action');
    if (content.toLowerCase().includes('ago')) structure.push('past_state');
    if (content.toLowerCase().includes('now') || content.toLowerCase().includes('today')) structure.push('current_state');
    
    return structure;
  }
}
