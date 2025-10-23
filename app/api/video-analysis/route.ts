import { NextRequest, NextResponse } from 'next/server';

interface VideoAnalysisData {
  videoId: string;
  title: string;
  creator: string;
  platform: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  viewsPerDay: number;
  likesPerView: number;
  performance48h: {
    totalViews: number;
    hourlyAverage: number;
    hourlyData: Array<{
      hour: string;
      views: number;
      revenue: number;
    }>;
  };
  audienceInsights: {
    primaryAudience: string;
    ageRange: string;
    engagementLevel: string;
    keyInterests: string[];
    activePlatforms: string[];
    audienceBreakdown: {
      earlyAdopters: { channel: number; video: number };
      heavyConsumers: { channel: number; video: number };
      socialSharers: { channel: number; video: number };
      purchaseInfluencers: { channel: number; video: number };
      communityBuilders: { channel: number; video: number };
      bingeWatchers: { channel: number; video: number };
      trendFollowers: { channel: number; video: number };
      loyalSubscribers: { channel: number; video: number };
    };
  };
  competitors: Array<{
    name: string;
    handle: string;
    subscribers: string;
    avgViews: string;
    description: string;
    strength: string;
  }>;
  nicheAnalysis: {
    marketDescription: string;
    marketSize: string;
    competition: string;
    opportunities: string[];
    threats: string[];
  };
  contentAnalysis: {
    titleLength: { score: number; value: number };
    titleWordCount: { score: number; value: number };
    platformOptimization: { score: number; value: string };
    thumbnailStatus: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Simulate video analysis with realistic data
    const analysisData: VideoAnalysisData = {
      videoId: 'sample-video-123',
      title: 'Viral Content Analysis - Sample Video',
      creator: '@contentcreator',
      platform: 'YouTube',
      duration: '5:00',
      views: 50000,
      likes: 1200,
      comments: 150,
      shares: 75,
      engagementRate: 13.3,
      viewsPerDay: 25000,
      likesPerView: 2.4,
      performance48h: {
        totalViews: 48354,
        hourlyAverage: 1007,
        hourlyData: generateHourlyData()
      },
      audienceInsights: {
        primaryAudience: 'Content creators, marketers, and viewers interested in understanding online trends.',
        ageRange: '18-44',
        engagementLevel: 'Medium - Comments and discussions related to the analysis.',
        keyInterests: ['Marketing', 'Social Media', 'YouTube', 'Content Creation', 'Data Analytics', 'Online Trends'],
        activePlatforms: ['YouTube', 'Twitter', 'LinkedIn', 'Reddit'],
        audienceBreakdown: {
          earlyAdopters: { channel: 50, video: 70 },
          heavyConsumers: { channel: 65, video: 75 },
          socialSharers: { channel: 40, video: 55 },
          purchaseInfluencers: { channel: 35, video: 40 },
          communityBuilders: { channel: 30, video: 35 },
          bingeWatchers: { channel: 60, video: 65 },
          trendFollowers: { channel: 55, video: 60 },
          loyalSubscribers: { channel: 75, video: 65 }
        }
      },
      competitors: [
        {
          name: 'MrBeast',
          handle: '@MrBeast',
          subscribers: '250M',
          avgViews: '75M avg views',
          description: 'High-budget challenges and philanthropic stunts',
          strength: 'Massive reach and viral content creation'
        },
        {
          name: 'Dude Perfect',
          handle: '@DudePerfect',
          subscribers: '60M',
          avgViews: '20M avg views',
          description: 'Trick shots and sports-related challenges',
          strength: 'Family-friendly content and consistent uploads'
        },
        {
          name: 'Airrack',
          handle: '@Airrack',
          subscribers: '15M',
          avgViews: '5M avg views',
          description: 'Ambitious and unconventional challenges',
          strength: 'Unique concepts and engaging storytelling'
        },
        {
          name: 'Yes Theory',
          handle: '@YesTheory',
          subscribers: '9M',
          avgViews: '3M avg views',
          description: 'Adventure and self-discovery videos',
          strength: 'Authentic and inspiring content'
        },
        {
          name: 'Unspeakable',
          handle: '@Unspeakable',
          subscribers: '20M',
          avgViews: '10M avg views',
          description: 'Minecraft-focused challenges and gameplay',
          strength: 'Strong appeal to younger audiences'
        }
      ],
      nicheAnalysis: {
        marketDescription: 'Viral content analysis focuses on dissecting elements that make videos successful, often involving reverse engineering or commentary on trending videos.',
        marketSize: 'Medium',
        competition: 'Medium',
        opportunities: [
          'Partnering with creators for analysis',
          'Developing tools for content analysis',
          'Offering consulting services'
        ],
        threats: [
          'Algorithm changes impacting video visibility',
          'Copyright issues related to analyzing other creators\' content',
          'Saturation of analysis content'
        ]
      },
      contentAnalysis: {
        titleLength: { score: 8.1, value: 37 },
        titleWordCount: { score: 8.6, value: 6 },
        platformOptimization: { score: 11.1, value: 'Good' },
        thumbnailStatus: 'Not Available'
      }
    };

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Video analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze video' }, { status: 500 });
  }
}

function generateHourlyData() {
  const data = [];
  const startDate = new Date();
  startDate.setHours(22, 0, 0, 0); // Start at 10pm
  
  for (let i = 0; i < 48; i++) {
    const hour = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    const views = Math.floor(Math.random() * 2000) + 500;
    const revenue = Math.floor(views * 0.01 * Math.random() * 10);
    
    data.push({
      hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      views,
      revenue
    });
  }
  
  return data;
}
