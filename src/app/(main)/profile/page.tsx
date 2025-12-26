'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, auth } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAvatarUrl(`https://cataas.com/cat/says/hello?_=${new Date().getTime()}`);
    if (user) {
        setUsername(user.displayName || '');
    }
  }, [user]);

  const handleAvatarChange = () => {
    setAvatarUrl(`https://cataas.com/cat/says/hello?_=${new Date().getTime()}`);
  };

  const handleSaveUsername = async () => {
      if (!user || !auth || !auth.currentUser) return;
      if (username.length < 3 || username.length > 20) {
          toast({
              variant: 'destructive',
              title: 'Username tidak valid',
              description: 'Username harus terdiri dari 3 hingga 20 karakter.'
          });
          return;
      }
      setIsSaving(true);
      try {
          await updateProfile(auth.currentUser, { displayName: username });
          toast({
              title: 'Sukses!',
              description: 'Username Anda telah diperbarui.'
          });
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Gagal memperbarui username',
              description: error.message || 'Terjadi kesalahan.'
          });
      } finally {
          setIsSaving(false);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 shrink-0"
        >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali</span>
        </Button>
        <div>
            <h1 className="text-xl font-bold">Profil</h1>
            <p className="text-sm text-muted-foreground">Kelola pengaturan profil dan preferensi Anda.</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24 border-2 border-primary/50 p-1">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="User avatar" />}
              <AvatarFallback className="text-3xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <div className="relative">
                    <Input 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-xl font-semibold text-center h-10 w-[200px]"
                        placeholder="Username Anda"
                    />
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAvatarChange}>Ubah Avatar</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Preferensi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg">
                    <div className='mb-2 sm:mb-0'>
                        <Label htmlFor="timezone" className="font-semibold">
                            Zona Waktu
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Pilih zona waktu lokal Anda.
                        </p>
                    </div>
                    <Select defaultValue="gmt+7">
                        <SelectTrigger id="timezone" className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Pilih zona waktu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gmt-5">AS (Timur) (GMT-5)</SelectItem>
                            <SelectSeparator />
                            <SelectItem value="gmt+0">London (GMT+0)</SelectItem>
                            <SelectItem value="gmt+1">Eropa Tengah (GMT+1)</SelectItem>
                            <SelectSeparator />
                            <SelectItem value="gmt+7">Jakarta (GMT+7)</SelectItem>
                            <SelectItem value="gmt+9">Tokyo (GMT+9)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Preferensi Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <Label htmlFor="email-notifications" className="font-semibold cursor-pointer">
                        Notifikasi Email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                        Terima pembaruan melalui email.
                        </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                 <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <Label htmlFor="push-notifications" className="font-semibold cursor-pointer">
                        Notifikasi Push
                        </Label>
                        <p className="text-xs text-muted-foreground">
                        Terima notifikasi di perangkat Anda.
                        </p>
                    </div>
                    <Switch id="push-notifications" />
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="flex justify-end pt-2">
          <Button onClick={handleSaveUsername} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
    </div>
  );
}
