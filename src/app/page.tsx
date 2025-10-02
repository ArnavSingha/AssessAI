
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import { Loader } from '@/components/Loader';

function RoleSelectionContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-2 text-2xl font-bold mb-8">
        <Bot className="h-8 w-8 text-primary" />
        <span className="font-headline">AssessAI</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Choose Your Role</h1>
      <p className="text-muted-foreground mb-8">
        Please select how you would like to use the application.
      </p>
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => router.push('/interviewee')}
          className="w-48"
        >
          I am an Interviewee
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push('/interviewer')}
          className="w-48"
        >
          I am an Interviewer
        </Button>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return <RoleSelectionContent />;
}
