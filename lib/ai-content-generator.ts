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

interface ContentTemplate {
  id: string;
  name: string;
  pattern: string;
  structure: string[];
  examples: string[];
  avgEngagement: number;
  bestFor: string[];
}

interface GeneratedContent {
  hook: string;
  caption: string;
  hashtags: string[];
  viralPrediction: number;
  engagementPrediction: number;
  contentType: string;
  inspiration: string;
  template: string;
  variations: string[];
}

interface ContentRequest {
  niche: string;
  tone: 'motivational' | 'educational' | 'entertaining' | 'controversial' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
  targetAudience: string;
  keywords?: string[];
  competitors?: string[];
}

export class AIContentGenerator {
  private viralPosts: ViralPost[] = [];
  private templates: ContentTemplate[] = [];
  
  // Pre-defined viral templates based on analysis
  private readonly VIRAL_TEMPLATES: ContentTemplate[] = [
    {
      id: 'question_hook',
      name: 'Question Hook',
      pattern: 'What if I told you [statement]?',
      structure: ['question', 'revelation', 'explanation', 'call_to_action'],
      examples: [
        'What if I told you that 90% of millionaires do this one thing every morning?',
        'What if I told you the secret to viral content is hiding in plain sight?'
      ],
      avgEngagement: 12.5,
      bestFor: ['business', 'motivation', 'education']
    },
    {
      id: 'absolute_statement',
      name: 'Absolute Statement',
      pattern: '[Never/Always] [action] if you want [outcome]',
      structure: ['absolute_statement', 'reasoning', 'examples', 'conclusion'],
      examples: [
        'Never start a business without validating your idea first',
        'Always do this before posting content if you want it to go viral'
      ],
      avgEngagement: 15.2,
      bestFor: ['business', 'motivation', 'lifestyle']
    },
    {
      id: 'numbered_list',
      name: 'Numbered Secrets',
      pattern: '[Number] [secrets/ways/mistakes] [target audience] [action]',
      structure: ['numbered_promise', 'list_items', 'explanation', 'summary'],
      examples: [
        '5 secrets millionaires use to build wealth faster',
        '3 mistakes that are killing your content engagement'
      ],
      avgEngagement: 11.8,
      bestFor: ['education', 'business', 'fitness']
    },
    {
      id: 'controversial_take',
      name: 'Controversial Take',
      pattern: 'Unpopular opinion: [controversial statement]',
      structure: ['controversial_statement', 'supporting_evidence', 'counterarguments', 'conclusion'],
      examples: [
        'Unpopular opinion: College is the biggest scam of the 21st century',
        'Unpopular opinion: Working 9-5 is more entrepreneurial than most startups'
      ],
      avgEngagement: 18.7,
      bestFor: ['business', 'lifestyle', 'education']
    },
    {
      id: 'story_hook',
      name: 'Story Hook',
      pattern: '[Time period] ago, [situation]. Today, [transformation].',
      structure: ['past_situation', 'struggle', 'turning_point', 'current_success', 'lesson'],
      examples: [
        '2 years ago, I was broke and living in my car. Today, I run a 7-figure business.',
        '6 months ago, I had 0 followers. Today, my content reaches millions.'
      ],
      avgEngagement: 14.3,
      bestFor: ['motivation', 'business', 'lifestyle']
    },
    {
      id: 'insider_secret',
      name: 'Insider Secret',
      pattern: 'The [industry] secret nobody talks about',
      structure: ['secret_revelation', 'why_hidden', 'explanation', 'application'],
      examples: [
        'The social media secret nobody talks about: consistency beats creativity',
        'The business secret nobody talks about: most successful people fail first'
      ],
      avgEngagement: 13.9,
      bestFor: ['business', 'education', 'motivation']
    },
    {
      id: 'comparison_hook',
      name: 'Comparison Hook',
      pattern: '[Successful people] vs [unsuccessful people]: [key difference]',
      structure: ['comparison_setup', 'differences', 'explanation', 'actionable_advice'],
      examples: [
        'Rich people vs poor people: how they think about money',
        'Viral creators vs struggling creators: the mindset difference'
      ],
      avgEngagement: 12.1,
      bestFor: ['business', 'motivation', 'education']
    },
    {
      id: 'challenge_hook',
      name: 'Challenge Hook',
      pattern: 'I challenge you to [action] for [timeframe]',
      structure: ['challenge_statement', 'expected_results', 'instructions', 'motivation'],
      examples: [
        'I challenge you to post every day for 30 days and watch your engagement explode',
        'I challenge you to read for 1 hour daily for a month'
      ],
      avgEngagement: 16.4,
      bestFor: ['motivation', 'fitness', 'education']
    }
  ];

  // Viral word combinations
  private readonly VIRAL_WORDS = {
    power_words: ['secret', 'hack', 'trick', 'mistake', 'truth', 'reality', 'exposed', 'revealed'],
    emotion_words: ['shocking', 'surprising', 'incredible', 'unbelievable', 'mind-blowing', 'game-changing'],
    urgency_words: ['now', 'today', 'immediately', 'instantly', 'quickly', 'fast'],
    exclusivity_words: ['nobody', 'everyone', 'most people', 'successful people', 'millionaires'],
    action_words: ['stop', 'start', 'avoid', 'master', 'achieve', 'build', 'create', 'destroy']
  };

  // Niche-specific hashtags
  private readonly NICHE_HASHTAGS = {
    business: ['#entrepreneur', '#business', '#success', '#mindset', '#money', '#wealth', '#hustle', '#motivation'],
    motivation: ['#motivation', '#mindset', '#success', '#inspiration', '#goals', '#hustle', '#grind', '#winning'],
    fitness: ['#fitness', '#workout', '#gym', '#health', '#transformation', '#fit', '#strong', '#muscle'],
    lifestyle: ['#lifestyle', '#life', '#happiness', '#positivity', '#vibes', '#daily', '#mood', '#energy'],
    education: ['#learn', '#education', '#knowledge', '#skills', '#growth', '#development', '#tips', '#tutorial']
  };

  constructor(viralPosts: ViralPost[] = []) {
    this.viralPosts = viralPosts;
    this.templates = [...this.VIRAL_TEMPLATES];
  }

  /**
   * Generate content based on request
   */
  generateContent(request: ContentRequest): GeneratedContent[] {
    console.log(`🤖 Generating AI content for ${request.niche} (${request.tone}, ${request.length})`);
    
    const templates = this.selectBestTemplates(request);
    const generatedContent: GeneratedContent[] = [];

    for (const template of templates.slice(0, 5)) { // Generate 5 pieces of content
      const content = this.createContentFromTemplate(template, request);
      generatedContent.push(content);
    }

    return generatedContent.sort((a, b) => b.viralPrediction - a.viralPrediction);
  }

  /**
   * Generate hook variations from existing viral hooks
   */
  generateHookVariations(originalHook: string, count: number = 10): string[] {
    const variations: string[] = [];
    const structure = this.analyzeHookStructure(originalHook);
    
    // Generate variations using different techniques
    for (let i = 0; i < count; i++) {
      if (i < 3) {
        // Synonym replacement
        variations.push(this.generateSynonymVariation(originalHook));
      } else if (i < 6) {
        // Structure preservation with new content
        variations.push(this.generateStructuralVariation(originalHook, structure));
      } else {
        // Template-based generation
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        variations.push(this.generateTemplateVariation(originalHook, template));
      }
    }
    
    return [...new Set(variations)]; // Remove duplicates
  }

  /**
   * Predict viral potential of content
   */
  predictViralPotential(content: string, contentType: string): {
    viralScore: number;
    engagementPrediction: number;
    factors: { factor: string; score: number; impact: string }[];
    recommendations: string[];
  } {
    const factors = this.analyzeViralFactors(content, contentType);
    const viralScore = this.calculateViralScore(factors);
    const engagementPrediction = this.predictEngagement(factors, contentType);
    const recommendations = this.generateRecommendations(factors);

    return {
      viralScore,
      engagementPrediction,
      factors,
      recommendations
    };
  }

  /**
   * Generate content calendar
   */
  generateContentCalendar(niche: string, days: number = 30): {
    date: string;
    content: GeneratedContent;
    theme: string;
    optimal_time: string;
  }[] {
    const calendar = [];
    const themes = this.getContentThemes(niche);
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const theme = themes[i % themes.length];
      const request: ContentRequest = {
        niche,
        tone: this.getOptimalTone(i % 7), // Vary tone by day of week
        length: this.getOptimalLength(i % 7),
        includeHashtags: true,
        targetAudience: 'general',
        keywords: [theme]
      };
      
      const content = this.generateContent(request)[0];
      
      calendar.push({
        date: date.toISOString().split('T')[0],
        content,
        theme,
        optimal_time: this.getOptimalPostingTime(date.getDay())
      });
    }
    
    return calendar;
  }

  /**
   * Train on new viral data
   */
  trainOnViralData(newPosts: ViralPost[]): void {
    console.log(`🧠 Training AI on ${newPosts.length} new viral posts...`);
    
    this.viralPosts.push(...newPosts);
    
    // Extract new patterns and update templates
    const newTemplates = this.extractTemplatesFromPosts(newPosts);
    this.templates.push(...newTemplates);
    
    // Keep only the best performing templates
    this.templates = this.templates
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 20);
    
    console.log(`✅ AI trained on ${this.viralPosts.length} total viral posts`);
  }

  // PRIVATE METHODS

  /**
   * Select best templates for request
   */
  private selectBestTemplates(request: ContentRequest): ContentTemplate[] {
    return this.templates
      .filter(template => template.bestFor.includes(request.niche))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 8);
  }

  /**
   * Create content from template
   */
  private createContentFromTemplate(template: ContentTemplate, request: ContentRequest): GeneratedContent {
    const hook = this.generateHookFromTemplate(template, request);
    const caption = this.generateFullCaption(hook, template, request);
    const hashtags = this.generateHashtags(request.niche, request.includeHashtags);
    const variations = this.generateHookVariations(hook, 3);
    
    const prediction = this.predictViralPotential(caption, request.niche);
    
    return {
      hook,
      caption,
      hashtags,
      viralPrediction: prediction.viralScore,
      engagementPrediction: prediction.engagementPrediction,
      contentType: request.niche,
      inspiration: `Based on ${template.name} pattern (${template.avgEngagement}% avg engagement)`,
      template: template.name,
      variations
    };
  }

  /**
   * Generate hook from template
   */
  private generateHookFromTemplate(template: ContentTemplate, request: ContentRequest): string {
    let hook = template.pattern;
    
    // Replace placeholders based on niche and keywords
    const replacements = this.getReplacements(request);
    
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      hook = hook.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), replacement);
    });
    
    // Add viral words if appropriate
    if (Math.random() > 0.5) {
      hook = this.enhanceWithViralWords(hook, request.tone);
    }
    
    return hook;
  }

  /**
   * Generate full caption
   */
  private generateFullCaption(hook: string, template: ContentTemplate, request: ContentRequest): string {
    let caption = hook + '\n\n';
    
    // Add content based on template structure
    template.structure.forEach((section, index) => {
      if (index === 0) return; // Skip hook as it's already added
      
      const content = this.generateSectionContent(section, request);
      caption += content + '\n\n';
    });
    
    // Add call to action
    caption += this.generateCallToAction(request.niche);
    
    return caption.trim();
  }

  /**
   * Generate section content
   */
  private generateSectionContent(section: string, request: ContentRequest): string {
    const templates = {
      revelation: [
        "Here's the truth nobody wants to hear:",
        "The reality is:",
        "What I've learned after years of experience:"
      ],
      explanation: [
        "Let me break this down for you:",
        "Here's exactly how it works:",
        "The science behind this is simple:"
      ],
      examples: [
        "For example:",
        "Case in point:",
        "Here's a real example:"
      ],
      call_to_action: [
        "Try this and let me know what happens!",
        "Save this for later and share with someone who needs to see it!",
        "Follow for more content like this!"
      ]
    };
    
    const sectionTemplates = templates[section as keyof typeof templates] || ["Here's what you need to know:"];
    const template = sectionTemplates[Math.floor(Math.random() * sectionTemplates.length)];
    
    return template + " " + this.generateContextualContent(section, request);
  }

  /**
   * Generate contextual content for section
   */
  private generateContextualContent(section: string, request: ContentRequest): string {
    const nichContent = {
      business: {
        explanation: "Most people focus on tactics instead of strategy. They get caught up in the daily grind and forget about the bigger picture.",
        examples: "Take Jeff Bezos - he didn't just sell books, he built an infrastructure for selling everything.",
        reasoning: "Because successful businesses solve real problems for real people."
      },
      motivation: {
        explanation: "Your mindset determines your success more than any external factor ever will.",
        examples: "Look at anyone who's overcome adversity - they all share this one trait.",
        reasoning: "Because what you believe about yourself becomes your reality."
      }
    };
    
    const content = nichContent[request.niche as keyof typeof nichContent];
    return content?.[section as keyof typeof content] || "This is the key insight you need to understand.";
  }

  /**
   * Get replacements for template placeholders
   */
  private getReplacements(request: ContentRequest): { [key: string]: string } {
    const nicheReplacements = {
      business: {
        action: 'building a business',
        outcome: 'financial freedom',
        statement: 'most entrepreneurs fail because they focus on the wrong metrics',
        target_audience: 'entrepreneurs'
      },
      motivation: {
        action: 'changing your mindset',
        outcome: 'success',
        statement: 'your thoughts create your reality',
        target_audience: 'people'
      },
      fitness: {
        action: 'working out consistently',
        outcome: 'your dream body',
        statement: 'most people train wrong',
        target_audience: 'fitness enthusiasts'
      }
    };
    
    return nicheReplacements[request.niche as keyof typeof nicheReplacements] || {
      action: 'taking action',
      outcome: 'success',
      statement: 'most people don\'t realize this',
      target_audience: 'people'
    };
  }

  /**
   * Enhance with viral words
   */
  private enhanceWithViralWords(text: string, tone: string): string {
    const wordSets: Record<string, string[]> = {
      motivational: [...this.VIRAL_WORDS.emotion_words, ...this.VIRAL_WORDS.action_words],
      educational: [...this.VIRAL_WORDS.power_words, ...this.VIRAL_WORDS.exclusivity_words],
      entertaining: [...this.VIRAL_WORDS.emotion_words, ...this.VIRAL_WORDS.urgency_words],
      controversial: [...this.VIRAL_WORDS.power_words, ...this.VIRAL_WORDS.emotion_words],
      inspirational: [...this.VIRAL_WORDS.emotion_words, ...this.VIRAL_WORDS.action_words]
    };
    
    const words = wordSets[tone] || this.VIRAL_WORDS.power_words;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Insert viral word strategically
    if (text.includes('secret')) {
      return text.replace('secret', `${randomWord} secret`);
    } else if (text.includes('truth')) {
      return text.replace('truth', `${randomWord} truth`);
    } else {
      return `${randomWord} ` + text;
    }
  }

  /**
   * Generate hashtags
   */
  private generateHashtags(niche: string, include: boolean): string[] {
    if (!include) return [];
    
    const baseHashtags = this.NICHE_HASHTAGS[niche as keyof typeof this.NICHE_HASHTAGS] || [];
    const generalHashtags = ['#viral', '#content', '#socialmedia', '#growth'];
    
    return [...baseHashtags.slice(0, 6), ...generalHashtags.slice(0, 2)];
  }

  /**
   * Generate call to action
   */
  private generateCallToAction(niche: string): string {
    const ctas = {
      business: "💼 Follow for daily business insights!\n🔄 Repost if this helped you!\n💬 What's your biggest business challenge?",
      motivation: "💪 Follow for daily motivation!\n🔄 Share this with someone who needs it!\n💬 What keeps you motivated?",
      fitness: "🏋️ Follow for fitness tips!\n🔄 Tag a workout buddy!\n💬 What's your fitness goal?",
      lifestyle: "✨ Follow for lifestyle content!\n🔄 Save this for later!\n💬 How do you stay positive?",
      education: "🧠 Follow to learn something new daily!\n🔄 Share this knowledge!\n💬 What do you want to learn next?"
    };
    
    return ctas[niche as keyof typeof ctas] || "Follow for more content like this!";
  }

  /**
   * Analyze viral factors
   */
  private analyzeViralFactors(content: string, contentType: string): { factor: string; score: number; impact: string }[] {
    const factors = [];
    
    // Hook strength
    const hookStrength = this.analyzeHookStrength(content);
    factors.push({ factor: 'Hook Strength', score: hookStrength, impact: hookStrength > 70 ? 'High' : hookStrength > 40 ? 'Medium' : 'Low' });
    
    // Emotional impact
    const emotionalImpact = this.analyzeEmotionalImpact(content);
    factors.push({ factor: 'Emotional Impact', score: emotionalImpact, impact: emotionalImpact > 70 ? 'High' : emotionalImpact > 40 ? 'Medium' : 'Low' });
    
    // Clarity
    const clarity = this.analyzeClarity(content);
    factors.push({ factor: 'Clarity', score: clarity, impact: clarity > 70 ? 'High' : clarity > 40 ? 'Medium' : 'Low' });
    
    // Call to action strength
    const ctaStrength = this.analyzeCTAStrength(content);
    factors.push({ factor: 'Call to Action', score: ctaStrength, impact: ctaStrength > 70 ? 'High' : ctaStrength > 40 ? 'Medium' : 'Low' });
    
    return factors;
  }

  /**
   * Analyze hook strength
   */
  private analyzeHookStrength(content: string): number {
    const firstLine = content.split('\n')[0];
    let score = 50; // Base score
    
    // Check for viral words
    Object.values(this.VIRAL_WORDS).flat().forEach(word => {
      if (firstLine.toLowerCase().includes(word.toLowerCase())) score += 10;
    });
    
    // Check for questions
    if (firstLine.includes('?')) score += 15;
    
    // Check for numbers
    if (/\d+/.test(firstLine)) score += 10;
    
    // Check for emotional triggers
    const emotionalWords = ['shocking', 'amazing', 'incredible', 'unbelievable'];
    emotionalWords.forEach(word => {
      if (firstLine.toLowerCase().includes(word)) score += 8;
    });
    
    return Math.min(score, 100);
  }

  /**
   * Analyze emotional impact
   */
  private analyzeEmotionalImpact(content: string): number {
    let score = 30; // Base score
    
    const emotionalWords = [
      'amazing', 'incredible', 'shocking', 'unbelievable', 'mind-blowing',
      'life-changing', 'game-changing', 'powerful', 'inspiring', 'motivating'
    ];
    
    emotionalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 8;
    });
    
    // Check for personal stories
    if (content.includes('I') || content.includes('my') || content.includes('me')) score += 15;
    
    // Check for exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    score += Math.min(exclamationCount * 3, 15);
    
    return Math.min(score, 100);
  }

  /**
   * Analyze clarity
   */
  private analyzeClarity(content: string): number {
    let score = 50; // Base score
    
    const words = content.split(' ').length;
    
    // Optimal length bonus
    if (words >= 50 && words <= 150) score += 20;
    else if (words < 30 || words > 200) score -= 15;
    
    // Paragraph structure
    const paragraphs = content.split('\n\n').length;
    if (paragraphs >= 2 && paragraphs <= 4) score += 15;
    
    // Readability (simple metric)
    const avgWordsPerSentence = words / Math.max(content.split('.').length - 1, 1);
    if (avgWordsPerSentence <= 15) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze CTA strength
   */
  private analyzeCTAStrength(content: string): number {
    let score = 20; // Base score
    
    const ctaWords = ['follow', 'share', 'save', 'comment', 'tag', 'repost', 'like'];
    ctaWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 12;
    });
    
    // Check for engagement questions
    if (content.includes('?') && content.toLowerCase().includes('what')) score += 15;
    
    // Check for emojis (simple detection)
    if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content)) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Calculate overall viral score
   */
  private calculateViralScore(factors: { factor: string; score: number; impact: string }[]): number {
    const weights = {
      'Hook Strength': 0.3,
      'Emotional Impact': 0.25,
      'Clarity': 0.2,
      'Call to Action': 0.25
    };
    
    const weightedScore = factors.reduce((total, factor) => {
      const weight = weights[factor.factor as keyof typeof weights] || 0.25;
      return total + (factor.score * weight);
    }, 0);
    
    return Math.round(weightedScore);
  }

  /**
   * Predict engagement rate
   */
  private predictEngagement(factors: { factor: string; score: number; impact: string }[], contentType: string): number {
    const baseEngagement = {
      business: 8.5,
      motivation: 11.2,
      fitness: 9.8,
      lifestyle: 7.3,
      education: 6.9
    };
    
    const base = baseEngagement[contentType as keyof typeof baseEngagement] || 8.0;
    const avgFactorScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;
    
    // Scale based on factor scores
    const multiplier = avgFactorScore / 50; // 50 is average score
    
    return Math.round((base * multiplier) * 100) / 100;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(factors: { factor: string; score: number; impact: string }[]): string[] {
    const recommendations = [];
    
    factors.forEach(factor => {
      if (factor.score < 40) {
        switch (factor.factor) {
          case 'Hook Strength':
            recommendations.push('💡 Strengthen your hook with a question or surprising statement');
            break;
          case 'Emotional Impact':
            recommendations.push('🎯 Add more emotional language and personal stories');
            break;
          case 'Clarity':
            recommendations.push('📝 Simplify your message and break into shorter paragraphs');
            break;
          case 'Call to Action':
            recommendations.push('📢 Add clear engagement requests (comment, share, follow)');
            break;
        }
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('🔥 Great content! Consider adding trending hashtags for more reach');
    }
    
    return recommendations;
  }

  /**
   * Additional helper methods for content calendar
   */
  private getContentThemes(niche: string): string[] {
    const themes = {
      business: ['entrepreneurship', 'money mindset', 'productivity', 'leadership', 'success stories', 'business tips', 'investing'],
      motivation: ['mindset', 'goals', 'perseverance', 'success', 'inspiration', 'achievement', 'growth'],
      fitness: ['workouts', 'nutrition', 'transformation', 'discipline', 'health', 'strength', 'mindset'],
      lifestyle: ['daily habits', 'wellness', 'relationships', 'happiness', 'balance', 'self-care', 'positivity'],
      education: ['learning', 'skills', 'knowledge', 'development', 'innovation', 'research', 'discovery']
    };
    
    return themes[niche as keyof typeof themes] || ['general tips', 'insights', 'advice'];
  }

  private getOptimalTone(dayOfWeek: number): 'motivational' | 'educational' | 'entertaining' | 'controversial' | 'inspirational' {
    const tones: ('motivational' | 'educational' | 'entertaining' | 'controversial' | 'inspirational')[] = [
      'motivational', // Sunday
      'educational', // Monday
      'inspirational', // Tuesday
      'entertaining', // Wednesday
      'educational', // Thursday
      'controversial', // Friday
      'entertaining'  // Saturday
    ];
    
    return tones[dayOfWeek];
  }

  private getOptimalLength(dayOfWeek: number): 'short' | 'medium' | 'long' {
    // Shorter content on weekends, longer on weekdays
    return dayOfWeek === 0 || dayOfWeek === 6 ? 'short' : 'medium';
  }

  private getOptimalPostingTime(dayOfWeek: number): string {
    const times = [
      '10:00', // Sunday
      '09:00', // Monday
      '11:00', // Tuesday
      '14:00', // Wednesday
      '10:00', // Thursday
      '15:00', // Friday
      '12:00'  // Saturday
    ];
    
    return times[dayOfWeek];
  }

  private analyzeHookStructure(hook: string): string {
    if (hook.includes('?')) return 'question';
    if (hook.toLowerCase().startsWith('what') || hook.toLowerCase().startsWith('how') || hook.toLowerCase().startsWith('why')) return 'interrogative';
    if (/\d+/.test(hook)) return 'numerical';
    if (hook.toLowerCase().includes('secret') || hook.toLowerCase().includes('trick')) return 'insider';
    return 'statement';
  }

  private generateSynonymVariation(hook: string): string {
    const synonyms = {
      'secret': 'trick',
      'amazing': 'incredible',
      'never': 'rarely',
      'always': 'consistently',
      'people': 'individuals',
      'money': 'wealth',
      'success': 'achievement'
    };
    
    let variation = hook;
    Object.entries(synonyms).forEach(([original, synonym]) => {
      if (variation.toLowerCase().includes(original)) {
        variation = variation.replace(new RegExp(original, 'gi'), synonym);
      }
    });
    
    return variation;
  }

  private generateStructuralVariation(hook: string, structure: string): string {
    // This is a simplified version - in a real implementation, you'd have more sophisticated NLP
    const variations = {
      question: [
        'Have you ever wondered',
        'What if I told you',
        'Did you know that'
      ],
      statement: [
        'The truth is',
        'Here\'s what most people don\'t realize',
        'The reality is that'
      ]
    };
    
    const variationStarters = variations[structure as keyof typeof variations] || ['Here\'s something interesting:'];
    const starter = variationStarters[Math.floor(Math.random() * variationStarters.length)];
    
    return starter + ' ' + hook.toLowerCase();
  }

  private generateTemplateVariation(hook: string, template: ContentTemplate): string {
    // Apply the template pattern to create a variation
    const patterns = template.examples;
    if (patterns.length === 0) return hook;
    
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Extract key elements from original hook and apply to pattern structure
    const keyWords = hook.split(' ').filter(word => word.length > 3);
    const randomKeyWord = keyWords[Math.floor(Math.random() * keyWords.length)] || 'success';
    
    return randomPattern.replace(/\b\w{4,}\b/, randomKeyWord);
  }

  private extractTemplatesFromPosts(posts: ViralPost[]): ContentTemplate[] {
    // This is a simplified version - in reality, you'd use NLP to extract patterns
    const templates: ContentTemplate[] = [];
    
    // Group posts by engagement level
    const highEngagementPosts = posts.filter(p => p.engagementRate > 15);
    
    if (highEngagementPosts.length > 0) {
      const avgEngagement = highEngagementPosts.reduce((sum, p) => sum + p.engagementRate, 0) / highEngagementPosts.length;
      
      templates.push({
        id: `custom_${Date.now()}`,
        name: 'High Engagement Pattern',
        pattern: 'Custom pattern from viral content',
        structure: ['hook', 'explanation', 'call_to_action'],
        examples: highEngagementPosts.slice(0, 3).map(p => p.hook),
        avgEngagement,
        bestFor: [...new Set(highEngagementPosts.map(p => p.contentType))]
      });
    }
    
    return templates;
  }
}
