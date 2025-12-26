'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const templateTaskSchema = z.object({
  title: z.string().min(3, 'Judul tugas minimal 3 karakter.'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
});

const templateSchema = z.object({
  title: z.string().min(5, 'Judul templat minimal 5 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  category: z.string().min(3, 'Kategori minimal 3 karakter.'),
  tasks: z.array(templateTaskSchema).min(1, 'Templat harus memiliki setidaknya satu tugas.'),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateTemplate: (data: TemplateFormData) => Promise<void>;
}

export function CreateTemplateDialog({ isOpen, onOpenChange, onCreateTemplate }: CreateTemplateDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'organisasi',
      tasks: [{ title: '', description: '', priority: 'Medium' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  const onSubmit = async (data: TemplateFormData) => {
    setIsCreating(true);
    try {
      await onCreateTemplate(data);
      toast({
        title: 'Templat Disimpan!',
        description: `Draf templat "${data.title}" telah disimpan. Anda dapat mempublikasikannya dari halaman profil.`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Templat',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buat Templat Baru</DialogTitle>
          <DialogDescription>
            Bagikan alur kerja Anda dengan komunitas dengan membuat templat baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-grow">
            <ScrollArea className="h-[calc(80vh-200px)] pr-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Templat</FormLabel>
                      <FormControl>
                        <Input placeholder="cth. Rencana Peluncuran Produk" {...field} />
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
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Jelaskan untuk apa templat ini..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="konten">Konten</SelectItem>
                                <SelectItem value="pemasaran">Pemasaran</SelectItem>
                                <SelectItem value="pengembangan">Pengembangan</SelectItem>
                                <SelectItem value="logistik">Logistik</SelectItem>
                                <SelectItem value="perencanaan">Perencanaan</SelectItem>
                                <SelectItem value="organisasi">Organisasi</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Tugas dalam Templat</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-3 relative">
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`tasks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Judul Tugas {index + 1}</FormLabel>
                            <FormControl>
                              <Input placeholder="cth. Buat halaman arahan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`tasks.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi Tugas (Opsional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Detail tugas..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`tasks.${index}.priority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioritas</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Rendah</SelectItem>
                                    <SelectItem value="Medium">Sedang</SelectItem>
                                    <SelectItem value="High">Tinggi</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                   <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ title: '', description: '', priority: 'Medium' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Tugas
                  </Button>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Draf Templat
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
