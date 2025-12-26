'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BottomNav } from './_components/bottom-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskReminderWatcher } from './_components/task-reminder-watcher';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is not loading and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading, show a skeleton UI or a loading spinner
  if (isUserLoading || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <header className="top-0 z-40 hidden h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl sm:flex sm:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                     <div className="space-y-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
  }

  // If user is logged in, render the main layout
  return (
    <div className="pb-24 sm:pb-0">
       <TaskReminderWatcher />
      <div className="p-4 sm:p-6 lg:p-8">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
