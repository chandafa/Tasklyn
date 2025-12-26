'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, FileText, CheckSquare, Clock, Trash, Pencil, Plus, X, ArrowLeft } from 'lucide-react';
import { EditTaskDialog } from '../../_components/edit-task-dialog';
import type { Task } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const priorityClasses = {
  High: 'bg-red-500/10 text-red-500 border-red-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusClasses = {
    'Pending': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const { tasks, updateTask, deleteTask, isLoaded } = useTasks();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const router = useRouter();

  const task = tasks.find((t) => t.id === id);
  const taskBannerImage = PlaceHolderImages.find(p => p.id === 'task-banner');

  if (!isLoaded || !task) {
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
                            <Skeleton className="h-24 w-full" />
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

  const handleSubtaskChange = (subtaskId: string, completed: boolean) => {
    const updatedSubtasks = (task.subtasks || []).map(st => 
        st.id === subtaskId ? { ...st, completed } : st
    );
    updateTask(task.id, { subtasks: updatedSubtasks });
  };
  
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim() === '') return;
    const newSubtask = {
      id: `subtask-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    updateTask(task.id, { subtasks: updatedSubtasks });
    setNewSubtaskText('');
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
    updateTask(task.id, { subtasks: updatedSubtasks });
  }

  const handleTaskUpdate = (updatedTaskData: Partial<Omit<Task, 'id' | 'subtasks' | 'createdAt'>>) => {
    updateTask(task.id, updatedTaskData);
  }

  const handleDelete = () => {
    deleteTask(task.id);
    router.push('/dashboard');
  }

  return (
    <>
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {taskBannerImage && (
            <div className="relative h-48 w-full">
                <Image
                    src={taskBannerImage.imageUrl}
                    alt="Task Banner"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={taskBannerImage.imageHint}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Button>
            </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
          <CardDescription>
            Detail lengkap untuk tugas Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className='w-full'>
                        <p className="text-sm font-medium">Status</p>
                        <Badge variant="outline" className={statusClasses[task.status]}>{task.status}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className='w-full'>
                        <p className="text-sm font-medium">Due Date</p>
                        <p className="text-sm">{format(parseISO(task.dueDate), 'PPP')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div className='w-full'>
                        <p className="text-sm font-medium">Priority</p>
                        <Badge variant="outline" className={priorityClasses[task.priority]}>
                        {task.priority}
                        </Badge>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div className='w-full'>
                        <p className="text-sm font-medium">Tags</p>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {(task.tags || []).map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                        </p>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Sub-tasks</p>
                </div>
            </div>
             <div className="space-y-3 pl-9">
                {(task.subtasks || []).map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 group">
                    <Checkbox 
                        id={subtask.id} 
                        checked={subtask.completed} 
                        onCheckedChange={(checked) => handleSubtaskChange(subtask.id, !!checked)}
                    />
                    <label
                      htmlFor={subtask.id}
                      className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {subtask.text}
                    </label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSubtask(subtask.id)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
                ))}
                 <form onSubmit={handleAddSubtask} className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Add a sub-task..."
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      className="h-8 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
                    />
                    <Button type="submit" size="sm">Add</Button>
                </form>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
    {task && <EditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        onTaskUpdate={handleTaskUpdate}
    />}
    </>
  );
}
