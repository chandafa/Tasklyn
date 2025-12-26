'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface TodaysFocusCardProps {
  tasks: Task[];
  isLoaded: boolean;
}

const priorityClasses = {
  High: 'border-red-500/50 bg-red-500/10 text-red-500',
  Medium: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500',
  Low: 'border-green-500/50 bg-green-500/10 text-green-500',
};


export function TodaysFocusCard({ tasks, isLoaded }: TodaysFocusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fokus Hari Ini</CardTitle>
        <CardDescription>Tugas paling mendesak untuk hari ini.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoaded ? (
          tasks.length > 0 ? (
            tasks.map(task => (
               <Link href={`/task/${task.id}`} key={task.id} className="block">
                <div className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent">
                  <div className="flex-1">
                    <p className="font-medium leading-tight truncate">{task.title}</p>
                    <div className="mt-1">
                       <Badge variant="outline" className={`text-xs ${priorityClasses[task.priority]}`}>
                            {task.priority}
                        </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <p>Tidak ada tugas untuk hari ini. Nikmati harimu!</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
