'use client';

import React, { useState } from 'react';

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
}

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [videoCount, setVideoCount] = useState(10);
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastScrapedUser, setLastScrapedUser] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  // Viral Analysis States
  const [showViralTools, setShowViralTools] = useState(false);
  const [viralAnalysisTab, setViralAnalysisTab] = useState<'mass_analyze' | 'generate' | 'predict' | 'variations' | 'insights'>('mass_analyze');
  const [massAnalysisLoading, setMassAnalysisLoading] = useState(false);
  const [massAnalysisResults, setMassAnalysisResults] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [contentInput, setContentInput] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('business');
  const [contentQuantity, setContentQuantity] = useState(5);
  const [viralPrediction, setViralPrediction] = useState<any>(null);
  const [contentVariations, setContentVariations] = useState<any[]>([]);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<{[key: string]: {
    content: string;
    timeline?: {
      "0-3s": string;
      "3-6s": string;
      "6-10s": string;
      "10-13s": string;
      "13-17s": string;
      "17-21s": string;
      "21-25s": string;
      "25-28s": string;
      "28-30s": string;
    } | null;
    viralScore: number;
    improvements: string[];
  }}>({});

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Analysis States
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [contentOptimization, setContentOptimization] = useState<any>(null);
  const [hashtagStrategy, setHashtagStrategy] = useState<any>(null);

  // Contents Tab States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contents' | 'profile' | 'calendar' | 'templates' | 'billing'>('contents');
  const [savedContent, setSavedContent] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentFilters, setContentFilters] = useState({
    niche: '',
    creator: '',
    searchQuery: '',
    minViralScore: 0,
    sortBy: 'viralScore',
    sortOrder: 'desc'
  });
  const [contentStats, setContentStats] = useState<any>(null);

  // Profile Tab States
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSection, setProfileSection] = useState<'personal' | 'content' | 'brand' | 'audience' | 'preferences' | 'analytics'>('personal');

  // Calendar Tab States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Templates Tab States
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hooks' | 'stories' | 'educational' | 'controversial' | 'motivation'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customizedContent, setCustomizedContent] = useState<string>('');

  // Dashboard Sub-navigation States
  const [dashboardSubPage, setDashboardSubPage] = useState<'scrape' | 'generate' | 'predict' | 'templates'>('scrape');
  const [showDashboardSubNav, setShowDashboardSubNav] = useState(false);

  // Mock data for demonstration
  const mockVideos: VideoData[] = [
    {
      id: '1',
      caption: 'POV: You discover the secret to viral content 🚀 #fyp #viral #contentcreator',
      postUrl: 'https://tiktok.com/@hormozis/video/1234567890',
      hook: 'POV: You discover the secret to viral content',
      transcript: 'Hey guys, today I want to share with you the secret formula that helped me go from 0 to 1 million followers in just 6 months. The key is understanding your audience and creating content that resonates with them...',
      views: 2500000,
      likes: 180000,
      uploadDate: '2024-12-10',
      thumbnail: '/placeholder-thumbnail.jpg'
    },
    {
      id: '2',
      caption: 'This simple trick changed my life completely 💡 #lifehack #productivity',
      postUrl: 'https://tiktok.com/@hormozis/video/1234567891',
      hook: 'This simple trick changed my life completely',
      transcript: 'I used to struggle with productivity until I discovered this one simple trick. It\'s so easy that you\'ll wonder why you didn\'t think of it before. Let me show you exactly what I do...',
      views: 1800000,
      likes: 125000,
      uploadDate: '2024-12-08',
      thumbnail: '/placeholder-thumbnail.jpg'
    },
    {
      id: '3',
      caption: 'Why everyone is wrong about success 🎯 #mindset #success #motivation',
      postUrl: 'https://tiktok.com/@hormozis/video/1234567892',
      hook: 'Why everyone is wrong about success',
      transcript: 'Most people think success is about working harder, but that\'s completely wrong. After studying hundreds of successful people, I found the real secret. It\'s not about the hours you put in, it\'s about...',
      views: 3200000,
      likes: 245000,
      uploadDate: '2024-12-05',
      thumbnail: '/placeholder-thumbnail.jpg'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          count: videoCount,
          platform: selectedPlatform,
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch videos';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setVideos(result.data.videos);
        setLastScrapedUser(result.data.metadata.username);
        setDataSource(result.data.metadata.dataSource || 'unknown');
        setShowResults(true);
        setProgress(100);
        
        // Automatically run AI analysis after scraping
        setTimeout(() => {
          runAIAnalysisAfterScraping(result.data.videos, result.data.metadata.username);
        }, 500);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch videos');
      // No fallback to demo data - show error instead
      setVideos([]);
      setShowResults(false);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Viral Analysis Functions
  const runMassAnalysis = async () => {
    setMassAnalysisLoading(true);
    try {
      const response = await fetch('/api/viral-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mass_analyze',
          payload: {
            niches: ['business', 'motivation'],
            limit: 25,
            saveToDatabase: true
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setMassAnalysisResults(result.data);
      }
    } catch (error) {
      console.error('Mass analysis failed:', error);
    }
    setMassAnalysisLoading(false);
  };

  const generateAIContent = async () => {
    setGeneratingContent(true);
    try {
      // Use profile data if available, otherwise use defaults
      const profileData = userProfile || {};
      const payload = {
        niche: selectedNiche,
        targetAudience: profileData?.content?.targetAudience || profileData?.audience || 'social media users',
        contentStyle: profileData?.content?.contentStyle || 'viral and engaging',
        count: contentQuantity,
        // Include comprehensive profile context for AI
        profileContext: {
          personal: profileData?.personal,
          brand: profileData?.brand,
          audience: profileData?.audience,
          preferences: profileData?.preferences,
          analytics: profileData?.analytics,
          contentGoals: profileData?.content?.contentGoals,
          brandVoice: profileData?.brand?.brandVoice,
          uniqueSellingPoint: profileData?.brand?.uniqueSellingPoint,
          audienceInterests: profileData?.audience?.audienceInterests,
          audiencePainPoints: profileData?.audience?.audiencePainPoints,
          bestPerformingTopics: profileData?.analytics?.bestPerformingTopics
        }
      };

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_suggestions',
          payload
        })
      });

      const result = await response.json();
      console.log('AI Content Generation Response:', result);
      if (result.success) {
        const suggestions = result.data.suggestions || [];
        console.log(`Setting ${suggestions.length} suggestions for quantity ${contentQuantity}`);
        setGeneratedContent(suggestions);
        // Clear previous scripts when generating new content
        setGeneratedScripts({});
      } else {
        console.log('API returned success: false, using fallback');
        const fallbackContent = generateFallbackContent(selectedNiche, contentQuantity);
        setGeneratedContent(fallbackContent);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      // Enhanced fallback content based on niche and quantity
      const fallbackContent = generateFallbackContent(selectedNiche, contentQuantity);
      setGeneratedContent(fallbackContent);
      // Clear previous scripts when generating new content
      setGeneratedScripts({});
    } finally {
      setGeneratingContent(false);
    }
  };

  // Generate fallback content when AI is unavailable
  const generateFallbackContent = (niche: string, quantity: number) => {
    const templates = {
      business: [
        {
          hook: "The $1M mistake I made so you don't have to",
          fullContent: "Last year, I lost $1M because I ignored this one principle. Here's what every entrepreneur needs to know about building sustainable businesses...",
          hashtags: ['#entrepreneur', '#business', '#mistake', '#success', '#money'],
          expectedEngagement: 89,
          reasoning: 'Personal failure stories with lessons perform exceptionally well'
        },
        {
          hook: "What if I told you most entrepreneurs fail because they focus on the wrong metrics?",
          fullContent: "95% of startups fail because they're tracking vanity metrics instead of what actually matters. Here are the 3 metrics that predict success...",
          hashtags: ['#startup', '#entrepreneur', '#metrics', '#business', '#success'],
          expectedEngagement: 93,
          reasoning: 'Question hooks combined with statistics create curiosity'
        },
        {
          hook: "Unpopular opinion: Working 80 hours a week is destroying your business",
          fullContent: "Everyone glorifies the hustle, but here's why working smarter beats working harder every single time...",
          hashtags: ['#entrepreneur', '#productivity', '#worklife', '#hustle', '#business'],
          expectedEngagement: 96,
          reasoning: 'Controversial takes against common beliefs drive engagement'
        }
      ],
      motivation: [
        {
          hook: "Your 2024 transformation starts with this mindset shift",
          fullContent: "Stop waiting for motivation. Start building discipline. Here's the exact framework that helped me change my life in 90 days...",
          hashtags: ['#motivation', '#mindset', '#transformation', '#discipline', '#goals'],
          expectedEngagement: 88,
          reasoning: 'New year transformation content with clear timeframes works well'
        },
        {
          hook: "The habit that changed my life in 21 days",
          fullContent: "I was stuck in the same routine for years until I discovered this simple daily practice. Here's exactly what I did...",
          hashtags: ['#habits', '#motivation', '#selfimprovement', '#success', '#mindset'],
          expectedEngagement: 91,
          reasoning: 'Specific timeframes and personal transformation stories are engaging'
        }
      ],
      fitness: [
        {
          hook: "Why your workout isn't working (and how to fix it)",
          fullContent: "Spent months in the gym with no results? You're probably making these 3 critical mistakes. Here's what actually works...",
          hashtags: ['#fitness', '#workout', '#gym', '#results', '#transformation'],
          expectedEngagement: 87,
          reasoning: 'Problem-solution content with clear fixes performs well'
        }
      ]
    };

    const nicheTemplates = templates[niche as keyof typeof templates] || templates.business;
    const result = [];
    
    for (let i = 0; i < quantity; i++) {
      const template = nicheTemplates[i % nicheTemplates.length];
      result.push({
        ...template,
        hook: template.hook + (i >= nicheTemplates.length ? ` (Variation ${Math.floor(i / nicheTemplates.length) + 1})` : '')
      });
    }
    
    return result;
  };

  // Helper function for safe clipboard copying
  const copyToClipboardSafe = async (text: string): Promise<boolean> => {
    try {
      // Try modern clipboard API first (only in secure contexts)
      if (navigator.clipboard && window.isSecureContext) {
        try {
        await navigator.clipboard.writeText(text);
        return true;
        } catch (clipboardError) {
          console.warn('Modern clipboard API failed, trying fallback:', clipboardError);
          // Fall through to fallback method
        }
      }
      
      // Fallback to older method (works in more contexts)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (execError) {
        document.body.removeChild(textArea);
        console.warn('Legacy copy command failed:', execError);
        return false;
      }
    } catch (err) {
      console.error('All clipboard methods failed:', err);
      return false;
    }
  };

  // Helper function to show script in modal/alert
  const showScript = (script: string, title: string) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); display: flex; align-items: center; 
      justify-content: center; z-index: 10000; padding: 20px;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white; border-radius: 12px; padding: 24px; 
        max-width: 600px; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">
          ✨ ${title}
        </h3>
        <textarea readonly style="
          width: 100%; height: 300px; padding: 12px; border: 1px solid #ddd; 
          border-radius: 6px; font-family: inherit; font-size: 14px; 
          line-height: 1.5; resize: vertical;
        ">${script}</textarea>
        <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">
            Close
          </button>
          <button onclick="navigator.clipboard.writeText('${script.replace(/'/g, "\\'")}').then(() => alert('Copied!')).catch(() => alert('Copy failed'))" 
                  style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            📋 Copy Again
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  const generateViralScript = async (contentIdea: any) => {
    const contentId = `${contentIdea.hook.substring(0, 20)}...`;
    setGeneratingScript(contentId);
    
    try {
      // Include profile context for personalized script generation
      const profileData = userProfile || {};
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_content',
          payload: {
            content: `Content Idea:
Hook: "${contentIdea.hook}"
Description: "${contentIdea.fullContent}"
Hashtags: ${Array.isArray(contentIdea.hashtags) ? contentIdea.hashtags.join(' ') : '#content #viral'}
Expected Engagement: ${contentIdea.expectedEngagement}%
Reasoning: ${contentIdea.reasoning || 'High viral potential'}

Creator Profile Context:
Brand Voice: ${profileData?.brand?.brandVoice || 'Not specified'}
Unique Selling Point: ${profileData?.brand?.uniqueSellingPoint || 'Not specified'}
Target Audience: ${profileData?.content?.targetAudience || 'General audience'}
Content Style: ${profileData?.content?.contentStyle || 'Not specified'}
Preferred Tone: ${profileData?.preferences?.tonePreference || 'Not specified'}`,
            niche: selectedNiche,
            targetMetrics: {
              engagement: contentIdea.expectedEngagement,
              viralPotential: 'high'
            },
            profileContext: {
              brandVoice: profileData?.brand?.brandVoice,
              brandStory: profileData?.brand?.brandStory,
              uniqueSellingPoint: profileData?.brand?.uniqueSellingPoint,
              targetAudience: profileData?.content?.targetAudience,
              contentStyle: profileData?.content?.contentStyle,
              tonePreference: profileData?.preferences?.tonePreference,
              callToActionStyle: profileData?.preferences?.callToActionStyle,
              audienceInterests: profileData?.audience?.audienceInterests,
              audiencePainPoints: profileData?.audience?.audiencePainPoints
            }
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        const scriptData = result.data.optimized;
        // Store the script with timeline data in state to display in the card
        setGeneratedScripts(prev => ({
          ...prev,
          [contentId]: {
            content: scriptData.content || scriptData.optimizedContent || 'Script generated successfully',
            timeline: scriptData.videoTimeline || scriptData.timeline || null,
            viralScore: scriptData.viralScore || 75,
            improvements: scriptData.improvements || ['Content optimized for viral potential']
          }
        }));
        // Script is now displayed inline in the content card
        // No need for popup or automatic clipboard copy
      }
    } catch (error) {
      console.error('Script generation failed:', error);
      // Fallback - use the original content
      const fallbackScript = contentIdea.fullContent;
      setGeneratedScripts(prev => ({
        ...prev,
        [contentId]: {
          content: fallbackScript,
          timeline: {
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
          viralScore: 92,
          improvements: ['Fallback timeline structure applied']
        }
      }));
      await copyToClipboardSafe(fallbackScript);
    } finally {
      setGeneratingScript(null);
    }
  };

  const predictViral = async () => {
    if (!contentInput.trim()) return;

    try {
      const response = await fetch('/api/viral-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict_viral',
          payload: {
            content: contentInput,
            contentType: selectedNiche,
            findOptimalTime: true
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setViralPrediction(result.data);
      }
    } catch (error) {
      console.error('Viral prediction failed:', error);
    }
  };

  const createVariations = async () => {
    if (!contentInput.trim()) return;

    try {
      const response = await fetch('/api/viral-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_variations',
          payload: {
            originalContent: contentInput,
            targetNiche: selectedNiche,
            count: 8,
            generateABTests: true,
            useViralFormulas: true
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setContentVariations(result.data.variations);
      }
    } catch (error) {
      console.error('Variation creation failed:', error);
    }
  };

  // AI Analysis Functions
  const runAIAnalysisAfterScraping = async (scrapedVideos: VideoData[], username: string) => {
    setAiAnalysisLoading(true);
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_content',
          payload: {
            videos: scrapedVideos,
            username: username,
            niche: selectedNiche
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setAiAnalysisResults(result.data);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
    setAiAnalysisLoading(false);
  };

  const runAIAnalysis = async () => {
    if (videos.length === 0) {
      setError('Please scrape some videos first to run AI analysis');
      return;
    }

    await runAIAnalysisAfterScraping(videos, lastScrapedUser);
  };

  const generateAISuggestions = async () => {
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_suggestions',
          payload: {
            niche: selectedNiche,
            targetAudience: 'content creators and entrepreneurs',
            contentStyle: 'educational and entertaining',
            competitorData: videos.slice(0, 5),
            count: 5
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setAiSuggestions(result.data.suggestions);
      }
    } catch (error) {
      console.error('AI suggestions failed:', error);
    }
  };

  const optimizeWithAI = async () => {
    if (!contentInput.trim()) return;

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_content',
          payload: {
            content: contentInput,
            niche: selectedNiche,
            targetMetrics: { engagement: 15, viral: true }
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setContentOptimization(result.data);
      }
    } catch (error) {
      console.error('AI optimization failed:', error);
    }
  };

  const generateHashtagStrategy = async () => {
    if (!contentInput.trim()) return;

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hashtag_strategy',
          payload: {
            content: contentInput,
            niche: selectedNiche,
            targetAudience: 'content creators'
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setHashtagStrategy(result.data);
      }
    } catch (error) {
      console.error('Hashtag strategy failed:', error);
    }
  };

  // Contents Tab Functions
  const fetchSavedContent = async () => {
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: contentFilters.searchQuery ? 'search' : 'get_all',
          filters: {
            searchQuery: contentFilters.searchQuery || undefined,
            niche: contentFilters.niche || undefined,
            creator: contentFilters.creator || undefined,
            minViralScore: contentFilters.minViralScore || undefined,
            sortBy: contentFilters.sortBy,
            sortOrder: contentFilters.sortOrder,
            limit: 100
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data.posts);
        setContentStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch saved content:', error);
    }
    setContentLoading(false);
  };

  const filterContentByNiche = async (niche: string) => {
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_by_niche',
          filters: {
            niche,
            sortBy: contentFilters.sortBy,
            sortOrder: contentFilters.sortOrder,
            limit: 100
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data.posts);
        setContentFilters(prev => ({ ...prev, niche }));
      }
    } catch (error) {
      console.error('Failed to filter content by niche:', error);
    }
    setContentLoading(false);
  };

  const filterContentByCreator = async (creator: string) => {
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_by_creator',
          filters: {
            creator,
            sortBy: contentFilters.sortBy,
            sortOrder: contentFilters.sortOrder,
            limit: 100
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data.posts);
        setContentFilters(prev => ({ ...prev, creator }));
      }
    } catch (error) {
      console.error('Failed to filter content by creator:', error);
    }
    setContentLoading(false);
  };

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      fetchSavedContent();
      return;
    }

    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          filters: {
            searchQuery: query,
            sortBy: contentFilters.sortBy,
            sortOrder: contentFilters.sortOrder,
            limit: 100
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data.posts);
        setContentFilters(prev => ({ ...prev, searchQuery: query }));
      }
    } catch (error) {
      console.error('Failed to search content:', error);
    }
    setContentLoading(false);
  };

  // Load saved content when Contents tab is first opened
  React.useEffect(() => {
    if (activeTab === 'contents' && savedContent.length === 0) {
      fetchSavedContent();
    }
  }, [activeTab]);

  // Profile Tab Functions
  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get' })
      });

      const result = await response.json();
      if (result.success) {
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
    setProfileLoading(false);
  };

  const saveUserProfile = async (profileData: any) => {
    setProfileSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: userProfile?.createdAt ? 'update' : 'save',
          profileData
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserProfile(result.data);
        // Show success message
        console.log('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
    setProfileSaving(false);
  };

  const updateProfileSection = (section: string, data: any) => {
    const updatedProfile = {
      ...userProfile,
      [section]: {
        ...userProfile?.[section],
        ...data
      }
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  // Load profile when Profile tab is first opened
  React.useEffect(() => {
    if (activeTab === 'profile' && !userProfile) {
      fetchUserProfile();
    }
  }, [activeTab]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Hook', 'Caption', 'URL', 'Views', 'Likes', 'Upload Date', 'Transcript'],
      ...videos.map(video => [
        video.hook,
        video.caption,
        video.postUrl,
        video.views.toString(),
        video.likes.toString(),
        video.uploadDate,
        video.transcript
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(videos, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Navigation */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-md border-r border-white/10 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              wscrape
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Social Media Analytics
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('contents');
                setShowDashboardSubNav(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'contents' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>Contents</span>
            </button>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setShowDashboardSubNav(!showDashboardSubNav);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
                  <span>Tools</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'dashboard' && showDashboardSubNav ? 'rotate-180' : ''
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dashboard Sub-navigation - Show when toggled */}
              {activeTab === 'dashboard' && showDashboardSubNav && (
                <div className="ml-8 space-y-1">
                  <button
                    onClick={() => setDashboardSubPage('scrape')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'scrape'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Scrape Content</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubPage('generate')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'generate'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Generate Content</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubPage('predict')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'predict'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Predict Viral</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubPage('templates')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'templates'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Templates</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setActiveTab('profile');
                setShowDashboardSubNav(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'profile' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('calendar');
                setShowDashboardSubNav(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'calendar' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Calendar</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('templates');
                setShowDashboardSubNav(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'templates' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'billing' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Billing</span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center space-x-3 hover:bg-white/5 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">User</div>
              <div className="text-xs text-gray-400">Premium Plan</div>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">
              {activeTab === 'contents' ? 'Saved Contents' : 
               activeTab === 'profile' ? 'Your Profile' : 
               activeTab === 'calendar' ? 'Content Calendar' :
               activeTab === 'templates' ? 'Viral Templates' :
               activeTab === 'billing' ? 'Billing & Subscription' :
               'Content Analysis Tools'}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {activeTab === 'contents' 
                ? 'Browse and manage all your saved viral content' 
                : activeTab === 'profile'
                ? 'Tell AI about yourself for personalized content generation'
                : activeTab === 'calendar'
                ? 'Plan, schedule, and optimize your content posting strategy'
                : activeTab === 'templates'
                ? 'Use proven viral templates to create engaging content instantly'
                : activeTab === 'billing'
                ? 'Manage your subscription, billing, and payment methods'
                : 'Powerful AI tools for content analysis and creation'}
            </p>
          </div>

          {/* Contents Tab */}
          {activeTab === 'contents' && (
            <div className="space-y-8">
              {/* Content Filters and Search */}
              <div className="border border-white/10 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Search content by hook, caption, or transcript..."
                      value={contentFilters.searchQuery}
                      onChange={(e) => {
                        setContentFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                        if (e.target.value.length > 2 || e.target.value.length === 0) {
                          searchContent(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Niche Filter */}
                  <div>
                    <select
                      value={contentFilters.niche}
                      onChange={(e) => {
                        if (e.target.value) {
                          filterContentByNiche(e.target.value);
                    } else {
                          setContentFilters(prev => ({ ...prev, niche: '' }));
                          fetchSavedContent();
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="">All Niches</option>
                      <option value="business">Business</option>
                      <option value="motivation">Motivation</option>
                      <option value="fitness">Fitness</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="education">Education</option>
                      <option value="general">General</option>
                    </select>
          </div>

                  {/* Sort */}
                <div>
                    <select
                      value={`${contentFilters.sortBy}-${contentFilters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setContentFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        // Refresh content with new sorting
                        setTimeout(() => fetchSavedContent(), 100);
                      }}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="viralScore-desc">Viral Score (High)</option>
                      <option value="viralScore-asc">Viral Score (Low)</option>
                      <option value="engagementRate-desc">Engagement (High)</option>
                      <option value="engagementRate-asc">Engagement (Low)</option>
                      <option value="views-desc">Views (High)</option>
                      <option value="views-asc">Views (Low)</option>
                      <option value="uploadDate-desc">Date (Recent)</option>
                      <option value="uploadDate-asc">Date (Oldest)</option>
                    </select>
                      </div>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                      <button
                    onClick={() => {
                      setContentFilters(prev => ({ ...prev, niche: '', creator: '', searchQuery: '' }));
                      fetchSavedContent();
                    }}
                    className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => filterContentByNiche('business')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      contentFilters.niche === 'business' 
                      ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                    Business
                </button>
                  <button
                    onClick={() => filterContentByNiche('motivation')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      contentFilters.niche === 'motivation' 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Motivation
                  </button>
                  <button
                    onClick={() => filterContentByNiche('fitness')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      contentFilters.niche === 'fitness' 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Fitness
                      </button>
            </div>
                    </div>
                    
              {/* Content Stats */}
              {contentStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{savedContent.length}</div>
                    <div className="text-sm text-gray-400">Total Contents</div>
                          </div>
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contentStats.avgViralScore?.toFixed(0) || 0}</div>
                    <div className="text-sm text-gray-400">Avg Viral Score</div>
                </div>
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contentStats.avgEngagement?.toFixed(1) || 0}%</div>
                            <div className="text-sm text-gray-400">Avg Engagement</div>
                </div>
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contentStats.database?.totalCreators || 0}</div>
                    <div className="text-sm text-gray-400">Creators</div>
              </div>
            </div>
              )}

              {/* Content Grid */}
              {contentLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading saved content...</p>
                </div>
              ) : savedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedContent.map((content) => (
                    <div key={content.id} className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
                      {/* Content Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-white">@{content.username}</span>
                            <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                              {content.contentType}
                            </span>
                          </div>
                          <h3 className="text-white font-medium text-sm leading-tight mb-2">
                            {content.hook}
                          </h3>
                        </div>
                        <div className="text-center ml-4">
                          <div className="text-lg font-bold text-white">{content.viralScore}</div>
                          <div className="text-xs text-gray-400">Viral Score</div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {content.caption}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                          <div className="text-sm font-medium text-white">{formatNumber(content.views)}</div>
                          <div className="text-xs text-gray-400">Views</div>
                      </div>
                        <div>
                          <div className="text-sm font-medium text-white">{formatNumber(content.likes)}</div>
                          <div className="text-xs text-gray-400">Likes</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{content.engagementRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-400">Engagement</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                      <button
                          onClick={() => copyToClipboard(content.hook, 'Hook')}
                          className="flex-1 text-xs bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                      >
                          Copy Hook
                      </button>
                        <button
                          onClick={() => copyToClipboard(content.caption, 'Caption')}
                          className="flex-1 text-xs bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                        >
                          Copy Caption
                        </button>
                        <a
                          href={content.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          View
                        </a>
                    </div>
                    
                      {/* Upload Date */}
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-gray-400">
                          {formatDate(content.uploadDate)}
                        </span>
                          </div>
                </div>
                          ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Content Found</h3>
                  <p className="text-gray-400 mb-6">
                    {contentFilters.searchQuery || contentFilters.niche || contentFilters.creator
                      ? 'Try adjusting your filters or search terms.'
                      : 'Start by analyzing some creators to populate your content database.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Go to Dashboard
                  </button>
              </div>
                    )}
            </div>
                )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Simple Profile Form */}
              <div className="border border-white/10 rounded-lg p-8">

                {profileLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading your profile...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Your Profile</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={userProfile?.personal?.name || ''}
                          onChange={(e) => updateProfileSection('personal', { name: e.target.value })}
                          placeholder="Your name"
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                        />
                </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Niche</label>
                        <select 
                          value={userProfile?.content?.primaryNiche || ''}
                          onChange={(e) => updateProfileSection('content', { primaryNiche: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                        >
                          <option value="">Select your niche</option>
                          <option value="business">Business</option>
                          <option value="motivation">Motivation</option>
                          <option value="fitness">Fitness</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                        <textarea
                          value={userProfile?.personal?.bio || ''}
                          onChange={(e) => updateProfileSection('personal', { bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                        <textarea
                          value={userProfile?.content?.targetAudience || ''}
                          onChange={(e) => updateProfileSection('content', { targetAudience: e.target.value })}
                          placeholder="Who is your target audience?"
                          rows={2}
                          className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                        onClick={() => saveUserProfile(userProfile)}
                        disabled={profileSaving}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        {profileSaving ? 'Saving...' : 'Save Profile'}
                        </button>
            </div>
          </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-8">
              {/* Calendar Controls */}
              <div className="border border-white/10 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Content Calendar</h3>
                    <p className="text-gray-400">Plan and schedule your viral content strategy</p>
                  </div>
                  <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <button
                        onClick={() => setCalendarView('month')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          calendarView === 'month' 
                            ? 'bg-white text-black' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Month
                                  </button>
                                  <button
                        onClick={() => setCalendarView('week')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          calendarView === 'week' 
                            ? 'bg-white text-black' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setCalendarView('day')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          calendarView === 'day' 
                            ? 'bg-white text-black' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Day
                                  </button>
                                </div>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Schedule Content
                    </button>
                              </div>
                              </div>
                
                {/* Calendar Grid */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-center text-white mb-4">
                    {calendarView === 'month' && 'January 2024'}
                    {calendarView === 'week' && 'Week of January 1, 2024'}
                    {calendarView === 'day' && 'January 1, 2024'}
                  </div>
                  
                  {calendarView === 'month' && (
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-gray-400 text-sm py-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div key={i} className="aspect-square border border-white/10 rounded-lg p-2 hover:bg-white/5 transition-colors">
                          <div className="text-white text-sm font-medium">{i + 1}</div>
                          {i % 7 === 0 && (
                            <div className="text-xs text-green-400 mt-1">Optimal</div>
                          )}
                          {i % 5 === 0 && (
                            <div className="text-xs text-blue-400 mt-1">Scheduled</div>
                          )}
                        </div>
                      ))}
                                </div>
                              )}
                              
                  {calendarView === 'week' && (
                    <div className="space-y-4">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                          <div className="text-white font-medium">Day {i + 1}</div>
                          <div className="text-sm text-gray-400">Optimal posting time: 7:00 PM</div>
                                    </div>
                      ))}
                                  </div>
                  )}
                  
                  {calendarView === 'day' && (
                    <div className="space-y-4">
                      <div className="text-center text-white mb-4">January 1, 2024</div>
                                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                          <div className="text-white">Morning (6-9 AM)</div>
                          <div className="text-sm text-gray-400">Good for educational content</div>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                          <div className="text-white">Afternoon (12-3 PM)</div>
                          <div className="text-sm text-gray-400">Peak engagement time</div>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                          <div className="text-white">Evening (6-9 PM)</div>
                          <div className="text-sm text-gray-400">Best for viral content</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Suggestions */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Content Suggestions</h3>
                <div className="space-y-4">
                  {[
                    { time: '9:00 AM', type: 'Educational', idea: '5 business mistakes to avoid', engagement: '89%', trending: true },
                    { time: '1:00 PM', type: 'Behind the Scenes', idea: 'Day in the life of an entrepreneur', engagement: '92%', trending: false },
                    { time: '6:00 PM', type: 'Motivational', idea: 'How I built my first $1M business', engagement: '78%', trending: true }
                  ].map((suggestion, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{suggestion.time}</span>
                        <div className="flex items-center space-x-2">
                          {suggestion.trending && (
                                                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                              Trending
                                                  </span>
                                                )}
                          <span className="text-xs text-green-400">{suggestion.engagement}</span>
                                              </div>
                                              </div>
                      <div className="text-xs text-gray-400 mb-2">{suggestion.type}</div>
                      <p className="text-sm text-gray-300 mb-3">{suggestion.idea}</p>
                      <div className="flex space-x-2">
                        <button className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20">
                          Use Idea
                        </button>
                        <button className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20">
                          Schedule
                        </button>
                                                </div>
                                            </div>
                  ))}
                                      </div>
                                    </div>
              
              {/* Weekly Strategy */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Weekly Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-sm text-gray-400">Educational Posts</div>
                                    </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">2</div>
                    <div className="text-sm text-gray-400">Behind the Scenes</div>
                                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">1</div>
                    <div className="text-sm text-gray-400">Motivational</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Primary Niche</label>
                        <select 
                              value={userProfile?.content?.primaryNiche || ''}
                              onChange={(e) => updateProfileSection('content', { primaryNiche: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select your primary niche</option>
                              <option value="business">Business & Entrepreneurship</option>
                              <option value="motivation">Motivation & Self-Help</option>
                              <option value="fitness">Fitness & Health</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                              <option value="technology">Technology</option>
                              <option value="finance">Finance & Investing</option>
                              <option value="creative">Creative & Arts</option>
                              <option value="entertainment">Entertainment</option>
                        </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Content Style</label>
                        <select 
                              value={userProfile?.content?.contentStyle || ''}
                              onChange={(e) => updateProfileSection('content', { contentStyle: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select your style</option>
                              <option value="educational">Educational</option>
                              <option value="entertaining">Entertaining</option>
                              <option value="inspirational">Inspirational</option>
                              <option value="controversial">Controversial</option>
                              <option value="storytelling">Storytelling</option>
                              <option value="behind-scenes">Behind the Scenes</option>
                        </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                            <textarea
                              value={userProfile?.content?.targetAudience || ''}
                              onChange={(e) => updateProfileSection('content', { targetAudience: e.target.value })}
                              placeholder="Describe your ideal audience (age, interests, problems they face)..."
                              rows={3}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Posting Frequency</label>
                            <select
                              value={userProfile?.content?.postingFrequency || ''}
                              onChange={(e) => updateProfileSection('content', { postingFrequency: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select frequency</option>
                              <option value="daily">Daily</option>
                              <option value="few-times-week">Few times a week</option>
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Platforms</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter', 'Facebook'].map(platform => (
                        <button
                                  key={platform}
                  onClick={() => {
                                    const current = userProfile?.content?.preferredPlatforms || [];
                                    const updated = current.includes(platform)
                                      ? current.filter((p: string) => p !== platform)
                                      : [...current, platform];
                                    updateProfileSection('content', { preferredPlatforms: updated });
                                  }}
                                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    userProfile?.content?.preferredPlatforms?.includes(platform)
                                      ? 'bg-white text-black'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  }`}
                                >
                                  {platform}
                        </button>
                              ))}
            </div>
          </div>
                        </div>
                                    </div>
                                  )}

                    {/* Brand Voice Section */}
                    {profileSection === 'brand' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Brand Voice & Personality</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Brand Voice</label>
                            <select
                              value={userProfile?.brand?.brandVoice || ''}
                              onChange={(e) => updateProfileSection('brand', { brandVoice: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select your brand voice</option>
                              <option value="professional">Professional</option>
                              <option value="casual">Casual & Friendly</option>
                              <option value="authoritative">Authoritative</option>
                              <option value="humorous">Humorous</option>
                              <option value="inspiring">Inspiring</option>
                              <option value="conversational">Conversational</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Brand Personality Traits</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['Authentic', 'Bold', 'Creative', 'Empathetic', 'Expert', 'Fun', 'Innovative', 'Reliable', 'Transparent', 'Visionary'].map(trait => (
                                  <button
                                  key={trait}
                                  onClick={() => {
                                    const current = userProfile?.brand?.brandPersonality || [];
                                    const updated = current.includes(trait)
                                      ? current.filter((t: string) => t !== trait)
                                      : [...current, trait];
                                    updateProfileSection('brand', { brandPersonality: updated });
                                  }}
                                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    userProfile?.brand?.brandPersonality?.includes(trait)
                                      ? 'bg-white text-black'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  }`}
                                >
                                  {trait}
                                  </button>
                              ))}
                                </div>
                              </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Unique Selling Point</label>
                            <textarea
                              value={userProfile?.brand?.uniqueSellingPoint || ''}
                              onChange={(e) => updateProfileSection('brand', { uniqueSellingPoint: e.target.value })}
                              placeholder="What makes you different from others in your niche?"
                              rows={3}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                              </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Brand Story</label>
                            <textarea
                              value={userProfile?.brand?.brandStory || ''}
                              onChange={(e) => updateProfileSection('brand', { brandStory: e.target.value })}
                              placeholder="Tell your story - how did you get here? What drives you?"
                              rows={4}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                        </div>
                                </div>
                              )}
                              
                    {/* Target Audience Section */}
                    {profileSection === 'audience' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Target Audience Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target Age Range</label>
                            <select
                              value={userProfile?.audience?.targetAge || ''}
                              onChange={(e) => updateProfileSection('audience', { targetAge: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select age range</option>
                              <option value="13-17">13-17 (Gen Z)</option>
                              <option value="18-24">18-24 (Young Adults)</option>
                              <option value="25-34">25-34 (Millennials)</option>
                              <option value="35-44">35-44 (Gen X)</option>
                              <option value="45-54">45-54 (Gen X)</option>
                              <option value="55+">55+ (Boomers)</option>
                            </select>
                            </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target Gender</label>
                            <select
                              value={userProfile?.audience?.targetGender || ''}
                              onChange={(e) => updateProfileSection('audience', { targetGender: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select gender</option>
                              <option value="all">All genders</option>
                              <option value="male">Primarily male</option>
                              <option value="female">Primarily female</option>
                              <option value="non-binary">Non-binary inclusive</option>
                            </select>
                                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Primary Location</label>
                            <input
                              type="text"
                              value={userProfile?.audience?.targetLocation || ''}
                              onChange={(e) => updateProfileSection('audience', { targetLocation: e.target.value })}
                              placeholder="e.g., USA, Global, Europe"
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                                              </div>
                                              </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Audience Interests (comma-separated)</label>
                          <input
                            type="text"
                            value={userProfile?.audience?.audienceInterests?.join(', ') || ''}
                            onChange={(e) => updateProfileSection('audience', { 
                              audienceInterests: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                            })}
                            placeholder="e.g., entrepreneurship, fitness, technology, personal development"
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                          />
                      </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Pain Points & Challenges</label>
                          <textarea
                            value={userProfile?.audience?.audiencePainPoints?.join('\n') || ''}
                            onChange={(e) => updateProfileSection('audience', { 
                              audiencePainPoints: e.target.value.split('\n').map(s => s.trim()).filter(s => s) 
                            })}
                            placeholder="What problems does your audience face? (one per line)"
                            rows={3}
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                          />
                                            </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Aspirations & Goals</label>
                          <textarea
                            value={userProfile?.audience?.audienceAspirations?.join('\n') || ''}
                            onChange={(e) => updateProfileSection('audience', { 
                              audienceAspirations: e.target.value.split('\n').map(s => s.trim()).filter(s => s) 
                            })}
                            placeholder="What does your audience want to achieve? (one per line)"
                            rows={3}
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                          />
                                      </div>
                  </div>
                )}

                    {/* Preferences Section */}
                    {profileSection === 'preferences' && (
                  <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Content Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Content Length</label>
                            <select
                              value={userProfile?.preferences?.contentLength || ''}
                              onChange={(e) => updateProfileSection('preferences', { contentLength: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select length preference</option>
                              <option value="short">Short (15-30 seconds)</option>
                              <option value="medium">Medium (30-60 seconds)</option>
                              <option value="long">Long (60+ seconds)</option>
                              <option value="mixed">Mixed lengths</option>
                            </select>
                </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tone Preference</label>
                            <select
                              value={userProfile?.preferences?.tonePreference || ''}
                              onChange={(e) => updateProfileSection('preferences', { tonePreference: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select tone</option>
                              <option value="motivational">Motivational</option>
                              <option value="educational">Educational</option>
                              <option value="entertaining">Entertaining</option>
                              <option value="controversial">Controversial</option>
                              <option value="inspirational">Inspirational</option>
                              <option value="conversational">Conversational</option>
                            </select>
                                  </div>
                                    <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hashtag Strategy</label>
                            <select
                              value={userProfile?.preferences?.hashtagStrategy || ''}
                              onChange={(e) => updateProfileSection('preferences', { hashtagStrategy: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select strategy</option>
                              <option value="trending">Focus on trending hashtags</option>
                              <option value="niche">Niche-specific hashtags</option>
                              <option value="branded">Branded hashtags</option>
                              <option value="mixed">Mixed approach</option>
                            </select>
                                    </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Call-to-Action Style</label>
                            <select
                              value={userProfile?.preferences?.callToActionStyle || ''}
                              onChange={(e) => updateProfileSection('preferences', { callToActionStyle: e.target.value })}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select CTA style</option>
                              <option value="direct">Direct (Follow, Like, Share)</option>
                              <option value="question">Question-based</option>
                              <option value="story">Story-driven</option>
                              <option value="value">Value-focused</option>
                              <option value="urgency">Urgency-based</option>
                            </select>
                          </div>
                        </div>
                                </div>
                              )}

                    {/* Analytics Section */}
                    {profileSection === 'analytics' && (
                <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Performance Analytics</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Best Performing Topics</label>
                            <input
                              type="text"
                              value={userProfile?.analytics?.bestPerformingTopics?.join(', ') || ''}
                              onChange={(e) => updateProfileSection('analytics', { 
                                bestPerformingTopics: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                              })}
                              placeholder="e.g., morning routines, business tips, workout videos"
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                            </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Topics That Don't Perform Well</label>
                            <input
                              type="text"
                              value={userProfile?.analytics?.worstPerformingTopics?.join(', ') || ''}
                              onChange={(e) => updateProfileSection('analytics', { 
                                worstPerformingTopics: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                              })}
                              placeholder="e.g., personal stories, behind the scenes"
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Optimal Posting Times</label>
                            <input
                              type="text"
                              value={userProfile?.analytics?.optimalPostingTimes?.join(', ') || ''}
                              onChange={(e) => updateProfileSection('analytics', { 
                                optimalPostingTimes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                              })}
                              placeholder="e.g., 7 AM, 12 PM, 6 PM"
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Seasonal Trends</label>
                      <textarea
                              value={userProfile?.analytics?.seasonalTrends?.join('\n') || ''}
                              onChange={(e) => updateProfileSection('analytics', { 
                                seasonalTrends: e.target.value.split('\n').map(s => s.trim()).filter(s => s) 
                              })}
                              placeholder="Describe any seasonal patterns in your content performance (one per line)"
                              rows={3}
                              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Save Status */}
                {profileSaving && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm">Saving your profile...</span>
                    </div>
                  </div>
                )}
                </div>

              {/* Profile Completion */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  {[
                    { section: 'personal', label: 'Personal Information', completed: !!(userProfile?.personal?.name && userProfile?.personal?.username) },
                    { section: 'content', label: 'Content Strategy', completed: !!(userProfile?.content?.primaryNiche && userProfile?.content?.targetAudience) },
                    { section: 'brand', label: 'Brand Voice', completed: !!(userProfile?.brand?.brandVoice && userProfile?.brand?.uniqueSellingPoint) },
                    { section: 'audience', label: 'Target Audience', completed: !!(userProfile?.audience?.targetAge && userProfile?.audience?.audienceInterests?.length) },
                    { section: 'preferences', label: 'Preferences', completed: !!(userProfile?.preferences?.contentLength && userProfile?.preferences?.tonePreference) }
                  ].map(item => (
                    <div key={item.section} className="flex items-center justify-between">
                      <span className="text-gray-300">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        {item.completed ? (
                          <span className="text-green-400 text-sm">✓ Complete</span>
                        ) : (
                          <button
                            onClick={() => setProfileSection(item.section as any)}
                            className="text-blue-400 text-sm hover:text-blue-300"
                          >
                            Complete →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Overall Completion</span>
                    <span className="text-white">
                      {Math.round(([
                        userProfile?.personal?.name && userProfile?.personal?.username,
                        userProfile?.content?.primaryNiche && userProfile?.content?.targetAudience,
                        userProfile?.brand?.brandVoice && userProfile?.brand?.uniqueSellingPoint,
                        userProfile?.audience?.targetAge && userProfile?.audience?.audienceInterests?.length,
                        userProfile?.preferences?.contentLength && userProfile?.preferences?.tonePreference
                      ].filter(Boolean).length / 5) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-8">
              {/* Calendar Controls */}
              <div className="border border-white/10 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Content Calendar</h3>
                    <p className="text-gray-400">Plan and schedule your viral content strategy</p>
                  </div>
                      <div className="flex items-center space-x-4">
                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                      {['month', 'week', 'day'].map(view => (
                        <button
                          key={view}
                          onClick={() => setCalendarView(view as any)}
                          className={`px-3 py-1 text-sm capitalize rounded transition-colors ${
                            calendarView === view 
                              ? 'bg-white text-black' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                    
                    {/* Add Content Button */}
                        <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                      + Schedule Content
                        </button>
                      </div>
                    </div>
                    
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                    const startDay = startOfMonth.getDay();
                    const dayNumber = i - startDay + 1;
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    const isToday = isCurrentMonth && dayNumber === date.getDate();
                    const hasContent = isCurrentMonth && Math.random() > 0.7; // Mock content
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] p-2 border border-white/5 rounded-lg transition-all cursor-pointer ${
                          isCurrentMonth 
                            ? 'bg-white/5 hover:bg-white/10' 
                            : 'bg-transparent'
                        } ${
                          isToday 
                            ? 'border-white/30 bg-white/10' 
                            : ''
                        }`}
                        onClick={() => isCurrentMonth && setSelectedDate(new Date(date.getFullYear(), date.getMonth(), dayNumber))}
                      >
                        {isCurrentMonth && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday ? 'text-white' : 'text-gray-300'
                            }`}>
                              {dayNumber}
                            </div>
                            
                            {/* Optimal Posting Times */}
                            {[9, 13, 18].map(hour => (
                              <div
                                key={hour}
                                className="text-xs bg-green-500/20 text-green-300 px-1 py-0.5 rounded mb-1 w-fit"
                              >
                                {hour}:00
                              </div>
                            ))}
                            
                            {/* Scheduled Content */}
                            {hasContent && (
                              <div className="text-xs bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded truncate">
                                📝 Business tip
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500/20 rounded"></div>
                    <span className="text-gray-400">Optimal posting times</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500/20 rounded"></div>
                    <span className="text-gray-400">Scheduled content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/20 rounded"></div>
                    <span className="text-gray-400">Today</span>
                  </div>
                </div>
              </div>

              {/* Content Suggestions for Selected Date */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Content Ideas for {selectedDate.toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      time: '9:00 AM',
                      type: 'Motivational Monday',
                      idea: 'Share your morning routine for success',
                      engagement: '85%',
                      trending: true
                    },
                    {
                      time: '1:00 PM',
                      type: 'Educational',
                      idea: '3 business mistakes I made so you don\'t have to',
                      engagement: '92%',
                      trending: false
                    },
                    {
                      time: '6:00 PM',
                      type: 'Behind the Scenes',
                      idea: 'Day in the life of an entrepreneur',
                      engagement: '78%',
                      trending: true
                    }
                  ].map((suggestion, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{suggestion.time}</span>
                        <div className="flex items-center space-x-2">
                          {suggestion.trending && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                              🔥 Trending
                            </span>
                          )}
                          <span className="text-xs text-green-400">{suggestion.engagement}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{suggestion.type}</div>
                      <p className="text-sm text-gray-300 mb-3">{suggestion.idea}</p>
                      <div className="flex space-x-2">
                        <button className="text-xs bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20 transition-colors">
                          Schedule
                        </button>
                        <button className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors">
                          Customize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Overview */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">This Week's Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-sm text-gray-400">Posts Scheduled</div>
                          </div>
                          <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">89%</div>
                    <div className="text-sm text-gray-400">Optimal Times</div>
                          </div>
                          <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">5</div>
                    <div className="text-sm text-gray-400">Content Types</div>
                          </div>
                          <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">3</div>
                    <div className="text-sm text-gray-400">Trending Topics</div>
                          </div>
                        </div>
                        
                <div className="mt-6 grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-gray-400 mb-2">{day}</div>
                      <div className="space-y-1">
                        {[9, 13, 18].map(hour => (
                          <div
                            key={hour}
                            className={`text-xs py-1 px-2 rounded ${
                              Math.random() > 0.3 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-white/5 text-gray-500'
                            }`}
                          >
                            {hour}:00
                          </div>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
                  </div>
                )}

          {/* Viral Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-8">
              {/* Template Categories */}
              <div className="border border-white/10 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                    <h3 className="text-xl font-semibold text-white">Viral Templates</h3>
                    <p className="text-gray-400">Proven templates that guarantee engagement</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Filter:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 text-sm"
                    >
                      <option value="all">All Templates</option>
                      <option value="hooks">Hooks & Openers</option>
                      <option value="stories">Story Templates</option>
                      <option value="educational">Educational</option>
                      <option value="controversial">Controversial</option>
                      <option value="motivation">Motivational</option>
                    </select>
                  </div>
                    </div>
                    
                {/* Template Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {[
                    { id: 'all', label: 'All', icon: '📋', count: 50 },
                    { id: 'hooks', label: 'Hooks', icon: '🎣', count: 15 },
                    { id: 'stories', label: 'Stories', icon: '📖', count: 12 },
                    { id: 'educational', label: 'Educational', icon: '🎓', count: 8 },
                    { id: 'controversial', label: 'Controversial', icon: '⚡', count: 6 },
                    { id: 'motivation', label: 'Motivational', icon: '💪', count: 9 }
                  ].map(category => (
                      <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedCategory === category.id
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium">{category.label}</div>
                      <div className="text-xs text-gray-400">{category.count} templates</div>
                      </button>
                  ))}
                    </div>
                    
                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: 1,
                      category: 'hooks',
                      title: 'POV Template',
                      hook: 'POV: You discover...',
                      description: 'Perfect for revealing secrets or insights',
                      engagement: '94%',
                      uses: '2.1M',
                      example: 'POV: You discover the secret that changed my entire business in 30 days',
                      trending: true
                    },
                    {
                      id: 2,
                      category: 'educational',
                      title: '3 Things Template',
                      hook: '3 things that changed my [topic]',
                      description: 'Educational content that performs consistently',
                      engagement: '87%',
                      uses: '1.8M',
                      example: '3 things that changed my morning routine (and my life)',
                      trending: false
                    },
                    {
                      id: 3,
                      category: 'controversial',
                      title: 'Unpopular Opinion',
                      hook: 'Unpopular opinion: [controversial take]',
                      description: 'Drive engagement with bold statements',
                      engagement: '91%',
                      uses: '1.5M',
                      example: 'Unpopular opinion: Working 80 hours a week is destroying your business',
                      trending: true
                    },
                    {
                      id: 4,
                      category: 'stories',
                      title: 'Mistake Story',
                      hook: 'The $[amount] mistake I made...',
                      description: 'Personal failure stories that teach lessons',
                      engagement: '89%',
                      uses: '1.3M',
                      example: 'The $50K mistake I made so you don\'t have to',
                      trending: false
                    },
                    {
                      id: 5,
                      category: 'motivation',
                      title: 'Transformation',
                      hook: 'How I went from [before] to [after]',
                      description: 'Inspiring transformation stories',
                      engagement: '85%',
                      uses: '2.5M',
                      example: 'How I went from broke to 6-figures in 8 months',
                      trending: true
                    },
                    {
                      id: 6,
                      category: 'educational',
                      title: 'What Nobody Tells You',
                      hook: 'What nobody tells you about [topic]',
                      description: 'Reveal hidden truths and insider knowledge',
                      engagement: '92%',
                      uses: '1.7M',
                      example: 'What nobody tells you about building a personal brand',
                      trending: false
                    }
                  ].filter(template => selectedCategory === 'all' || template.category === selectedCategory).map(template => (
                    <div key={template.id} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors border border-white/10">
                      {/* Template Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-white">{template.title}</h4>
                            {template.trending && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                🔥 Trending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        </div>
                      </div>

                      {/* Template Hook */}
                      <div className="bg-black/20 rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-400 mb-1">Template:</div>
                        <div className="text-white font-medium">{template.hook}</div>
                      </div>

                      {/* Example */}
                      <div className="bg-blue-500/10 rounded-lg p-3 mb-4">
                        <div className="text-sm text-blue-400 mb-1">Example:</div>
                        <div className="text-blue-200 text-sm">{template.example}</div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-green-400">{template.engagement} avg engagement</span>
                          <span className="text-gray-400">{template.uses} uses</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                                <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="flex-1 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Use Template
                        </button>
                        <button className="bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                          Preview
                                </button>
                              </div>
                          </div>
                        ))}
                      </div>
              </div>

              {/* Template Stats */}
              <div className="border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Template Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">50</div>
                    <div className="text-sm text-gray-400">Total Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">89.5%</div>
                    <div className="text-sm text-gray-400">Avg Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">12.3M</div>
                    <div className="text-sm text-gray-400">Total Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">15</div>
                    <div className="text-sm text-gray-400">Trending Now</div>
                  </div>
                </div>
              </div>
                  </div>
                )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-8">
              {/* Current Plan */}
              <div className="border border-white/10 rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                    <p className="text-gray-400">Unlimited AI analysis, viral templates, and content generation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">$29</div>
                    <div className="text-gray-400">per month</div>
                  </div>
                    </div>
                    
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">∞</div>
                    <div className="text-sm text-gray-400">AI Analysis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">50+</div>
                    <div className="text-sm text-gray-400">Viral Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">∞</div>
                    <div className="text-sm text-gray-400">Content Generation</div>
                        </div>
                      </div>
                      
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Next billing: January 15, 2024
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Change Plan
                  </button>
                        </div>
                      </div>
                      
              {/* Payment Method */}
              <div className="border border-white/10 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">Payment Method</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-gray-400">Expires 12/25</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Update
                  </button>
                        </div>
                      </div>
                      
              {/* Billing History */}
              <div className="border border-white/10 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">Billing History</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <div className="text-white font-medium">Pro Plan - December 2023</div>
                      <div className="text-sm text-gray-400">Dec 15, 2023</div>
                        </div>
                    <div className="text-right">
                      <div className="text-white font-medium">$29.00</div>
                      <div className="text-sm text-green-400">Paid</div>
                      </div>
                    </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <div className="text-white font-medium">Pro Plan - November 2023</div>
                      <div className="text-sm text-gray-400">Nov 15, 2023</div>
                  </div>
                    <div className="text-right">
                      <div className="text-white font-medium">$29.00</div>
                      <div className="text-sm text-green-400">Paid</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-white font-medium">Pro Plan - October 2023</div>
                      <div className="text-sm text-gray-400">Oct 15, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">$29.00</div>
                      <div className="text-sm text-green-400">Paid</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="border border-white/10 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">This Month's Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">47</div>
                    <div className="text-sm text-gray-400">AI Analyses</div>
                    <div className="text-xs text-green-400 mt-1">+12 from last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">23</div>
                    <div className="text-sm text-gray-400">Content Generated</div>
                    <div className="text-xs text-green-400 mt-1">+8 from last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">156</div>
                    <div className="text-sm text-gray-400">Templates Used</div>
                    <div className="text-xs text-green-400 mt-1">+34 from last month</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard Sub-page Content */}
              {dashboardSubPage === 'scrape' && (
                <>
          {/* Main Scraping Form */}
            <div className="border border-white/10 rounded-lg p-8 mb-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Scrape Content</h2>
                      <p className="text-gray-400">Analyze viral content from top creators with AI-powered insights</p>
                    </div>
                    
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Platform Selection */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white mb-4">Platform</h3>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('tiktok')}
                      className={`px-6 py-3 rounded-lg border border-white/10 transition-all ${
                        selectedPlatform === 'tiktok' 
                          ? 'bg-white text-black' 
                          : 'bg-black text-white hover:bg-white/5'
                      }`}
                    >
                      TikTok
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('instagram')}
                      className={`px-6 py-3 rounded-lg border border-white/10 transition-all ${
                        selectedPlatform === 'instagram' 
                          ? 'bg-white text-black' 
                          : 'bg-black text-white hover:bg-white/5'
                      }`}
                    >
                      Instagram
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username (without @)"
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="count" className="block text-sm font-medium text-gray-400 mb-2">
                      Count
                    </label>
                    <select
                      id="count"
                      value={videoCount}
                      onChange={(e) => setVideoCount(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      disabled={isLoading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                {isLoading && (
                  <div className="text-center">
                    <div className="w-full bg-white/10 rounded-lg h-2 mb-2">
                      <div 
                        className="bg-white h-2 rounded-lg transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400">Analyzing content... {progress}%</p>
                  </div>
                )}

                {error && (
                  <div className="text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={!username.trim() || isLoading}
                    className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      `Analyze @${username || 'username'}`
                    )}
                  </button>
                </div>
              </form>
            </div>

                  {/* Results Section - Shows when content is scraped */}
          {showResults && (
                    <div className="border border-white/10 rounded-lg p-8 mb-12">
                      <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Content Analysis Results
                </h2>
                <p className="text-gray-400 mb-6">
                  {videos.length} videos from @{lastScrapedUser}
                </p>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={runAIAnalysis}
                    disabled={aiAnalysisLoading}
                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {aiAnalysisLoading ? 'Analyzing...' : 'Run AI Analysis'}
                  </button>
                  <button 
                    onClick={exportToCSV}
                    className="px-6 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={exportToJSON}
                    className="px-6 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* AI Analysis Results */}
              {(aiAnalysisResults || aiAnalysisLoading) && (
                        <div className="border border-white/10 rounded-lg p-6 mb-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">AI Content Analysis</h3>
                    <p className="text-gray-400">GPT-powered insights and recommendations</p>
                  </div>

                  {aiAnalysisLoading && (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400">Analyzing content with AI...</p>
                    </div>
                  )}

                  {aiAnalysisResults && !aiAnalysisLoading && (
                    <div className="space-y-6">
                      {/* AI Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{aiAnalysisResults.summary.overallScore}/100</div>
                          <div className="text-sm text-gray-400">AI Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{aiAnalysisResults.summary.viralPotential}</div>
                          <div className="text-sm text-gray-400">Viral Potential</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{formatNumber(aiAnalysisResults.summary.averageViews)}</div>
                          <div className="text-sm text-gray-400">Avg Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{aiAnalysisResults.summary.averageEngagement.toFixed(1)}%</div>
                          <div className="text-sm text-gray-400">Avg Engagement</div>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-green-500/20 bg-green-900/10 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">✅ Strengths</h5>
                          <div className="space-y-1">
                            {aiAnalysisResults.analysis.contentStrategy.strengths.slice(0, 3).map((strength: string, idx: number) => (
                              <div key={idx} className="text-sm text-gray-300">• {strength}</div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border border-orange-500/20 bg-orange-900/10 rounded-lg p-4">
                          <h5 className="text-white font-medium mb-2">⚠️ Opportunities</h5>
                          <div className="space-y-1">
                            {aiAnalysisResults.analysis.contentStrategy.opportunities.slice(0, 3).map((opp: string, idx: number) => (
                              <div key={idx} className="text-sm text-gray-300">• {opp}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      <div className="border border-blue-500/20 bg-blue-900/10 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-2">🎯 AI Recommendations</h5>
                        <div className="space-y-1">
                          {aiAnalysisResults.actionableInsights.quickWins.map((rec: string, idx: number) => (
                            <div key={idx} className="text-sm text-gray-300">• {rec}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

                      {/* Content Optimization Results */}
                      {contentOptimization && (
                        <div className="border border-white/10 rounded-lg p-6 mb-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Viral Script Optimization</h3>
                            <p className="text-gray-400">AI-optimized content for maximum viral potential</p>
                          </div>

                          <div className="space-y-6">
                            {/* Viral Score */}
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white mb-2">
                                {contentOptimization.viralScore || 75}/100
                              </div>
                              <div className="text-lg text-gray-400">Viral Score</div>
                              <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                                <div 
                                  className="bg-white h-3 rounded-full transition-all duration-1000"
                                  style={{ width: `${contentOptimization.viralScore || 75}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Optimized Content */}
                            <div className="border border-white/10 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-white">Optimized Script</h4>
                                <button
                                  onClick={() => {
                                    const content = contentOptimization.optimizedContent || contentOptimization.content;
                                    if (content) {
                                      // Create a temporary textarea to select all text
                                      const textarea = document.createElement('textarea');
                                      textarea.value = content;
                                      textarea.style.position = 'fixed';
                                      textarea.style.left = '-999999px';
                                      textarea.style.top = '-999999px';
                                      document.body.appendChild(textarea);
                                      textarea.focus();
                                      textarea.select();
                                      document.body.removeChild(textarea);
                                      alert('Text selected! Press Ctrl+C (Cmd+C on Mac) to copy.');
                                    }
                                  }}
                                  className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition-colors"
                                >
                                  Select All
                                </button>
                              </div>
                              <div className="bg-gray-900/50 rounded-lg p-4">
                                <p className="text-gray-300 whitespace-pre-wrap">
                                  {contentOptimization.optimizedContent || contentOptimization.content}
                                </p>
                              </div>
                            </div>

                            {/* Video Timeline */}
                            {contentOptimization.videoTimeline && (
                              <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">⏱️ Video Timeline</h4>
                                <div className="space-y-3">
                                  {Object.entries(contentOptimization.videoTimeline).map(([time, content]) => (
                                    <div key={time} className="flex items-start space-x-3">
                                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-mono">
                                        {time}
                                      </div>
                                      <div className="text-gray-300 text-sm flex-1">
                                        {content as string}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Improvements */}
                            {contentOptimization.improvements && (
                              <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">✨ Key Improvements</h4>
                                <div className="space-y-2">
                                  {contentOptimization.improvements.map((improvement: string, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-gray-300 text-sm">{improvement}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Hashtags */}
                            {contentOptimization.hashtags && (
                              <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">Recommended Hashtags</h4>
                                <div className="flex flex-wrap gap-2">
                                  {contentOptimization.hashtags.map((hashtag: string, idx: number) => (
                                    <span key={idx} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">
                                      {hashtag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Call to Action */}
                            {contentOptimization.callToAction && (
                              <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">Call to Action</h4>
                                <div className="bg-gray-900/50 rounded-lg p-3">
                                  <p className="text-gray-300">{contentOptimization.callToAction}</p>
                                </div>
                              </div>
                            )}

                            {/* Engagement Tips */}
                            {contentOptimization.engagementTips && (
                              <div className="border border-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-3">Engagement Tips</h4>
                                <div className="space-y-2">
                                  {contentOptimization.engagementTips.map((tip: string, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                      <span className="text-gray-300 text-sm">{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 pt-4">
                              <button
                                onClick={async () => {
                                  const content = contentOptimization.optimizedContent || contentOptimization.content;
                                  if (content) {
                                    const copySuccess = await copyToClipboardSafe(content);
                                    if (copySuccess) {
                                      alert('Script copied to clipboard!');
                                    } else {
                                      alert('Unable to copy automatically. Please use the "Select All" button above the script, then press Ctrl+C (Cmd+C on Mac) to copy manually.');
                                    }
                                  }
                                }}
                                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
                              >
                                Copy Script
                              </button>
                              <button
                                onClick={() => {
                                  const content = contentOptimization.optimizedContent || contentOptimization.content;
                                  if (content) {
                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'viral-script.txt';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    alert('Script downloaded!');
                                  }
                                }}
                                className="px-6 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
                              >
                                Download Script
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video Results */}
                <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="border border-white/10 rounded-lg p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Video Info */}
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{video.hook}</h3>
                          <p className="text-gray-300 text-sm mb-3">{video.caption}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Post URL:</span>
                            <a 
                              href={video.postUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm truncate"
                            >
                              {video.postUrl}
                            </a>
                          </div>
                    <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Upload Date:</span>
                            <span className="text-white text-sm">{formatDate(video.uploadDate)}</span>
                          </div>
                    </div>

                        {/* Transcript */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Full Transcript:</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {video.transcript}
                          </p>
                  </div>
                    </div>

                      {/* Metrics */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-medium text-white">{formatNumber(video.views)}</div>
                              <div className="text-xs text-gray-400">Views</div>
                  </div>
                            <div>
                              <div className="text-lg font-medium text-white">{formatNumber(video.likes)}</div>
                              <div className="text-xs text-gray-400">Likes</div>
                    </div>
                            <div>
                              <div className="text-lg font-medium text-white">{((video.likes / video.views) * 100).toFixed(1)}%</div>
                              <div className="text-xs text-gray-400">Engagement</div>
                </div>
              </div>

                        <div className="space-y-2">
                          <button 
                            onClick={() => copyToClipboard(video.hook, 'Hook')}
                            className="w-full border border-white/10 text-white py-2 px-3 rounded-lg text-sm hover:bg-white/5 transition-all"
                          >
                            Copy Hook
                          </button>
                          <button 
                            onClick={() => copyToClipboard(video.caption, 'Caption')}
                            className="w-full border border-white/10 text-white py-2 px-3 rounded-lg text-sm hover:bg-white/5 transition-all"
                          >
                            Copy Caption
                          </button>
                        </div>
                  </div>
                  </div>
                  </div>
                ))}
              </div>
            </div>
                  )}
                </>
              )}

              {dashboardSubPage === 'generate' && (
                <>
                  {/* AI Content Generation */}
                  <div className="border border-white/10 rounded-lg p-8 mb-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">AI Content Generator</h2>
                      <p className="text-gray-400">Generate viral content based on winning patterns</p>
                    </div>

                    {/* Profile Integration Notice */}
                    {userProfile?.personal?.name && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <div>
                            <h4 className="text-green-300 font-medium">Profile-Powered Generation</h4>
                            <p className="text-green-400/80 text-sm">
                              AI will use your profile data ({userProfile.personal.name}, {userProfile?.content?.primaryNiche || 'your niche'}, 
                              {userProfile?.brand?.brandVoice || 'brand voice'}) to create personalized content that matches your style and audience.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!userProfile?.personal?.name && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400">💡</span>
                          <div>
                            <h4 className="text-blue-300 font-medium">Enhance with Profile</h4>
                            <p className="text-blue-400/80 text-sm">
                              Complete your{' '}
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className="text-blue-300 underline hover:text-blue-200"
                              >
                                profile
                              </button>
                              {' '}for personalized AI content generation based on your brand, audience, and preferences.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <select 
                          value={selectedNiche} 
                          onChange={(e) => setSelectedNiche(e.target.value)}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value="business">Business</option>
                          <option value="motivation">Motivation</option>
                          <option value="fitness">Fitness</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                        </select>
                        <select 
                          value={contentQuantity} 
                          onChange={(e) => setContentQuantity(Number(e.target.value))}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value={5}>5 Ideas</option>
                          <option value={10}>10 Ideas</option>
                          <option value={25}>25 Ideas</option>
                        </select>
                        <button
                          onClick={generateAIContent}
                          disabled={generatingContent}
                          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingContent ? '⏳ Generating...' : '🤖 Generate Content'}
                        </button>
                      </div>
                    </div>

                    {generatedContent.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">✨ Generated Content:</h4>
                        {generatedContent.map((content: any, idx: number) => {
                          const contentId = `${content.hook.substring(0, 20)}...`;
                          const isGenerating = generatingScript === contentId;
                          const script = generatedScripts[contentId];
                          
                          return (
                            <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white font-medium">
                                  {content.template || `Content Idea ${idx + 1}`}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-white">
                                    {content.expectedEngagement || content.viralPrediction || 65}% viral chance
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(content.hook, 'hook')}
                                    className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                                  >
                                    Copy Hook
                                  </button>
                                  <button
                                    onClick={() => generateViralScript(content)}
                                    disabled={isGenerating}
                                    className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isGenerating ? 'Creating...' : 'Create Viral Script'}
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{content.hook}</p>
                              <p className="text-gray-400 text-xs mb-2">{content.fullContent}</p>
                              <div className="text-xs text-gray-400">
                                {Array.isArray(content.hashtags) ? content.hashtags.join(' ') : '#viral #content #success'}
                              </div>
                              {content.reasoning && (
                                <div className="text-xs text-blue-400 mt-2 italic">
                                  💡 {content.reasoning}
                                </div>
                              )}

                              {/* Viral Script Display */}
                              {script && (
                                <div className="mt-4 border-t border-white/10 pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-white">Viral Script</h5>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                                        {script.viralScore || 75}/100 Viral Score
                                      </span>
                                      <button
                                        onClick={async () => {
                                          const copySuccess = await copyToClipboardSafe(script.content);
                                          if (copySuccess) {
                                            alert('Script copied to clipboard!');
                                          } else {
                                            alert('Unable to copy automatically. Please select and copy the text manually.');
                                          }
                                        }}
                                        className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                                      >
                                        Copy Script
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Script Content */}
                                  <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                      {script.content}
                                    </p>
                                  </div>

                                  {/* Video Timeline */}
                                  {script.timeline && (
                                    <div className="mb-3">
                                      <h6 className="text-xs font-medium text-white mb-2">Video Timeline</h6>
                                      <div className="space-y-1">
                                        {Object.entries(script.timeline).map(([time, content]) => (
                                          <div key={time} className="flex items-start space-x-2 text-xs">
                                            <span className="bg-white/10 text-white px-2 py-1 rounded font-mono min-w-[60px]">
                                              {time}
                                            </span>
                                            <span className="text-gray-300 flex-1">
                                              {content as string}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Improvements */}
                                  {script.improvements && (
                                    <div className="mb-3">
                                      <h6 className="text-xs font-medium text-white mb-2">Key Improvements</h6>
                                      <div className="space-y-1">
                                        {script.improvements.map((improvement: string, impIdx: number) => (
                                          <div key={impIdx} className="flex items-center space-x-2 text-xs">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            <span className="text-gray-300">{improvement}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {dashboardSubPage === 'predict' && (
                <>
                  {/* Viral Prediction Tool */}
                  <div className="border border-white/10 rounded-lg p-8 mb-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Viral Potential Predictor</h2>
                      <p className="text-gray-400">Predict how viral your content will be before posting</p>
                    </div>

                    <div className="space-y-6">
                      <textarea
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        placeholder="Paste your content here to predict its viral potential..."
                        className="w-full h-32 bg-white/10 text-white rounded-lg p-4 border border-white/20 placeholder-gray-400"
                      />
                      
                      <div className="flex items-center space-x-4">
                        <select 
                          value={selectedNiche} 
                          onChange={(e) => setSelectedNiche(e.target.value)}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value="business">Business</option>
                          <option value="motivation">Motivation</option>
                          <option value="fitness">Fitness</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                        </select>
                        <button
                          onClick={predictViral}
                          disabled={!contentInput.trim()}
                          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                        >
                          🔮 Predict Viral
                        </button>
                      </div>
                    </div>
                    
                    {viralPrediction && (
                      <div className="bg-white/5 rounded-lg p-6 mt-6">
                        <h4 className="text-white font-medium mb-4">🎯 Viral Prediction Results</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.viralProbability}%</div>
                            <div className="text-sm text-gray-400">Viral Chance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.expectedEngagement}%</div>
                            <div className="text-sm text-gray-400">Expected Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{formatNumber(viralPrediction.prediction.expectedViews)}</div>
                            <div className="text-sm text-gray-400">Expected Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.confidence}%</div>
                            <div className="text-sm text-gray-400">Confidence</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="text-white font-medium">💡 Recommendations:</h5>
                          {viralPrediction.recommendations.immediate.map((rec: string, idx: number) => (
                            <div key={idx} className="text-sm text-gray-300">• {rec}</div>
              ))}
            </div>
          </div>
                    )}
                  </div>
                </>
              )}

              {dashboardSubPage === 'templates' && (
                <>
                  {/* Quick Templates Access */}
                  <div className="border border-white/10 rounded-lg p-8 mb-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Quick Templates</h2>
                      <p className="text-gray-400">Access your most-used viral templates instantly</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'POV Template',
                          hook: 'POV: You discover...',
                          engagement: '94%',
                          trending: true
                        },
                        {
                          title: '3 Things Template',
                          hook: '3 things that changed my [topic]',
                          engagement: '87%',
                          trending: false
                        },
                        {
                          title: 'Unpopular Opinion',
                          hook: 'Unpopular opinion: [controversial take]',
                          engagement: '91%',
                          trending: true
                        }
                      ].map((template, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{template.title}</h4>
                            {template.trending && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                🔥 Trending
                              </span>
                            )}
                          </div>
                          <div className="bg-black/20 rounded-lg p-3 mb-4">
                            <div className="text-white font-medium text-sm">{template.hook}</div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-green-400 text-sm">{template.engagement} avg engagement</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('templates')}
                            className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            Use Template
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-8">
                      <button
                        onClick={() => setActiveTab('templates')}
                        className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
                      >
                        View All Templates →
                      </button>
                    </div>
                  </div>
                </>
              )}

                {/* Mass Analysis Tab */}
                {viralAnalysisTab === 'mass_analyze' && (
                  <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                        <h3 className="text-lg font-semibold text-white">Mass Creator Analysis</h3>
                        <p className="text-gray-400">Analyze 100+ top creators and build viral database</p>
                      </div>
                      <button
                        onClick={runMassAnalysis}
                        disabled={massAnalysisLoading}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                      >
                        {massAnalysisLoading ? '🔄 Analyzing...' : '🚀 Start Analysis'}
                      </button>
                    </div>
                    
                    {massAnalysisResults && (
                      <div className="bg-white/5 rounded-lg p-6">
                        <h4 className="text-white font-medium mb-4">📈 Analysis Results</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{massAnalysisResults.summary.totalPosts}</div>
                            <div className="text-sm text-gray-400">Viral Posts</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{massAnalysisResults.summary.totalCreators}</div>
                            <div className="text-sm text-gray-400">Creators</div>
                </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{massAnalysisResults.summary.avgEngagement.toFixed(1)}%</div>
                            <div className="text-sm text-gray-400">Avg Engagement</div>
                </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{massAnalysisResults.summary.bestPatterns.length}</div>
                            <div className="text-sm text-gray-400">Patterns Found</div>
              </div>
            </div>

                        <div className="space-y-2">
                          <h5 className="text-white font-medium">🔥 Top Performing Patterns:</h5>
                          {massAnalysisResults.summary.bestPatterns.slice(0, 3).map((pattern: any, idx: number) => (
                            <div key={idx} className="text-sm text-gray-300">
                              • {pattern.hookPattern} ({pattern.avgEngagement.toFixed(1)}% engagement)
                </div>
                          ))}
                </div>
              </div>
                    )}
            </div>
                )}

                {/* Content Generation Tab */}
                {viralAnalysisTab === 'generate' && (
                  <div className="space-y-4">
                    {/* Profile Integration Notice */}
                    {userProfile?.personal?.name && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <div>
                            <h4 className="text-green-300 font-medium">Profile-Powered Generation</h4>
                            <p className="text-green-400/80 text-sm">
                              AI will use your profile data ({userProfile.personal.name}, {userProfile?.content?.primaryNiche || 'your niche'}, 
                              {userProfile?.brand?.brandVoice || 'brand voice'}) to create personalized content that matches your style and audience.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!userProfile?.personal?.name && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400">💡</span>
                          <div>
                            <h4 className="text-blue-300 font-medium">Enhance with Profile</h4>
                            <p className="text-blue-400/80 text-sm">
                              Complete your{' '}
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className="text-blue-300 underline hover:text-blue-200"
                              >
                                profile
                              </button>
                              {' '}for personalized AI content generation based on your brand, audience, and preferences.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

              <div className="flex items-center justify-between">
                <div>
                        <h3 className="text-lg font-semibold text-white">AI Content Generator</h3>
                        <p className="text-gray-400">Generate viral content based on winning patterns</p>
                </div>
                      <div className="flex items-center space-x-4">
                        <select 
                          value={selectedNiche} 
                          onChange={(e) => setSelectedNiche(e.target.value)}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value="business">Business</option>
                          <option value="motivation">Motivation</option>
                          <option value="fitness">Fitness</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                        </select>
                        <select 
                          value={contentQuantity} 
                          onChange={(e) => setContentQuantity(Number(e.target.value))}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value={5}>5 Ideas</option>
                          <option value={10}>10 Ideas</option>
                          <option value={25}>25 Ideas</option>
                        </select>
                        <button
                          onClick={generateAIContent}
                          disabled={generatingContent}
                          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingContent ? '⏳ Generating...' : '🤖 Generate Content'}
                        </button>
            </div>
          </div>

                    {generatedContent.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">✨ Generated Content:</h4>
                        {generatedContent.map((content: any, idx: number) => {
                          const contentId = `${content.hook.substring(0, 20)}...`;
                          const isGenerating = generatingScript === contentId;
                          
                          return (
                            <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white font-medium">
                                  {content.template || `Content Idea ${idx + 1}`}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-white">
                                    {content.expectedEngagement || content.viralPrediction || 65}% viral chance
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(content.hook, 'hook')}
                                    className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                                  >
                                    Copy Hook
                                  </button>
                                  <button
                                    onClick={() => generateViralScript(content)}
                                    disabled={isGenerating}
                                    className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isGenerating ? 'Creating...' : 'Create Viral Script'}
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{content.hook}</p>
                              <p className="text-gray-400 text-xs mb-2">{content.fullContent}</p>
                              <div className="text-xs text-gray-400">
                                {Array.isArray(content.hashtags) ? content.hashtags.join(' ') : '#viral #content #success'}
                              </div>
                              {content.reasoning && (
                                <div className="text-xs text-blue-400 mt-2 italic">
                                  💡 {content.reasoning}
                                </div>
                              )}
                              
                              {/* Generated Viral Script Display */}
                              {generatedScripts[contentId] && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <h5 className="text-sm font-medium text-white">✨ 30-Second Viral Script</h5>
                                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                        {generatedScripts[contentId].viralScore}% Viral Score
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => copyToClipboardSafe(generatedScripts[contentId].content)}
                                      className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500/30"
                                    >
                                      📋 Copy Script
                                    </button>
                                  </div>
                                  
                                  {/* Video Timeline */}
                                  {generatedScripts[contentId].timeline && (
                                    <div className="mb-3">
                                      <h6 className="text-xs font-medium text-purple-300 mb-2">🎬 30-Second Video Timeline with Visual Cues</h6>
                                      <div className="space-y-2">
                                        {Object.entries(generatedScripts[contentId].timeline).map(([time, description]) => {
                                          // Parse the description to extract script and visual cues
                                          const [scriptPart, visualPart] = description.split(' → ');
                                          const [keyword1, keyword2] = visualPart ? visualPart.split(' / ') : ['', ''];
                                          
                                          return (
                                            <div key={time} className="bg-black/10 rounded-lg p-2 border border-purple-500/10">
                                              <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-purple-400 font-mono bg-purple-500/20 px-2 py-1 rounded text-xs font-bold">
                                                  {time}
                                                </span>
                                                {time === '0-3s' && (
                                                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                                    HOOK
                                                  </span>
                                                )}
                                                {time === '28-30s' && (
                                                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                                    LOOP
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-gray-300 mb-1 leading-relaxed">
                                                "{scriptPart}"
                                              </div>
                                              {keyword1 && keyword2 && (
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-xs text-purple-300">Visual:</span>
                                                  <span className="text-xs bg-purple-500/10 text-purple-200 px-2 py-1 rounded">
                                                    {keyword1}
                                                  </span>
                                                  <span className="text-xs text-gray-400">/</span>
                                                  <span className="text-xs bg-purple-500/10 text-purple-200 px-2 py-1 rounded">
                                                    {keyword2}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Full Script */}
                                  <div className="mb-3">
                                    <h6 className="text-xs font-medium text-purple-300 mb-2">📝 Complete Script</h6>
                                    <div className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded border border-purple-500/10">
                                      {generatedScripts[contentId].content}
                                    </div>
                                  </div>
                                  
                                  {/* Improvements */}
                                  {generatedScripts[contentId].improvements && generatedScripts[contentId].improvements.length > 0 && (
                                    <div>
                                      <h6 className="text-xs font-medium text-purple-300 mb-2">🚀 Optimizations Applied</h6>
                                      <ul className="text-xs text-gray-400 space-y-1">
                                        {generatedScripts[contentId].improvements.map((improvement, idx) => (
                                          <li key={idx} className="flex items-start space-x-1">
                                            <span className="text-purple-400">•</span>
                                            <span>{improvement}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Viral Predictor Tab */}
                {viralAnalysisTab === 'predict' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Viral Potential Predictor</h3>
                      <p className="text-gray-400">Predict how viral your content will be before posting</p>
                </div>

                <div className="space-y-4">
                      <textarea
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        placeholder="Paste your content here to predict its viral potential..."
                        className="w-full h-32 bg-white/10 text-white rounded-lg p-4 border border-white/20 placeholder-gray-400"
                      />
                      
                      <div className="flex items-center space-x-4">
                        <select 
                          value={selectedNiche} 
                          onChange={(e) => setSelectedNiche(e.target.value)}
                          className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
                        >
                          <option value="business">Business</option>
                          <option value="motivation">Motivation</option>
                          <option value="fitness">Fitness</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="education">Education</option>
                        </select>
                        <button
                          onClick={predictViral}
                          disabled={!contentInput.trim()}
                          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                        >
                          🔮 Predict Viral
                        </button>
                      </div>
                    </div>
                    
                    {viralPrediction && (
                      <div className="bg-white/5 rounded-lg p-6">
                        <h4 className="text-white font-medium mb-4">🎯 Viral Prediction Results</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.viralProbability}%</div>
                            <div className="text-sm text-gray-400">Viral Chance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.expectedEngagement}%</div>
                            <div className="text-sm text-gray-400">Expected Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{formatNumber(viralPrediction.prediction.expectedViews)}</div>
                            <div className="text-sm text-gray-400">Expected Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{viralPrediction.prediction.confidence}%</div>
                            <div className="text-sm text-gray-400">Confidence</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="text-white font-medium">💡 Recommendations:</h5>
                          {viralPrediction.recommendations.immediate.map((rec: string, idx: number) => (
                            <div key={idx} className="text-sm text-gray-300">• {rec}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Variations Tab */}
                {viralAnalysisTab === 'variations' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Content Variations Generator</h3>
                      <p className="text-gray-400">Create multiple viral variations from one winning post</p>
                    </div>
                    
                    <div className="space-y-4">
                      <textarea
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        placeholder="Paste content to create variations from..."
                        className="w-full h-32 bg-white/10 text-white rounded-lg p-4 border border-white/20 placeholder-gray-400"
                      />
                      
                      <button
                        onClick={createVariations}
                        disabled={!contentInput.trim()}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                      >
                        🎨 Create Variations
                      </button>
                    </div>
                    
                    {contentVariations.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">🔄 Content Variations:</h4>
                        {contentVariations.slice(0, 5).map((variation: any, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-white font-medium">{variation.variationType.replace('_', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-white">{variation.viralPrediction}% viral</span>
                                <button
                                  onClick={() => copyToClipboard(variation.caption, 'variation')}
                                  className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{variation.hook}</p>
                            <div className="text-xs text-gray-400">{variation.adaptationStrategy}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Insights Tab */}
                {viralAnalysisTab === 'insights' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Viral Insights & Trends</h3>
                      <p className="text-gray-400">Get insights from viral content database</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">🔥 Trending Patterns</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>• Question hooks (15.2% avg engagement)</div>
                          <div>• Number-based content (12.8% avg)</div>
                          <div>• Controversial takes (18.7% avg)</div>
                          <div>• Story hooks (14.3% avg)</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">📊 Performance Benchmarks</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>Business: 8.5% avg engagement</div>
                          <div>Motivation: 11.2% avg engagement</div>
                          <div>Fitness: 9.8% avg engagement</div>
                          <div>Lifestyle: 7.3% avg engagement</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">⏰ Optimal Posting Times</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>Monday: 9-11 AM, 5-7 PM</div>
                          <div>Tuesday: 9 AM-1 PM, 6-8 PM</div>
                          <div>Wednesday: 10 AM-2 PM, 8-10 PM</div>
                          <div>Weekend: 11 AM-3 PM, 8-10 PM</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">💡 Quick Tips</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>• Use 5-8 hashtags maximum</div>
                          <div>• Questions boost engagement 15%</div>
                          <div>• 80-150 words = optimal length</div>
                          <div>• Personal stories perform 2x better</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            </>
          )}

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Built with AI-powered content analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


