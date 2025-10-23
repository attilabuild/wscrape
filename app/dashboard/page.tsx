'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import Contents from '../../components/dashboard/Contents';
import Profile from '../../components/dashboard/Profile';
import Calendar from '../../components/dashboard/Calendar';
import Templates from '../../components/dashboard/Templates';
import Billing from '../../components/dashboard/Billing';
import Tools from '../../components/dashboard/Tools';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase } from '@/lib/supabase';

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
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Main navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contents' | 'profile' | 'calendar' | 'templates' | 'billing'>('contents');

  // Scraping states
  const [username, setUsername] = useState('hormozi');
  const [videoCount, setVideoCount] = useState(10);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastScrapedUser, setLastScrapedUser] = useState<string>('');

  // AI Analysis States
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [contentInput, setContentInput] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('business');
  const [contentQuantity, setContentQuantity] = useState(5);
  const [viralPrediction, setViralPrediction] = useState<any>(null);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<{[key: string]: any}>({});
  
  // Dashboard sub-navigation states
  const [dashboardSubPage, setDashboardSubPage] = useState<'scrape' | 'generate' | 'predict' | 'templates' | 'comments' | 'video-analysis' | 'ai-assistant'>('scrape');
  const [showDashboardSubNav, setShowDashboardSubNav] = useState(false);

  // Contents Tab States
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
  const [userSavedContent, setUserSavedContent] = useState<any[]>([]);

  // Calendar Tab States
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Templates Tab States
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hooks' | 'stories' | 'educational' | 'controversial' | 'motivation'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Helper function to make authenticated API requests
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  };

  // Scraping Functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const response = await authenticatedFetch('/api/scrape', {
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
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setVideos(result.data.videos);
        setLastScrapedUser(result.data.metadata.username);
        setShowResults(true);
        setProgress(100);
        
        setTimeout(() => {
          runAIAnalysis();
        }, 500);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch videos');
      setVideos([]);
      setShowResults(false);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setAiAnalysisLoading(true);
    try {
      const response = await authenticatedFetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_content',
          payload: {
            videos: videos.slice(0, 10),
            niche: userProfile?.niche || 'business',
            username: lastScrapedUser
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setAiAnalysisResults(result.data);
      } else {
        console.error('AI analysis failed:', result.error);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
    setAiAnalysisLoading(false);
  };

  // Content Generation Functions
  const generateAIContent = async () => {
    setGeneratingContent(true);
    try {
      // Get user's saved content from Supabase for context
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
      let savedContentContext: any[] = [];
      
      if (user) {
        const { data } = await (await import('@/lib/supabase')).supabase
          .from('contents')
          .select('hook, caption, content_type, viral_score, hashtags')
          .eq('user_id', user.id)
          .order('viral_score', { ascending: false })
          .limit(10);
        
        savedContentContext = data || [];
      }

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_suggestions',
          payload: {
            niche: selectedNiche,
            count: contentQuantity,
            profileContext: userProfile,
            savedContent: savedContentContext
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data.suggestions);
        setGeneratedScripts({});
      }
    } catch (error) {
      console.error('Content generation failed:', error);
    }
    setGeneratingContent(false);
  };

  const generateViralScript = async (contentIdea: any) => {
    const contentId = `${contentIdea.hook.substring(0, 20)}...`;
    setGeneratingScript(contentId);
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_content',
          payload: {
            content: contentIdea,
            profileContext: userProfile
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedScripts(prev => ({
          ...prev,
          [contentId]: result.data
        }));
      }
    } catch (error) {
      console.error('Script generation failed:', error);
    }
    setGeneratingScript(null);
  };

  // Viral Prediction Functions
  const predictViral = async () => {
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

  const exportToCSV = () => {
    if (videos.length === 0) return;
    
    const headers = ['Hook', 'Caption', 'Views', 'Likes', 'Upload Date', 'URL'];
    const csvContent = [
      headers.join(','),
      ...videos.map(video => [
        `"${video.hook.replace(/"/g, '""')}"`,
        `"${video.caption.replace(/"/g, '""')}"`,
        video.views,
        video.likes,
        video.uploadDate,
        video.postUrl
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${lastScrapedUser}_analysis.csv`;
    link.click();
  };

  const exportToJSON = () => {
    if (videos.length === 0) return;
    
    const data = {
      metadata: {
        username: lastScrapedUser,
        platform: selectedPlatform,
        exportDate: new Date().toISOString(),
        totalVideos: videos.length
      },
      videos,
      analysis: aiAnalysisResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${lastScrapedUser}_analysis.json`;
    link.click();
  };

  // Contents Tab Functions
  const fetchSavedContent = async () => {
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_all' })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data);
        setContentStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch saved content:', error);
    }
    setContentLoading(false);
  };

  const searchContent = async (query: string) => {
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data);
      }
    } catch (error) {
      console.error('Failed to search content:', error);
    }
    setContentLoading(false);
  };

  const filterContentByNiche = async (niche: string) => {
    setContentFilters(prev => ({ ...prev, niche }));
    setContentLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'filter_by_niche', niche })
      });

      const result = await response.json();
      if (result.success) {
        setSavedContent(result.data);
      }
    } catch (error) {
      console.error('Failed to filter content:', error);
    }
    setContentLoading(false);
  };

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
          action: 'save',
          data: profileData
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserProfile(result.data);
        console.log('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
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

  // Load saved content when Contents tab is first opened
  useEffect(() => {
    if (activeTab === 'contents' && savedContent.length === 0) {
      fetchSavedContent();
    }
  }, [activeTab]);

  // Load profile when Profile tab is first opened
  useEffect(() => {
    if (activeTab === 'profile' && !userProfile) {
      fetchUserProfile();
    }
  }, [activeTab]);

  // Load user profile from Supabase on mount for AI content generation
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (await import('@/lib/supabase')).supabase
          .from('profiles')
          .select('name, niche, bio')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserProfile({
            name: data.name,
            niche: data.niche,
            bio: data.bio
          });
          
          // Auto-set the niche selector if user has a niche in their profile
          if (data.niche) {
            setSelectedNiche(data.niche.toLowerCase());
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Load user's saved content for AI context
  useEffect(() => {
    const fetchUserSavedContent = async () => {
      try {
        const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (await import('@/lib/supabase')).supabase
          .from('contents')
          .select('hook, caption, content_type, viral_score, hashtags')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setUserSavedContent(data);
        }
      } catch (error) {
        console.error('Error fetching user saved content:', error);
      }
    };

    fetchUserSavedContent();
  }, [activeTab]);

  return (
    <ProtectedRoute>
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

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardSubPage={dashboardSubPage}
        setDashboardSubPage={setDashboardSubPage}
        showDashboardSubNav={showDashboardSubNav}
        setShowDashboardSubNav={setShowDashboardSubNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <Header activeTab={activeTab} />

              {/* Tab Content */}
          {activeTab === 'contents' && (
            <Contents
              savedContent={savedContent}
              contentLoading={contentLoading}
              contentFilters={contentFilters}
              setContentFilters={setContentFilters}
              contentStats={contentStats}
              searchContent={searchContent}
              filterContentByNiche={filterContentByNiche}
              fetchSavedContent={fetchSavedContent}
              copyToClipboard={copyToClipboard}
              formatNumber={formatNumber}
              formatDate={formatDate}
              setActiveTab={(tab: string) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'profile' && (
            <Profile
              userProfile={userProfile}
              profileLoading={profileLoading}
              profileSaving={profileSaving}
              updateProfileSection={updateProfileSection}
              saveUserProfile={saveUserProfile}
            />
          )}

          {activeTab === 'calendar' && (
            <Calendar
              calendarView={calendarView}
              setCalendarView={setCalendarView}
              setShowScheduleModal={setShowScheduleModal}
            />
          )}

          {activeTab === 'templates' && (
            <Templates
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setSelectedTemplate={setSelectedTemplate}
              setShowTemplateModal={setShowTemplateModal}
            />
          )}

          {activeTab === 'billing' && <Billing />}

          {activeTab === 'dashboard' && (
            <Tools 
              dashboardSubPage={dashboardSubPage}
              // Scraping props
              username={username}
              setUsername={setUsername}
              videoCount={videoCount}
              setVideoCount={setVideoCount}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              isLoading={isLoading}
              error={error}
              progress={progress}
              handleSubmit={handleSubmit}
              // Results props
              showResults={showResults}
              videos={videos}
              lastScrapedUser={lastScrapedUser}
              aiAnalysisLoading={aiAnalysisLoading}
              aiAnalysisResults={aiAnalysisResults}
              runAIAnalysis={runAIAnalysis}
              exportToCSV={exportToCSV}
              exportToJSON={exportToJSON}
              formatNumber={formatNumber}
              formatDate={formatDate}
              copyToClipboard={copyToClipboard}
              // Generation props
              selectedNiche={selectedNiche}
              setSelectedNiche={setSelectedNiche}
              contentQuantity={contentQuantity}
              setContentQuantity={setContentQuantity}
              generateAIContent={generateAIContent}
              generatingContent={generatingContent}
              generatedContent={generatedContent}
              generateViralScript={generateViralScript}
              generatingScript={generatingScript}
              generatedScripts={generatedScripts}
              // Prediction props
              contentInput={contentInput}
              setContentInput={setContentInput}
              predictViral={predictViral}
              viralPrediction={viralPrediction}
              // Profile props
              userProfile={userProfile}
              userSavedContent={userSavedContent}
              setActiveTab={(tab: string) => setActiveTab(tab as any)}
            />
          )}
                </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
