'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSchedules } from '@/lib/hooks/use-schedules';
import type { Schedule, DayOfWeek } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const scheduleSchema = z.object({
  courseName: z.string().min(3, 'Nama mata kuliah minimal 3 karakter.'),
  session: z.string().min(1, 'Sesi harus diisi.'),
  dayOfWeek: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  timeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM).'),
  timeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM).'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter.'),
  lecturer: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface AddEditScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  schedule?: Schedule;
}

const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function AddEditScheduleDialog({
  isOpen,
  onOpenChange,
  schedule,
}: AddEditScheduleDialogProps) {
  const { addSchedule, updateSchedule } = useSchedules();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      courseName: '',
      session: '',
      dayOfWeek: 'Monday',
      timeStart: '',
      timeEnd: '',
      location: '',
      lecturer: '',
    },
  });

  useEffect(() => {
    if (schedule && isOpen) {
      form.reset(schedule);
    } else if (!schedule && isOpen) {
      form.reset({
        courseName: '',
        session: '',
        dayOfWeek: 'Monday',
        timeStart: '',
        timeEnd: '',
        location: '',
        lecturer: '',
      });
    }
  }, [schedule, isOpen, form]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      if (schedule) {
        updateSchedule(schedule.id, data);
      } else {
        addSchedule(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save schedule', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
          <DialogDescription>
            Isi detail untuk jadwal Anda di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <ScrollArea className="h-96 pr-6 -mr-6">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="courseName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nama Mata Kuliah</FormLabel>
                        <FormControl>
                            <Input placeholder="cth. Internet of Things" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sesi</FormLabel>
                        <FormControl>
                            <Input placeholder="cth. 13" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hari</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {daysOfWeek.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="timeStart"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waktu Mulai</FormLabel>
                            <FormControl>
                            <Input placeholder="08:50" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="timeEnd"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waktu Selesai</FormLabel>
                            <FormControl>
                            <Input placeholder="10:30" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lokasi</FormLabel>
                        <FormControl>
                            <Input placeholder="Online / Ruang 404" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="lecturer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dosen (Opsional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Nama dosen" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (schedule ? 'Simpan Perubahan' : 'Tambah Jadwal')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    