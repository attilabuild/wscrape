'use client';

interface VideoPreviewProps {
  title: string;
  creator: string;
  platform: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  videoUrl?: string;
}

export default function VideoPreview({ 
  title, 
  creator, 
  platform, 
  duration, 
  views, 
  likes, 
  comments, 
  shares,
  videoUrl 
}: VideoPreviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-start gap-6">
        {/* Video Thumbnail */}
        <div className="w-80 h-48 bg-gray-800 rounded-lg flex items-center justify-center relative group">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-400">Video Preview</p>
            <p className="text-xs text-gray-500 mt-1">{platform}</p>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
          
          {/* Platform Icon */}
          <div className="absolute top-2 left-2 bg-black/80 text-white p-1 rounded">
            {getPlatformIcon(platform)}
          </div>
        </div>

        {/* Video Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-400">{creator}</p>
            <div className="flex items-center gap-1 text-gray-400">
              {getPlatformIcon(platform)}
              <span className="text-sm">{platform}</span>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{formatNumber(views)}</div>
              <div className="text-sm text-gray-400">Views</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{formatNumber(likes)}</div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{formatNumber(comments)}</div>
              <div className="text-sm text-gray-400">Comments</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{formatNumber(shares)}</div>
              <div className="text-sm text-gray-400">Shares</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
              View Original
            </button>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Save Analysis
            </button>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
