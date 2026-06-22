import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, MousePointerClick, Clock } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Sessions', value: '1,248', icon: Users, trend: '+12.5%' },
    { title: 'Events Tracked', value: '34.2K', icon: Activity, trend: '+4.2%' },
    { title: 'Avg Session Time', value: '2m 14s', icon: Clock, trend: '-1.1%' },
    { title: 'Avg Clicks / Session', value: '8.4', icon: MousePointerClick, trend: '+0.4%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">Overview of your application's user activity.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith('+');
          return (
            <Card key={i} className="border-0 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <p className={`text-xs mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add a chart placeholder here */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Sessions over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 rounded-md border border-dashed border-slate-200 m-6 mt-0 text-slate-400 text-sm">
          Chart visualization goes here (Recharts)
        </CardContent>
      </Card>
    </div>
  );
}
