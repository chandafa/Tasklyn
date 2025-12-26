'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Progress } from '@/components/ui/progress';
import type { Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Reorder } from 'framer-motion';

const priorityColors: Record<Task['priority'], string> = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const DeadlineProgress = ({ task }: { task: Task }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (task.status === 'Completed') {
      setProgress(100);
      return;
    }

    const calculateProgress = () => {
      const now = new Date().getTime();
      const createdAt = parseISO(task.createdAt).getTime();
      const dueDate = parseISO(task.dueDate).getTime();
      
      if (now >= dueDate) {
        setProgress(100);
        return;
      }
      if(now < createdAt) {
        setProgress(0);
        return;
      }

      const totalDuration = dueDate - createdAt;
      const elapsedTime = now - createdAt;
      
      const calculatedProgress = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 100;
      setProgress(Math.min(calculatedProgress, 100));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [task]);
  
  const getProgressColor = () => {
    if (progress > 80) return 'bg-red-500';
    if (progress > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
      <div className='w-full mt-1'>
          <Progress value={progress} indicatorClassName={getProgressColor()} />
      </div>
  );
};


export function TaskListCard() {
    const { tasks, reorderTasks, isLoaded, searchQuery, setSearchQuery } = useTasks();

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Task List</CardTitle>
                        <CardDescription>Drag and drop to re-order and set priority.</CardDescription>
                    </div>
                    <div className="relative w-full max-w-sm hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search tasks..." 
                            className="w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {isLoaded ? (
                tasks.length > 0 ? (
                    <Reorder.Group as="div" axis="y" values={tasks} onReorder={reorderTasks} className="space-y-1">
                    {tasks.map((task) => (
                        <Reorder.Item 
                            key={task.id} 
                            value={task} 
                            className="flex items-center p-2 sm:p-3 rounded-lg transition-colors hover:bg-secondary/50 bg-card cursor-grab active:cursor-grabbing"
                        >
                            <div className={`w-1.5 h-10 rounded-full ${priorityColors[task.priority]}`}></div>
                            <div className="ml-3 sm:ml-4 flex-1">
                                <p className="font-medium text-sm sm:text-base">{task.title}</p>
                                <DeadlineProgress task={task} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/task/${task.id}`} passHref>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </Link>
                            </div>
                        </Reorder.Item>
                    ))}
                    </Reorder.Group>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                    <p>No tasks match your search.</p>
                    <p className="text-sm">Try a different search or create a new task.</p>
                    </div>
                )
                ) : (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
                )}
            </CardContent>
        </Card>
    )
}
