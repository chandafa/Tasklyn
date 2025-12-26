'use client';

import { useState, useEffect } from 'react';
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
import { Tag, Bell } from 'lucide-react';
import { format, getYear, getMonth, getDate, getDaysInMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, ReminderType } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
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
import { Badge } from '@/components/ui/badge';
import { suggestTags } from '@/ai/flows/smart-tagging';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/hooks/use-settings';
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
  reminders: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type AddTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTaskAdd: (task: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt' | 'orderRank'> & { description?: string }) => void;
  initialDate?: Date;
};

const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) + i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(2000, i), 'MMMM'),
}));


export function AddTaskDialog({
  isOpen,
  onOpenChange,
  onTaskAdd,
  initialDate,
}: AddTaskDialogProps) {
  const [isTagging, setIsTagging] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const [selectedDate, setSelectedDate] = useState({
    day: getDate(initialDate || new Date()),
    month: getMonth(initialDate || new Date()),
    year: getYear(initialDate || new Date()),
  });

  const daysInMonth = getDaysInMonth(new Date(selectedDate.year, selectedDate.month));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (isOpen) {
      const initDate = initialDate || new Date();
      const newSelectedDate = {
        day: getDate(initDate),
        month: getMonth(initDate),
        year: getYear(initDate),
      }
      setSelectedDate(newSelectedDate);
      
      const newDueDate = new Date(newSelectedDate.year, newSelectedDate.month, newSelectedDate.day);
      
      const defaultReminders = settings.defaultReminder !== 'none' ? [settings.defaultReminder] : [];
      form.reset({
        title: '',
        description: '',
        dueDate: newDueDate.toISOString(),
        priority: 'Medium',
        tags: [],
        reminders: defaultReminders,
      });
    }
  }, [isOpen, initialDate, settings.defaultReminder, form]);

  useEffect(() => {
    const { day, month, year } = selectedDate;
    const newDate = new Date(year, month, day);
    form.setValue('dueDate', newDate.toISOString());
    
    // Adjust day if it's out of bounds for the new month
    const maxDays = getDaysInMonth(new Date(year, month));
    if (day > maxDays) {
      setSelectedDate(d => ({ ...d, day: maxDays }));
    }

  }, [selectedDate, form]);

  const handleSmartTagging = async () => {
    const description = form.getValues('description');
    if (!description) {
      toast({
        variant: "destructive",
        title: "No description provided",
        description: "Please write a task description to get smart tag suggestions.",
      });
      return;
    }
    setIsTagging(true);
    try {
      const result = await suggestTags({ taskDescription: description });
      const currentTags = form.getValues('tags') || [];
      const newTags = Array.from(new Set([...currentTags, ...result.tags]));
      form.setValue('tags', newTags.slice(0, 5));
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Smart Tagging Failed",
        description: "Could not generate tags. Please try again.",
      });
      console.error('Smart tagging failed', error);
    } finally {
      setIsTagging(false);
    }
  };

  const onSubmit = (data: TaskFormData) => {
    onTaskAdd({
      ...data,
      createdAt: new Date().toISOString(),
      reminders: (data.reminders as ReminderType[]) || [],
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 flex flex-col sm:rounded-[1.5rem]"
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task.
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
                      <Input 
                        placeholder="e.g. Design new homepage" 
                        {...field} 
                      />
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
                      <Textarea
                        placeholder="Add more details about the task..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
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
              

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Low
                            </span>
                          </SelectItem>
                          <SelectItem value="Medium">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-yellow-500" />
                              Medium
                            </span>
                          </SelectItem>
                          <SelectItem value="High">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              High
                            </span>
                          </SelectItem>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Tags</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleSmartTagging}
                        disabled={isTagging}
                      >
                        <Tag className="mr-1.5 h-3 w-3" />
                        {isTagging ? 'Generating...' : 'Smart Tag'}
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Add tags, separated by commas"
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0);
                          field.onChange(tags);
                        }}
                        value={(field.value || []).join(', ')}
                      />
                    </FormControl>
                    {(field.value || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {(field.value || []).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminders"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Reminders
                    </FormLabel>
                    <div className="space-y-2 pt-1">
                      {reminderOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="reminders"
                          render={({ field }) => (
                            <FormItem
                              className="flex items-center space-x-3 space-y-0"
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
                              <FormLabel className="font-normal text-sm cursor-pointer">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )}
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

        <DialogFooter className="px-6 py-4 border-t bg-card sm:rounded-b-[1.5rem]">
          <div className="flex gap-2 w-full">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1"
            >
              Add Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
