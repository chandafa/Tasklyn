'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Send, Users, Shield, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useWorkspaces } from '@/lib/hooks/use-workspaces';
import { useUser } from '@/firebase';
import { CreateWorkspaceDialog } from './_components/create-workspace-dialog';
import { InvitationCard } from './_components/invitation-card';
import { AddTaskDialog } from '../_components/add-task-dialog';
import type { Task } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export default function CollabPage() {
  const { user } = useUser();
  const {
    workspaces,
    invitations,
    activeWorkspace,
    activeWorkspaceMembers,
    activeWorkspaceTasks,
    isLoaded,
    createWorkspace,
    setActiveWorkspaceId,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    addSharedTask,
    updateSharedTask,
  } = useWorkspaces();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const collabIllustration = PlaceHolderImages.find(p => p.id === 'collab-illustration');
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeWorkspace) return;
    setIsInviting(true);
    await inviteMember(inviteEmail);
    setIsInviting(false);
    setInviteEmail('');
  };

  const handleTaskAdd = (task: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt' | 'orderRank'> & { description?: string }) => {
    if (!activeWorkspace) return;
    addSharedTask(task);
  };

  const handleTaskStatusChange = (taskId: string, currentStatus: Task['status']) => {
    if (!activeWorkspace) return;
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateSharedTask(taskId, { status: newStatus });
  };


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Handle invitations first, but only for non-anonymous users
  if (user && !user.isAnonymous && invitations.length > 0) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4">
        {invitations.map(inv => (
          <InvitationCard 
            key={inv.id} 
            invitation={inv}
            onAccept={acceptInvitation}
            onDecline={declineInvitation}
          />
        ))}
      </div>
    )
  }

  // If no workspace, show creation view
  if (workspaces.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          {collabIllustration && (
             <Image
              src={collabIllustration.imageUrl}
              alt="Collaboration Illustration"
              width={300}
              height={200}
              className="mb-6 rounded-lg"
              data-ai-hint={collabIllustration.imageHint}
            />
          )}
          <h2 className="text-2xl font-bold mb-2">Mulai Berkolaborasi dengan Tim Anda</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Buat ruang kerja untuk berbagi tugas, melacak kemajuan, dan mencapai tujuan bersama.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} disabled={user?.isAnonymous}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Ruang Kerja Pertama Anda
          </Button>
           {user?.isAnonymous && (
            <p className="mt-4 text-sm text-muted-foreground">
              Silakan <a href="/register" className="underline">buat akun</a> untuk membuat ruang kerja.
            </p>
          )}
        </div>
        <CreateWorkspaceDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCreateWorkspace={createWorkspace}
        />
      </>
    );
  }
  
  if (!activeWorkspace) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Pilih Ruang Kerja</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                Pilih salah satu ruang kerja Anda untuk mulai berkolaborasi.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
                {workspaces.map(ws => (
                    <Button key={ws.id} variant="outline" onClick={() => setActiveWorkspaceId(ws.id)}>
                        {ws.name}
                    </Button>
                ))}
            </div>
             <p className="text-muted-foreground mt-8">atau</p>
             <Button onClick={() => setIsCreateOpen(true)} className="mt-4" disabled={user?.isAnonymous}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Buat Ruang Kerja Baru
            </Button>
             {user?.isAnonymous && (
                <p className="mt-4 text-sm text-muted-foreground">
                Silakan <a href="/register" className="underline">buat akun</a> untuk membuat ruang kerja.
                </p>
            )}
            <CreateWorkspaceDialog
                isOpen={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreateWorkspace={createWorkspace}
            />
        </div>
    );
  }


  return (
     <>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{activeWorkspace.name}</h1>
            <p className="text-muted-foreground">{activeWorkspace.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Tugas
            </Button>
            <select
              value={activeWorkspace.id}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="px-3 py-2 border rounded-md bg-card text-card-foreground"
            >
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card>
              <CardHeader>
                <CardTitle>Tugas Bersama</CardTitle>
                <CardDescription>Tugas yang sedang dikerjakan oleh tim Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Tugas</TableHead>
                      <TableHead>Tenggat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeWorkspaceTasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>
                           <Checkbox
                            checked={task.status === 'Completed'}
                            onCheckedChange={() => handleTaskStatusChange(task.id, task.status)}
                           />
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                            {format(parseISO(task.dueDate), 'd MMM')}
                        </TableCell>
                      </TableRow>
                    ))}
                     {activeWorkspaceTasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                Belum ada tugas bersama.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Anggota Tim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeWorkspaceMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userAvatar?.imageUrl} alt={member.email} />
                        <AvatarFallback>{member.email.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.email === user?.email ? 'You' : member.email}</p>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                          {member.role === 'owner' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Undang Anggota Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="flex w-full items-center space-x-2">
                  <Input 
                    type="email" 
                    placeholder="Email anggota..." 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting || user?.isAnonymous}
                  />
                  <Button type="submit" size="icon" disabled={isInviting || user?.isAnonymous}>
                     {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
                {user?.isAnonymous && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Fitur undangan memerlukan akun terdaftar.
                    </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AddTaskDialog 
        isOpen={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onTaskAdd={handleTaskAdd}
      />
    </>
  );
}
