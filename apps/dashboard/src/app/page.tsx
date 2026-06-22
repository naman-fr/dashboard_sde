'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, MousePointerClick, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ───────── helpers ───────── */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/* ───────── animated counter ───────── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      start = Math.round(eased * target);
      setValue(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const animated = useCountUp(value);
  return <>{format ? format(animated) : animated.toLocaleString()}</>;
}

/* ───────── stat card ───────── */
const statConfig: Array<{
  key: string;
  title: string;
  icon: typeof Users;
  gradient: string;
  bg: string;
  format?: (n: number) => string;
}> = [
  {
    key: 'totalSessions',
    title: 'Total Sessions',
    icon: Users,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'totalEvents',
    title: 'Total Events',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    key: 'avgSessionDuration',
    title: 'Avg Session Duration',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    format: (n: number) => formatDuration(n),
  },
  {
    key: 'avgClicksPerSession',
    title: 'Avg Clicks / Session',
    icon: MousePointerClick,
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    format: (n: number) => n.toFixed(1),
  },
];

/* ───────── placeholder chart data ───────── */
function generatePlaceholderChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    name: day,
    events: Math.floor(Math.random() * 300 + 100),
    sessions: Math.floor(Math.random() * 80 + 20),
  }));
}

/* ───────── main page ───────── */
export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    retry: 1,
    staleTime: 30_000,
  });

  const stats = data?.data;
  const chartData = stats?.eventsOverTime ?? generatePlaceholderChart();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">Overview of your application's user activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat, i) => {
          const Icon = stat.icon;

          if (isLoading) {
            return (
              <Card
                key={stat.key}
                className="border-0 bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-100"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            );
          }

          const rawValue = stats?.[stat.key] ?? 0;

          return (
            <Card
              key={stat.key}
              className="group border-0 bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800 tabular-nums">
                  {stat.format ? (
                    <AnimatedNumber value={rawValue} format={stat.format} />
                  ) : (
                    <AnimatedNumber value={rawValue} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 backdrop-blur-xl px-5 py-4 text-sm text-amber-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-medium">Unable to connect to the analytics API</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Make sure the backend is running at{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">localhost:8080</code> — showing sample data below.
            </p>
          </div>
        </div>
      )}

      {/* Area Chart */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Events Over Time
              </CardTitle>
              <CardDescription className="mt-1">
                {stats?.eventsOverTime
                  ? 'Live data from your analytics API'
                  : 'Connect API to see live data'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEvents)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
