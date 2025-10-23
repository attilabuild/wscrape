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

export default function Dashboard() {
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Main navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contents' | 'profile' | 'calendar' | 'templates' | 'billing'>('contents');
  
  // Dashboard sub-navigation states
  const [dashboardSubPage, setDashboardSubPage] = useState<'scrape' | 'generate' | 'predict' | 'templates'>('scrape');
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
              setActiveTab={setActiveTab}
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
            <Tools dashboardSubPage={dashboardSubPage} />
          )}
        </div>
      </div>
    </div>
  );
}
