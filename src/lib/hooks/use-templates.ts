'use client';

import { useMemo, useCallback } from 'react';
import { formatISO, addDays } from 'date-fns';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { taskTemplates as defaultTemplates } from '@/lib/task-templates';
import type { TemplateFormData } from '@/app/(main)/explore/_components/create-template-dialog';

export interface TemplateTask {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[]; // Merged from Template's category
  dueDate: string; // Should be calculated relative to creation
  createdAt: string; // Should be set on creation
}

export interface Template {
    id: string;
    title: string;
    description: string;
    category: string;
    authorId?: string;
    authorName?: string;
    published: boolean;
    tasks: TemplateTask[];
}

// Convert default templates to the new format
const formattedDefaultTemplates: Template[] = defaultTemplates.map((dt, index) => ({
    id: `default-${index}`,
    title: dt.title,
    description: dt.description,
    authorName: 'TaskVerse',
    published: true,
    category: dt.tasks[0]?.tags[0] || 'organisasi',
    tasks: dt.tasks.map(t => ({...t})),
}));


export function useTemplates() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const publishedTemplatesQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'templates'), where('published', '==', true));
  }, [firestore]);

  const { data: publishedTemplates, isLoading } = useCollection<Omit<Template, 'id'>>(publishedTemplatesQuery);

  const templates = useMemo(() => {
    const userTemplates = publishedTemplates || [];
    return [...formattedDefaultTemplates, ...userTemplates];
  }, [publishedTemplates]);


  const createTemplate = useCallback(async (data: TemplateFormData) => {
    if (!firestore || !user) throw new Error('User not authenticated');

    const templateTasks = data.tasks.map(task => ({
        ...task,
        tags: [data.category],
        dueDate: formatISO(addDays(new Date(), 7)), // Default due date
        createdAt: formatISO(new Date()),
    }));

    const newTemplate = {
      title: data.title,
      description: data.description,
      category: data.category,
      tasks: templateTasks,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      published: false, // Draft by default
      createdAt: new Date().toISOString(),
    };

    try {
        await addDoc(collection(firestore, 'templates'), newTemplate);
    } catch (e) {
        console.error("Error creating template: ", e);
        throw e;
    }

  }, [firestore, user]);


  return {
    templates,
    isLoading,
    createTemplate,
  };
}
