
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const StatusCodeBarChart = () => {
  // State
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatuses, setSelectedStatuses] = useState({
    '2xx': true,
    '3xx': true,
    '4xx': true,
    '5xx': true
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Status code category styling
  const statusConfig = {
    '2xx': { color: '#4ade80', label: 'Success (2xx)' },
    '3xx': { color: '#60a5fa', label: 'Redirect (3xx)' },
    '4xx': { color: '#facc15', label: 'Client Error (4xx)' },
    '5xx': { color: '#f87171', label: 'Server Error (5xx)' }
  };

  // Time range options
  const timeRangeOptions = [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' }
  ];

  // Fetch stats from API
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Assuming token is stored in localStorage
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const statsData = await response.json();
      processApiData(statsData, timeRange);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to load statistics data');
      setLoading(false);
    }
  };

  // Process API data into chart-compatible format
  const processApiData = (apiData, selectedTimeRange) => {
    try {
      // Set date range based on selected time period
      const end = new Date();
      const start = new Date();
      
      switch (selectedTimeRange) {
        case '24h':
          start.setDate(end.getDate() - 1);
          break;
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
      }
      
      setDateRange({
        start: start.toLocaleDateString(),
        end: end.toLocaleDateString()
      });
      
      // Process recent requests to extract status code information
      const recentRequests = apiData.recentRequests || [];
      
      // Create a mapping of timestamps to status code counts
      const timestampMap = {};
      
      // Group requests by time period
      recentRequests.forEach(request => {
        if (!request || !request.timestamp) return;
        
        // Parse timestamp
        const requestTime = new Date(request.timestamp);
        
        // Skip if outside the selected time range
        if (requestTime < start || requestTime > end) return;
        
        // Determine the grouping key based on time range
        let timeKey;
        
        switch (selectedTimeRange) {
          case '24h':
            // Group by hour for 24h view
            timeKey = new Date(requestTime).setMinutes(0, 0, 0);
            break;
          case '7d':
            // Group by 4 hours for 7d view
            const hours = requestTime.getHours();
            const fourHourBlock = Math.floor(hours / 4) * 4;
            timeKey = new Date(requestTime).setHours(fourHourBlock, 0, 0, 0);
            break;
          case '30d':
            // Group by day for 30d view
            timeKey = new Date(requestTime).setHours(0, 0, 0, 0);
            break;
          case '90d':
            // Group by day for 90d view
            timeKey = new Date(requestTime).setHours(0, 0, 0, 0);
            break;
        }
        
        // Initialize the timestamp entry if it doesn't exist
        if (!timestampMap[timeKey]) {
          timestampMap[timeKey] = {
            timestamp: timeKey,
            '2xx': 0,
            '3xx': 0,
            '4xx': 0,
            '5xx': 0,
            total: 0,
          };
        }
        
        // Extract status code from response
        // Note: This may need adjustment based on your actual API response structure
        const statusCode = request.statusCode || 200; // Default to 200 if not provided
        
        // Increment the appropriate category
        if (statusCode >= 200 && statusCode < 300) {
          timestampMap[timeKey]['2xx']++;
        } else if (statusCode >= 300 && statusCode < 400) {
          timestampMap[timeKey]['3xx']++;
        } else if (statusCode >= 400 && statusCode < 500) {
          timestampMap[timeKey]['4xx']++;
        } else if (statusCode >= 500) {
          timestampMap[timeKey]['5xx']++;
        }
        
        // Increment total
        timestampMap[timeKey].total++;
      });
      
      // Convert the map to an array and sort by timestamp
      let timeSeriesData = Object.values(timestampMap).sort((a, b) => a.timestamp - b.timestamp);
      
      // If no data points from API or not enough, add some zero-value points
      if (timeSeriesData.length === 0) {
        // Add some empty data points
        const interval = selectedTimeRange === '24h' ? 3600 * 1000 : 
                         selectedTimeRange === '7d' ? 4 * 3600 * 1000 :
                         24 * 3600 * 1000; // Default to daily for 30d and 90d
        
        const numberOfPoints = selectedTimeRange === '24h' ? 24 : 
                              selectedTimeRange === '7d' ? 42 : 
                              selectedTimeRange === '30d' ? 30 : 90;
        
        for (let i = 0; i < numberOfPoints; i++) {
          const timestamp = new Date(start.getTime() + (i * interval));
          timeSeriesData.push({
            timestamp: timestamp.getTime(),
            '2xx': 0,
            '3xx': 0,
            '4xx': 0,
            '5xx': 0,
            total: 0
          });
        }
      }
      
      // Format for display
      const formattedData = timeSeriesData.map(point => {
        const date = new Date(point.timestamp);
        
        // Format the label based on time range
        let timeLabel;
        if (selectedTimeRange === '24h') {
          timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (selectedTimeRange === '7d') {
          timeLabel = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.getHours()}:00`;
        } else {
          timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        
        return {
          ...point,
          name: timeLabel,
          fullDate: date.toLocaleString()
        };
      });
      
      // Filter to show only some labels for readability
      const labelEvery = selectedTimeRange === '24h' ? 4 : 
                        selectedTimeRange === '7d' ? 6 : 
                        selectedTimeRange === '30d' ? 4 : 5;
      
      formattedData.forEach((point, index) => {
        if (index % labelEvery !== 0) {
          point.name = '';
        }
      });
      
      setData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error processing API data:', err);
      setError('Failed to process data: ' + err.message);
      setLoading(false);
    }
  };

  // Initial fetch on component mount and when time range changes
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Handle status code category toggle
  const toggleStatusCategory = (category) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle time range navigation
  const navigateTimeRange = (direction) => {
    const currentIndex = timeRangeOptions.findIndex(option => option.value === timeRange);
    if (direction === 'prev' && currentIndex > 0) {
      setTimeRange(timeRangeOptions[currentIndex - 1].value);
    } else if (direction === 'next' && currentIndex < timeRangeOptions.length - 1) {
      setTimeRange(timeRangeOptions[currentIndex + 1].value);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Get the actual data point
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;
      
      // Filter payload to only show selected status categories
      const filteredPayload = payload.filter(p => selectedStatuses[p.dataKey]);
      
      // Calculate the total of selected categories
      const total = filteredPayload.reduce((sum, entry) => sum + entry.value, 0);
      
      // Sort the payload to match the visual stacking order (5xx on top, then 4xx, etc.)
      const sortedPayload = [...filteredPayload].sort((a, b) => {
        const order = ['5xx', '4xx', '3xx', '2xx'];
        return order.indexOf(a.dataKey) - order.indexOf(b.dataKey);
      });
      
      return (
        <div className="w-full md:col-span-2 bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-800">{dataPoint.fullDate || label}</p>
          <p className="text-sm font-semibold mt-1">Total: {total.toLocaleString()}</p>
          <div className="mt-2">
            {sortedPayload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{statusConfig[entry.dataKey].label}</span>
                </div>
                <span className="font-medium">{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-semibold mb-3 md:mb-0">Status Code Analytics</h3>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-md px-3 py-1.5 text-sm">
            <CalendarDays size={16} className="text-gray-500" />
            <span className="text-gray-600">{dateRange.start} — {dateRange.end}</span>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center rounded-md bg-gray-100 p-1">
            <button 
              onClick={() => navigateTimeRange('prev')}
              disabled={timeRange === timeRangeOptions[0].value}
              className={`p-1 rounded ${
                timeRange === timeRangeOptions[0].value
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            
            <div className="flex mx-1 rounded-md overflow-hidden">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1 text-sm font-medium ${
                    timeRange === option.value
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => navigateTimeRange('next')}
              disabled={timeRange === timeRangeOptions[timeRangeOptions.length - 1].value}
              className={`p-1 rounded ${
                timeRange === timeRangeOptions[timeRangeOptions.length - 1].value
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ArrowRight size={16} />
            </button>
            
            {/* Refresh Button */}
            <button 
              onClick={fetchStats}
              className="ml-2 p-1.5 bg-white rounded-md text-gray-600 hover:text-gray-800 border border-gray-200"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Status Category Toggles */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => toggleStatusCategory(key)}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedStatuses[key]
                ? 'border-gray-300 text-gray-800'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
            style={{ 
              backgroundColor: selectedStatuses[key] ? `${config.color}20` : '', 
              borderColor: selectedStatuses[key] ? config.color : '' 
            }}
          >
            <div 
              className="w-3 h-3 rounded-sm mr-2" 
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </button>
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="flex justify-center items-center h-20 mb-4">
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-md border border-red-200 w-full">
            {error}
            <div className="mt-2">
              <button 
                onClick={fetchStats}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading status code data...</div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              barGap={0}
              barSize={timeRange === '24h' ? 8 : timeRange === '7d' ? 10 : timeRange === '30d' ? 8 : 6}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              
              {/* Render the stacked bars - the "hamburger" effect */}
              {Object.entries(statusConfig).map(([key, config]) => (
                selectedStatuses[key] && (
                  <Bar 
                    key={key}
                    dataKey={key}
                    stackId="status-stack"
                    fill={config.color}
                    radius={key === '5xx' ? [4, 4, 0, 0] : [0, 0, 0, 0]} // Only round the top of the stack
                    animationDuration={300}
                  />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          // Calculate total for this status category across all data points
          const total = data.reduce((sum, point) => sum + point[key], 0);
          
          // Calculate percentage of all responses
          const allResponses = data.reduce((sum, point) => sum + point.total, 0);
          const percentage = allResponses > 0 ? ((total / allResponses) * 100).toFixed(1) : '0.0';
          
          return (
            <div 
              key={key} 
              className="p-4 rounded-lg border border-gray-200"
              style={{ borderColor: selectedStatuses[key] ? config.color : '' }}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium text-gray-600">{config.label}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{total.toLocaleString()}</span>
                <span className="ml-2 text-sm text-gray-500">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusCodeBarChart;