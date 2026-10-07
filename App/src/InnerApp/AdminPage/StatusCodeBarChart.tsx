
import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarDays, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { status } from '@design-system';
import { Alert, Button, Card, Heading, IconButton, Text } from '@design-system/components';

const StatusCodeBarChart = () => {
  const { t } = useLanguage();
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
  const [showTotal, setShowTotal] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Status code category styling
  const statusConfig = {
    '2xx': { color: status.success, label: t('admin.statusSuccess') },
    '3xx': { color: status.info, label: t('admin.statusRedirect') },
    '4xx': { color: status.warning, label: t('admin.statusClientError') },
    '5xx': { color: status.error, label: t('admin.statusServerError') }
  };

  // Time range options
  const timeRangeOptions = [
    { value: '24h', label: t('admin.range24h') },
    { value: '7d', label: t('admin.range7d') },
    { value: '30d', label: t('admin.range30d') },
    { value: '90d', label: t('admin.range90d') }
  ];

  // Format an exact timestamp for the X axis, with granularity that matches
  // the selected range (time of day for short ranges, date for long ones).
  const formatAxisTime = (ms) => {
    const date = new Date(ms);
    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (timeRange === '7d') {
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
      setError(err.message || t('admin.failLoadStatsData'));
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

      // Build one data point per request at its EXACT timestamp (no bucketing).
      // Requests that share the identical millisecond are merged so their
      // counts stack correctly at that instant.
      const exactMap = {};

      recentRequests.forEach(request => {
        if (!request || !request.timestamp) return;

        const requestTime = new Date(request.timestamp);

        // Skip if outside the selected time range
        if (requestTime < start || requestTime > end) return;

        const timeKey = requestTime.getTime(); // exact ms

        if (!exactMap[timeKey]) {
          exactMap[timeKey] = {
            timestamp: timeKey,
            '2xx': 0,
            '3xx': 0,
            '4xx': 0,
            '5xx': 0,
            total: 0,
          };
        }

        const statusCode = request.statusCode || 200; // Default to 200 if not provided

        if (statusCode >= 200 && statusCode < 300) {
          exactMap[timeKey]['2xx']++;
        } else if (statusCode >= 300 && statusCode < 400) {
          exactMap[timeKey]['3xx']++;
        } else if (statusCode >= 400 && statusCode < 500) {
          exactMap[timeKey]['4xx']++;
        } else if (statusCode >= 500) {
          exactMap[timeKey]['5xx']++;
        }

        exactMap[timeKey].total++;
      });

      // Convert the map to an array and sort by exact timestamp
      let timeSeriesData = Object.values(exactMap).sort((a, b) => a.timestamp - b.timestamp);

      // Format for display — keep the exact timestamp for a time-scaled X axis.
      const formattedData = timeSeriesData.map(point => {
        const date = new Date(point.timestamp);
        return {
          ...point,
          fullDate: date.toLocaleString(),
        };
      });

      setData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error processing API data:', err);
      setError(t('admin.failProcessData') + err.message);
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
        <div className="w-full md:col-span-2 bg-surface-light dark:bg-surface-elevated p-3 border border-line dark:border-line-dark shadow-lg rounded-md">
          <p className="font-medium text-content dark:text-content-inverse">{dataPoint.fullDate || label}</p>
          <p className="text-sm font-semibold mt-1">{t('admin.totalColon')} {total.toLocaleString()}</p>
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
    <Card className="md:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Heading level={3} className="mb-3 md:mb-0">{t('admin.statusCodeAnalytics')}</Heading>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2 bg-black/[0.03] dark:bg-white/5 rounded-md px-3 py-1.5 text-sm">
            <CalendarDays size={16} className="text-content-muted" />
            <span className="text-content-subtle dark:text-content-subtle-inverse">{dateRange.start} — {dateRange.end}</span>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center rounded-md bg-black/[0.04] dark:bg-white/10 p-1">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={t('admin.range24h')}
              onClick={() => navigateTimeRange('prev')}
              disabled={timeRange === timeRangeOptions[0].value}
            >
              <ArrowLeft size={16} />
            </IconButton>
            
            <div className="flex mx-1 rounded-md overflow-hidden">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    timeRange === option.value
                      ? 'bg-surface-light dark:bg-surface-elevated shadow text-brand dark:text-brand-focus'
                      : 'text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.04] dark:hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={t('admin.range90d')}
              onClick={() => navigateTimeRange('next')}
              disabled={timeRange === timeRangeOptions[timeRangeOptions.length - 1].value}
            >
              <ArrowRight size={16} />
            </IconButton>
            
            {/* Refresh Button */}
            <IconButton
              variant="outline"
              size="sm"
              aria-label={t('admin.refreshData')}
              onClick={fetchStats}
              className="ml-2 bg-surface-light dark:bg-surface-elevated"
              title={t('admin.refreshData')}
            >
              <RefreshCw size={16} />
            </IconButton>
          </div>
        </div>
      </div>
      
      {/* Status Category Toggles */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => toggleStatusCategory(key)}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus ${
              selectedStatuses[key]
                ? 'text-content dark:text-content-inverse'
                : 'bg-black/[0.04] dark:bg-white/10 border-line dark:border-line-dark text-content-muted'
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
        {/* Total request line toggle */}
        <button
          onClick={() => setShowTotal((prev) => !prev)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus ${
            showTotal
              ? 'border-content-muted text-content dark:text-content-inverse bg-black/[0.04] dark:bg-white/10'
              : 'bg-black/[0.04] dark:bg-white/10 border-line dark:border-line-dark text-content-muted'
          }`}
        >
          <div
            className="w-3 h-0.5 mr-2"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #6b7280 0, #6b7280 4px, transparent 4px, transparent 7px)',
            }}
          />
          {t('admin.totalColon').replace(':', '')}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <Alert tone="error" className="mb-4 text-center">
          {error}
          <div className="mt-2">
            <Button variant="ghost" size="sm" onClick={fetchStats} className="text-brand dark:text-brand-focus">
              {t('admin.tryAgain')}
            </Button>
          </div>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Text tone="muted">{t('admin.loadingStatusData')}</Text>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <linearGradient
                    key={key}
                    id={`statusGradient-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatAxisTime}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickMargin={10}
                minTickGap={40}
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1 }} />

              {/* Continuous stacked areas — smooth, filled curves per status category */}
              {Object.entries(statusConfig).map(([key, config]) =>
                selectedStatuses[key] ? (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="status-stack"
                    stroke={config.color}
                    strokeWidth={2}
                    fill={`url(#statusGradient-${key})`}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    animationDuration={300}
                  />
                ) : null,
              )}

              {/* Total request line overlaid for at-a-glance volume trend */}
              {showTotal && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={300}
                />
              )}
            </ComposedChart>
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
              className="p-4 rounded-lg border border-line dark:border-line-dark"
              style={{ borderColor: selectedStatuses[key] ? config.color : '' }}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium text-content-subtle dark:text-content-subtle-inverse">{config.label}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-content dark:text-content-inverse">{total.toLocaleString()}</span>
                <span className="ml-2 text-sm text-content-muted">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StatusCodeBarChart;