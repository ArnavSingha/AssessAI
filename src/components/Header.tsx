
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <Bot className="h-7 w-7 text-primary" />
          <span className="font-headline">AssessAI</span>
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
