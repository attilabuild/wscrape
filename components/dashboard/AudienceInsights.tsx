'use client';

interface AudienceInsightsProps {
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
}

export default function AudienceInsights({ audienceInsights }: AudienceInsightsProps) {
  const audienceTypes = [
    { key: 'earlyAdopters', label: 'Early Adopters', color: 'bg-blue-500' },
    { key: 'heavyConsumers', label: 'Heavy Consumers', color: 'bg-green-500' },
    { key: 'socialSharers', label: 'Social Sharers', color: 'bg-purple-500' },
    { key: 'purchaseInfluencers', label: 'Purchase Influencers', color: 'bg-orange-500' },
    { key: 'communityBuilders', label: 'Community Builders', color: 'bg-pink-500' },
    { key: 'bingeWatchers', label: 'Binge Watchers', color: 'bg-red-500' },
    { key: 'trendFollowers', label: 'Trend Followers', color: 'bg-yellow-500' },
    { key: 'loyalSubscribers', label: 'Loyal Subscribers', color: 'bg-indigo-500' }
  ];

  const getDifferenceType = (channel: number, video: number) => {
    const diff = video - channel;
    if (Math.abs(diff) <= 5) return 'similar';
    if (diff > 10) return 'major';
    if (diff > 5) return 'notable';
    return 'similar';
  };

  const getDifferenceColor = (type: string) => {
    switch (type) {
      case 'major': return 'text-red-400';
      case 'notable': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getDifferenceText = (type: string) => {
    switch (type) {
      case 'major': return 'Major difference';
      case 'notable': return 'Notable difference';
      default: return 'Similar';
    }
  };

  return (
    <div className="space-y-8">
      {/* Primary Audience Info */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium mb-4">Primary Audience</h4>
          <p className="text-gray-400 mb-4">{audienceInsights.primaryAudience}</p>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Age Range: </span>
              <span className="text-gray-400">{audienceInsights.ageRange}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Engagement Level: </span>
              <span className="text-gray-400">{audienceInsights.engagementLevel}</span>
            </div>
          </div>

          <div className="mt-6">
            <h5 className="font-medium mb-3">Key Interests</h5>
            <div className="flex flex-wrap gap-2">
              {audienceInsights.keyInterests.map((interest, index) => (
                <span key={index} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-4">Active Platforms</h4>
          <div className="space-y-3">
            {audienceInsights.activePlatforms.map((platform, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Breakdown Chart */}
      <div className="bg-white/5 rounded-lg p-6">
        <h4 className="text-lg font-medium mb-6">Detailed Audience Breakdown</h4>
        <div className="space-y-4">
          {audienceTypes.map(({ key, label, color }) => {
            const values = audienceInsights.audienceBreakdown[key as keyof typeof audienceInsights.audienceBreakdown];
            const differenceType = getDifferenceType(values.channel, values.video);
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className={`text-xs ${getDifferenceColor(differenceType)}`}>
                    {getDifferenceText(differenceType)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {/* Channel Bar */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 w-16">Channel</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${values.channel}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 w-8">{values.channel}%</span>
                  </div>
                  
                  {/* Video Bar */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 w-16">Video</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${values.video}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 w-8">{values.video}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audience Insights Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Top Audience Type</h5>
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {audienceTypes.reduce((max, type) => {
              const values = audienceInsights.audienceBreakdown[type.key as keyof typeof audienceInsights.audienceBreakdown];
              const maxValues = audienceInsights.audienceBreakdown[max.key as keyof typeof audienceInsights.audienceBreakdown];
              return values.video > maxValues.video ? type : max;
            }).label}
          </div>
          <div className="text-sm text-gray-400">
            {Math.max(...Object.values(audienceInsights.audienceBreakdown).map(v => v.video))}% of video audience
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Engagement Quality</h5>
          <div className="text-2xl font-bold text-green-400 mb-1">High</div>
          <div className="text-sm text-gray-400">
            Strong community engagement
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Growth Potential</h5>
          <div className="text-2xl font-bold text-purple-400 mb-1">Medium</div>
          <div className="text-sm text-gray-400">
            Steady audience growth expected
          </div>
        </div>
      </div>
    </div>
  );
}
