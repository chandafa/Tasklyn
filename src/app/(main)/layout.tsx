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
    if (isUserLoading) {
        return;
    }
    // Jika auth state tidak loading dan tidak ada user, alihkan ke login
    if (!user) {
      router.push('/login');
      return;
    }
    // Jika user ada, bukan tamu, tapi tidak punya displayName, paksa lengkapi profil
    if (user && !user.isAnonymous && !user.displayName) {
      router.push('/complete-profile');
    }
  }, [user, isUserLoading, router]);

  // Saat loading atau user tidak valid, tampilkan UI skeleton
  if (isUserLoading || !user || (!user.isAnonymous && !user.displayName)) {
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

  // Jika user valid, render layout utama
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
