'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { useUser } from '@/firebase';

export default function SplashPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // We wait until the user's auth status is determined.
    if (isUserLoading) {
      return; // Do nothing while we check for a user.
    }
    
    const hasVisited = localStorage.getItem('hasVisited');

    // If user is logged in, go directly to the dashboard.
    if (user) {
      router.replace('/dashboard');
    } else if (hasVisited === 'true') {
        // If not logged in, but has visited, go to login.
        router.replace('/login');
    }else {
      // First-time user, show splash for a bit, then go to welcome.
      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 2000); // 2-second splash screen

      return () => clearTimeout(timer);
    }
  }, [router, user, isUserLoading]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6">
        <Icons.logo className="h-24 w-24 text-primary animate-pulse" />
        <h1 className="text-3xl font-bold text-gradient">TaskVerse</h1>
      </div>
    </div>
  );
}
