'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  activeTab: 'dashboard' | 'contents' | 'profile' | 'calendar' | 'templates' | 'billing';
  setActiveTab: (tab: 'dashboard' | 'contents' | 'profile' | 'calendar' | 'templates' | 'billing') => void;
  dashboardSubPage: 'scrape' | 'generate' | 'predict' | 'templates' | 'comments' | 'video-analysis' | 'ai-assistant';
  setDashboardSubPage: (page: 'scrape' | 'generate' | 'predict' | 'templates' | 'comments' | 'video-analysis' | 'ai-assistant') => void;
  showDashboardSubNav: boolean;
  setShowDashboardSubNav: (show: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  dashboardSubPage,
  setDashboardSubPage,
  showDashboardSubNav,
  setShowDashboardSubNav,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  return (
    <>
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
                  {/* Predict Viral and Templates removed for MVP */}
                  <button
                    onClick={() => setDashboardSubPage('comments')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'comments'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span>Scrape Comments</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubPage('video-analysis')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'video-analysis'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span>Video Analysis</span>
                  </button>
                  <button
                    onClick={() => setDashboardSubPage('ai-assistant')}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      dashboardSubPage === 'ai-assistant'
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>AI Assistant</span>
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
            
            {/* Templates tab removed for MVP */}
            
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
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{userEmail || 'Loading...'}</div>
              <div className="text-xs text-gray-400">Free Plan</div>
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
    </>
  );
}
