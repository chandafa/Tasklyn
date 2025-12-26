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
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Generate a new random cat image URL on component mount
    setAvatarUrl(`https://cataas.com/cat?_=${new Date().getTime()}`);
  }, []);

  const handleAvatarChange = () => {
    // Generate a new random cat image URL on button click
    setAvatarUrl(`https://cataas.com/cat?_=${new Date().getTime()}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute top-4 left-4 h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali</span>
          </Button>
          <div className="text-center pt-8">
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Kelola pengaturan profil dan preferensi Anda.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <Avatar className="h-24 w-24">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="User avatar" />}
              <AvatarFallback className="text-3xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold">
                {user?.displayName || user?.email}
              </h3>
              <Button variant="outline" onClick={handleAvatarChange}>Ubah Avatar</Button>
            </div>
          </div>

          <Separator />

          {/* Timezone Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferensi Akun</h3>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="timezone" className="font-semibold">
                    Zona Waktu
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pilih zona waktu lokal Anda.
                  </p>
                </div>
                <Select defaultValue="gmt+7">
                  <SelectTrigger id="timezone" className="w-[240px]">
                    <SelectValue placeholder="Select timezone" />
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
            </div>
          </div>

          <Separator />

          {/* Notification Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferensi Notifikasi</h3>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <Label
                  htmlFor="email-notifications"
                  className="font-semibold"
                >
                  Notifikasi Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Terima pembaruan dan pengingat melalui email.
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <Label
                  htmlFor="push-notifications"
                  className="font-semibold"
                >
                  Notifikasi Push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi di perangkat Anda.
                </p>
              </div>
              <Switch id="push-notifications" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
