'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { Invitation } from '@/lib/hooks/use-workspaces';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export function InvitationCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anda Diundang!</CardTitle>
        <CardDescription>
          Anda telah diundang untuk bergabung dengan ruang kerja.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-semibold">{invitation.workspaceName}</p>
        <p className="text-sm text-muted-foreground">
          Diundang oleh: {invitation.inviterEmail}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onDecline(invitation.id)}>
          <X className="mr-2 h-4 w-4" /> Tolak
        </Button>
        <Button size="sm" onClick={() => onAccept(invitation.id)}>
          <Check className="mr-2 h-4 w-4" /> Terima
        </Button>
      </CardFooter>
    </Card>
  );
}
