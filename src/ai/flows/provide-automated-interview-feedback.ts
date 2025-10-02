'use server';
/**
 * @fileOverview An AI agent that provides automated feedback on interview answers.
 *
 * - provideAutomatedInterviewFeedback - A function that handles the interview feedback process.
 * - ProvideAutomatedInterviewFeedbackInput - The input type for the provideAutomatedInterviewFeedback function.
 * - ProvideAutomatedInterviewFeedbackOutput - The return type for the provideAutomatedInterviewFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAutomatedInterviewFeedbackInputSchema = z.object({
  answer: z.string().describe('The answer provided by the interviewee.'),
  jobDescription: z.string().describe('The description of the job being interviewed for.'),
  resumeData: z.string().describe('The parsed resume data of the interviewee.'),
});
export type ProvideAutomatedInterviewFeedbackInput = z.infer<typeof ProvideAutomatedInterviewFeedbackInputSchema>;

const ProvideAutomatedInterviewFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The feedback on the answer.'),
});
export type ProvideAutomatedInterviewFeedbackOutput = z.infer<typeof ProvideAutomatedInterviewFeedbackOutputSchema>;

export async function provideAutomatedInterviewFeedback(input: ProvideAutomatedInterviewFeedbackInput): Promise<ProvideAutomatedInterviewFeedbackOutput> {
  return provideAutomatedInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAutomatedInterviewFeedbackPrompt',
  input: {schema: ProvideAutomatedInterviewFeedbackInputSchema},
  output: {schema: ProvideAutomatedInterviewFeedbackOutputSchema},
  prompt: `You are an expert interview coach providing feedback to interviewees. You will analyze the answer provided by the interviewee and give specific and actionable feedback to help the candidate improve their interviewing skills.

Consider the job description and resume data to tailor your feedback.

Job Description: {{{jobDescription}}}

Resume Data: {{{resumeData}}}

Answer: {{{answer}}}

Feedback:`,
});

const provideAutomatedInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAutomatedInterviewFeedbackFlow',
    inputSchema: ProvideAutomatedInterviewFeedbackInputSchema,
    outputSchema: ProvideAutomatedInterviewFeedbackOutputSchema,
  },
  async input => {
    const {output} = await await prompt(input);
    return output!;
  }
);
