'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function WelcomePage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleNavigation = (path: string) => {
    localStorage.setItem('hasVisited', 'true');
    router.push(path);
  };
  
  const handleGuestSignIn = async () => {
    try {
        await signInAnonymously(auth);
        localStorage.setItem('hasVisited', 'true');
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Anonymous sign-in failed:", error);
        toast({
            variant: "destructive",
            title: "Gagal Masuk sebagai Tamu",
            description: error.message || "Tidak dapat masuk sebagai tamu. Silakan coba lagi."
        });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <GraduationCap className="h-20 w-20 text-primary mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Selamat Datang di Tasklyn
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Atur tugas Anda dengan mudah dan tingkatkan produktivitas Anda.
        </p>
        <div className="mt-10 flex w-full flex-col gap-4">
          <Button size="lg" onClick={() => handleNavigation('/login')}>
            Masuk dengan Akun
          </Button>
          <Button size="lg" variant="outline" onClick={handleGuestSignIn}>
            Masuk sebagai Tamu
          </Button>
        </div>
      </div>
    </div>
  );
}
