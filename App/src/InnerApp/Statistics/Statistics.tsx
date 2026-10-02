import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, UserCheck, UserMinus, UserX } from 'lucide-react';
import { brand, status } from '@design-system';
import { Button, Card, Heading, Spinner, Text } from '@design-system/components';
import StatCard from './StatCard';
import { mockTerminatedStatistics, type StatusStatistics } from './mockData';

const STATUS_COLORS: Record<string, string> = {
  active: status.success,
  inactive: status.warning,
  terminated: status.error,
};

const formatLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const TerminatedStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<StatusStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;

    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);

      if (useMockData) {
        setStatistics(mockTerminatedStatistics);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/terminatedStatistics`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data: StatusStatistics = await response.json();
        if (!cancelled) {
          setStatistics(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      cancelled = true;
    };
  }, [useMockData, API_BASE_URL]);

  const toggleDataSource = () => setUseMockData((prev) => !prev);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24 text-brand">
        <Spinner size="xl" label="Loading statistics" />
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card padding="lg" className="max-w-md text-center">
          <Heading level={3} className="mb-2 text-status-error">
            Error
          </Heading>
          <Text tone="subtle" className="mb-4">
            {error ?? 'No statistics available.'}
          </Text>
          <Button variant="secondary" onClick={toggleDataSource}>
            Use {useMockData ? 'real' : 'mock'} data
          </Button>
        </Card>
      </div>
    );
  }

  const chartData = Object.entries(statistics.byStatus).map(([key, value]) => ({
    name: formatLabel(key),
    value,
    fill: STATUS_COLORS[key] ?? brand.DEFAULT,
  }));

  return (
    <Card padding="lg" className="max-h-full overflow-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={1}>Client Statistics</Heading>
          <Text tone="subtle" className="mt-1">
            Overview of client status distribution
          </Text>
        </div>
        <Button variant="secondary" size="sm" onClick={toggleDataSource}>
          Using {useMockData ? 'mock' : 'real'} data
        </Button>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Clients"
          value={statistics.total}
          tone="brand"
          icon={<Users size={22} />}
        />
        <StatCard
          label="Active"
          value={statistics.active}
          tone="success"
          icon={<UserCheck size={22} />}
        />
        <StatCard
          label="Inactive"
          value={statistics.inactive}
          tone="warning"
          icon={<UserMinus size={22} />}
        />
        <StatCard
          label="Terminated"
          value={statistics.terminated}
          tone="danger"
          icon={<UserX size={22} />}
        />
      </div>

      <section>
        <Heading level={3} className="mb-4">
          Status Distribution
        </Heading>
        <Card padding="md">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: brand.DEFAULT }}
                  tickLine={false}
                  axisLine={{ stroke: brand.DEFAULT }}
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(101,85,143,0.08)' }}
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [value, 'Clients']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={600}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </Card>
  );
};

export default TerminatedStatistics;
