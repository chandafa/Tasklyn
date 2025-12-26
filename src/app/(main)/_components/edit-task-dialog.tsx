'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell } from 'lucide-react';
import { format, parseISO, getYear, getMonth, getDate, getDaysInMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, ReminderType } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const reminderOptions: { id: ReminderType; label: string }[] = [
  { id: '1_hour_before', label: '1 hour before' },
  { id: '1_day_before', label: '1 day before' },
  { id: '3_days_before', label: '3 days before' },
];

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  priority: z.enum(['Low', 'Medium', 'High']),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']),
  reminders: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type EditTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
  onTaskUpdate: (task: Partial<Omit<Task, 'id' | 'subtasks' | 'createdAt'>>) => void;
};

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(2000, i), 'MMMM'),
}));

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  task,
  onTaskUpdate,
}: EditTaskDialogProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const [selectedDate, setSelectedDate] = useState({
    day: task.dueDate ? getDate(parseISO(task.dueDate)) : getDate(new Date()),
    month: task.dueDate ? getMonth(parseISO(task.dueDate)) : getMonth(new Date()),
    year: task.dueDate ? getYear(parseISO(task.dueDate)) : getYear(new Date()),
  });

  const daysInMonth = getDaysInMonth(new Date(selectedDate.year, selectedDate.month));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (task && isOpen) {
      const dueDate = task.dueDate ? parseISO(task.dueDate) : new Date();
      const newSelectedDate = {
          day: getDate(dueDate),
          month: getMonth(dueDate),
          year: getYear(dueDate),
      };
      setSelectedDate(newSelectedDate);

      form.reset({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || new Date().toISOString(),
        priority: task.priority,
        tags: task.tags || [],
        status: task.status,
        reminders: task.reminders || [],
      });
    }
  }, [task, form, isOpen]);

  useEffect(() => {
    const { day, month, year } = selectedDate;
    const newDate = new Date(year, month, day);
    form.setValue('dueDate', newDate.toISOString());

    const maxDays = getDaysInMonth(new Date(year, month));
    if (day > maxDays) {
      setSelectedDate(d => ({ ...d, day: maxDays }));
    }
  }, [selectedDate, form]);

  const onSubmit = (data: TaskFormData) => {
    onTaskUpdate({
      ...data,
      tags: data.tags || [],
      reminders: (data.reminders as ReminderType[]) || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 flex flex-col sm:rounded-[1.5rem]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for your task.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto no-scrollbar px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Due Date</FormLabel>
                 <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={String(selectedDate.day)}
                      onValueChange={(val) => setSelectedDate(d => ({ ...d, day: Number(val) }))}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <Select
                      value={String(selectedDate.month)}
                      onValueChange={(val) => setSelectedDate(d => ({ ...d, month: Number(val) }))}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <Select
                      value={String(selectedDate.year)}
                      onValueChange={(val) => setSelectedDate(d => ({ ...d, year: Number(val) }))}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                 </div>
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={() => <FormMessage />}
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add tags, separated by commas"
                          onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()))}
                          value={(field.value || []).join(', ')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminders"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Reminders
                        </FormLabel>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {reminderOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="reminders"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t bg-card sm:rounded-b-[1.5rem]">
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
