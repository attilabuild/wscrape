import React from 'react';


interface ContentData {
  id: string;
  username?: string;
  caption?: string;
  hook: string;
  transcript?: string;
  fullContent?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagementRate?: number;
  uploadDate?: string;
  contentType?: string;
  postUrl?: string;
  thumbnail?: string;
  viralScore?: number;
  hashtags?: string[];
  mentions?: string[];
  expectedEngagement?: number;
  viralPrediction?: number;
  template?: string;
  reasoning?: string;
}

interface ContentDetailModalProps {
  content: ContentData;
  isOpen: boolean;
  onClose: () => void;
  copyToClipboard: (text: string, type: string) => void;
  formatNumber: (num: number) => string;
  formatDate: (date: string) => string;
  isGeneratedContent?: boolean;
}

interface ContentGridProps {
  content: ContentData[];
  contentLoading?: boolean;
  copyToClipboard: (text: string, type: string) => void;
  formatNumber: (num: number) => string;
  formatDate: (date: string) => string;
  isGeneratedContent?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: () => void;
  emptyStateActionText?: string;
  generateViralScript?: (content: any) => void;
  generatingScript?: string | null;
  generatedScripts?: {[key: string]: any};
  onSaveContent?: (content: ContentData) => Promise<void> | void;
  onDeleteContent?: (content: ContentData) => Promise<void> | void;
  onAnalyzeContent?: (content: ContentData) => Promise<void> | void;
  onGenerateSimilar?: (content: ContentData) => Promise<void> | void;
  analyzingContent?: string | null;
  generatingSimilar?: string | null;
}

function ContentDetailModal({ 
  content, 
  isOpen, 
  onClose, 
  copyToClipboard, 
  formatNumber, 
  formatDate, 
  isGeneratedContent = false 
}: ContentDetailModalProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    await copyToClipboard(text, type);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  const displayUsername = content.username || (isGeneratedContent ? 'AI Generated' : 'Unknown Creator');
  const displayViralScore = content.viralScore || content.expectedEngagement || content.viralPrediction || 65;
  const displayContentType = content.contentType || content.template || 'general';
  const displayCaption = content.caption || content.fullContent || content.hook;
  const displayTranscript = content.transcript || content.fullContent || content.hook;

  return (
    <div className="fixed inset-0 md:left-64 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: -1 }}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">
              {isGeneratedContent ? '🤖 ' : '@'}{displayUsername}
            </h2>
            <span className={`px-3 py-1 text-xs rounded-full ${
              displayContentType === 'business' ? 'bg-blue-500/20 text-blue-300' :
              displayContentType === 'fitness' ? 'bg-green-500/20 text-green-300' :
              displayContentType === 'motivation' ? 'bg-purple-500/20 text-purple-300' :
              displayContentType === 'lifestyle' ? 'bg-pink-500/20 text-pink-300' :
              displayContentType === 'education' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {displayContentType}
            </span>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-bold text-white">{displayViralScore}</div>
              <div className="text-sm text-gray-400">
                {isGeneratedContent ? 'Viral Chance' : 'Viral Score'}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">
                {content.views && content.views > 0 ? formatNumber(content.views) : '?'}
              </div>
              <div className="text-sm text-gray-400">Views</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">
                {content.likes && content.likes > 0 ? formatNumber(content.likes) : '?'}
              </div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">
                {content.comments && content.comments > 0 ? formatNumber(content.comments) : '?'}
              </div>
              <div className="text-sm text-gray-400">Comments</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">
                {content.engagementRate && content.engagementRate > 0 ? `${content.engagementRate.toFixed(1)}%` : '?'}
              </div>
              <div className="text-sm text-gray-400">Engagement</div>
            </div>
          </div>

          {/* Hook */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Hook</h3>
              <button
                onClick={() => handleCopy(content.hook, 'hook')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  copied === 'hook'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copied === 'hook' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-300 text-lg">{content.hook}</p>
          </div>

          {/* Caption/Full Content */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                {isGeneratedContent ? 'Full Content' : 'Caption'}
              </h3>
              <button
                onClick={() => handleCopy(displayCaption, 'caption')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  copied === 'caption'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copied === 'caption' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed">{displayCaption}</p>
          </div>

          {/* Script/Transcript */}
          {displayTranscript && (
            <div className="border border-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {isGeneratedContent ? 'Content Details' : 'Full Script/Transcript'}
                </h3>
                <button
                  onClick={() => handleCopy(displayTranscript, 'script')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    copied === 'script'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {copied === 'script' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{displayTranscript}</p>
              </div>
            </div>
          )}

          {/* Reasoning (for generated content) */}
          {isGeneratedContent && content.reasoning && (
            <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">💡 AI Reasoning</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{content.reasoning}</p>
            </div>
          )}

          {/* Hashtags */}
          {content.hashtags && content.hashtags.length > 0 && (
            <div className="border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((hashtag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded"
                  >
                    {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upload Date (for real content) */}
          {!isGeneratedContent && content.uploadDate && (
            <div className="text-center text-gray-400 text-sm">
              Uploaded {formatDate(content.uploadDate)}
            </div>
          )}

          {/* Copy All Button */}
          <div className="flex justify-center">
            <button
              onClick={() => handleCopy(
                `Hook: ${content.hook}\n\n${isGeneratedContent ? 'Content' : 'Caption'}: ${displayCaption}\n\n${isGeneratedContent ? 'Details' : 'Script'}: ${displayTranscript}`,
                'all'
              )}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                copied === 'all'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
              }`}
            >
              {copied === 'all' ? 'Copied All Content!' : 'Copy All Content'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentGrid({
  content,
  contentLoading = false,
  copyToClipboard,
  formatNumber,
  formatDate,
  isGeneratedContent = false,
  emptyStateTitle = "No Content Found",
  emptyStateDescription = "Start analyzing creators to populate your content database.",
  emptyStateAction,
  emptyStateActionText = "Get Started",
  generateViralScript,
  generatingScript,
  generatedScripts = {},
  onSaveContent,
  onDeleteContent,
  onAnalyzeContent,
  onGenerateSimilar,
  analyzingContent,
  generatingSimilar
}: ContentGridProps) {
  // Modal state
  const [selectedContent, setSelectedContent] = React.useState<ContentData | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = (contentItem: ContentData) => {
    setSelectedContent(contentItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedContent(null);
    setIsModalOpen(false);
  };

  if (contentLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading content...</p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">{emptyStateTitle}</h3>
        <p className="text-gray-400 mb-6">{emptyStateDescription}</p>
        {emptyStateAction && (
          <button
            onClick={emptyStateAction}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {emptyStateActionText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item, index) => {
          const displayUsername = item.username || (isGeneratedContent ? 'AI Generated' : 'Unknown Creator');
          const displayViralScore = item.viralScore || item.expectedEngagement || item.viralPrediction || 65;
          const displayContentType = item.contentType || item.template || 'general';
          const contentId = `${item.hook.substring(0, 20)}...`;
          const isGeneratingScript = generatingScript === contentId;
          const hasScript = generatedScripts[contentId];

          return (
            <div key={item.id || index} className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
              {/* Content Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-white">
                      {isGeneratedContent ? '🤖 ' : '@'}{displayUsername}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      displayContentType === 'business' ? 'bg-blue-500/20 text-blue-300' :
                      displayContentType === 'fitness' ? 'bg-green-500/20 text-green-300' :
                      displayContentType === 'motivation' ? 'bg-purple-500/20 text-purple-300' :
                      displayContentType === 'lifestyle' ? 'bg-pink-500/20 text-pink-300' :
                      displayContentType === 'education' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {displayContentType}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-sm leading-tight mb-2">
                    {item.hook}
                  </h3>
                </div>
                {displayViralScore > 0 && (
                  <div className="text-center ml-4">
                    <div className="text-lg font-bold text-white">{displayViralScore}</div>
                    <div className="text-xs text-gray-400">
                      {isGeneratedContent ? 'Viral Chance' : 'Preview Score'}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Preview */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {item.caption || item.fullContent || item.hook}
              </p>

              {/* Inline Video Thumbnail Preview */}
              {!isGeneratedContent && item.thumbnail && item.postUrl && (
                <a
                  href={item.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group mb-4"
                  aria-label="Open original video post"
                >
                  <div className="relative w-full overflow-hidden rounded-lg border border-white/10">
                    <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
                      <img
                        src={item.thumbnail}
                        alt={`Preview of ${displayUsername}'s post`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Play overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 border border-white/20">
                        <svg
                          className="w-6 h-6 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <div className="text-sm font-medium text-white">
                    {item.views && item.views > 0 ? formatNumber(item.views) : '?'}
                  </div>
                  <div className="text-xs text-gray-400">Views</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {item.likes && item.likes > 0 ? formatNumber(item.likes) : '?'}
                  </div>
                  <div className="text-xs text-gray-400">Likes</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {item.engagementRate && item.engagementRate > 0 ? `${item.engagementRate.toFixed(1)}%` : '?'}
                  </div>
                  <div className="text-xs text-gray-400">Engagement</div>
                </div>
              </div>

              {/* Reasoning (for generated content) */}
              {isGeneratedContent && item.reasoning && (
                <div className="text-xs text-blue-400 mb-4 italic bg-blue-500/10 p-2 rounded">
                  💡 {item.reasoning}
                </div>
              )}
              

              {/* Actions */}
              <div className={`grid gap-2 ${
                (isGeneratedContent || !isGeneratedContent) && onSaveContent
                  ? 'grid-cols-2' 
                  : !isGeneratedContent && onDeleteContent && item.postUrl
                    ? 'grid-cols-3'
                    : !isGeneratedContent && onDeleteContent
                      ? 'grid-cols-2'
                      : 'grid-cols-1'
              }`}>
                <button
                  onClick={() => openModal(item)}
                  className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded hover:bg-blue-500/30 transition-colors text-center"
                >
                  View Details
                </button>
                
                {isGeneratedContent && generateViralScript && (
                  <button
                    onClick={() => generateViralScript(item)}
                    disabled={isGeneratingScript}
                    className="text-xs bg-white text-black px-3 py-2 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors text-center"
                  >
                    {isGeneratingScript ? 'Creating...' : hasScript ? 'Update Script' : 'Create Script'}
                  </button>
                )}

                {onSaveContent && (
                  <button
                    onClick={() => onSaveContent(item)}
                    className="text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded hover:bg-green-500/30 transition-colors text-center font-medium"
                  >
                    💾 Save Content
                  </button>
                )}

                {!isGeneratedContent && onAnalyzeContent && (
                  <button
                    onClick={() => onAnalyzeContent(item)}
                    disabled={analyzingContent === item.id}
                    className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded hover:bg-blue-500/30 transition-colors text-center font-medium disabled:opacity-50"
                  >
                    {analyzingContent === item.id ? '⏳ Analyzing...' : '🔍 Analyze'}
                  </button>
                )}

                {!isGeneratedContent && onGenerateSimilar && (
                  <button
                    onClick={() => onGenerateSimilar(item)}
                    disabled={generatingSimilar === item.id}
                    className="text-xs bg-purple-500/20 text-purple-300 px-3 py-2 rounded hover:bg-purple-500/30 transition-colors text-center font-medium disabled:opacity-50"
                  >
                    {generatingSimilar === item.id ? '⏳ Generating...' : '✨ Generate Similar'}
                  </button>
                )}

                {!isGeneratedContent && onDeleteContent && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this content?')) {
                        onDeleteContent(item);
                      }
                    }}
                    className="text-xs bg-red-500/20 text-red-300 px-3 py-2 rounded hover:bg-red-500/30 transition-colors text-center font-medium"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Upload Date + Platform badge (for real content) */}
              {!isGeneratedContent && item.uploadDate && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(item.uploadDate)}
                  </span>
                  {item.contentType && (
                    <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wide ${
                      item.contentType === 'tiktok' ? 'bg-purple-500/20 text-purple-300' :
                      item.contentType === 'instagram' ? 'bg-pink-500/20 text-pink-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.contentType}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          isOpen={isModalOpen}
          onClose={closeModal}
          copyToClipboard={copyToClipboard}
          formatNumber={formatNumber}
          formatDate={formatDate}
          isGeneratedContent={isGeneratedContent}
        />
      )}
    </div>
  );
}
