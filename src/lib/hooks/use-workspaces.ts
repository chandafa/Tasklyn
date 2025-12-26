'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

export interface Member {
  id: string;
  email: string;
  role: 'owner' | 'member';
}

export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviteeEmail: string;
  inviterEmail: string;
  status: 'pending' | 'accepted' | 'declined';
}

export function useWorkspaces() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  // 1. Fetch workspaces where the user is a member
  const memberInQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'members'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: memberEntries } = useCollection(memberInQuery);

  const workspaceIds = useMemo(() => {
    return memberEntries?.map(m => m.workspaceId) || [];
  }, [memberEntries]);

  const workspacesQuery = useMemoFirebase(() => {
    if (!user || workspaceIds.length === 0) return null;
    return query(collection(firestore, 'workspaces'), where('__name__', 'in', workspaceIds));
  }, [firestore, user, workspaceIds]);

  const { data: workspaces, isLoading: workspacesLoading } = useCollection<Workspace>(workspacesQuery);

  // 2. Fetch invitations for the current user
  const invitationsQuery = useMemoFirebase(() => {
    if (!user || !user.email) return null;
    return query(
      collection(firestore, 'invitations'),
      where('inviteeEmail', '==', user.email),
      where('status', '==', 'pending')
    );
  }, [firestore, user]);
  
  const { data: pendingInvitations, isLoading: invitationsLoading } = useCollection<Invitation>(invitationsQuery);


  // Set the active workspace
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      const lastActiveId = localStorage.getItem('activeWorkspaceId');
      if (lastActiveId && workspaces.some(ws => ws.id === lastActiveId)) {
        setActiveWorkspaceId(lastActiveId);
      } else {
        setActiveWorkspaceId(workspaces[0].id);
      }
    }
  }, [workspaces, activeWorkspaceId]);

  useEffect(() => {
    if(activeWorkspaceId) {
        localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  // 3. Fetch data for the active workspace
  const activeWorkspace = useMemo(() => {
    return workspaces?.find(ws => ws.id === activeWorkspaceId) || null;
  }, [workspaces, activeWorkspaceId]);

  const membersQuery = useMemoFirebase(() => {
    if (!activeWorkspaceId) return null;
    return collection(firestore, 'workspaces', activeWorkspaceId, 'members');
  }, [firestore, activeWorkspaceId]);
  const { data: activeWorkspaceMembers, isLoading: membersLoading } = useCollection<Member>(membersQuery);

  const tasksQuery = useMemoFirebase(() => {
    if (!activeWorkspaceId) return null;
    return collection(firestore, 'workspaces', activeWorkspaceId, 'tasks');
  }, [firestore, activeWorkspaceId]);
  const { data: activeWorkspaceTasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);


  // Check if all data has been loaded
  useEffect(() => {
      const loading = workspacesLoading || invitationsLoading || (!!activeWorkspaceId && (membersLoading || tasksLoading));
      setIsLoaded(!loading);
  }, [workspacesLoading, invitationsLoading, membersLoading, tasksLoading, activeWorkspaceId])

  // --- ACTIONS ---

  const createWorkspace = useCallback(async (data: { name: string; description?: string }) => {
    if (!firestore || !user) throw new Error('User not authenticated');
    
    const batch = writeBatch(firestore);

    // Create workspace
    const workspaceRef = doc(collection(firestore, 'workspaces'));
    batch.set(workspaceRef, {
      ...data,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });

    // Add owner as a member
    const memberRef = doc(collection(firestore, 'workspaces', workspaceRef.id, 'members'), user.uid);
    batch.set(memberRef, {
      userId: user.uid,
      email: user.email,
      role: 'owner',
    });
    
    // Add member lookup entry
    const memberLookupRef = doc(collection(firestore, 'members'));
    batch.set(memberLookupRef, {
      userId: user.uid,
      workspaceId: workspaceRef.id
    })

    await batch.commit();
    setActiveWorkspaceId(workspaceRef.id);
  }, [firestore, user]);


  const inviteMember = useCallback(async (email: string) => {
    if (!firestore || !user || !activeWorkspace) {
      toast({ variant: 'destructive', title: 'Error', description: 'Tidak dapat mengirim undangan.' });
      return;
    }
    
    // Check if user is already a member
    if (activeWorkspaceMembers?.some(m => m.email === email)) {
       toast({ variant: 'destructive', title: 'Anggota Sudah Ada', description: `${email} sudah menjadi anggota ruang kerja ini.` });
       return;
    }

    try {
      await addDoc(collection(firestore, 'invitations'), {
        workspaceId: activeWorkspace.id,
        workspaceName: activeWorkspace.name,
        inviteeEmail: email,
        inviterEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Undangan Terkirim', description: `Undangan telah dikirim ke ${email}.` });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Gagal Mengirim Undangan' });
    }
  }, [firestore, user, activeWorkspace, activeWorkspaceMembers, toast]);


  const acceptInvitation = useCallback(async (invitationId: string) => {
    if (!firestore || !user) return;
    const inv = pendingInvitations?.find(i => i.id === invitationId);
    if (!inv) return;

    const batch = writeBatch(firestore);

    // Add user to workspace members
    const memberRef = doc(collection(firestore, 'workspaces', inv.workspaceId, 'members'), user.uid);
    batch.set(memberRef, {
      userId: user.uid,
      email: user.email,
      role: 'member',
    });

    // Add member lookup entry
    const memberLookupRef = doc(collection(firestore, 'members'));
    batch.set(memberLookupRef, {
      userId: user.uid,
      workspaceId: inv.workspaceId
    });

    // Update invitation status
    const invRef = doc(firestore, 'invitations', invitationId);
    batch.update(invRef, { status: 'accepted' });

    await batch.commit();
    toast({ title: 'Selamat!', description: `Anda telah bergabung dengan ruang kerja ${inv.workspaceName}.` });
  }, [firestore, user, pendingInvitations, toast]);


  const declineInvitation = useCallback(async (invitationId: string) => {
    if (!firestore) return;
    const invRef = doc(firestore, 'invitations', invitationId);
    await updateDoc(invRef, { status: 'declined' });
    toast({ title: 'Undangan Ditolak' });
  }, [firestore, toast]);
  
  const addSharedTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'subtasks' | 'completedAt' | 'orderRank'>) => {
    if (!tasksQuery) return;
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      status: 'Pending',
      subtasks: [],
      orderRank: (activeWorkspaceTasks?.length || 0) + 1
    };
    addDoc(tasksQuery, newTask);
  }, [tasksQuery, activeWorkspaceTasks]);

  const updateSharedTask = useCallback((taskId: string, taskData: Partial<Omit<Task, 'id'>>) => {
      if (!activeWorkspaceId) return;
      const taskRef = doc(firestore, 'workspaces', activeWorkspaceId, 'tasks', taskId);
      const dataToUpdate: Partial<Task> = { ...taskData };
      if (taskData.status === 'Completed' && !taskData.completedAt) {
        dataToUpdate.completedAt = new Date().toISOString();
      }
      updateDoc(taskRef, dataToUpdate);
    },
    [firestore, activeWorkspaceId]
  );


  return {
    isLoaded,
    workspaces: workspaces || [],
    invitations: pendingInvitations || [],
    activeWorkspace,
    activeWorkspaceMembers: activeWorkspaceMembers || [],
    activeWorkspaceTasks: activeWorkspaceTasks || [],
    createWorkspace,
    setActiveWorkspaceId,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    addSharedTask,
    updateSharedTask,
  };
}
