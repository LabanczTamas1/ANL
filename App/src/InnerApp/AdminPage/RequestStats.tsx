import React, { useEffect, useState } from 'react';
import StatusCodeBarChart from './StatusCodeBarChart';

interface RequestStats {
  totalRequests: string;
  methodCounts: {
    GET: string;
    POST: string;
    PUT: string;
    PATCH: string;
    DELETE: string;
  };
  roleCounts: {
    [role: string]: string;
  };
  roleMethodCounts: {
    [role: string]: {
      [method: string]: string;
    };
  };
  recentRequests: {
    timestamp: string;
    method: string;
    path: string;
    role: string;
    ip: string;
    userAgent: string;
  }[];
}

interface RequestStatsProps {
  userRole: string;
}

const RequestStats: React.FC<RequestStatsProps> = ({ userRole }) => {
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request statistics');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: unknown) {
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err.message as string) 
        : 'An error occurred while fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const resetStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/stats/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset statistics');
      }

      const result = await response.json();
      setResetSuccess(result.message);
      
      // Refresh stats after reset
      fetchStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting statistics');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate the maximum value for bar charts
  const getMaxValue = (data: {[key: string]: string}) => {
    const values = Object.values(data).map(val => parseInt(val, 10));
    return Math.max(...values, 1); // Ensure minimum of 1 to avoid division by zero
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">API Request Statistics</h2>
        <div>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
          >
            Refresh Stats
          </button>
          
          {userRole === 'owner' || userRole === 'admin' && (
            <button 
              onClick={resetStats}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset Stats
            </button>
          )}
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading statistics...</p>}
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}
      {resetSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">{resetSuccess}</div>}

      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overview Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Overview</h3>
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalRequests}</p>
            <p className="text-gray-600">Total Requests</p>
          </div>

          {/* Method Distribution Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">HTTP Methods</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(stats.methodCounts).map(([method, count]) => (
                <div key={method} className="text-center">
                  <div className={`
                    px-3 py-2 rounded font-medium
                    ${method === 'GET' ? 'bg-green-100 text-green-800' : ''}
                    ${method === 'POST' ? 'bg-blue-100 text-blue-800' : ''}
                    ${method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${method === 'PATCH' ? 'bg-purple-100 text-purple-800' : ''}
                    ${method === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {method}
                  </div>
                  <p className="mt-1 font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Role Distribution Card with Visual Bars */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Request by Role</h3>
            <div className="space-y-4">
              {stats.roleCounts && Object.entries(stats.roleCounts).map(([role, count]) => {
                const maxValue = getMaxValue(stats.roleCounts);
                const percentage = (parseInt(count, 10) / maxValue) * 100;
                
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{role}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          

          {/* Role + Method Matrix Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Role + Method Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left">Role</th>
                    <th className="py-2 px-3 text-center bg-green-50">GET</th>
                    <th className="py-2 px-3 text-center bg-blue-50">POST</th>
                    <th className="py-2 px-3 text-center bg-yellow-50">PUT</th>
                    <th className="py-2 px-3 text-center bg-purple-50">PATCH</th>
                    <th className="py-2 px-3 text-center bg-red-50">DELETE</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.roleMethodCounts).map(([role, methods]) => (
                    <tr key={role} className="border-t border-gray-200">
                      <td className="py-2 px-3 font-medium capitalize">{role}</td>
                      <td className="py-2 px-3 text-center">{methods.GET || '0'}</td>
                      <td className="py-2 px-3 text-center">{methods.POST || '0'}</td>
                      <td className="py-2 px-3 text-center">{methods.PUT || '0'}</td>
                      <td className="py-2 px-3 text-center">{methods.PATCH || '0'}</td>
                      <td className="py-2 px-3 text-center">{methods.DELETE || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Method Visualization Card */}
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Method Distribution</h3>
            <div className="flex items-end h-40 space-x-6 mt-4">
              {Object.entries(stats.methodCounts).map(([method, count]) => {
                const maxValue = getMaxValue(stats.methodCounts);
                const percentage = (parseInt(count, 10) / maxValue) * 100;
                
                return (
                  <div key={method} className="flex flex-col items-center flex-1">
                    <div className="relative w-full flex justify-center mb-2">
                      <div 
                        className={`w-full max-w-md rounded-t-lg
                          ${method === 'GET' ? 'bg-green-500' : ''}
                          ${method === 'POST' ? 'bg-blue-500' : ''}
                          ${method === 'PUT' ? 'bg-yellow-500' : ''}
                          ${method === 'PATCH' ? 'bg-purple-500' : ''}
                          ${method === 'DELETE' ? 'bg-red-500' : ''}
                        `}
                        style={{ height: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium">{method}</div>
                    <div className="text-sm font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <StatusCodeBarChart />

          {/* Recent Requests Table */}
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Recent Requests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left">Time</th>
                    <th className="py-2 px-3 text-left">Method</th>
                    <th className="py-2 px-3 text-left">Path</th>
                    <th className="py-2 px-3 text-left">Role</th>
                    <th className="py-2 px-3 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentRequests.map((request, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-2 px-3">{new Date(request.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 px-3">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${request.method === 'GET' ? 'bg-green-100 text-green-800' : ''}
                          ${request.method === 'POST' ? 'bg-blue-100 text-blue-800' : ''}
                          ${request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${request.method === 'PATCH' ? 'bg-purple-100 text-purple-800' : ''}
                          ${request.method === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {request.method}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-sm truncate max-w-xs">{request.path}</td>
                      <td className="py-2 px-3 capitalize">{request.role}</td>
                      <td className="py-2 px-3 font-mono text-sm">{request.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStats;