
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Candidate } from '@/lib/store/features/candidates/candidatesSlice';
import { Mail, Phone, User } from 'lucide-react';

interface CandidateDetailProps {
  candidate: Candidate;
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  const { profile, interview } = candidate;
  const { summary, answers } = interview;

  return (
    <ScrollArea className="h-[70vh] pr-4">
      <div className="space-y-4 text-sm">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Candidate Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span>{profile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span>{profile.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Overall Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="space-y-4 pr-4">
                <div className="text-center">
                  <p className="text-base whitespace-normal">{summary.text}</p>
                  <p className="text-3xl font-bold mt-2">
                    {summary.totalScore}{' '}
                    <span className="text-xl text-muted-foreground">/ 60</span>
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Q&A Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detailed Q&amp;A</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {answers.map((ans, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span className="truncate text-left">
                            {ans.question}
                          </span>
                          <Badge>{ans.score}/10</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 whitespace-normal">
                        <p className="font-semibold">Candidate's Answer:</p>
                        <p className="text-muted-foreground bg-secondary p-2 rounded-md">
                          {ans.answer || 'No answer provided.'}
                        </p>
                        <p className="font-semibold">AI Feedback:</p>
                        <p className="text-muted-foreground">{ans.feedback}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
