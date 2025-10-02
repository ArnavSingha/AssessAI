
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WelcomeBackModalProps {
  open: boolean;
  onContinue: () => void;
  onRestart: () => void;
}

export function WelcomeBackModal({
  open,
  onContinue,
  onRestart,
}: WelcomeBackModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome Back!</AlertDialogTitle>
          <AlertDialogDescription>
            You have an interview in progress. Would you like to continue where
            you left off or start over?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onRestart}>
            Restart Interview
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            Continue Interview
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
