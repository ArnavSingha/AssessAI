
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  addMessage,
  updateCandidateField,
} from '@/lib/store/features/candidate/candidateProfileSlice';
import {
  setQuestions,
  setStatus,
} from '@/lib/store/features/interview/interviewSlice';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { Send, Loader2 } from 'lucide-react';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';

export function PreInterviewChat() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { name, email, phone, chatHistory, resumeText, jobDescriptionFile } =
    useSelector((state: RootState) => state.candidateProfile);
  const [userInput, setUserInput] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasStartedGenerating = useRef(false);
  const infoDisplayed = useRef(false);

  useEffect(() => {
    if (!infoDisplayed.current) {
      const hasDetails = name || email || phone;
      if (hasDetails) {
        let text = 'I have parsed the following information from your resume:';
        if (name) text += `\n- Name: ${name}`;
        if (email) text += `\n- Email: ${email}`;
        if (phone) text += `\n- Phone: ${phone}`;
        dispatch(addMessage({ sender: 'system', text }));
      }

      const fields: string[] = [];
      if (!name) fields.push('name');
      if (!email) fields.push('email');
      if (!phone) fields.push('phone');
      setMissingFields(fields);

      if (fields.length > 0) {
        dispatch(
          addMessage({
            sender: 'system',
            text: `I couldn't find your ${fields[0]} in the resume. Could you please provide it?`,
          })
        );
      }
      infoDisplayed.current = true;
    }
  }, [name, email, phone, dispatch, chatHistory]);

  useEffect(() => {
    const allInfoCollected = name && email && phone;
    if (allInfoCollected && !hasStartedGenerating.current && infoDisplayed.current) {
      hasStartedGenerating.current = true;
      setIsGenerating(true);

      const startGeneration = async () => {
        try {
          const shouldShowThankYou = chatHistory.some(m => m.sender === 'user');
          const message = shouldShowThankYou
            ? 'Thank you! I have all the information I need. Generating interview questions now, please wait...'
            : 'Generating interview questions now, please wait...';

          dispatch(addMessage({ sender: 'system', text: message }));

          const result = await generateInterviewQuestions({
            resumeText,
            jobDescription: jobDescriptionFile?.name,
          });

          dispatch(setQuestions(result.questions));
          dispatch(setStatus('in-progress'));
          router.push('/interview/session');
        } catch (error) {
          console.error('Failed to generate interview questions:', error);
          dispatch(
            addMessage({
              sender: 'system',
              text: 'Sorry, I encountered an error while generating questions. Please try starting the process over.',
            })
          );
          setIsGenerating(false);
        }
      };

      startGeneration();
    }
  }, [name, email, phone, resumeText, jobDescriptionFile, chatHistory, dispatch, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!userInput.trim() || missingFields.length === 0) return;

    dispatch(addMessage({ sender: 'user', text: userInput }));
    const currentField = missingFields[0] as 'name' | 'email' | 'phone';
    dispatch(updateCandidateField({ field: currentField, value: userInput }));
    setUserInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <ChatMessage key={index} sender={msg.sender} text={msg.text} />
          ))}
          {isGenerating && (
            <div className="flex justify-start items-start">
              <ChatMessage
                sender="system"
                text="Generating interview questions now, please wait..."
              />
              <Loader2 className="animate-spin ml-2 mt-2" />
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={missingFields.length === 0 || isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={missingFields.length === 0 || isGenerating}
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
