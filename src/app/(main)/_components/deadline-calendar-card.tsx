'use client';

import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useTasks } from '@/lib/hooks/use-tasks';
import { format, isSameDay, parseISO } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DayPicker } from 'react-day-picker';

const priorityModifiers = {
  High: 'bg-red-500 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-green-500 text-white',
};

const priorityDayClasses = {
  High: 'border-red-500',
  Medium: 'border-yellow-500',
  Low: 'border-green-500',
};


function DayWithPopover({ date }: { date: Date }) {
    const { tasks } = useTasks();
    const tasksOnDay = useMemo(() => {
        if (!date) return [];
        return tasks.filter((task) => isSameDay(parseISO(task.dueDate), date));
    }, [tasks, date]);

    if (tasksOnDay.length === 0) {
        return <div className="p-1">{format(date, 'd')}</div>;
    }

    const highestPriority = useMemo(() => {
        if (tasksOnDay.length === 0) return null;
        if (tasksOnDay.some(t => t.priority === 'High')) return 'High';
        if (tasksOnDay.some(t => t.priority === 'Medium')) return 'Medium';
        return 'Low';
    }, [tasksOnDay]);


    return (
        <Popover>
        <PopoverTrigger asChild>
            <div className={cn(
                "relative flex h-full w-full items-center justify-center rounded-md",
                highestPriority && priorityDayClasses[highestPriority],
                highestPriority && "border-2"
                )}>
                {format(date, 'd')}
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Tenggat Waktu - {format(date, 'PPP')}</h4>
                <p className="text-sm text-muted-foreground">
                Tugas yang harus diselesaikan hari ini.
                </p>
            </div>
            <div className="grid gap-2">
                {tasksOnDay.map((task) => (
                    <div key={task.id} className="grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0">
                         <span className={cn("flex h-2 w-2 translate-y-1 rounded-full", priorityModifiers[task.priority])} />
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">
                                {task.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </PopoverContent>
        </Popover>
    );
};

const DayContent = (props: { date: Date }) => <DayWithPopover date={props.date} />;


export function DeadlineCalendarCard() {
    const { tasks } = useTasks();

    const deadlines = useMemo(() => tasks.map(task => parseISO(task.dueDate)), [tasks]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kalender Tenggat Waktu</CardTitle>
                <CardDescription>Lihat tenggat waktu tugas Anda yang akan datang.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Calendar
                    modifiers={{ deadlines }}
                    modifiersClassNames={{
                        deadlines: 'relative',
                    }}
                    components={{
                        Day: ({ date }) => date ? <DayContent date={date} /> : null,
                    }}
                    className="p-0"
                />
            </CardContent>
        </Card>
    );
}
