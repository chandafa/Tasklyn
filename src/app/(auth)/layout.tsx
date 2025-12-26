'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    if (user && !user.isAnonymous) {
      // Jika pengguna sudah login tapi belum punya username, arahkan untuk melengkapi profil
      if (!user.displayName) {
        router.push('/complete-profile');
      } else {
        // Jika sudah punya username, arahkan ke dasbor
        router.push('/dashboard');
      }
    }
    // Jika tidak ada user atau user anonim, biarkan di halaman login/register.
  }, [user, isUserLoading, router]);

  // Tampilkan layar pemuatan jika sedang memeriksa ATAU jika ada pengguna non-anonim (menunggu pengalihan).
  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Jika pengecekan selesai dan TIDAK ada pengguna, ATAU pengguna adalah tamu (anonim),
  // tampilkan konten halaman (formulir login/register).
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
