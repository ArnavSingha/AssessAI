
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Moon, Sun, Monitor, ChevronLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveChanges = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      toast({
        title: 'Profile Updated',
        description: 'Your name has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} disabled />
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="pt-4">
        <Link href="/interview/start">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    </div>
  );
}
