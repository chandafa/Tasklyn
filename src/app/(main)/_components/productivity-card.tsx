'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import type { TaskStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductivityCardProps {
  stats: TaskStats;
  isLoaded: boolean;
}

export function ProductivityCard({ stats, isLoaded }: ProductivityCardProps) {
  const { completedThisWeek, completedLastWeek, wowTrend } = stats;

  const chartData = [
    { name: 'Last Week', tasks: completedLastWeek },
    { name: 'This Week', tasks: completedThisWeek },
  ];

  const TrendIcon = wowTrend > 0 ? ArrowUp : wowTrend < 0 ? ArrowDown : Minus;
  const trendColor = wowTrend > 0 ? 'text-green-500' : wowTrend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Productivity</CardTitle>
        <CardDescription>Tasks completed week-over-week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoaded ? (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{completedThisWeek} tasks</p>
              <div className={`flex items-center text-sm font-medium ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>{wowTrend}% vs last week</span>
              </div>
            </div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
