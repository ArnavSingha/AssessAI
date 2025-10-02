
import { Bot } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-primary/30"></div>
        <div className="absolute h-32 w-32 animate-pulse rounded-full bg-primary/20 delay-75"></div>
        <div className="absolute h-40 w-40 animate-pulse rounded-full bg-primary/10 delay-150"></div>
        <Bot className="h-16 w-16 text-primary" />
      </div>
      <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground font-headline">
        AssessAI
      </h1>
      <p className="text-muted-foreground">Initializing your interview experience...</p>
    </div>
  );
}
