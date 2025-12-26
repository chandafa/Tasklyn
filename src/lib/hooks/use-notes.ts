'use client';

import { useState, useMemo, useCallback } from 'react';
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
  writeBatch
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  content: string;
  createdAt: any; // Allow server timestamp
}

export function useNotes() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const notesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'notes');
  }, [firestore, user]);

  const { data: notes, isLoading } = useCollection<Note>(notesQuery);

  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    return [...notes].sort((a, b) => {
        // Firestore timestamps can be seconds/nanoseconds objects
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; // Most recent first
    });
  }, [notes]);

  const addNote = useCallback((content: string) => {
    if (!notesQuery) {
        toast({ variant: 'destructive', title: 'Anda harus masuk untuk menyimpan catatan.' });
        return;
    }
    const newNote = {
      content,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(notesQuery, newNote);
    toast({ title: "Catatan Disimpan!" });
  }, [notesQuery, toast]);

  const updateNote = useCallback((noteId: string, content: string) => {
    if (!user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    updateDocumentNonBlocking(noteRef, { content });
    toast({ title: "Catatan Diperbarui!" });
  }, [firestore, user, toast]);

  const deleteNote = useCallback((noteId: string) => {
    if (!user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    deleteDocumentNonBlocking(noteRef);
    toast({ title: "Catatan Dihapus!" });
  }, [firestore, user, toast]);

  const deleteAllNotes = useCallback(async () => {
    if (!user || !firestore || !notes) return;

    if (notes.length === 0) return;

    const batch = writeBatch(firestore);
    notes.forEach(note => {
        const noteRef = doc(firestore, 'users', user.uid, 'notes', note.id);
        batch.delete(noteRef);
    });

    await batch.commit();
  }, [firestore, user, notes]);

  return {
    notes: sortedNotes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
  };
}
