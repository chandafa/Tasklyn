'use client';

import { useMemo, useCallback, useState } from 'react';
import type { Task, TaskStats, TaskWithRisk, PriorityCounts } from '@/lib/types';
import { isToday, isFuture, isPast, parseISO, startOfWeek, endOfWeek, subWeeks, isWithinInterval, differenceInDays, format } from 'date-fns';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export function useTasks() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'tasks');
  }, [firestore, user]);

  const { data: rawTasks, isLoading: isTasksLoading, error } = useCollection<Task>(tasksQuery);
  
  const tasks = useMemo(() => {
    if (!rawTasks) return [];
    
    // Sort tasks: uncompleted first, then by orderRank
    const sorted = [...rawTasks].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return (a.orderRank || 0) - (b.orderRank || 0);
    });

    if (!searchQuery.trim()) return sorted;

    const lowercasedQuery = searchQuery.toLowerCase();
    const queryParts = lowercasedQuery.split(' ');

    const textQueries = queryParts.filter(p => !p.includes(':') && !p.startsWith('#')).join(' ');
    const tagQueries = queryParts.filter(p => p.startsWith('#')).map(t => t.substring(1));
    const priorityQuery = queryParts.find(p => p.startsWith('priority:'))?.split(':')[1];
    const dueQuery = queryParts.find(p => p.startsWith('due:'))?.split(':')[1];
    const overdueQuery = queryParts.find(p => p.startsWith('overdue:'))?.split(':')[1];
    
    return sorted.filter(task => {
      // Text search (title and description)
      if (textQueries) {
        const titleMatch = task.title.toLowerCase().includes(textQueries);
        const descriptionMatch = task.description?.toLowerCase().includes(textQueries);
        if (!titleMatch && !descriptionMatch) return false;
      }
      
      // Tag search
      if (tagQueries.length > 0) {
        const taskTags = (task.tags || []).map(t => t.toLowerCase());
        if (!tagQueries.every(qTag => taskTags.includes(qTag))) return false;
      }
      
      // Priority search
      if (priorityQuery) {
        if (task.priority.toLowerCase() !== priorityQuery) return false;
      }
      
      // Due date search
      if (dueQuery === 'today') {
        if (!isToday(parseISO(task.dueDate))) return false;
      }
      
      // Overdue search
      if (overdueQuery === 'true') {
        const isOverdue = isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
        if (task.status === 'Completed' || !isOverdue) return false;
      }

      return true;
    });

  }, [rawTasks, searchQuery]);


  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt' | 'orderRank'>) => {
      if (!tasksQuery) return;
      const maxOrderRank = Math.max(0, ...(rawTasks || []).map(t => t.orderRank || 0));
      const newTask: Omit<Task, 'id'> = {
        ...taskData,
        status: 'Pending' as const,
        subtasks: [],
        orderRank: maxOrderRank + 1,
      };

      addDocumentNonBlocking(tasksQuery, newTask);
    },
    [tasksQuery, rawTasks]
  );
  
  const addMultipleTasks = useCallback(
    async (tasksData: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt' | 'orderRank'>[]) => {
      if (!tasksQuery || !firestore || !user) return;
      const batch = writeBatch(firestore);
      const currentMaxRank = Math.max(0, ...(rawTasks || []).map(t => t.orderRank || 0));

      tasksData.forEach((taskData, index) => {
        const taskRef = doc(tasksQuery);
        const newTask: Omit<Task, 'id'> = {
          ...taskData,
          status: 'Pending',
          subtasks: [],
          orderRank: currentMaxRank + index + 1,
        };
        batch.set(taskRef, newTask);
      });

      try {
        await batch.commit();
        toast({
            title: "Template applied!",
            description: `${tasksData.length} tasks have been added to your list.`
        })
      } catch (error) {
         console.error("Error adding multiple tasks: ", error);
         toast({
            variant: "destructive",
            title: "Failed to apply template",
            description: "An error occurred while adding tasks."
         })
      }
    },
    [tasksQuery, firestore, user, rawTasks, toast]
  );

  const updateTask = useCallback(
    (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => {
      if (!user) return;
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      
      const dataToUpdate: Partial<Task> = { ...taskData };
      if (taskData.status === 'Completed' && !taskData.completedAt) {
        dataToUpdate.completedAt = new Date().toISOString();
      } else if (taskData.status && taskData.status !== 'Completed') {
        dataToUpdate.completedAt = undefined; // or delete field
      }

      updateDocumentNonBlocking(taskRef, dataToUpdate);
    },
    [firestore, user]
  );

  const reorderTasks = useCallback((reorderedTasks: Task[]) => {
      if (!user || !firestore) return;
      
      const batch = writeBatch(firestore);
      
      reorderedTasks.forEach((task, index) => {
        const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
        
        let newPriority: 'High' | 'Medium' | 'Low';
        if (index < 3) {
            newPriority = 'High';
        } else if (index < 6) {
            newPriority = 'Medium';
        } else {
            newPriority = 'Low';
        }

        batch.update(taskRef, { 
            orderRank: index,
            priority: newPriority
        });
      });

      // Commit the batch. This is an atomic operation.
      batch.commit().catch(console.error);

    }, [firestore, user]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!user) return;
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      deleteDocumentNonBlocking(taskRef);
    },
    [firestore, user]
  );

  const todaysFocusTasks = useMemo(() => {
    if (!tasks) return [];
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    return tasks
      .filter(task => task.status !== 'Completed' && isToday(parseISO(task.dueDate)))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);
  }, [tasks]);

  const riskyTasks = useMemo(() => {
    if (!tasks) return [];
  
    const now = new Date();
    
    const calculateRisk = (task: Task): TaskWithRisk => {
      let score = 0;
      const dueDate = parseISO(task.dueDate);
      const daysUntilDue = differenceInDays(dueDate, now);
  
      // Factor 1: Deadline proximity
      if (daysUntilDue < 1) score += 40; // Due today or overdue
      else if (daysUntilDue < 3) score += 25; // Due in < 3 days
      else if (daysUntilDue < 7) score += 10; // Due in < 7 days
  
      // Factor 2: Task status
      if (task.status === 'Pending') score += 30;
      if (task.status === 'In Progress') score += 10;
  
      // Factor 3: Priority
      if (task.priority === 'High') score += 30;
      if (task.priority === 'Medium') score += 15;
  
      let riskLevel: 'High' | 'Medium' | 'Low';
      if (score >= 60) riskLevel = 'High';
      else if (score >= 40) riskLevel = 'Medium';
      else riskLevel = 'Low';
  
      return { ...task, riskScore: score, riskLevel };
    };
  
    return tasks
      .filter(task => task.status !== 'Completed')
      .map(calculateRisk)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);
  }, [tasks]);
  
  const stats: TaskStats = useMemo(() => {
    const allTasks = rawTasks || [];
    const defaultStats: TaskStats = {
      total: 0, completedToday: 0, overdue: 0, upcoming: 0, 
      completedThisWeek: 0, completedLastWeek: 0, wowTrend: 0,
      completionRate: 0, avgCompletionTimeDays: 0, mostProductiveDay: 'N/A',
      tasksCompletedByDay: [],
      priorityCounts: { High: 0, Medium: 0, Low: 0 },
    };

    if (!allTasks.length) {
        return defaultStats;
    }
    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const endOfLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const completedTasks = allTasks.filter(t => t.status === 'Completed' && t.completedAt);
    
    const priorityCounts = allTasks.reduce<PriorityCounts>((acc, task) => {
        if(task.status !== 'Completed') {
            acc[task.priority]++;
        }
        return acc;
    }, { High: 0, Medium: 0, Low: 0 });

    const completedThisWeekCount = completedTasks.filter(t => {
      try {
        const completedDate = parseISO(t.completedAt!);
        return isWithinInterval(completedDate, { start: startOfThisWeek, end: endOfThisWeek });
      } catch(e) { return false; }
    }).length;
    
    const completedLastWeekCount = completedTasks.filter(t => {
      try {
        const completedDate = parseISO(t.completedAt!);
        return isWithinInterval(completedDate, { start: startOfLastWeek, end: endOfLastWeek });
      } catch(e) { return false; }
    }).length;

    const wowTrend = completedLastWeekCount > 0 
      ? Math.round(((completedThisWeekCount - completedLastWeekCount) / completedLastWeekCount) * 100)
      : (completedThisWeekCount > 0 ? 100 : 0);

    const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

    const completionTimes = completedTasks
      .map(t => {
        try {
          return differenceInDays(parseISO(t.completedAt!), parseISO(t.createdAt));
        } catch (e) {
          return null;
        }
      })
      .filter((d): d is number => d !== null && d >= 0);

    const avgCompletionTimeDays = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;
      
    const dayCounts: { [key: string]: number } = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };
    completedTasks.forEach(t => {
        try {
            const day = format(parseISO(t.completedAt!), 'EEEE');
            dayCounts[day]++;
        } catch(e) {}
    });

    const tasksCompletedByDay = Object.entries(dayCounts).map(([day, tasks]) => ({ day, tasks }));
    
    const mostProductiveDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, 'N/A');

    return {
      total: allTasks.length,
      completedToday: completedTasks.filter(t => {
        try {
            return isToday(parseISO(t.completedAt!))
        } catch(e) { return false }
      }).length,
      overdue: allTasks.filter(t => {
         try {
            const dueDate = parseISO(t.dueDate);
            return t.status !== 'Completed' && isPast(dueDate) && !isToday(dueDate)
        } catch(e) { return false }
      }).length,
      upcoming: allTasks.filter(t => {
         try {
            return t.status !== 'Completed' && isFuture(parseISO(t.dueDate))
        } catch(e) { return false }
      }).length,
      completedThisWeek: completedThisWeekCount,
      completedLastWeek: completedLastWeekCount,
      wowTrend,
      completionRate,
      avgCompletionTimeDays,
      mostProductiveDay: mostProductiveDay === 'N/A' && completedTasks.length > 0 ? Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b) : mostProductiveDay,
      tasksCompletedByDay,
      priorityCounts
    };
  }, [rawTasks]);

  return { 
    tasks, 
    isLoaded: !isTasksLoading && !isUserLoading && !error,
    stats,
    riskyTasks, 
    todaysFocusTasks,
    searchQuery,
    setSearchQuery,
    addTask,
    addMultipleTasks, 
    updateTask,
    reorderTasks,
    deleteTask 
  };
}
