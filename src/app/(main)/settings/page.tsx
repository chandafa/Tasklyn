'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/hooks/use-settings';
import type { WeekStartDay, DefaultReminder } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, UserCheck, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTasks } from '@/lib/hooks/use-tasks';
import { useNotes } from '@/lib/hooks/use-notes';
import { useSchedules } from '@/lib/hooks/use-schedules';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';


export default function SettingsPage() {
  const { settings, setSetting } = useSettings();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteAllTasks } = useTasks();
  const { deleteAllNotes } = useNotes();
  const { deleteAllSchedules } = useSchedules();

  const handleLogout = () => {
    signOut(auth);
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
        await Promise.all([
            deleteAllTasks(),
            deleteAllNotes(),
            deleteAllSchedules()
        ]);
        toast({
            title: "Data Dihapus",
            description: "Semua data Anda telah berhasil dihapus.",
        });
    } catch (error) {
        console.error("Error deleting all data:", error);
        toast({
            variant: "destructive",
            title: "Gagal Menghapus Data",
            description: "Terjadi kesalahan saat menghapus data Anda. Silakan coba lagi.",
        });
    } finally {
        setIsDeleting(false);
    }
  };

  if (isUserLoading || !settings) {
    return (
       <Card>
        <CardHeader>
          <Skeleton className="h-7 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-6">
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Jika pengguna adalah tamu, tampilkan pesan untuk login
  if (user && user.isAnonymous) {
    return (
       <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Buat Akun untuk Melanjutkan</CardTitle>
            <CardDescription>
                Untuk menyimpan pengaturan Anda dan mengakses semua fitur, silakan buat akun atau masuk.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Data Anda sebagai tamu bersifat sementara. Membuat akun memastikan pekerjaan Anda aman.
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-3">
            <Button onClick={() => router.push('/register')} className="w-full">
                Buat Akun Baru
            </Button>
            <Button variant="ghost" onClick={() => router.push('/login')}>
                Sudah Punya Akun? Masuk
            </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
          <CardDescription>
            Atur preferensi aplikasi dan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tampilan</h3>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <Label htmlFor="theme" className="font-semibold">
                  Tema
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pilih tema terang, gelap, atau sistem.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Tugas</h3>
            <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="default-reminder" className="font-semibold">
                            Pengingat Default
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Atur pengingat otomatis untuk tugas baru.
                        </p>
                    </div>
                    <Select 
                      value={settings.defaultReminder} 
                      onValueChange={(value: DefaultReminder) => setSetting('defaultReminder', value)}
                    >
                        <SelectTrigger id="default-reminder" className="w-[180px]">
                        <SelectValue placeholder="Select reminder" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        <SelectItem value="1_hour_before">1 jam sebelum</SelectItem>
                        <SelectItem value="1_day_before">1 hari sebelum</SelectItem>
                        <SelectItem value="3_days_before">3 hari sebelum</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="p-4 border rounded-lg">
                 <div className="flex items-center justify-between">
                    <div>
                        <Label className="font-semibold">Awal Pekan</Label>
                        <p className="text-sm text-muted-foreground">
                            Pilih hari pertama dalam sepekan.
                        </p>
                    </div>
                    <RadioGroup 
                      value={settings.weekStart}
                      onValueChange={(value: WeekStartDay) => setSetting('weekStart', value)}
                      className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sunday" id="sunday" />
                            <Label htmlFor="sunday">Minggu</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monday" id="monday" />
                            <Label htmlFor="monday">Senin</Label>
                        </div>
                    </RadioGroup>
                 </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6 gap-2">
            {user && !user.isAnonymous ? (
                <>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus semua tugas, catatan, dan jadwal Anda secara permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAllData} disabled={isDeleting}>
                                     {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Ya, Hapus Semua
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                </>
            ) : (
                <Button onClick={handleLogin}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk untuk Menyimpan Data
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
