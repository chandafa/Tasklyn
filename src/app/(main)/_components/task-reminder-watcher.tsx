'use client';

import { useEffect, useRef } from 'react';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { parseISO, differenceInHours, differenceInDays, isPast, isToday } from 'date-fns';
import type { Task, ReminderType } from '@/lib/types';
import { BellRing } from 'lucide-react';

const CHECK_INTERVAL = 60 * 1000; // Check every minute

export function TaskReminderWatcher() {
  const { tasks, isLoaded } = useTasks();
  const { toast } = useToast();
  const notifiedTasks = useRef(new Set<string>());

  useEffect(() => {
    if (!isLoaded || !tasks || tasks.length === 0) {
      return;
    }

    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach((task) => {
        if (task.status === 'Completed' || !task.dueDate) {
          return;
        }

        try {
          const dueDate = parseISO(task.dueDate);

          // Check for overdue tasks that haven't been notified
          const overdueKey = `${task.id}-overdue`;
          if (isPast(dueDate) && !isToday(dueDate) && !notifiedTasks.current.has(overdueKey)) {
             toast({
                title: 'Tugas Terlambat',
                description: `Tugas "${task.title}" telah melewati tenggat waktunya.`,
                variant: 'destructive',
             });
             notifiedTasks.current.add(overdueKey);
          }


          // Check for scheduled reminders
          (task.reminders || []).forEach((reminder: ReminderType) => {
            const reminderKey = `${task.id}-${reminder}`;
            if (notifiedTasks.current.has(reminderKey)) {
              return; // Already notified for this reminder type
            }

            let shouldNotify = false;
            let message = '';

            const hoursUntilDue = differenceInHours(dueDate, now);
            const daysUntilDue = differenceInDays(dueDate, now);

            if (reminder === '1_hour_before') {
              if (hoursUntilDue >= 0 && hoursUntilDue < 1) {
                shouldNotify = true;
                message = `Tugas "${task.title}" akan jatuh tempo dalam 1 jam.`;
              }
            } else if (reminder === '1_day_before') {
              if (daysUntilDue >= 0 && daysUntilDue < 1) {
                 shouldNotify = true;
                 message = `Tugas "${task.title}" akan jatuh tempo besok.`;
              }
            } else if (reminder === '3_days_before') {
               if (daysUntilDue >= 0 && daysUntilDue < 3) {
                shouldNotify = true;
                message = `Tugas "${task.title}" akan jatuh tempo dalam 3 hari.`;
              }
            }

            if (shouldNotify) {
              toast({
                title: (
                    <div className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-primary" />
                        Pengingat Tugas
                    </div>
                ),
                description: message,
              });
              notifiedTasks.current.add(reminderKey);
            }
          });
        } catch (error) {
          console.error("Error processing task reminder:", task.title, error);
        }
      });
    };

    // Run once on load
    checkReminders();

    // Set up interval to check periodically
    const intervalId = setInterval(checkReminders, CHECK_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [tasks, isLoaded, toast]);

  // This component doesn't render anything
  return null;
}
