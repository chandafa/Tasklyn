'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().min(3, 'Nama ruang kerja minimal 3 karakter.'),
  description: z.string().optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateWorkspace: (data: WorkspaceFormData) => Promise<void>;
}

export function CreateWorkspaceDialog({ isOpen, onOpenChange, onCreateWorkspace }: CreateWorkspaceDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    setIsCreating(true);
    try {
      await onCreateWorkspace(data);
      toast({
        title: 'Ruang Kerja Dibuat!',
        description: `Ruang kerja "${data.name}" telah berhasil dibuat.`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Ruang Kerja',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Ruang Kerja Baru</DialogTitle>
          <DialogDescription>
            Beri nama dan deskripsi untuk ruang kerja tim Anda.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ruang Kerja</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Tim Pemasaran" {...field} />
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
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan tujuan ruang kerja ini..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Ruang Kerja
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
