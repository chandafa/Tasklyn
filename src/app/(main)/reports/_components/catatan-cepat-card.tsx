'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useNotes, Note } from '@/lib/hooks/use-notes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function CatatanCepatCard() {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setNoteContent(selectedNote.content);
    } else {
      setNoteContent('');
    }
  }, [selectedNote]);
  
  useEffect(() => {
    // When notes are loaded, if there's no selected note, select the first one.
    if (!isLoading && notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [isLoading, notes, selectedNote]);

  const handleSave = () => {
    if (noteContent.trim() === '') return;

    if (selectedNote) {
      updateNote(selectedNote.id, noteContent);
    } else {
      addNote(noteContent);
    }
    // Don't clear form, user might want to continue editing
  };
  
  const handleNewNote = () => {
      setSelectedNote(null);
      setNoteContent('');
  };

  const handleDelete = () => {
      if (!selectedNote) return;
      deleteNote(selectedNote.id);
      setSelectedNote(null);
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'beberapa saat lalu';
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  }

  return (
    <Card className="flex flex-col h-[480px]">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Catatan Cepat</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleNewNote}>
                <Plus className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="h-1/3 pr-2">
            <div className="space-y-2">
                {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
                {!isLoading && notes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className={cn(
                            "w-full text-left p-2 rounded-md transition-colors",
                            selectedNote?.id === note.id ? "bg-accent" : "hover:bg-accent/50"
                        )}
                    >
                        <p className="font-semibold text-sm truncate">{note.content.split('\n')[0] || 'Catatan baru'}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(note.createdAt)}</p>
                    </button>
                ))}
                {!isLoading && notes.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground pt-4">Belum ada catatan.</p>
                )}
            </div>
        </ScrollArea>
        
        <div className="flex-grow flex flex-col gap-2">
            <Textarea 
                placeholder="Tulis catatan cepat di sini..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex-grow text-base"
            />
             <div className="flex justify-end gap-2">
                {selectedNote && (
                     <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                    </Button>
                )}
                <Button onClick={handleSave} size="sm">
                   {selectedNote ? 'Simpan Perubahan' : 'Simpan Catatan'}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
