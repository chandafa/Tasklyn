'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, Flag } from 'lucide-react';
import type { TaskWithRisk } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DeadlineRiskCardProps {
  riskyTasks: TaskWithRisk[];
  isLoaded: boolean;
}

const riskLevels = {
  High: {
    label: 'Tinggi',
    icon: AlertTriangle,
    className: 'text-red-500',
    badgeClassName: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  Medium: {
    label: 'Sedang',
    icon: ShieldAlert,
    className: 'text-yellow-500',
    badgeClassName: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  Low: {
    label: 'Rendah',
    icon: Flag,
    className: 'text-green-500',
    badgeClassName: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
};

export function DeadlineRiskCard({ riskyTasks, isLoaded }: DeadlineRiskCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risiko Tenggat Waktu</CardTitle>
        <CardDescription>Tugas yang diprediksi berisiko terlambat.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoaded ? (
            riskyTasks.length > 0 ? (
                riskyTasks.map(task => {
                    const level = riskLevels[task.riskLevel];
                    const Icon = level.icon;
                    return (
                        <Link href={`/task/${task.id}`} key={task.id} className="block">
                            <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-accent transition-colors">
                                <Icon className={`h-6 w-6 mt-1 shrink-0 ${level.className}`} />
                                <div className="flex-1">
                                <p className="font-medium leading-tight">{task.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Prioritas: {task.priority}
                                </p>
                                </div>
                                <Badge variant="outline" className={level.badgeClassName}>{level.label}</Badge>
                            </div>
                        </Link>
                    )
                })
            ) : (
                <div className="text-center text-muted-foreground p-4">
                    <p>Tidak ada tugas berisiko saat ini. Kerja bagus!</p>
                </div>
            )
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-4/5" /></div>
            <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-4/5" /></div>
            <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-6 w-4/5" /></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
