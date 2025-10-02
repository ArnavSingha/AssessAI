
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  addAnswer,
  setSummary,
  setCurrentQuestionIndex,
  setStatus,
} from '@/lib/store/features/interview/interviewSlice';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, MCQChatMessage } from './ChatMessage';
import { Send, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { evaluateAnswers } from '@/ai/flows/evaluate-answers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { addMessage } from '@/lib/store/features/candidate/candidateProfileSlice';
import { addCandidate } from '@/lib/store/features/candidates/candidatesSlice';

const getTimerDuration = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
  switch (difficulty) {
    case 'Easy':
      return 20;
    case 'Medium':
      return 60;
    case 'Hard':
      return 120;
  }
};

export function InterviewSession() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const interviewState = useSelector((state: RootState) => state.interview);
  const candidateProfile = useSelector(
    (state: RootState) => state.candidateProfile
  );
  const { questions, currentQuestionIndex, answers, summary, status } =
    interviewState;

  const [userInput, setUserInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const questionMessageSent = useRef<boolean[]>([]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (
      status === 'in-progress' &&
      currentQuestion &&
      !questionMessageSent.current[currentQuestionIndex]
    ) {
      const duration = getTimerDuration(currentQuestion.difficulty);
      setTimeLeft(duration);
      startTimeRef.current = Date.now();
      questionMessageSent.current[currentQuestionIndex] = true;

      if (currentQuestion.difficulty === 'Easy') {
        dispatch(
          addMessage({
            sender: 'system',
            text: currentQuestion.question,
            type: 'mcq',
            options: currentQuestion.options,
          })
        );
      } else {
        dispatch(
          addMessage({
            sender: 'system',
            text: `Question ${currentQuestionIndex + 1}/${
              questions.length
            } (${currentQuestion.difficulty}):\n\n${currentQuestion.question}`,
          })
        );
      }
    }
  }, [
    currentQuestionIndex,
    status,
    currentQuestion,
    dispatch,
    questions.length,
  ]);

  useEffect(() => {
    if (
      timeLeft > 0 &&
      status === 'in-progress' &&
      questionMessageSent.current[currentQuestionIndex]
    ) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (
      timeLeft === 0 &&
      status === 'in-progress' &&
      currentQuestion &&
      questionMessageSent.current[currentQuestionIndex]
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleSend(true); // Auto-submit on timeout
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status, currentQuestion, currentQuestionIndex]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [candidateProfile.chatHistory, summary, status]);

  const handleSend = (isTimeout = false) => {
    if (!currentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = isTimeout
      ? getTimerDuration(currentQuestion.difficulty)
      : Math.round((Date.now() - startTimeRef.current) / 1000);

    let answerText = userInput;
    if (currentQuestion.difficulty === 'Easy') {
      answerText = selectedOption;
    }
    const finalAnswer = {
      question: currentQuestion.question,
      answer: answerText,
      difficulty: currentQuestion.difficulty,
      timeTaken,
    };

    dispatch(
      addMessage({ sender: 'user', text: answerText || 'No answer provided' })
    );
    dispatch(addAnswer(finalAnswer));

    setUserInput('');
    setSelectedOption('');

    if (currentQuestionIndex < questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
    } else {
      dispatch(setStatus('evaluating'));
      dispatch(
        addMessage({
          sender: 'system',
          text: 'Interview completed. Generating your results...',
        })
      );
      handleEvaluation([...answers, finalAnswer]);
    }
  };

  const handleEvaluation = async (allAnswers: typeof answers) => {
    try {
      const evaluationResult = await evaluateAnswers({
        answers: allAnswers.map((a) => ({
          ...a,
          answer: a.answer || 'No answer provided.',
        })),
        resumeText: candidateProfile.resumeText,
        jobDescription: candidateProfile.jobDescriptionFile?.name,
      });

      const totalScore = evaluationResult.evaluations.reduce(
        (acc, curr) => acc + curr.score,
        0
      );

      dispatch(
        setSummary({
          evaluations: evaluationResult.evaluations,
          text: evaluationResult.summary,
          totalScore: totalScore,
        })
      );
      dispatch(setStatus('completed'));

      const finalCandidateData = {
        profile: {
          name: candidateProfile.name,
          email: candidateProfile.email,
          phone: candidateProfile.phone,
        },
        interview: {
          questions: questions,
          answers: allAnswers.map((answer, index) => ({
            ...answer,
            score: evaluationResult.evaluations[index]?.score ?? 0,
            feedback: evaluationResult.evaluations[index]?.feedback ?? 'N/A',
          })),
          summary: {
            evaluations: evaluationResult.evaluations,
            text: evaluationResult.summary,
            totalScore: totalScore,
          },
        },
      };
      dispatch(addCandidate(finalCandidateData));
    } catch (error) {
      console.error('Evaluation failed:', error);
      dispatch(setStatus('failed'));
      dispatch(
        addMessage({
          sender: 'system',
          text: 'Sorry, I encountered an error while evaluating your answers. Please try again.',
        })
      );
      router.push('/interviewee');
    }
  };

  const { chatHistory } = useSelector(
    (state: RootState) => state.candidateProfile
  );

  const renderAnswerInput = () => {
    if (!currentQuestion || status !== 'in-progress') return null;

    if (currentQuestion.difficulty === 'Easy') {
      return null;
    }

    return (
      <Input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder={
          currentQuestion.difficulty === 'Medium'
            ? 'Type your short answer (1-5 words)...'
            : 'Type your one-line answer...'
        }
        onKeyDown={(e) =>
          e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())
        }
      />
    );
  };

  if (status === 'completed' || status === 'evaluating') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          Interview Results
        </h1>
        {status === 'evaluating' ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Evaluating your answers...
            </p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Overall Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg">{summary.text}</p>
                <p className="text-4xl font-bold mt-4">
                  {summary.totalScore}{' '}
                  <span className="text-2xl text-muted-foreground">/ 60</span>
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4">Detailed Feedback</h3>
                <div className="space-y-4">
                  {summary.evaluations.map((evaluation, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span className="truncate pr-4">
                            {answers[index]?.question || 'Question not found'}
                          </span>
                          <Badge>{evaluation.score}/10</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold">Your Answer:</p>
                        <p className="text-muted-foreground mb-2">
                          {answers[index]?.answer || 'No answer provided.'}
                        </p>
                        <p className="font-semibold">Feedback:</p>
                        <p className="text-muted-foreground">
                          {evaluation.feedback}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="text-center mt-6">
                <Button
                  onClick={() => {
                    dispatch({ type: 'interview/resetInterview' });
                    dispatch({
                      type: 'candidateProfile/resetCandidateProfile',
                    });
                    router.push('/interviewee');
                  }}
                >
                  Start a New Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="p-4 border-b text-center space-y-2">
        <p className="font-semibold text-lg">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <p className="font-semibold text-lg">Time Remaining: {timeLeft}s</p>
        <Progress
          value={
            (timeLeft / getTimerDuration(currentQuestion.difficulty)) * 100
          }
          className="mt-2"
        />
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.map((msg, index) =>
            msg.type === 'mcq' && msg.sender === 'system' ? (
              <MCQChatMessage
                key={index}
                text={msg.text}
                options={msg.options!}
                onSelect={setSelectedOption}
                selectedOption={selectedOption}
              />
            ) : (
              <ChatMessage
                key={index}
                sender={msg.sender}
                text={msg.text}
              />
            )
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t space-y-4">
        {renderAnswerInput()}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSend()}
            disabled={
              status !== 'in-progress' ||
              (currentQuestion.difficulty === 'Easy' && !selectedOption) ||
              (currentQuestion.difficulty !== 'Easy' && !userInput)
            }
            className="w-full"
          >
            <Send />
            <span className="ml-2">Submit Answer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
