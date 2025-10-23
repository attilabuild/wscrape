'use client';

import { useState, useEffect } from 'react';

interface ScheduledContent {
  id: string;
  title: string;
  caption: string;
  videoFile?: File | null;
  videoUrl?: string;
  thumbnailUrl?: string;
  platforms: ('tiktok' | 'instagram' | 'youtube' | 'facebook')[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'uploading' | 'posted' | 'failed';
  createdAt: string;
}

interface CalendarProps {
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  setShowScheduleModal: (show: boolean) => void;
}

export default function Calendar({
  calendarView,
  setCalendarView,
  setShowScheduleModal
}: CalendarProps) {
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    caption: '',
    videoFile: null as File | null,
    videoUrl: '',
    platforms: [] as ('tiktok' | 'instagram' | 'youtube' | 'facebook')[],
    date: '',
    time: '09:00'
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Load scheduled content from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scheduledContent');
    if (saved) {
      setScheduledContent(JSON.parse(saved));
    }

    // Check for pending schedule from Tools page
    const pending = localStorage.getItem('pendingSchedule');
    if (pending) {
      const data = JSON.parse(pending);
      setNewSchedule(data);
      setShowModal(true);
      localStorage.removeItem('pendingSchedule');
    }
  }, []);

  // Save to localStorage whenever scheduledContent changes
  useEffect(() => {
    localStorage.setItem('scheduledContent', JSON.stringify(scheduledContent));
  }, [scheduledContent]);

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Store video file and create preview URL
    setNewSchedule({ 
      ...newSchedule, 
      videoFile: file,
      videoUrl: URL.createObjectURL(file)
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload(e.dataTransfer.files[0]);
    }
  };

  const togglePlatform = (platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook') => {
    if (newSchedule.platforms.includes(platform)) {
      setNewSchedule({
        ...newSchedule,
        platforms: newSchedule.platforms.filter(p => p !== platform)
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        platforms: [...newSchedule.platforms, platform]
      });
    }
  };

  const handleScheduleContent = () => {
    if (!newSchedule.title || !newSchedule.date || newSchedule.platforms.length === 0) {
      alert('Please fill in title, date, and select at least one platform');
      return;
    }

    const scheduled: ScheduledContent = {
      id: Date.now().toString(),
      title: newSchedule.title,
      caption: newSchedule.caption,
      videoUrl: newSchedule.videoUrl,
      platforms: newSchedule.platforms,
      scheduledDate: newSchedule.date,
      scheduledTime: newSchedule.time,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    setScheduledContent([...scheduledContent, scheduled]);
    setShowModal(false);
    setShowScheduleModal(false);
    setNewSchedule({ 
      title: '',
      caption: '',
      videoFile: null,
      videoUrl: '',
      platforms: [],
      date: '',
      time: '09:00'
    });
    setUploadProgress(0);
  };

  const handleDeleteScheduled = (id: string) => {
    if (confirm('Delete this scheduled post?')) {
      setScheduledContent(scheduledContent.filter(item => item.id !== id));
    }
  };

  const getScheduledForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledContent.filter(item => item.scheduledDate === dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-8">
      {/* Calendar Controls */}
      <div className="border border-white/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Content Calendar</h3>
            <p className="text-gray-400">Plan and schedule your viral content strategy</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  calendarView === 'month' 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  calendarView === 'week' 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarView('day')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  calendarView === 'day' 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Day
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              + Schedule Content
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between text-white mb-4">
            <button 
              onClick={() => navigateMonth('prev')}
              className="px-3 py-1 hover:bg-white/10 rounded"
            >
              ←
            </button>
            <div className="font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={() => navigateMonth('next')}
              className="px-3 py-1 hover:bg-white/10 rounded"
            >
              →
            </button>
          </div>
          
          {calendarView === 'month' && (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-400 text-sm py-2">
                  {day}
                </div>
              ))}
              {(() => {
                const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
                const days = [];
                
                // Empty cells for days before month starts
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<div key={`empty-${i}`} className="aspect-square" />);
                }
                
                // Actual days
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const scheduled = getScheduledForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  days.push(
                    <div 
                      key={day} 
                      className={`aspect-square border border-white/10 rounded-lg p-2 hover:bg-white/5 transition-colors ${
                        isToday ? 'bg-blue-500/20 border-blue-500/50' : ''
                      }`}
                    >
                      <div className="text-white text-sm font-medium">{day}</div>
                      {scheduled.length > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          {scheduled.length} post{scheduled.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          )}
          
          {calendarView === 'week' && (
            <div className="space-y-4">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="text-white font-medium">Day {i + 1}</div>
                  <div className="text-sm text-gray-400">Optimal posting time: 7:00 PM</div>
                </div>
              ))}
            </div>
          )}
          
          {calendarView === 'day' && (
            <div className="space-y-4">
              <div className="text-center text-white mb-4">January 1, 2024</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="text-white">Morning (6-9 AM)</div>
                  <div className="text-sm text-gray-400">Good for educational content</div>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="text-white">Afternoon (12-3 PM)</div>
                  <div className="text-sm text-gray-400">Peak engagement time</div>
                </div>
                <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="text-white">Evening (6-9 PM)</div>
                  <div className="text-sm text-gray-400">Best for viral content</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scheduled Posts */}
      <div className="border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Scheduled Posts ({scheduledContent.length})
        </h3>
        <div className="space-y-4">
          {scheduledContent.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No scheduled content yet. Click "+ Schedule Content" to get started!
            </div>
          ) : (
            scheduledContent
              .sort((a, b) => new Date(a.scheduledDate + ' ' + a.scheduledTime).getTime() - 
                              new Date(b.scheduledDate + ' ' + b.scheduledTime).getTime())
              .map((item) => (
                <div key={item.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex gap-4">
                    {/* Video Thumbnail */}
                    {item.videoUrl && (
                      <div className="flex-shrink-0">
                        <video 
                          src={item.videoUrl} 
                          className="w-24 h-24 object-cover rounded-lg"
                          muted
                        />
                      </div>
                    )}
                    
                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{item.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>
                              {new Date(item.scheduledDate).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </span>
                            <span>•</span>
                            <span>{item.scheduledTime}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          item.status === 'scheduled' ? 'bg-green-500/20 text-green-300' :
                          item.status === 'uploading' ? 'bg-yellow-500/20 text-yellow-300' :
                          item.status === 'posted' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      
                      {item.caption && (
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{item.caption}</p>
                      )}
                      
                      {/* Platforms */}
                      <div className="flex items-center gap-2 mb-3">
                        {item.platforms.map(platform => (
                          <span 
                            key={platform}
                            className={`text-xs px-2 py-1 rounded ${
                              platform === 'tiktok' ? 'bg-pink-500/20 text-pink-300' :
                              platform === 'instagram' ? 'bg-purple-500/20 text-purple-300' :
                              platform === 'youtube' ? 'bg-red-500/20 text-red-300' :
                              'bg-blue-600/20 text-blue-300'
                            }`}
                          >
                            {platform === 'tiktok' ? '📱 TikTok' :
                             platform === 'instagram' ? '📷 Instagram' :
                             platform === 'youtube' ? '▶️ YouTube' :
                             '👥 Facebook'}
                          </span>
                        ))}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setNewSchedule({
                              title: item.title,
                              caption: item.caption,
                              videoFile: null,
                              videoUrl: item.videoUrl || '',
                              platforms: item.platforms,
                              date: item.scheduledDate,
                              time: item.scheduledTime
                            });
                            setShowModal(true);
                            handleDeleteScheduled(item.id);
                          }}
                          className="text-xs bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteScheduled(item.id)}
                          className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded hover:bg-red-500/30"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      
      {/* Upload Stats */}
      <div className="border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Upload Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{scheduledContent.length}</div>
            <div className="text-sm text-gray-400">Total Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {scheduledContent.filter(c => c.platforms.includes('tiktok')).length}
            </div>
            <div className="text-sm text-gray-400">TikTok</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {scheduledContent.filter(c => c.platforms.includes('instagram')).length}
            </div>
            <div className="text-sm text-gray-400">Instagram</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {scheduledContent.filter(c => c.platforms.includes('youtube')).length}
            </div>
            <div className="text-sm text-gray-400">YouTube</div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-xl w-full my-8">
            <h3 className="text-lg font-semibold text-white mb-4">Schedule Content Upload</h3>
            
            <div className="space-y-4">
              {/* Video Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Upload Video {!newSchedule.videoFile && '*'}
                </label>
                
                {!newSchedule.videoUrl ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-3xl mb-2">🎬</div>
                      <p className="text-white font-medium text-sm mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        MP4, MOV, AVI, or any video format
                      </p>
                    </label>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-3">
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video 
                      src={newSchedule.videoUrl} 
                      controls 
                      className="w-full max-h-48"
                    />
                    <button
                      onClick={() => {
                        setNewSchedule({ ...newSchedule, videoFile: null, videoUrl: '' });
                        setUploadProgress(0);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  placeholder="Enter video title..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Caption
                </label>
                <textarea
                  value={newSchedule.caption}
                  onChange={(e) => setNewSchedule({ ...newSchedule, caption: e.target.value })}
                  placeholder="Enter your caption here... #hashtags"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
                  rows={2}
                />
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Platforms *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => togglePlatform('tiktok')}
                    className={`px-3 py-2 rounded-lg transition-colors flex flex-col items-center ${
                      newSchedule.platforms.includes('tiktok')
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl mb-0.5">📱</span>
                    <span className="text-xs">TikTok</span>
                  </button>
                  <button
                    onClick={() => togglePlatform('instagram')}
                    className={`px-3 py-2 rounded-lg transition-colors flex flex-col items-center ${
                      newSchedule.platforms.includes('instagram')
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl mb-0.5">📷</span>
                    <span className="text-xs">Instagram</span>
                  </button>
                  <button
                    onClick={() => togglePlatform('youtube')}
                    className={`px-3 py-2 rounded-lg transition-colors flex flex-col items-center ${
                      newSchedule.platforms.includes('youtube')
                        ? 'bg-red-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl mb-0.5">▶️</span>
                    <span className="text-xs">YouTube</span>
                  </button>
                  <button
                    onClick={() => togglePlatform('facebook')}
                    className={`px-3 py-2 rounded-lg transition-colors flex flex-col items-center ${
                      newSchedule.platforms.includes('facebook')
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl mb-0.5">👥</span>
                    <span className="text-xs">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Optimal Time Suggestions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5">
                <p className="text-xs text-blue-300 mb-1.5">💡 Optimal Posting Times:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['09:00', '12:00', '15:00', '18:00', '21:00'].map(time => (
                    <button
                      key={time}
                      onClick={() => setNewSchedule({ ...newSchedule, time })}
                      className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewSchedule({ 
                      title: '',
                      caption: '',
                      videoFile: null,
                      videoUrl: '',
                      platforms: [],
                      date: '',
                      time: '09:00'
                    });
                    setUploadProgress(0);
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleContent}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📅 Schedule Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
