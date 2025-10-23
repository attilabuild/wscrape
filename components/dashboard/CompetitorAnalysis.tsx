'use client';

interface Competitor {
  name: string;
  handle: string;
  subscribers: string;
  avgViews: string;
  description: string;
  strength: string;
}

interface CompetitorAnalysisProps {
  competitors: Competitor[];
  nicheAnalysis: {
    marketDescription: string;
    marketSize: string;
    competition: string;
    opportunities: string[];
    threats: string[];
  };
}

export default function CompetitorAnalysis({ competitors, nicheAnalysis }: CompetitorAnalysisProps) {
  const getCompetitorRank = (index: number) => {
    const ranks = ['#1', '#2', '#3', '#4', '#5'];
    return ranks[index] || `#${index + 1}`;
  };

  const getMarketSizeColor = (size: string) => {
    switch (size.toLowerCase()) {
      case 'large': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'small': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCompetitionLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Niche Analysis */}
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Niche Analysis</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4">Market Overview</h4>
            <p className="text-gray-400 mb-6">{nicheAnalysis.marketDescription}</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Size</span>
                <span className={`text-sm font-semibold ${getMarketSizeColor(nicheAnalysis.marketSize)}`}>
                  {nicheAnalysis.marketSize}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Competition Level</span>
                <span className={`text-sm font-semibold ${getCompetitionLevel(nicheAnalysis.competition)}`}>
                  {nicheAnalysis.competition}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Market Opportunities</h4>
            <div className="space-y-3">
              {nicheAnalysis.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">{opportunity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-lg font-medium mb-4">Market Threats</h4>
          <div className="space-y-3">
            {nicheAnalysis.threats.map((threat, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-300">{threat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitors List */}
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Top Competitors in Niche</h3>
        
        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">{getCompetitorRank(index)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{competitor.name}</div>
                    <div className="text-sm text-gray-400">{competitor.handle}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white">{competitor.subscribers}</div>
                  <div className="text-sm text-gray-400">{competitor.avgViews}</div>
                </div>
              </div>
              
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Description</div>
                  <div className="text-sm text-gray-300">{competitor.description}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Key Strength</div>
                  <div className="text-sm text-blue-400">{competitor.strength}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Market Leader</h5>
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {competitors[0]?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-400">
            {competitors[0]?.subscribers || 'N/A'} subscribers
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Average Views</h5>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {competitors.length > 0 ? 
              competitors.reduce((acc, comp) => {
                const views = comp.avgViews.match(/(\d+(?:\.\d+)?)/)?.[1];
                return acc + (views ? parseFloat(views) : 0);
              }, 0) / competitors.length : 0
            }M
          </div>
          <div className="text-sm text-gray-400">
            Across top competitors
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="font-medium mb-2">Market Saturation</h5>
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {nicheAnalysis.competition}
          </div>
          <div className="text-sm text-gray-400">
            Competition level
          </div>
        </div>
      </div>
    </div>
  );
}
