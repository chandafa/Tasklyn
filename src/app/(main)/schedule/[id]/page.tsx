'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSchedules } from '@/lib/hooks/use-schedules';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Trash, Pencil, ArrowLeft } from 'lucide-react';
import { AddEditScheduleDialog } from '../_components/add-edit-schedule-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { schedules, deleteSchedule, isLoading } = useSchedules();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const schedule = schedules.find((s) => s.id === id);

  if (isLoading || !schedule) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  const handleDelete = () => {
    deleteSchedule(schedule.id);
    router.push('/reports');
  }

  return (
    <>
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
           <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="absolute top-6 left-6 h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Kembali</span>
            </Button>
           <div className="text-center pt-10">
            <CardTitle className="text-2xl font-bold">{schedule.courseName}</CardTitle>
            <CardDescription>
              Detail lengkap untuk jadwal Anda.
            </CardDescription>
           </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Hari</p>
                    <p className="text-base font-semibold">{schedule.dayOfWeek}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Waktu</p>
                    <p className="text-base font-semibold">{schedule.timeStart} - {schedule.timeEnd}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Lokasi</p>
                    <p className="text-base font-semibold">{schedule.location}</p>
                </div>
            </div>
             {schedule.lecturer && (
                <div className="flex items-center gap-4">
                    <User className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Dosen</p>
                        <p className="text-base font-semibold">{schedule.lecturer}</p>
                    </div>
                </div>
            )}
             <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-base py-1 px-3">Sesi {schedule.session}</Badge>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-center gap-2 border-t pt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jadwal secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Lanjutkan</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
    {schedule && <AddEditScheduleDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        schedule={schedule}
    />}
    </>
  );
}

    