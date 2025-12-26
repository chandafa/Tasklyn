'use client';

import { useTasks } from '@/lib/hooks/use-tasks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, CalendarClock, Zap } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function StatsPage() {
  const { stats, isLoaded } = useTasks();

  const renderStatsCards = () => {
    if (!isLoaded) {
      return (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </>
      );
    }

    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of all tasks created.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionTimeDays} days</div>
            <p className="text-xs text-muted-foreground">
              Average time from creation to completion.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Productive Day</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostProductiveDay}</div>
            <p className="text-xs text-muted-foreground">
              The day you complete the most tasks.
            </p>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {renderStatsCards()}
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Productivity</CardTitle>
          <CardDescription>
            Number of tasks completed each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoaded ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={stats.tasksCompletedByDay}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltipContent />
                <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <Skeleton className="h-[250px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
