interface TemplatesProps {
  selectedCategory: 'all' | 'hooks' | 'stories' | 'educational' | 'controversial' | 'motivation';
  setSelectedCategory: (category: 'all' | 'hooks' | 'stories' | 'educational' | 'controversial' | 'motivation') => void;
  setSelectedTemplate: (template: any) => void;
  setShowTemplateModal: (show: boolean) => void;
}

export default function Templates({
  selectedCategory,
  setSelectedCategory,
  setSelectedTemplate,
  setShowTemplateModal
}: TemplatesProps) {
  const templates = [
    {
      id: 1,
      category: 'hooks',
      title: 'POV Template',
      hook: 'POV: You discover...',
      description: 'Perfect for revealing secrets or insights',
      engagement: '94%',
      uses: '2.1M',
      example: 'POV: You discover the secret that changed my entire business in 30 days',
      trending: true
    },
    {
      id: 2,
      category: 'educational',
      title: '3 Things Template',
      hook: '3 things that changed my [topic]',
      description: 'Educational content that performs consistently',
      engagement: '87%',
      uses: '1.8M',
      example: '3 things that changed my morning routine (and my life)',
      trending: false
    },
    {
      id: 3,
      category: 'controversial',
      title: 'Unpopular Opinion',
      hook: 'Unpopular opinion: [controversial take]',
      description: 'Drive engagement with bold statements',
      engagement: '91%',
      uses: '1.5M',
      example: 'Unpopular opinion: Working 80 hours a week is destroying your business',
      trending: true
    },
    {
      id: 4,
      category: 'stories',
      title: 'Mistake Story',
      hook: 'The $[amount] mistake I made...',
      description: 'Personal failure stories that teach lessons',
      engagement: '89%',
      uses: '1.3M',
      example: 'The $50K mistake I made so you don\'t have to',
      trending: false
    },
    {
      id: 5,
      category: 'motivation',
      title: 'Transformation',
      hook: 'How I went from [before] to [after]',
      description: 'Inspiring transformation stories',
      engagement: '85%',
      uses: '2.5M',
      example: 'How I went from broke to 6-figures in 8 months',
      trending: true
    },
    {
      id: 6,
      category: 'educational',
      title: 'What Nobody Tells You',
      hook: 'What nobody tells you about [topic]',
      description: 'Reveal hidden truths and insider knowledge',
      engagement: '92%',
      uses: '1.7M',
      example: 'What nobody tells you about building a personal brand',
      trending: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '📋', count: 50 },
    { id: 'hooks', label: 'Hooks', icon: '🎣', count: 15 },
    { id: 'stories', label: 'Stories', icon: '📖', count: 12 },
    { id: 'educational', label: 'Educational', icon: '🎓', count: 8 },
    { id: 'controversial', label: 'Controversial', icon: '⚡', count: 6 },
    { id: 'motivation', label: 'Motivational', icon: '💪', count: 9 }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Template Categories */}
      <div className="border border-white/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Viral Templates</h3>
            <p className="text-gray-400">Proven templates that guarantee engagement</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 text-sm"
            >
              <option value="all">All Templates</option>
              <option value="hooks">Hooks & Openers</option>
              <option value="stories">Story Templates</option>
              <option value="educational">Educational</option>
              <option value="controversial">Controversial</option>
              <option value="motivation">Motivational</option>
            </select>
          </div>
        </div>
        
        {/* Template Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.label}</div>
              <div className="text-xs text-gray-400">{category.count} templates</div>
            </button>
          ))}
        </div>
        
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors border border-white/10">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-white">{template.title}</h4>
                    {template.trending && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                        🔥 Trending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                </div>
              </div>

              {/* Template Hook */}
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-400 mb-1">Template:</div>
                <div className="text-white font-medium">{template.hook}</div>
              </div>

              {/* Example */}
              <div className="bg-blue-500/10 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-400 mb-1">Example:</div>
                <div className="text-blue-200 text-sm">{template.example}</div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-green-400">{template.engagement} avg engagement</span>
                  <span className="text-gray-400">{template.uses} uses</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTemplateModal(true);
                  }}
                  className="flex-1 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Use Template
                </button>
                <button className="bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Stats */}
      <div className="border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Template Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50</div>
            <div className="text-sm text-gray-400">Total Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">89.5%</div>
            <div className="text-sm text-gray-400">Avg Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">12.3M</div>
            <div className="text-sm text-gray-400">Total Uses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">15</div>
            <div className="text-sm text-gray-400">Trending Now</div>
          </div>
        </div>
      </div>
    </div>
  );
}
