'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ContentGrid from './ContentGrid';
import { AIContentGenerator } from '@/lib/ai-content-generator';
import { supabase } from '@/lib/supabase';

interface ContentsProps {
  savedContent: any[];
  contentLoading: boolean;
  contentFilters: {
    niche: string;
    creator: string;
    searchQuery: string;
    minViralScore: number;
    sortBy: string;
    sortOrder: string;
  };
  setContentFilters: (filters: any) => void;
  contentStats: any;
  searchContent: (query: string) => void;
  filterContentByNiche: (niche: string) => void;
  fetchSavedContent: () => void;
  copyToClipboard: (text: string, type: string) => void;
  formatNumber: (num: number) => string;
  formatDate: (date: string) => string;
  setActiveTab: (tab: string) => void;
}

export default function Contents({
  savedContent,
  contentLoading,
  contentFilters,
  setContentFilters,
  contentStats,
  searchContent,
  filterContentByNiche,
  fetchSavedContent,
  copyToClipboard,
  formatNumber,
  formatDate,
  setActiveTab
}: ContentsProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    hook: '',
    caption: '',
    transcript: '',
    username: '',
    contentType: 'general',
    hashtags: '',
  });
  const [aiGenLoading, setAiGenLoading] = React.useState(false);
  const [aiOptions, setAiOptions] = React.useState({
    tone: 'motivational',
    length: 'short',
    keywords: ''
  });

  // Load content from Supabase
  const [dbContent, setDbContent] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  
  // AI analysis states
  const [analyzingContent, setAnalyzingContent] = useState<string | null>(null);
  const [generatingSimilar, setGeneratingSimilar] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: any}>({});
  const [similarContent, setSimilarContent] = useState<{[key: string]: any[]}>({});
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [savingIdeas, setSavingIdeas] = useState(false);
  const [savingIndividualIdea, setSavingIndividualIdea] = useState<number | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set());
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Only select needed fields (faster query)
        // Note: upload_date column doesn't exist, using created_at instead
        const { data, error } = await supabase
          .from('contents')
          .select('id, username, caption, hook, transcript, views, likes, engagement_rate, created_at, content_type, post_url, viral_score, hashtags, platform')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(100); // Limit to 100 most recent items

        if (!error && data) {
          // Map database fields to expected format
          const formattedData = data.map((item: any) => ({
            id: item.id,
            username: item.username,
            caption: item.caption,
            hook: item.hook,
            transcript: item.transcript,
            views: item.views,
            likes: item.likes,
            comments: 0, // Default since column doesn't exist
            shares: 0, // Default since column doesn't exist
            engagementRate: item.engagement_rate,
            uploadDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            contentType: item.content_type,
            postUrl: item.post_url,
            thumbnail: null,
            viralScore: item.viral_score,
            hashtags: item.hashtags || [],
            mentions: [], // Default since column doesn't exist
            platform: item.platform,
          }));
          setDbContent(formattedData);
        }
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setLoadingDb(false);
      }
    };
    loadContent();
  }, []);

  // Use database content
  const displayContent = dbContent;
  const hasRealContent = dbContent.length > 0;

  // Handle AI analysis of ALL content
  const handleAnalyzeAllContent = async () => {
    if (dbContent.length === 0) {
      alert('No content to analyze. Please save some content first.');
      return;
    }

    try {
      setAnalyzingContent('all');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          action: 'analyze_content',
          payload: {
            videos: dbContent.map(content => ({
              id: content.id,
              hook: content.hook,
              caption: content.caption,
              views: content.views || 0,
              likes: content.likes || 0,
              engagementRate: content.engagementRate || 0,
              viralScore: content.viralScore || 0
            })),
            username: 'Your Library',
            niche: 'business'
          }
        })
      });

      const result = await response.json();
      console.log('Analysis result:', result);
      
      if (result.success) {
        setAnalysisResults({ all: result.data });
        
        // Show modal with analysis
        const analysis = result.data.analysis;
        const metrics = result.data.metrics;
        
        console.log('Analysis:', analysis);
        console.log('Metrics:', metrics);
        
        setAnalysisData({
          contentCount: dbContent.length,
          overallScore: analysis?.overallScore || 0,
          viralPotential: analysis?.viralPotential || 'Low',
          avgViews: metrics?.performanceMetrics?.avgViews || 'N/A',
          avgEngagement: metrics?.performanceMetrics?.avgEngagement?.toFixed(1) || '0',
          viralRate: metrics?.performanceMetrics?.viralRate || '0',
          strengths: analysis?.performanceAnalysis?.whatsWorking?.slice(0, 3) || analysis?.contentStrategy?.strengths?.slice(0, 3) || ['Good engagement'],
          improvements: analysis?.performanceAnalysis?.whatsFailing?.slice(0, 3) || analysis?.contentStrategy?.weaknesses?.slice(0, 3) || ['Keep up the good work!']
        });
        
        console.log('Showing analysis modal');
        setShowAnalysisModal(true);
      } else {
        console.error('Analysis failed:', result.error);
        alert('Failed to analyze content: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to analyze content. Please try again.');
    } finally {
      setAnalyzingContent(null);
    }
  };

  // Handle generating similar content based on ALL saved content
  const handleGenerateSimilarFromAll = async () => {
    if (dbContent.length === 0) {
      alert('No content to analyze. Please save some content first.');
      return;
    }

    try {
      setGeneratingSimilar('all');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // Detect niche from saved content (look for common tech/business keywords)
      const detectedNiche = (() => {
        const contentText = dbContent.map(c => `${c.hook} ${c.caption}`).join(' ').toLowerCase();
        if (contentText.includes('apple') || contentText.includes('tech') || contentText.includes('iphone')) {
          return 'tech';
        }
        if (contentText.includes('business') || contentText.includes('entrepreneur')) {
          return 'business';
        }
        if (contentText.includes('fitness') || contentText.includes('workout')) {
          return 'fitness';
        }
        if (contentText.includes('motivation')) {
          return 'motivation';
        }
        return 'business'; // fallback
      })();

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          action: 'generate_suggestions',
          payload: {
            niche: detectedNiche,
            targetAudience: 'general audience',
            contentStyle: 'viral and engaging',
            competitorData: dbContent.map(content => ({
              hook: content.hook,
              caption: content.caption,
              fullContent: content.transcript || content.caption,
              views: content.views || 0,
              likes: content.likes || 0,
              viralScore: content.viralScore || 0,
              viral_score: content.viralScore || 0,
              hashtags: content.hashtags || []
            })),
            count: 5
          }
        })
      });

      const result = await response.json();
      if (result.success && result.data?.suggestions) {
        // Show modal with generated ideas
        setGeneratedIdeas(result.data.suggestions);
        setShowGeneratedModal(true);
      } else {
        alert('Failed to generate content ideas. Please try again.');
      }
    } catch (error) {
      alert('Failed to generate similar content. Please try again.');
    } finally {
      setGeneratingSimilar(null);
    }
  };

  // Handle saving a single generated idea
  const handleSaveIndividualIdea = async (idea: any, index: number) => {
    try {
      setSavingIndividualIdea(index);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save content');
        return;
      }

      await supabase.from('contents').insert({
        user_id: user.id,
        username: 'AI Generated',
        caption: idea.fullContent,
        hook: idea.hook,
        transcript: '',
        views: 0,
        likes: 0,
        engagement_rate: 0,
        content_type: 'generated',
        post_url: '',
        viral_score: idea.expectedEngagement || 75,
        hashtags: idea.hashtags || [],
        platform: 'general'
      });
      
      // Mark as saved
      setSavedIdeas(prev => new Set(prev).add(index));
      
      // Reload content
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          username: item.username,
          caption: item.caption,
          hook: item.hook,
          transcript: item.transcript,
          views: item.views,
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          engagementRate: item.engagement_rate,
          uploadDate: item.upload_date,
          contentType: item.content_type,
          postUrl: item.post_url,
          thumbnail: null,
          viralScore: item.viral_score,
          hashtags: item.hashtags,
          mentions: item.mentions,
          platform: item.platform,
        }));
        setDbContent(formattedData);
      }

      alert('✅ Content idea saved!');
    } catch (error) {
      alert('❌ Failed to save content idea');
    } finally {
      setSavingIndividualIdea(null);
    }
  };

  // Handle saving all generated ideas to library
  const handleSaveGeneratedIdeas = async () => {
    try {
      setSavingIdeas(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save content');
        return;
      }

      // Only save ideas that haven't been saved individually
      const unsavedIdeas = generatedIdeas.filter((_, idx) => !savedIdeas.has(idx));

      for (const suggestion of unsavedIdeas) {
        await supabase.from('contents').insert({
          user_id: user.id,
          username: 'AI Generated',
          caption: suggestion.fullContent,
          hook: suggestion.hook,
          transcript: '',
          views: 0,
          likes: 0,
          engagement_rate: 0,
          content_type: 'generated',
          post_url: '',
          viral_score: suggestion.expectedEngagement || 75,
          hashtags: suggestion.hashtags || [],
          platform: 'general'
        });
      }
      
      // Reload content
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          username: item.username,
          caption: item.caption,
          hook: item.hook,
          transcript: item.transcript,
          views: item.views,
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          engagementRate: item.engagement_rate,
          uploadDate: item.upload_date,
          contentType: item.content_type,
          postUrl: item.post_url,
          thumbnail: null,
          viralScore: item.viral_score,
          hashtags: item.hashtags,
          mentions: item.mentions,
          platform: item.platform,
        }));
        setDbContent(formattedData);
      }

      setShowGeneratedModal(false);
      setSavedIdeas(new Set());
      alert('✅ Content ideas saved successfully!');
    } catch (error) {
      alert('❌ Failed to save content ideas');
    } finally {
      setSavingIdeas(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* AI Actions */}
      <div className="border border-white/10 rounded-lg p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">🤖 AI Content Analysis</h3>
            <p className="text-gray-400 text-sm">Analyze all your saved content and generate new ideas</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleAnalyzeAllContent}
            disabled={analyzingContent === 'all' || dbContent.length === 0}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {analyzingContent === 'all' ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Analyzing {dbContent.length} pieces...</span>
              </div>
            ) : (
              `🔍 Analyze All Content (${dbContent.length})`
            )}
          </button>

          <button
            onClick={handleGenerateSimilarFromAll}
            disabled={generatingSimilar === 'all' || dbContent.length === 0}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {generatingSimilar === 'all' ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Generating ideas...</span>
              </div>
            ) : (
              '✨ Generate Similar Content'
            )}
          </button>
        </div>
      </div>

      {/* Content Filters and Search */}
      <div className="border border-white/10 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search content by hook, caption, or transcript..."
              value={contentFilters.searchQuery}
              onChange={(e) => {
                setContentFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }));
                if (e.target.value.length > 2 || e.target.value.length === 0) {
                  searchContent(e.target.value);
                }
              }}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${contentFilters.sortBy}-${contentFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setContentFilters((prev: any) => ({ ...prev, sortBy, sortOrder }));
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

      </div>

      {/* Add Content Manually */}
      <div className="border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Add Content Manually</h3>
          <button
            onClick={() => setIsAdding((prev: any) => !prev)}
            className="px-3 py-1 text-xs bg-white text-black rounded hover:bg-gray-200"
          >
            {isAdding ? 'Close' : 'Add New'}
          </button>
        </div>
        {isAdding && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitLoading(true);
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  alert('Please log in to save content');
                  setSubmitLoading(false);
                  return;
                }

                // Save directly to Supabase instead of in-memory database
                const { error } = await supabase
                  .from('contents')
                  .insert({
                    user_id: user.id,
                    username: form.username || 'manual_entry',
                    caption: form.caption,
                    hook: form.hook,
                    transcript: form.transcript || form.caption || form.hook,
                    views: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    engagement_rate: 0,
                    upload_date: new Date().toISOString().split('T')[0],
                    content_type: form.contentType || 'general',
                    post_url: '',
                    viral_score: 50,
                    hashtags: form.hashtags
                      ? form.hashtags.split(',').map(h => h.trim()).filter(Boolean)
                      : [],
                    mentions: [],
                    platform: form.contentType || 'general'
                  });

                if (error) throw error;

                setForm({ hook: '', caption: '', transcript: '', username: '', contentType: 'general', hashtags: '' });
                setIsAdding(false);
                // refresh saved content
                fetchSavedContent();
              } catch (err: any) {
                console.error('Error saving content:', err);
                alert('Failed to save content: ' + (err?.message || 'Unknown error'));
              } finally {
                setSubmitLoading(false);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Hook *</label>
              <input
                required
                value={form.hook}
                onChange={(e) => setForm((prev: any) => ({ ...prev, hook: e.target.value }))}
                placeholder="E.g., The 5-second rule that will change your life"
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Caption *</label>
              <textarea
                required
                value={form.caption}
                onChange={(e) => setForm((prev: any) => ({ ...prev, caption: e.target.value }))}
                placeholder="Short caption or summary"
                className="w-full h-24 px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Full Script / Transcript</label>
              <textarea
                value={form.transcript}
                onChange={(e) => setForm((prev: any) => ({ ...prev, transcript: e.target.value }))}
                placeholder="Optional: include full script or transcript"
                className="w-full h-32 px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Creator Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((prev: any) => ({ ...prev, username: e.target.value }))}
                placeholder="E.g., productivityguru"
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Content Type</label>
              <select
                value={form.contentType}
                onChange={(e) => setForm((prev: any) => ({ ...prev, contentType: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                <option value="general">General</option>
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
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Hashtags (comma-separated)</label>
              <input
                value={form.hashtags}
                onChange={(e) => setForm((prev: any) => ({ ...prev, hashtags: e.target.value }))}
                placeholder="#viral, #content, #success"
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* AI Options */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">AI Tone</label>
              <select
                value={aiOptions.tone}
                onChange={(e) => setAiOptions((prev: any) => ({ ...prev, tone: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                <option value="motivational">Motivational</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="controversial">Controversial</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">AI Length</label>
              <select
                value={aiOptions.length}
                onChange={(e) => setAiOptions((prev: any) => ({ ...prev, length: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">AI Keywords (comma-separated)</label>
              <input
                value={aiOptions.keywords}
                onChange={(e) => setAiOptions((prev: any) => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., consistency, morning routine"
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="md:col-span-2 flex justify-between gap-3">
              <button
                type="button"
                disabled={aiGenLoading}
                onClick={() => {
                  try {
                    setAiGenLoading(true);
                    const generator = new AIContentGenerator();
                    const ideas = generator.generateContent({
                      niche: form.contentType as any,
                      tone: aiOptions.tone as any,
                      length: aiOptions.length as any,
                      includeHashtags: true,
                      targetAudience: 'general',
                      keywords: aiOptions.keywords
                        ? aiOptions.keywords.split(',').map(k => k.trim()).filter(Boolean)
                        : undefined
                    } as any);
                    const idea = ideas[0];
                    if (idea) {
                      setForm((prev: any) => ({
                        ...prev,
                        hook: idea.hook,
                        caption: idea.caption,
                        transcript: idea.caption,
                        hashtags: (idea.hashtags || []).join(', ')
                      }));
                    }
                  } finally {
                    setAiGenLoading(false);
                  }
                }}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 disabled:opacity-50"
              >
                {aiGenLoading ? 'Generating…' : 'Generate with AI'}
              </button>

              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Content Stats */}
      {(contentStats || !hasRealContent) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{displayContent.length}</div>
            <div className="text-sm text-gray-400">Total Contents</div>
          </div>
          <div className="border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {(() => {
                const avgViralScore = hasRealContent 
                  ? (contentStats.avgViralScore || 0)
                  : displayContent.length > 0 
                    ? Math.round(displayContent.reduce((sum, content) => sum + (content.viralScore || 0), 0) / displayContent.length)
                    : 0;
                
                return avgViralScore > 0 ? avgViralScore : '?';
              })()}
            </div>
            <div className="text-sm text-gray-400">Avg Viral Score</div>
          </div>
          <div className="border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {(() => {
                const avgEngagement = hasRealContent 
                  ? (contentStats.avgEngagement || 0)
                  : displayContent.length > 0
                    ? (displayContent.reduce((sum, content) => sum + (content.engagementRate || 0), 0) / displayContent.length)
                    : 0;
                
                return avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : '?';
              })()}
            </div>
            <div className="text-sm text-gray-400">Avg Engagement</div>
          </div>
          <div className="border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {hasRealContent 
                ? (contentStats.database?.totalCreators || 0)
                : displayContent.length > 0
                  ? new Set(displayContent.map(content => content.username)).size
                  : 0
              }
            </div>
            <div className="text-sm text-gray-400">Creators</div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <ContentGrid
        content={displayContent}
        contentLoading={loadingDb || contentLoading}
        copyToClipboard={copyToClipboard}
        formatNumber={formatNumber}
        formatDate={formatDate}
        isGeneratedContent={false}
        emptyStateTitle="No Content Saved Yet"
        emptyStateDescription="Scrape some viral content from TikTok or Instagram to get started, or add content manually above."
        emptyStateAction={() => setActiveTab('dashboard')}
        emptyStateActionText="Scrape Content"
        onDeleteContent={async (content) => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
              .from('contents')
              .delete()
              .eq('id', content.id)
              .eq('user_id', user.id);

            if (error) throw error;

            // Remove from local state
            setDbContent(prev => prev.filter(item => item.id !== content.id));
            alert('✅ Content deleted successfully!');
          } catch (error: any) {
            alert('❌ Failed to delete content');
          }
        }}
      />

      {/* Analysis Modal */}
      {showAnalysisModal && analysisData && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-black border border-white/20 rounded-lg max-w-2xl w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">📊 AI Analysis of Your {analysisData.contentCount} Content Pieces</h2>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Score Overview */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white text-sm font-medium">✅ Overall Score:</span>
                    <span className="text-white text-2xl font-bold">{analysisData.overallScore}/100</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">📈 Viral Potential:</span>
                    <span className="text-white text-lg font-semibold">{analysisData.viralPotential}</span>
                  </div>
                </div>
              </div>

              {/* What's Working */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-green-300 font-semibold mb-3">✅ What's Working:</h3>
                <ul className="space-y-2">
                  {analysisData.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to Improve */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="text-yellow-300 font-semibold mb-3">⚠️ What to Improve:</h3>
                <ul className="space-y-2">
                  {analysisData.improvements.map((improvement: string, idx: number) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Generated Ideas Modal */}
      {showGeneratedModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-black border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">✨ Generated Content Ideas</h2>
                  <p className="text-gray-400 text-sm mt-1">Based on analysis of {dbContent.length} saved pieces</p>
                </div>
                <button
                  onClick={() => setShowGeneratedModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {generatedIdeas.map((idea, idx) => (
                  <div key={idx} className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">#{idx + 1}</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                          {idea.expectedEngagement || 75}% Expected Engagement
                        </span>
                      </div>
                      
                      {savedIdeas.has(idx) ? (
                        <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                          ✓ Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSaveIndividualIdea(idea, idx)}
                          disabled={savingIndividualIdea === idx}
                          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {savingIndividualIdea === idx ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </div>
                          ) : (
                            '💾 Save'
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Hook</h3>
                        <p className="text-lg font-medium text-white">{idea.hook}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Full Content</h3>
                        <p className="text-gray-300 leading-relaxed">{idea.fullContent}</p>
                      </div>
                      
                      {idea.hashtags && idea.hashtags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-2">Hashtags</h3>
                          <div className="flex flex-wrap gap-2">
                            {idea.hashtags.map((tag: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {idea.reasoning && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-1">Why This Works</h3>
                          <p className="text-sm text-gray-400 italic">{idea.reasoning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {savedIdeas.size > 0 ? (
                  <>
                    {savedIdeas.size} saved, {generatedIdeas.length - savedIdeas.size} remaining
                  </>
                ) : (
                  `${generatedIdeas.length} content ideas ready to save`
                )}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowGeneratedModal(false);
                    setSavedIdeas(new Set());
                  }}
                  className="px-6 py-3 border border-white/10 text-white rounded-lg font-medium hover:bg-white/5 transition-all"
                >
                  {savedIdeas.size === generatedIdeas.length ? 'Close' : 'Cancel'}
                </button>
                {savedIdeas.size < generatedIdeas.length && (
                  <button
                    onClick={handleSaveGeneratedIdeas}
                    disabled={savingIdeas}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {savingIdeas ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      `💾 Save Remaining (${generatedIdeas.length - savedIdeas.size})`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

