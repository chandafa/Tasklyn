'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Loader2, UserCheck } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter.').max(15, 'Username maksimal 15 karakter.').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan garis bawah.'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserProfile } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateUserProfile({ displayName: data.username });
      toast({
        title: 'Profil Diperbarui!',
        description: `Selamat datang, ${data.username}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Username',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
                <UserCheck className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Satu Langkah Lagi</CardTitle>
            <CardDescription>Pilih username untuk melengkapi profil Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="Pilih username unik Anda"
                        {...field}
                        disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Simpan & Lanjutkan'}
                </Button>
            </form>
            </Form>
        </CardContent>
        </Card>
    </div>
  );
}
