interface ToolsProps {
  dashboardSubPage: 'scrape' | 'generate' | 'predict' | 'templates';
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
  contentInput, setContentInput, predictViral, viralPrediction
}: ToolsProps) {
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

                <div>
                  <label htmlFor="count" className="block text-sm font-medium text-gray-400 mb-2">
                    Count
                  </label>
                  <select
                    id="count"
                    value={videoCount}
                    onChange={(e) => setVideoCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    disabled={isLoading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
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
                  <button 
                    onClick={runAIAnalysis}
                    disabled={aiAnalysisLoading}
                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {aiAnalysisLoading ? 'Analyzing...' : 'Run AI Analysis'}
                  </button>
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

              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any) => (
                  <div key={video.id} className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm leading-tight mb-2">
                          {video.hook}
                        </h3>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-lg font-bold text-white">{Math.round(Math.random() * 100)}</div>
                        <div className="text-xs text-gray-400">Viral Score</div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {video.caption}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-white">{formatNumber(video.views)}</div>
                        <div className="text-xs text-gray-400">Views</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{formatNumber(video.likes)}</div>
                        <div className="text-xs text-gray-400">Likes</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{((video.likes / video.views) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Engagement</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(video.hook, 'Hook')}
                        className="flex-1 text-xs bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                      >
                        Copy Hook
                      </button>
                      <button
                        onClick={() => copyToClipboard(video.caption, 'Caption')}
                        className="flex-1 text-xs bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                      >
                        Copy Caption
                      </button>
                      <a
                        href={video.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        View
                      </a>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-400">
                        {formatDate(video.uploadDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Generate Content */}
      {dashboardSubPage === 'generate' && (
        <div className="border border-white/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">AI Content Generation</h2>
            <p className="text-gray-400">Generate viral content ideas powered by AI</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Niche</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                >
                  <option value="business">Business</option>
                  <option value="motivation">Motivation</option>
                  <option value="fitness">Fitness</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <select
                  value={contentQuantity}
                  onChange={(e) => setContentQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                >
                  <option value={3}>3 ideas</option>
                  <option value={5}>5 ideas</option>
                  <option value={10}>10 ideas</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={generateAIContent}
                disabled={generatingContent}
                className="px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                {generatingContent ? 'Generating...' : 'Generate Content Ideas'}
              </button>
            </div>

            {generatedContent.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-white font-medium">Generated Content:</h4>
                {generatedContent.map((content: any, idx: number) => {
                  const contentId = `${content.hook.substring(0, 20)}...`;
                  const isGenerating = generatingScript === contentId;
                  const script = generatedScripts[contentId];
                  
                  return (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white font-medium">
                          {content.hook}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(content.hook, 'Hook')}
                            className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20"
                          >
                            Copy Hook
                          </button>
                          <button
                            onClick={() => generateViralScript(content)}
                            disabled={isGenerating}
                            className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? 'Creating...' : 'Create Viral Script'}
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">
                        {content.caption}
                      </p>
                      
                      {script && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="bg-gray-900/50 rounded-lg p-3">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">
                              {script.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
                    <div className="text-2xl font-bold text-white">{formatNumber(viralPrediction.prediction?.expectedViews || 0)}</div>
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
    </div>
  );
}

