
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, XCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { PasswordConstraints } from './PasswordConstraints';
import { cn } from '@/lib/utils';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.301-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export function InterviewerAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const constraints = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    return constraints;
  };

  const handleAuth = async (
    event: React.FormEvent,
    type: 'signin' | 'signup'
  ) => {
    event.preventDefault();
    setIsLoading(true);

    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;

    try {
      if (type === 'signup') {
        const confirmPassword = (
          form.elements.namedItem('confirmPassword') as HTMLInputElement
        ).value;

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const passwordConstraints = validatePassword(password);
        const { length, lowercase, uppercase, digit, special } =
          passwordConstraints;

        if (!length)
          throw new Error('Password must be at least 8 characters long.');
        if (!lowercase)
          throw new Error(
            'Password must contain at least one lowercase letter.'
          );
        if (!uppercase)
          throw new Error(
            'Password must contain at least one uppercase letter.'
          );
        if (!digit) throw new Error('Password must contain at least one digit.');
        if (!special)
          throw new Error(
            'Password must contain at least one special character.'
          );

        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      toast({
        title: `Successfully ${
          type === 'signin' ? 'signed in' : 'signed up'
        }!`,
        description: `Redirecting you to the interviewer dashboard...`,
      });

      router.push('/interviewer/dashboard');
    } catch (error: any) {
      if (
        error.code !== 'auth/invalid-credential' &&
        error.code !== 'auth/user-not-found' &&
        error.code !== 'auth/wrong-password'
      ) {
        console.error('Firebase authentication error:', error);
      }
      let errorMessage =
        error.message || 'An unexpected error occurred. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage =
            'This email is already in use. Please sign in or use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'The password is too weak. Please use a stronger password.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
      }
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Successfully signed in with Google!',
        description: 'Redirecting you to the interviewer dashboard...',
      });
      router.push('/interviewer/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast({
        title: 'Google Sign-In Failed',
        description:
          error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordConstraints = validatePassword(passwordInput);
  const allConstraintsMet = Object.values(passwordConstraints).every(Boolean);
  const passwordsMatch =
    passwordInput === confirmPasswordInput && confirmPasswordInput.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Interviewer Sign In</CardTitle>
              <CardDescription>Access the candidate dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleAuth(e, 'signin')}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-signin-interviewer">Email</Label>
                  <Input
                    id="email-signin-interviewer"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin-interviewer">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-signin-interviewer"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="animate-spin" />}
                  Sign In
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2" />
                )}
                Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Interviewer Sign Up</CardTitle>
              <CardDescription>
                Create an account to review candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleAuth(e, 'signup')}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name-signup-interviewer">Name</Label>
                  <Input
                    id="name-signup-interviewer"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup-interviewer">Email</Label>
                  <Input
                    id="email-signup-interviewer"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup-interviewer">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-signup-interviewer"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {isPasswordFocused && !allConstraintsMet && (
                    <PasswordConstraints constraints={passwordConstraints} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword-signup-interviewer">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword-signup-interviewer"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-s" />
                      )}
                    </Button>
                  </div>
                  {isConfirmPasswordFocused &&
                    confirmPasswordInput.length > 0 && (
                      <div
                        className={cn(
                          'flex items-center gap-2 text-xs mt-2',
                          passwordsMatch ? 'text-green-500' : 'text-destructive'
                        )}
                      >
                        {passwordsMatch ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>
                          {passwordsMatch
                            ? 'Passwords match'
                            : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="animate-spin" />}
                  Sign Up
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2" />
                )}
                Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
       <div className="mt-4">
        <Link href="/">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    </div>
  );
}
