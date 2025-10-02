
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  setCandidateProfile,
  addMessage,
  clearChatHistory,
  resetCandidateProfile,
} from '@/lib/store/features/candidate/candidateProfileSlice';
import { Loader2, Upload } from 'lucide-react';
import type { AppDispatch, RootState } from '@/lib/store/store';
import { parseResumeAction } from '@/app/actions/parse-resume-action';
import { WelcomeBackModal } from './WelcomeBackModal';
import { resetInterview, setUserId } from '@/lib/store/features/interview/interviewSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export function IntervieweeView() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const interviewState = useSelector((state: RootState) => state.interview);
  const { status: interviewStatus, userId: interviewUserId } = interviewState;
  
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && (interviewStatus === 'in-progress' || interviewStatus === 'evaluating' || interviewStatus === 'completed') && interviewUserId === currentUser.uid) {
      setShowWelcomeBack(true);
    } else {
      setShowWelcomeBack(false);
    }
  }, [interviewStatus, interviewUserId, currentUser]);

  const handleContinue = () => {
    if ((interviewStatus === 'in-progress' || interviewStatus === 'evaluating' || interviewStatus === 'completed') && interviewUserId === currentUser?.uid) {
       router.push('/interview/session');
    }
  };

  const handleRestart = () => {
    dispatch(resetInterview());
    dispatch(resetCandidateProfile());
    setShowWelcomeBack(false);
  };

  const handleFileChange =
    (setter: (file: File | null) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setter(file);
    };

  const handleStartInterview = async () => {
    if (!resumeFile) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume to start the interview.',
        variant: 'destructive',
      });
      return;
    }
     if (!currentUser) {
      toast({
        title: 'Not Logged In',
        description: 'You must be logged in to start an interview.',
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(resumeFile.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a valid resume file (PDF or DOCX).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    dispatch(clearChatHistory());
    dispatch(setUserId(currentUser.uid));

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const result = await parseResumeAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      const { text, profileData } = result;

      const profile = {
        name: profileData?.name || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        resumeText: text || '',
        resumeFile: {
          name: resumeFile.name,
          type: resumeFile.type,
          // Not storing buffer in redux
        },
        jobDescriptionFile: jdFile
          ? { name: jdFile.name, type: jdFile.type }
          : null,
      };

      dispatch(setCandidateProfile(profile));
      dispatch(
        addMessage({
          sender: 'system',
          text: 'Resume parsed successfully! I will now ask for any missing information.',
        })
      );
      router.push('/interview/chat');
    } catch (error) {
      console.error('Error parsing resume:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Parsing Error',
        description: `There was an error parsing your resume: ${errorMessage}`,
        variant: 'destructive',
      });
      dispatch(
        addMessage({
          sender: 'system',
          text: 'I apologize, but I had trouble reading your resume. Could you please try uploading a different file?',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <WelcomeBackModal
          open={showWelcomeBack}
          onContinue={handleContinue}
          onRestart={handleRestart}
        />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-10rem)]">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-headline">
            Practice Your Interviews with AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume and a job description to start a tailored mock
            interview. Get instant feedback and improve your skills.
          </p>
          <div className="flex gap-4">
            <Button size="lg" onClick={handleStartInterview} disabled={isLoading || !resumeFile}>Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        <div>
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Start a New Session</CardTitle>
              <CardDescription>
                Upload your documents to begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume-upload">Resume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume-upload"
                    type="file"
                    onChange={handleFileChange(setResumeFile)}
                    className="hidden"
                    accept=".pdf,.docx"
                  />
                  <Button variant="outline" asChild>
                    <Label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex items-center gap-2 w-full justify-center"
                    >
                      <Upload />
                      <span>Choose File</span>
                    </Label>
                  </Button>
                  <span className="text-sm text-muted-foreground truncate w-40">
                    {resumeFile?.name || 'No file chosen'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jd-upload">Job Description (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="jd-upload"
                    type="file"
                    onChange={handleFileChange(setJdFile)}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                  />
                  <Button variant="outline" asChild>
                    <Label
                      htmlFor="jd-upload"
                      className="cursor-pointer flex items-center gap-2 w-full justify-center"
                    >
                      <Upload />
                      <span>Choose File</span>
                    </Label>
                  </Button>
                  <span className="text-sm text-muted-foreground truncate w-40">
                    {jdFile?.name || 'No file chosen'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleStartInterview}
                disabled={isLoading || !resumeFile}
              >
                {isLoading && <Loader2 className="animate-spin" />}
                Start Interview
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
