'use client';

interface PerformanceChartProps {
  data: Array<{
    hour: string;
    views: number;
    revenue: number;
  }>;
  totalViews: number;
  hourlyAverage: number;
}

export default function PerformanceChart({ data, totalViews, hourlyAverage }: PerformanceChartProps) {
  const maxViews = Math.max(...data.map(d => d.views));
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
          <div className="text-sm text-gray-400">48H Total Views</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{hourlyAverage.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Hourly Average</div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Performance Over Time</h4>
        
        {/* Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between space-x-1">
            {data.map((item, index) => {
              const height = (item.views / maxViews) * 100;
              const revenueHeight = (item.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                  {/* Views Bar */}
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: '2px' }}
                    ></div>
                    <div 
                      className="w-full bg-green-500 rounded-b"
                      style={{ height: `${revenueHeight}%`, minHeight: '1px' }}
                    ></div>
                  </div>
                  
                  {/* Hour Label */}
                  <div className="text-xs text-gray-400 mt-2">
                    {index % 4 === 0 ? item.hour : ''}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>{maxViews.toLocaleString()}</span>
            <span>{Math.floor(maxViews * 0.75).toLocaleString()}</span>
            <span>{Math.floor(maxViews * 0.5).toLocaleString()}</span>
            <span>{Math.floor(maxViews * 0.25).toLocaleString()}</span>
            <span>0</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-400">Views</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">Revenue</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="text-sm font-medium text-white mb-3">Recent Activity</h5>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {data.slice(-10).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{item.hour}</span>
              <div className="flex items-center space-x-4">
                <span className="text-blue-400">{item.views.toLocaleString()} views</span>
                <span className="text-green-400">${item.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
