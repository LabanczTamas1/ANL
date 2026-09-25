import React, { useEffect, useState } from 'react';
import StatusCodeBarChart from './StatusCodeBarChart';
import { useLanguage } from '../../hooks/useLanguage';
import {
  Alert,
  Badge,
  Button,
  Card,
  Heading,
  METHOD_TONES,
  ProgressBar,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@design-system/components';

const METHOD_BAR_COLORS: Record<string, string> = {
  GET: 'bg-status-success',
  POST: 'bg-status-info',
  PUT: 'bg-status-warning',
  PATCH: 'bg-accent-purple',
  DELETE: 'bg-status-error',
};

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
    edgeIp?: string;
    userAgent: string;
  }[];
}

interface RequestStatsProps {
  userRole: string;
}

const RequestStats: React.FC<RequestStatsProps> = ({ userRole }) => {
  const { t } = useLanguage();
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
        : t('admin.errorFetchingStats'));
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
    } catch (err: unknown) {
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err.message as string)
          : t('admin.errorResettingStats'),
      );
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

  const canReset = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Heading level={2}>{t('admin.apiRequestStats')}</Heading>
        <div className="flex gap-2">
          <Button variant="primary" onClick={fetchStats}>
            {t('admin.refreshStats')}
          </Button>

          {canReset && (
            <Button variant="danger" onClick={resetStats}>
              {t('admin.resetStats')}
            </Button>
          )}
        </div>
      </div>

      {loading && <Text tone="muted">{t('admin.loadingStats')}</Text>}
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      {resetSuccess && (
        <Alert tone="success" className="mb-4">
          {resetSuccess}
        </Alert>
      )}

      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overview Card */}
          <Card>
            <Heading level={3} className="mb-4">
              {t('admin.overview')}
            </Heading>
            <p className="text-4xl font-bold text-brand dark:text-brand-focus mb-2">
              {stats.totalRequests}
            </p>
            <Text tone="subtle">{t('admin.totalRequests')}</Text>
          </Card>

          {/* Method Distribution Card */}
          <Card>
            <Heading level={3} className="mb-4">
              {t('admin.httpMethods')}
            </Heading>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(stats.methodCounts).map(([method, count]) => (
                <div key={method} className="text-center">
                  <Badge
                    tone={METHOD_TONES[method] ?? 'neutral'}
                    size="md"
                    className="w-full justify-center"
                  >
                    {method}
                  </Badge>
                  <p className="mt-1 font-bold text-content dark:text-content-inverse">{count}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Role Distribution Card with Visual Bars */}
          <Card>
            <Heading level={3} className="mb-4">
              {t('admin.requestByRole')}
            </Heading>
            <div className="space-y-4">
              {stats.roleCounts &&
                Object.entries(stats.roleCounts).map(([role, count]) => {
                  const maxValue = getMaxValue(stats.roleCounts);
                  const percentage = (parseInt(count, 10) / maxValue) * 100;

                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-content dark:text-content-inverse">
                          {role}:
                        </span>
                        <span className="font-medium text-content dark:text-content-inverse">
                          {count}
                        </span>
                      </div>
                      <ProgressBar value={percentage} tone="brand" />
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Role + Method Matrix Card */}
          <Card>
            <Heading level={3} className="mb-4">
              {t('admin.roleMethodMatrix')}
            </Heading>
            <TableContainer className="border-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('admin.role')}</Th>
                    <Th className="text-center">GET</Th>
                    <Th className="text-center">POST</Th>
                    <Th className="text-center">PUT</Th>
                    <Th className="text-center">PATCH</Th>
                    <Th className="text-center">DELETE</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(stats.roleMethodCounts).map(([role, methods]) => (
                    <Tr key={role} hoverable>
                      <Td className="font-medium capitalize">{role}</Td>
                      <Td className="text-center">{methods.GET || '0'}</Td>
                      <Td className="text-center">{methods.POST || '0'}</Td>
                      <Td className="text-center">{methods.PUT || '0'}</Td>
                      <Td className="text-center">{methods.PATCH || '0'}</Td>
                      <Td className="text-center">{methods.DELETE || '0'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>

          {/* Method Visualization Card */}
          <Card className="md:col-span-2">
            <Heading level={3} className="mb-4">
              {t('admin.methodDistribution')}
            </Heading>
            <div className="flex items-end h-40 space-x-6 mt-4">
              {Object.entries(stats.methodCounts).map(([method, count]) => {
                const maxValue = getMaxValue(stats.methodCounts);
                const percentage = (parseInt(count, 10) / maxValue) * 100;

                return (
                  <div key={method} className="flex flex-col items-center flex-1">
                    <div className="relative w-full flex justify-center mb-2 h-full items-end">
                      <div
                        className={`w-full max-w-md rounded-t-lg ${
                          METHOD_BAR_COLORS[method] ?? 'bg-content-muted'
                        }`}
                        style={{ height: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-content dark:text-content-inverse">
                      {method}
                    </div>
                    <div className="text-sm font-bold text-content dark:text-content-inverse">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <StatusCodeBarChart />

          {/* Recent Requests Table */}
          <Card className="md:col-span-2">
            <Heading level={3} className="mb-4">
              {t('admin.recentRequests')}
            </Heading>
            <TableContainer className="border-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('admin.time')}</Th>
                    <Th>{t('admin.method')}</Th>
                    <Th>{t('admin.path')}</Th>
                    <Th>{t('admin.role')}</Th>
                    <Th>{t('admin.ip')}</Th>
                    <Th>{t('admin.edgeIp')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.recentRequests.map((request, index) => (
                    <Tr key={index} hoverable>
                      <Td className="whitespace-nowrap">
                        {new Date(request.timestamp).toLocaleString()}
                      </Td>
                      <Td>
                        <Badge tone={METHOD_TONES[request.method] ?? 'neutral'} pill>
                          {request.method}
                        </Badge>
                      </Td>
                      <Td className="font-mono text-sm truncate max-w-xs">{request.path}</Td>
                      <Td className="capitalize">{request.role}</Td>
                      <Td className="font-mono text-sm">{request.ip}</Td>
                      <Td className="font-mono text-sm">{request.edgeIp ?? '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestStats;