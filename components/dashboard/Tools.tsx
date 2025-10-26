'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentGrid from './ContentGrid';

interface ToolsProps {
  dashboardSubPage: 'scrape' | 'generate' | 'predict' | 'templates' | 'comments' | 'ai-assistant';
  // Scraping props
  username: string;
  setUsername: (username: string) => void;
  videoCount: number;
  setVideoCount: (count: number) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  isLoading: boolean;
  error: string | null;
  progress: number;
  handleSubmit: (e: React.FormEvent) => void;
  // Results props
  showResults: boolean;
  videos: any[];
  lastScrapedUser: string;
  aiAnalysisLoading: boolean;
  aiAnalysisResults: any;
  runAIAnalysis: () => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  formatNumber: (num: number) => string;
  formatDate: (date: string) => string;
  copyToClipboard: (text: string, type: string) => void;
  // Generation props
  selectedNiche: string;
  setSelectedNiche: (niche: string) => void;
  contentQuantity: number;
  setContentQuantity: (quantity: number) => void;
  generateAIContent: () => void;
  generatingContent: boolean;
  generatedContent: any[];
  generateViralScript: (content: any) => void;
  generatingScript: string | null;
  generatedScripts: {[key: string]: any};
  // Prediction props
  contentInput: string;
  setContentInput: (input: string) => void;
  predictViral: () => void;
  viralPrediction: any;
  // Profile props
  userProfile?: any;
  userSavedContent?: any[];
  setActiveTab?: (tab: string) => void;
}

export default function Tools({ 
  dashboardSubPage,
  // Scraping props
  username, setUsername, videoCount, setVideoCount, 
  selectedPlatform, setSelectedPlatform, isLoading, error, progress, handleSubmit,
  // Results props
  showResults, videos, lastScrapedUser, aiAnalysisLoading, aiAnalysisResults,
  runAIAnalysis, exportToCSV, exportToJSON, formatNumber, formatDate, copyToClipboard,
  // Generation props
  selectedNiche, setSelectedNiche, contentQuantity, setContentQuantity,
  generateAIContent, generatingContent, generatedContent, generateViralScript,
  generatingScript, generatedScripts,
  // Prediction props
  contentInput, setContentInput, predictViral, viralPrediction,
  // Profile props
  userProfile, userSavedContent, setActiveTab
}: ToolsProps) {
  const router = useRouter();
  
  // Comments state
  const [scrapedComments, setScrapedComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [lastScrapedPost, setLastScrapedPost] = useState('');
  const [commentAnalysis, setCommentAnalysis] = useState<any>(null);
  const [analyzingComments, setAnalyzingComments] = useState(false);
  
  // AI suggestions loading state
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<any[]>([]);

  return (
    <div className="space-y-8">
      {/* Scrape Content */}
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

          {/* Results Section */}
          {showResults && (
            <div className="border border-white/10 rounded-lg p-8 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Content Analysis Results</h2>
                <p className="text-gray-400 mb-6">{videos.length} videos from @{lastScrapedUser}</p>
                <div className="flex justify-center space-x-4">
                  {aiAnalysisLoading && (
                    <div className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 text-gray-300">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  )}
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

              {/* Scraped Content Grid */}
              <ContentGrid
                content={videos.map((video: any) => ({
                  id: video.id,
                  username: lastScrapedUser,
                  hook: video.hook,
                  caption: video.caption,
                  transcript: video.transcript,
                  views: video.views,
                  likes: video.likes,
                  comments: video.comments,
                  shares: video.shares,
                  engagementRate: video.likes && video.views ? ((video.likes / video.views) * 100) : 0,
                  uploadDate: video.uploadDate,
                  contentType: selectedPlatform,
                  postUrl: video.postUrl,
                  thumbnail: '',
                  viralScore: Math.round(Math.random() * 100), // You might want to calculate afproperly
                  hashtags: video.hashtags || [],
                  mentions: video.mentions || []
                }))}
                contentLoading={false}
                copyToClipboard={copyToClipboard}
                formatNumber={formatNumber}
                formatDate={formatDate}
                isGeneratedContent={false}
                emptyStateTitle="No Videos Found"
                emptyStateDescription={`No recent videos found for @${lastScrapedUser} on ${selectedPlatform}. Try a different handle or switch platform.`}
                onSaveContent={async (content) => {
                  console.log('Save content clicked!', content);
                  try {
                    const { data: { user }, error: authError } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                    if (!user) {
                      alert('Please log in to save content');
                      return;
                    }
                    console.log('User authenticated:', user.id);

                    // Get the auth token
                    const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
                    const token = session?.access_token;

                    if (!token) {
                      alert('Please log in to save content');
                      return;
                    }
                    console.log('Token retrieved');

                    // Use the content API endpoint with auth
                    console.log('Saving content to API...');
                    const response = await fetch('/api/content', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        action: 'add',
                        payload: {
                          hook: content.hook,
                          caption: content.caption || content.fullContent,
                          transcript: content.transcript || content.caption || content.hook,
                          username: content.username || lastScrapedUser,
                          contentType: content.contentType || selectedPlatform,
                          views: content.views || 0,
                          likes: content.likes || 0,
                          engagementRate: content.engagementRate || 0,
                          postUrl: content.postUrl,
                          hashtags: content.hashtags || []
                        }
                      })
                    });

                    console.log('API response:', response.status);
                    if (!response.ok) {
                      const errorData = await response.json();
                      console.error('API error:', errorData);
                      throw new Error(errorData.error || 'Failed to save content');
                    }
                    
                    console.log('Content saved successfully!');
                    alert('✅ Content saved to library! Go to Contents tab to view it.');
                  } catch (error: any) {
                    console.error('Save content error:', error);
                    alert('❌ Failed to save content: ' + (error.message || 'Unknown error'));
                  }
                }}
              />

              {/* AI Analysis Section */}
              <div className="mt-8 border border-white/10 rounded-lg p-6 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">🤖 AI Content Analysis</h3>
                    <p className="text-gray-400 text-sm">Analyze what works and what doesn't</p>
            </div>
                  <button
                    onClick={async () => {
                      if (aiAnalysisLoading) return;
                      runAIAnalysis();
                    }}
                    disabled={aiAnalysisLoading}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {aiAnalysisLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      '🔍 Analyze Content'
                    )}
                  </button>
                </div>

                {/* Analysis Results */}
                {aiAnalysisResults && (
                  <div className="space-y-6 mt-6">
                    {/* Brief Analysis Summary */}
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">📊 Content Analysis</h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* What's Working */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-2xl">✅</span>
                            <h5 className="text-green-400 font-semibold">What's Working</h5>
                          </div>
                          <ul className="space-y-2">
                            {/* Top performing content */}
                            {videos && videos.length > 0 && (
                              <>
                                {videos
                                  .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                                  .slice(0, 3)
                                  .map((item: any, idx: number) => {
                                    const engagement = item.views > 0 ? ((item.likes / item.views) * 100) : 0;
                                    return (
                                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                                        <span className="text-green-400 mr-2">•</span>
                                        <span>
                                          <strong>{item.hook?.substring(0, 50) || 'Video'}...</strong>
                                          <br />
                                          {formatNumber(item.views)} views, {engagement.toFixed(1)}% engagement
                                        </span>
                                      </li>
                                    );
                                  })}
                              </>
                            )}
                            {/* Insights strengths */}
                            {(aiAnalysisResults.performanceAnalysis?.whatsWorking?.length > 0 || aiAnalysisResults.contentStrategy?.strengths?.length > 0) ? (
                              (aiAnalysisResults.performanceAnalysis?.whatsWorking || aiAnalysisResults.contentStrategy?.strengths || []).slice(0, 2).map((strength: string, idx: number) => (
                                <li key={`strength-${idx}`} className="text-sm text-gray-300 flex items-start">
                                  <span className="text-green-400 mr-2">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))
                            ) : (
                              <>
                                <li className="text-sm text-gray-300 flex items-start">
                                  <span className="text-green-400 mr-2">•</span>
                                  <span>High engagement rates across multiple posts</span>
                                </li>
                                <li className="text-sm text-gray-300 flex items-start">
                                  <span className="text-green-400 mr-2">•</span>
                                  <span>Consistent posting frequency builds audience trust</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        {/* What to Improve */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-2xl">⚠️</span>
                            <h5 className="text-yellow-400 font-semibold">What to Improve</h5>
                          </div>
                          <ul className="space-y-2">
                            {/* Show AI insights if available */}
                            {(aiAnalysisResults.performanceAnalysis?.whatsFailing?.length > 0 || aiAnalysisResults.contentStrategy?.weaknesses?.length > 0) ? (
                              <>
                                {(aiAnalysisResults.performanceAnalysis?.whatsFailing || aiAnalysisResults.contentStrategy?.weaknesses || []).slice(0, 2).map((weakness: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-300 flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    <span>{weakness}</span>
                                  </li>
                                ))}
                                {(aiAnalysisResults.contentStrategy?.opportunities || []).slice(0, 1).map((opp: string, idx: number) => (
                                  <li key={`opp-${idx}`} className="text-sm text-gray-300 flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    <span>{opp}</span>
                                  </li>
                                ))}
                              </>
                            ) : (
                              <>
                                {/* Data-driven suggestions based on actual content */}
                                {videos && videos.length > 0 && (() => {
                                  // Calculate average engagement
                                  const avgEngagement = videos.reduce((sum: number, v: any) => 
                                    sum + (v.views > 0 ? (v.likes / v.views) * 100 : 0), 0) / videos.length;
                                  
                                  // Find low performers (below 50% of average)
                                  const lowPerformers = videos.filter((v: any) => {
                                    const engagement = v.views > 0 ? (v.likes / v.views) * 100 : 0;
                                    return engagement < avgEngagement * 0.5;
                                  });
                                  
                                  // Find patterns
                                  const shortCaptions = videos.filter((v: any) => (v.caption || v.hook || '').length < 50);
                                  const longCaptions = videos.filter((v: any) => (v.caption || v.hook || '').length > 200);
                                  
                                  const suggestions = [];
                                  
                                  if (lowPerformers.length > videos.length * 0.3) {
                                    suggestions.push(`${lowPerformers.length} posts have low engagement - analyze what made them underperform`);
                                  }
                                  
                                  if (avgEngagement < 8) {
                                    suggestions.push(`Average engagement is ${avgEngagement.toFixed(1)}% - add stronger hooks and CTAs to boost interaction`);
                                  }
                                  
                                  const sortedByViews = [...videos].sort((a: any, b: any) => b.views - a.views);
                                  const topViewsAvg = sortedByViews.slice(0, 3).reduce((sum: number, v: any) => sum + v.views, 0) / 3;
                                  const bottomViewsAvg = sortedByViews.slice(-3).reduce((sum: number, v: any) => sum + v.views, 0) / 3;
                                  
                                  if (topViewsAvg > bottomViewsAvg * 5) {
                                    suggestions.push('Large variance in views - double down on topics similar to top performers');
                                  }
                                  
                                  if (shortCaptions.length > videos.length * 0.6) {
                                    suggestions.push('Most captions are very short - try adding more context and storytelling');
                                  }
                                  
                                  return suggestions.slice(0, 3).map((suggestion: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                                      <span className="text-yellow-400 mr-2">•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ));
                                })()}
                              </>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      {aiAnalysisResults.performanceMetrics && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {aiAnalysisResults.performanceMetrics.avgViews && aiAnalysisResults.performanceMetrics.avgViews > 0 ? formatNumber(aiAnalysisResults.performanceMetrics.avgViews) : '?'}
                              </div>
                              <div className="text-xs text-gray-400">Avg Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {(aiAnalysisResults.performanceMetrics.avgEngagement || 0).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-400">Avg Engagement</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {aiAnalysisResults.performanceMetrics.viralRate || 0}%
                              </div>
                              <div className="text-xs text-gray-400">Viral Rate</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Generate Similar Ideas Button */}
                    {generatedSuggestions.length === 0 && (
                      <div className="text-center">
                        <button
                          onClick={async () => {
                            // Trigger content suggestions generation
                            try {
                              setGeneratingSuggestions(true);
                              const response = await fetch('/api/ai-analysis', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'generate_suggestions',
                                  payload: {
                                    niche: userProfile?.niche || 'business',
                                    targetAudience: userProfile?.targetAudience || 'general audience',
                                    contentStyle: 'viral and engaging',
                                    competitorData: videos,
                                    count: 5,
                                    profileContext: userProfile,
                                    savedContent: userSavedContent || []
                                  }
                                })
                              });
                              const data = await response.json();
                              
                              // Update generated suggestions
                              if (data.success && data.data?.suggestions) {
                                setGeneratedSuggestions(data.data.suggestions);
                              } else {
                                alert('Failed to generate content ideas. Please try again.');
                              }
                            } catch (error) {
                              alert('Failed to generate content ideas');
                            } finally {
                              setGeneratingSuggestions(false);
                            }
                          }}
                          disabled={generatingSuggestions}
                          className="px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingSuggestions ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                              <span>Generating Ideas...</span>
                            </div>
                          ) : (
                            '✨ Generate Similar Content Ideas'
                          )}
                        </button>
                      </div>
                    )}

                    {/* AI-Generated Content Ideas */}
                    {generatedSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">💡 AI-Generated Content Ideas (Based on @{lastScrapedUser})</h4>
                        <ContentGrid
                          content={generatedSuggestions.map((suggestion: any, idx: number) => ({
                            id: `ai-suggestion-${idx}`,
                            hook: suggestion.hook,
                            caption: suggestion.fullContent,
                            fullContent: suggestion.fullContent,
                            viralScore: suggestion.expectedEngagement || 75,
                            contentType: 'ai-generated',
                            hashtags: suggestion.hashtags || [],
                            reasoning: suggestion.reasoning || `Based on @${lastScrapedUser}'s viral patterns`
                          }))}
                          contentLoading={false}
                          copyToClipboard={copyToClipboard}
                          formatNumber={formatNumber}
                          formatDate={formatDate}
                          isGeneratedContent={true}
                          emptyStateTitle="No Suggestions Generated"
                          emptyStateDescription="Run AI analysis to generate content suggestions."
                          onSaveContent={async (content) => {
                            try {
                              const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                              if (!user) {
                                alert('Please log in to save content');
                                return;
                              }

                              const { error } = await (await import('@/lib/supabase')).supabase
                                .from('contents')
                                .insert({
                                  user_id: user.id,
                                  username: 'AI Generated',
                                  caption: content.caption || content.fullContent,
                                  hook: content.hook,
                                  transcript: '',
                                  views: 0,
                                  likes: 0,
                                  engagement_rate: 0,
                                  content_type: 'generated',
                                  post_url: '',
                                  viral_score: content.viralScore || 0,
                                  hashtags: content.hashtags || [],
                                  platform: selectedPlatform
                                });

                              if (error) throw error;
                              alert('AI-generated content saved successfully!');
                            } catch (error) {
                              alert('Failed to save content');
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Generate Content */}
      {dashboardSubPage === 'generate' && (
        <>
          {/* AI Content Generation */}
          <div className="border border-white/10 rounded-lg p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">AI Content Generator</h2>
              <p className="text-gray-400">Generate viral content based on winning patterns</p>
            </div>

            {/* Profile Integration Notice */}
            {userProfile && (userProfile.name || userProfile.niche || userProfile.bio) ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <div>
                    <h4 className="text-green-300 font-medium">Profile-Powered Generation</h4>
                    <p className="text-green-400/80 text-sm">
                      AI will create personalized content based on your profile: 
                      {userProfile.name && ` ${userProfile.name}`}
                      {userProfile.niche && ` - ${userProfile.niche}`}
                      {userProfile.bio && ` - ${userProfile.bio.substring(0, 50)}...`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⚠️</span>
                  <div>
                      <h4 className="text-yellow-300 font-medium">Complete Your Profile</h4>
                      <p className="text-yellow-400/80 text-sm">
                        Add your name, niche, and bio in your profile to get better AI-generated content.
                      </p>
                    </div>
                  </div>
                  {setActiveTab && (
                      <button 
                      onClick={() => setActiveTab('profile')}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-500/30 transition-all"
                      >
                      Go to Profile
                      </button>
                  )}
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
                <option value="tech">Tech</option>
                <option value="finance">Finance</option>
                <option value="crypto">Crypto</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty</option>
                <option value="gaming">Gaming</option>
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
                <ContentGrid
                  content={generatedContent.map((content: any, idx: number) => ({
                    id: `generated-${idx}`,
                    hook: content.hook,
                    caption: content.fullContent,
                    fullContent: content.fullContent,
                    viralScore: content.expectedEngagement || content.viralPrediction || 65,
                    contentType: content.template || 'generated',
                    hashtags: Array.isArray(content.hashtags) ? content.hashtags : ['#viral', '#content', '#success'],
                    reasoning: content.reasoning
                  }))}
                  contentLoading={false}
                  copyToClipboard={copyToClipboard}
                  formatNumber={formatNumber}
                  formatDate={formatDate}
                  isGeneratedContent={true}
                  emptyStateTitle="No Content Generated"
                  emptyStateDescription="Generate some AI content ideas to get started."
                  onSaveContent={async (content) => {
                    try {
                      const { data: { user }, error: authError } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                      if (!user) {
                        alert('Please log in to save content');
                        return;
                      }

                      // Get the auth token
                      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
                      const token = session?.access_token;

                      if (!token) {
                        alert('Please log in to save content');
                        return;
                      }

                      // Use the content API endpoint with auth
                      const response = await fetch('/api/content', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          action: 'add',
                          payload: {
                            hook: content.hook,
                            caption: content.caption,
                            transcript: content.fullContent || content.caption,
                            username: 'ai_generated',
                            contentType: content.contentType || 'generated',
                            hashtags: Array.isArray(content.hashtags) ? content.hashtags : (content.hashtags || [])
                          }
                        })
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to save content');
                      }
                      
                      alert('✅ Content saved to library! Go to Contents tab to view it.');

                    } catch (error: any) {
                      console.error('Save content error:', error);
                      alert('❌ Failed to save content: ' + error.message);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Predict Viral */}
      {dashboardSubPage === 'predict' && (
        <div className="border border-white/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Viral Prediction</h2>
            <p className="text-gray-400">Predict the viral potential of your content</p>
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
                className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20"
              >
                <option value="business">Business</option>
                <option value="motivation">Motivation</option>
                <option value="fitness">Fitness</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="education">Education</option>
                <option value="tech">Tech</option>
                <option value="finance">Finance</option>
                <option value="crypto">Crypto</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty</option>
                <option value="gaming">Gaming</option>
              </select>
              
              <button
                onClick={predictViral}
                disabled={!contentInput.trim()}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                Predict Viral Potential
              </button>
            </div>

            {viralPrediction && (
              <div className="bg-white/5 rounded-lg p-6 mt-6">
                <h4 className="text-white font-medium mb-4">Viral Prediction Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{viralPrediction.prediction?.viralProbability || 0}%</div>
                    <div className="text-sm text-gray-400">Viral Chance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{viralPrediction.prediction?.expectedEngagement || 0}%</div>
                    <div className="text-sm text-gray-400">Expected Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{viralPrediction.prediction?.expectedViews && viralPrediction.prediction.expectedViews > 0 ? formatNumber(viralPrediction.prediction.expectedViews) : '?'}</div>
                    <div className="text-sm text-gray-400">Expected Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{viralPrediction.prediction?.confidenceScore || 0}%</div>
                    <div className="text-sm text-gray-400">Confidence</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Templates */}
      {dashboardSubPage === 'templates' && (
        <div className="border border-white/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Templates</h2>
            <p className="text-gray-400">Access viral templates quickly from the tools section</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'POV Template', hook: 'POV: You discover...', engagement: '94%' },
              { title: '3 Things Template', hook: '3 things that changed my...', engagement: '87%' },
              { title: 'Unpopular Opinion', hook: 'Unpopular opinion:', engagement: '91%' }
            ].map((template, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-2">{template.title}</h4>
                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="text-white font-medium">{template.hook}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm">{template.engagement} avg engagement</span>
                  <button className="bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrape Comments */}
      {dashboardSubPage === 'comments' && (
        <>
          {/* Comments Scraping Form */}
          <div className="border border-white/10 rounded-lg p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Scrape Instagram Comments</h2>
              <p className="text-gray-400">Extract comments from Instagram posts</p>
            </div>

            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const postUrl = formData.get('postUrl') as string;
              const count = formData.get('count') as string;
              
              setCommentsLoading(true);
              
              try {
                const response = await fetch('/api/scrape-comments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    postUrl,
                    platform: 'instagram',
                    count: parseInt(count)
                  })
                });
                
                const data = await response.json();
                
                if (data.success) {
                  setScrapedComments(data.comments);
                  setLastScrapedPost(postUrl);
                  alert(`Successfully scraped ${data.count} comments!`);
                } else {
                  alert(`Error: ${data.error}`);
                  setScrapedComments([]);
                }
              } catch (error) {
                alert('Failed to scrape comments');
                setScrapedComments([]);
              } finally {
                setCommentsLoading(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Post URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instagram Post URL *
                  </label>
                  <input
                    type="url"
                    name="postUrl"
                    required
                    placeholder="https://www.instagram.com/p/ABC123..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                  />
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 font-medium mb-1">ℹ️ Important:</p>
                    <p className="text-xs text-blue-200">
                      You need a <strong>direct post URL</strong>, not a profile URL.
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      ✅ Correct: <code className="bg-black/30 px-1 py-0.5 rounded">https://www.instagram.com/p/ABC123/</code>
                    </p>
                    <p className="text-xs text-blue-200">
                      ✅ Or: <code className="bg-black/30 px-1 py-0.5 rounded">https://www.instagram.com/reel/XYZ789/</code>
                    </p>
                    <p className="text-xs text-red-300 mt-1">
                      ❌ Wrong: <code className="bg-black/30 px-1 py-0.5 rounded">https://www.instagram.com/username/</code>
                    </p>
                </div>
                </div>

                {/* Comment Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Comments
                  </label>
                  <select name="count" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40">
                    <option value="50">50 Comments</option>
                    <option value="100">100 Comments</option>
                    <option value="250">250 Comments</option>
                    <option value="500">500 Comments</option>
                  </select>
                </div>

                {/* Platform - Fixed to Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform
                  </label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400">
                    Instagram (Only)
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all inline-flex items-center space-x-2"
                >
                  <span>📥</span>
                  <span>Scrape Comments</span>
                </button>
              </div>
            </form>
          </div>

          {/* Comments Results */}
          {scrapedComments.length > 0 && (
          <div className="border border-white/10 rounded-lg p-8">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Scraped Comments</h3>
                <p className="text-gray-400">{scrapedComments.length} comments from post</p>
                {lastScrapedPost && (
                  <a href={lastScrapedPost} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                    {lastScrapedPost}
                  </a>
                )}
            </div>

              {/* Comments List */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">💬 Comments ({scrapedComments.length})</h4>
                {scrapedComments.map((comment, idx) => (
                  <div key={comment.id || idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {comment.ownerProfilePicUrl && (
                          <img 
                            src={comment.ownerProfilePicUrl} 
                            alt={comment.ownerUsername}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium text-white">@{comment.ownerUsername}</span>
                        {comment.ownerIsVerified && (
                          <span className="text-blue-400">✓</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {comment.likesCount > 0 && (
                          <span className="text-sm text-gray-400">❤️ {comment.likesCount}</span>
                        )}
                      <button
                          onClick={() => copyToClipboard(comment.text, 'Comment')}
                        className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                    <p className="text-gray-300 text-sm">{comment.text}</p>
                    {comment.timestamp && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    )}
                </div>
              ))}
            </div>

            {/* AI Analysis Button */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={async () => {
                  setAnalyzingComments(true);
                  try {
                    const response = await fetch('/api/analyze-comments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ comments: scrapedComments })
                    });
                    const data = await response.json();
                    if (data.success) {
                      setCommentAnalysis(data.analysis);
                    }
                  } catch (error) {
                    alert('Failed to analyze comments');
                  } finally {
                    setAnalyzingComments(false);
                  }
                }}
                disabled={analyzingComments}
                className="w-full px-6 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
              >
                {analyzingComments ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Analyzing Comments...</span>
                  </div>
                ) : (
                  '🤖 Analyze Comments with AI'
                )}
              </button>

              {/* Analysis Results */}
              {commentAnalysis && (
                <div className="space-y-6 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">📊 Comment Analysis</h4>
                    
                    {/* Sentiment Overview */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-400 mb-3">Overall Sentiment</h5>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400">Positive: {commentAnalysis.sentiment?.positive || 0}%</span>
                            <span className="text-yellow-400">Neutral: {commentAnalysis.sentiment?.neutral || 0}%</span>
                            <span className="text-red-400">Negative: {commentAnalysis.sentiment?.negative || 0}%</span>
                          </div>
                          <div className="h-4 bg-black rounded-full overflow-hidden flex">
                            <div className="bg-green-500" style={{ width: `${commentAnalysis.sentiment?.positive || 0}%` }}></div>
                            <div className="bg-yellow-500" style={{ width: `${commentAnalysis.sentiment?.neutral || 0}%` }}></div>
                            <div className="bg-red-500" style={{ width: `${commentAnalysis.sentiment?.negative || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Themes */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-400 mb-3">Common Themes</h5>
                      <div className="flex flex-wrap gap-2">
                        {commentAnalysis.themes?.map((theme: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Comments */}
                    {commentAnalysis.topComments && commentAnalysis.topComments.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-400 mb-3">🔥 Most Liked Comments</h5>
                        <div className="space-y-3">
                          {commentAnalysis.topComments.map((comment: any, idx: number) => (
                            <div key={idx} className="bg-black/30 border border-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium text-sm">@{comment.username}</span>
                                <span className="text-gray-400 text-xs">❤️ {comment.likes}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Insights */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-400 mb-3">💡 What You Should Do</h5>
                      <ul className="space-y-3">
                        {commentAnalysis.suggestions?.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-white mt-1">•</span>
                            <span className="text-gray-300 text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-white/10">
                <button 
                  onClick={() => {
                    const csv = scrapedComments.map(c => `"${c.ownerUsername}","${c.text.replace(/"/g, '""')}","${c.likesCount || 0}","${c.timestamp || ''}"`).join('\n');
                    const blob = new Blob([`Username,Comment,Likes,Timestamp\n${csv}`], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'instagram_comments.csv';
                    a.click();
                  }}
                  className="px-6 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
                >
                Export Comments CSV
              </button>
                <button 
                  onClick={() => {
                    const json = JSON.stringify(scrapedComments, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'instagram_comments.json';
                    a.click();
                  }}
                  className="px-6 py-3 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
                >
                Export Analysis JSON
              </button>
            </div>
          </div>
          )}

          {commentsLoading && (
            <div className="border border-white/10 rounded-lg p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white">Scraping comments...</p>
          </div>
          )}
        </>
      )}


      {/* AI Content Assistant */}
      {dashboardSubPage === 'ai-assistant' && (
        <AIContentAssistant userProfile={userProfile} />
      )}
    </div>
  );
}

// AI Content Assistant Component
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Function to parse and style markdown content for AI assistant
const parseMarkdown = (text: string) => {
  if (!text) return text;
  
  // Split by lines to handle headers
  const lines = text.split('\n');
  const styledLines = lines.map((line, index) => {
    // Handle ### headers
    if (line.startsWith('### ')) {
      const headerText = line.replace('### ', '');
      return (
        <h3 key={index} className="text-xl font-black text-white mb-3 mt-4 first:mt-0 border-b border-white/20 pb-2">
          {headerText}
        </h3>
      );
    }
    
    // Handle numbered lists (1. 2. 3. etc.)
    if (/^\d+\.\s/.test(line)) {
      const listText = line.replace(/^\d+\.\s/, '');
      return (
        <div key={index} className="flex items-start mb-2">
          <span className="text-blue-400 font-semibold mr-2 mt-0.5">•</span>
          <span className="text-gray-300 leading-relaxed">{parseBoldText(listText)}</span>
        </div>
      );
    }
    
    // Handle bullet points (- or *)
    if (/^[-*]\s/.test(line)) {
      const listText = line.replace(/^[-*]\s/, '');
      return (
        <div key={index} className="flex items-start mb-2">
          <span className="text-blue-400 font-semibold mr-2 mt-0.5">•</span>
          <span className="text-gray-300 leading-relaxed">{parseBoldText(listText)}</span>
        </div>
      );
    }
    
    // Handle ** bold text
    return (
      <p key={index} className="text-gray-300 leading-relaxed mb-2">
        {parseBoldText(line)}
      </p>
    );
  });
  
  return styledLines;
};

// Helper function to parse bold text
const parseBoldText = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  return parts.map((part, partIndex) => {
    if (partIndex % 2 === 1) {
      // This is bold text - hide the ** and make it bold
      return <strong key={partIndex} className="text-white font-semibold">{part}</strong>;
    }
    // Regular text - also remove any remaining ** characters
    return part.replace(/\*\*/g, '');
  });
};

function AIContentAssistant({ userProfile }: { userProfile?: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Content Assistant. I can help you with:\n\n• Content strategy and ideas\n• Hook and caption writing\n• Hashtag optimization\n• Viral content analysis\n• Platform-specific tips\n• Engagement strategies\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5), // Last 5 messages for context
          userProfile: userProfile
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "How do I create viral content?",
    "What makes a good hook?",
    "Best hashtags for my niche",
    "How to increase engagement?",
    "Content ideas for this week"
  ];

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-black h-[calc(100vh-12rem)]  flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-2xl font-bold text-white mb-2">🤖 AI Content Assistant</h2>
        <p className="text-gray-400 text-sm">Get personalized advice for your content strategy</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{parseMarkdown(message.content)}</div>
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-black/60' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-400 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="px-3 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-lg hover:bg-white/10 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about content creation..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
