'use client';

import { useMemo, useCallback } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import type { Schedule } from '@/lib/types';

export function useSchedules() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const schedulesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'schedules');
  }, [firestore, user]);

  const { data: schedules, isLoading } = useCollection<Schedule>(schedulesQuery);

  const addSchedule = useCallback(
    (scheduleData: Omit<Schedule, 'id'>) => {
      if (!schedulesQuery) {
        toast({ variant: 'destructive', title: 'Anda harus masuk untuk menambahkan jadwal.' });
        return;
      }
      addDocumentNonBlocking(schedulesQuery, scheduleData);
      toast({ title: "Jadwal ditambahkan!" });
    },
    [schedulesQuery, toast]
  );

  const updateSchedule = useCallback(
    (scheduleId: string, scheduleData: Partial<Omit<Schedule, 'id'>>) => {
      if (!user) return;
      const scheduleRef = doc(firestore, 'users', user.uid, 'schedules', scheduleId);
      updateDocumentNonBlocking(scheduleRef, scheduleData);
      toast({ title: "Jadwal diperbarui!" });
    },
    [firestore, user, toast]
  );

  const deleteSchedule = useCallback(
    (scheduleId: string) => {
      if (!user) return;
      const scheduleRef = doc(firestore, 'users', user.uid, 'schedules', scheduleId);
      deleteDocumentNonBlocking(scheduleRef);
      toast({ title: "Jadwal dihapus!" });
    },
    [firestore, user, toast]
  );

  const deleteAllSchedules = useCallback(async () => {
    if (!user || !firestore || !schedules) return;

    if (schedules.length === 0) return;

    const batch = writeBatch(firestore);
    schedules.forEach(schedule => {
        const scheduleRef = doc(firestore, 'users', user.uid, 'schedules', schedule.id);
        batch.delete(scheduleRef);
    });

    await batch.commit();
  }, [firestore, user, schedules]);


  return {
    schedules: schedules || [],
    isLoading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    deleteAllSchedules,
  };
}
    