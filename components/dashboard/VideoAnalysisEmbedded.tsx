'use client';

import { useState, useEffect } from 'react';
import PerformanceChart from './PerformanceChart';
import AudienceInsights from './AudienceInsights';
import CompetitorAnalysis from './CompetitorAnalysis';
import VideoPreview from './VideoPreview';

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

export default function VideoAnalysisEmbedded() {
  const [videoUrl, setVideoUrl] = useState('');
  const [analysisData, setAnalysisData] = useState<VideoAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/video-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Video Analysis Tool</h2>
        <p className="text-gray-400 text-lg">
          Analyze viral content performance, audience insights, and competitor data
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex gap-4">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter video URL (YouTube, TikTok, Instagram, etc.)"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
          <button
            onClick={analyzeVideo}
            disabled={loading}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </div>
        {error && (
          <p className="text-red-400 mt-2">{error}</p>
        )}
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-8">
          {/* Video Preview Section */}
          <VideoPreview
            title={analysisData.title}
            creator={analysisData.creator}
            platform={analysisData.platform}
            duration={analysisData.duration}
            views={analysisData.views}
            likes={analysisData.likes}
            comments={analysisData.comments}
            shares={analysisData.shares}
            videoUrl={videoUrl}
          />

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">{analysisData.engagementRate}%</div>
              <div className="text-sm text-gray-400">Above average performance</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Views per Day</h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">{formatNumber(analysisData.viewsPerDay)}/day</div>
              <div className="text-sm text-gray-400">Strong daily growth</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Likes per View</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">{analysisData.likesPerView}%</div>
              <div className="text-sm text-gray-400">High engagement quality</div>
            </div>
          </div>

          {/* 48-Hour Performance Chart */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">48-Hour Performance</h3>
            <PerformanceChart 
              data={analysisData.performance48h.hourlyData}
              totalViews={analysisData.performance48h.totalViews}
              hourlyAverage={analysisData.performance48h.hourlyAverage}
            />
          </div>

          {/* Audience Insights */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Audience Insights</h3>
            <AudienceInsights audienceInsights={analysisData.audienceInsights} />
          </div>

          {/* Competitors & Niche Analysis */}
          <CompetitorAnalysis 
            competitors={analysisData.competitors}
            nicheAnalysis={analysisData.nicheAnalysis}
          />

          {/* Content Analysis */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Content Analysis</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">{analysisData.contentAnalysis.titleLength.score}%</div>
                <div className="text-sm text-gray-400 mb-1">Title Length</div>
                <div className="text-xs text-gray-500">{analysisData.contentAnalysis.titleLength.value} characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">{analysisData.contentAnalysis.titleWordCount.score}%</div>
                <div className="text-sm text-gray-400 mb-1">Title Word Count</div>
                <div className="text-xs text-gray-500">{analysisData.contentAnalysis.titleWordCount.value} words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">{analysisData.contentAnalysis.platformOptimization.score}%</div>
                <div className="text-sm text-gray-400 mb-1">Platform Optimization</div>
                <div className="text-xs text-gray-500">{analysisData.contentAnalysis.platformOptimization.value}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">-</div>
                <div className="text-sm text-gray-400 mb-1">Thumbnail Status</div>
                <div className="text-xs text-gray-500">{analysisData.contentAnalysis.thumbnailStatus}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setVideoUrl('');
                setAnalysisData(null);
                setError('');
              }}
              className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Analyze Another
            </button>
            <button className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysisData && !loading && (
        <div className="text-center py-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <svg className="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Video Analysis</h3>
              <p className="text-gray-400 mb-6">
                Get comprehensive insights into video performance, audience demographics, 
                engagement metrics, and competitor analysis.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Performance metrics and engagement analysis</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Audience insights and demographics</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Competitor analysis and market research</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Content optimization recommendations</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">
              Enter a video URL above to get started with your analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


