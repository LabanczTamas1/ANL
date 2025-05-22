import React, { useState, useEffect } from 'react';
import MonthCard from './MonthCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockTerminatedStatistics } from './mockData'; // Import mock data

// Define the types for the statistics
interface MonthStatistics {
  name: string;
  number: number;
  moneyValue: number;
  terminatedCount: number;
}

const TerminatedStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<MonthStatistics[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataType, setDataType] = useState<'terminatedCount' | 'moneyValue'>('terminatedCount');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(true); // Toggle for mock data
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        
        if (useMockData) {
          // Use mock data instead of API call
          setTimeout(() => {
            setStatistics(mockTerminatedStatistics.months);
            setIsLoading(false);
          }, 800); // Simulate network delay
          return;
        }
        
        // Real API call
        const response = await fetch(`${API_BASE_URL}/api/terminatedStatistics`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data.months);
        setIsLoading(false);
      } catch (error: any) {
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, [useMockData]);

  // Toggle between mock and real data
  const toggleDataSource = () => {
    setUseMockData(!useMockData);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-xl mb-2">Error</div>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={toggleDataSource}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Use {useMockData ? 'Real' : 'Mock'} Data
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !statistics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare the data for the chart
  const chartData = statistics.map(month => ({
    name: month.name,
    value: dataType === 'terminatedCount' ? month.terminatedCount : month.moneyValue,
    fill: dataType === 'terminatedCount' ? '#65558F' : '#10b981',
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 max-h-full overflow-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Terminated Statistics</h1>
          <p className="text-gray-500 mt-1">
            Overview of {dataType === 'terminatedCount' ? 'terminated contracts' : 'monetary values'} by month
          </p>
        </div>
        
        {/* Toggle between mock and real data */}
        <div className="text-sm">
          <button 
            onClick={toggleDataSource}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Using {useMockData ? 'Mock' : 'Real'} Data
          </button>
        </div>
      </header>
      
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setDataType('terminatedCount')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
              dataType === 'terminatedCount'
                ? 'bg-[#65558F] text-white border-[#65558F]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Terminated Count
          </button>
          <button
            onClick={() => setDataType('moneyValue')}
            className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${
              dataType === 'moneyValue'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Money Value
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#65558F' }}
                tickLine={false}
                axisLine={{ stroke: '#65558F' }}
                dy={10}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
                formatter={(value) => [
                  dataType === 'moneyValue' ? `$${value.toLocaleString()}` : value,
                  dataType === 'moneyValue' ? 'Value' : 'Terminated Count'
                ]}
              />
              <Bar 
                dataKey="value" 
                fill={dataType === 'terminatedCount' ? '#65558F' : '#10b981'} 
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statistics.map((month) => (
            <MonthCard
              key={month.number}
              month={month.name}
              number={month.terminatedCount}
              moneyValue={month.moneyValue}
              displayType={dataType}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TerminatedStatistics;