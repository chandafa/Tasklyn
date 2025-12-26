'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  ListTodo,
  AlertTriangle,
  Clock,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/lib/hooks/use-tasks';
import { AddTaskDialog } from '../_components/add-task-dialog';
import type { Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UserNav } from '@/components/user-nav';
import { ProductivityCard } from '../_components/productivity-card';
import { DeadlineRiskCard } from '../_components/deadline-risk-card';
import { TodaysFocusCard } from '../_components/todays-focus-card';
import { PriorityBreakdownCard } from '../_components/priority-breakdown-card';
import { JadwalMingguIniCard } from '../reports/_components/jadwal-minggu-ini-card';
import { TaskListCard } from '../reports/_components/task-list-card';
import { useUser } from '@/firebase';


export default function DashboardPage() {
  const { user } = useUser();
  const { tasks, stats, addTask, isLoaded, riskyTasks, todaysFocusTasks } = useTasks();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'pagi';
      if (hour < 15) return 'siang';
      if (hour < 19) return 'sore';
      return 'malam';
    };
    setGreeting(getGreeting());
  }, []);
  
  const handleAddTask = (taskData: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt'>) => {
    addTask(taskData);
  };
  
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <>
      <header className="top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl sm:hidden -mx-4 -mt-4 mb-4">
          <div className="flex items-center justify-center h-10 w-10 border rounded-md">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
        <div className="ml-auto flex items-center gap-2">
          <UserNav />
        </div>
      </header>
      <div className="p-4 sm:p-0 space-y-6">
         <header className="top-0 z-40 hidden h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-xl sm:flex sm:px-6 sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:-mx-6 sm:-mt-6 sm:mb-0">
                  <div className="flex items-center justify-center h-10 w-10 border rounded-md">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                <div className="ml-auto flex items-center gap-4">
                  <UserNav />
                </div>
        </header>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Hi, {user?.displayName || user?.email || 'Tamu'}</h1>
          {greeting && <p className="text-muted-foreground">Selamat {greeting}, mau nugas apa hari ini?</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <ListTodo className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoaded ? <div className="text-2xl font-bold">{stats.total}</div> : <Skeleton className="h-8 w-1/4" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              {isLoaded ? <div className="text-2xl font-bold">{completedTasksCount}</div> : <Skeleton className="h-8 w-1/4" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              {isLoaded ? <div className="text-2xl font-bold">{stats.overdue}</div> : <Skeleton className="h-8 w-1/4" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
              <Clock className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              {isLoaded ? <div className="text-2xl font-bold">{stats.upcoming}</div> : <Skeleton className="h-8 w-1/4" />}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskListCard />
            <JadwalMingguIniCard />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <TodaysFocusCard tasks={todaysFocusTasks} isLoaded={isLoaded} />
            <PriorityBreakdownCard stats={stats} isLoaded={isLoaded} />
            <ProductivityCard stats={stats} isLoaded={isLoaded} />
            <DeadlineRiskCard riskyTasks={riskyTasks} isLoaded={isLoaded} />
          </div>
        </div>
      </div>
      
      <Button 
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-30"
        onClick={() => {
          setSelectedDate(new Date());
          setIsAddTaskOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddTaskDialog 
        isOpen={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onTaskAdd={handleAddTask}
        initialDate={selectedDate}
      />
    </>
  );
}
