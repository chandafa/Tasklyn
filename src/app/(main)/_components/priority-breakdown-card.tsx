'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TaskStats } from '@/lib/types';

interface PriorityBreakdownCardProps {
  stats: TaskStats;
  isLoaded: boolean;
}

const COLORS = {
  High: 'hsl(var(--destructive))',
  Medium: 'hsl(var(--primary))',
  Low: 'hsl(var(--muted-foreground))',
};

export function PriorityBreakdownCard({ stats, isLoaded }: PriorityBreakdownCardProps) {
  const { priorityCounts } = stats;

  const data = [
    { name: 'High', value: priorityCounts.High },
    { name: 'Medium', value: priorityCounts.Medium },
    { name: 'Low', value: priorityCounts.Low },
  ].filter(item => item.value > 0);
  
  const totalTasks = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian Prioritas</CardTitle>
        <CardDescription>Distribusi tugas Anda yang belum selesai.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoaded ? (
          totalTasks > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                     contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>Tidak ada tugas aktif untuk ditampilkan.</p>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-[200px]">
             <Skeleton className="h-[160px] w-[160px] rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
