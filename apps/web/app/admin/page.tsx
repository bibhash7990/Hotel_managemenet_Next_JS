'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { AdminKpiSkeleton, ErrorState } from '@/components/query-state';
import { Card, CardContent } from '@/components/ui/card';
import { AdminChartBoundary } from '@/components/admin-chart-boundary';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

type Kpi = { totalBookings: number; revenue: string; hotelCount: number };

export default function AdminPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const isManagerPanel = staffBase === '/manager';

  useEffect(() => {
    if (!getAccessToken()) router.replace(`/login?next=${encodeURIComponent(staffBase)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['admin-kpi', token],
    enabled: !!token,
    queryFn: () =>
      apiJson<Kpi>('/api/v1/admin/dashboard/kpis', { accessToken: token! }),
  });

  if (!token) return null;

  const chartData = data
    ? [
        { name: 'Bookings', value: data.totalBookings },
        { name: 'Hotels', value: data.hotelCount },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title={isManagerPanel ? 'Your dashboard' : 'Super admin overview'}
        description={
          isManagerPanel
            ? 'Performance for the hotels you operate.'
            : 'Key performance indicators across the whole platform.'
        }
      />

      {isPending && <AdminKpiSkeleton />}
      {isError && (
        <ErrorState
          className="mt-6"
          title="Unable to load dashboard data"
          message="You may not have access, or the server returned an error."
          onRetry={() => void refetch()}
        />
      )}
      {data && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5 pt-5">
              <p className="text-sm text-muted-foreground dark:text-slate-400">Total bookings</p>
              <p className="mt-1 text-3xl font-semibold">{data.totalBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 pt-5">
              <p className="text-sm text-muted-foreground dark:text-slate-400">Revenue (confirmed)</p>
              <p className="mt-1 text-3xl font-semibold">${data.revenue}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 pt-5">
              <p className="text-sm text-muted-foreground dark:text-slate-400">Hotels</p>
              <p className="mt-1 text-3xl font-semibold">{data.hotelCount}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {data && (
        <AdminChartBoundary>
          <div className="mt-10 h-72 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(210 70% 38%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartBoundary>
      )}
    </div>
  );
}
