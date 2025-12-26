'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BookOpen, Clock, Video, Plus } from 'lucide-react';
import { useSchedules } from '@/lib/hooks/use-schedules';
import { AddEditScheduleDialog } from '../../schedule/_components/add-edit-schedule-dialog';
import type { Schedule } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function JadwalMingguIniCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [week, setWeek] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { schedules, isLoading } = useSchedules();

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    setWeek(weekDays);
  }, []);
  
  const schedulesForSelectedDay = schedules.filter(s => s.dayOfWeek.toLowerCase() === format(selectedDate, 'EEEE').toLowerCase());

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Jadwal Minggu Ini</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-5 w-5" />
            </Button>
          </div>
           <p className="text-sm text-muted-foreground !mt-0">
                {format(selectedDate, "d MMMM yyyy", { locale: id })}
            </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-around text-center">
            {week.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayHasSchedule = schedules.some(s => s.dayOfWeek.toLowerCase() === format(day, 'EEEE').toLowerCase());
              return (
                <div key={day.toISOString()} className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">{format(day, 'E', { locale: id })}</span>
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-colors',
                      isSelected && 'bg-green-500 text-white hover:bg-green-600',
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, 'd')}
                  </Button>
                  <div className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      dayHasSchedule ? (isSelected ? 'bg-white' : 'bg-green-500') : 'bg-transparent'
                  )}></div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : schedulesForSelectedDay.length > 0 ? (
                 <div className="flex flex-col gap-3">
                 {schedulesForSelectedDay.map(schedule => (
                     <Link href={`/schedule/${schedule.id}`} key={schedule.id}>
                        <div className="flex items-start gap-4 p-3 rounded-lg bg-card transition-colors hover:bg-accent cursor-pointer border">
                            <div className="flex-1 space-y-1">
                                <p className="font-semibold">{schedule.courseName}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Sesi {schedule.session}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {schedule.timeStart} - {schedule.timeEnd}</span>
                                    <span className="flex items-center gap-1.5"><Video className="h-4 w-4" /> {schedule.location}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                 ))}
                 </div>
            ) : (
                <p className="text-center text-muted-foreground pt-4">Tidak ada jadwal untuk hari ini.</p>
            )}
          </div>
        </CardContent>
      </Card>
      <AddEditScheduleDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
