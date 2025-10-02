'use server';

/**
 * @fileOverview A flow that generates summaries of candidate performance during the interview.
 *
 * - summarizeCandidatePerformance - A function that handles the summarization process.
 * - SummarizeCandidatePerformanceInput - The input type for the summarizeCandidatePerformance function.
 * - SummarizeCandidatePerformanceOutput - The return type for the summarizeCandidatePerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCandidatePerformanceInputSchema = z.object({
  resumeData: z.string().describe('The parsed data from the candidate\'s resume.'),
  jobDescription: z.string().describe('The job description for the position.'),
  interviewTranscript: z.string().describe('The transcript of the interview.'),
});
export type SummarizeCandidatePerformanceInput = z.infer<typeof SummarizeCandidatePerformanceInputSchema>;

const SummarizeCandidatePerformanceOutputSchema = z.object({
  summary: z.string().describe('A summary of the candidate\'s performance during the interview.'),
  strengths: z.string().describe('The candidate\'s strengths based on the interview.'),
  weaknesses: z.string().describe('The candidate\'s weaknesses based on the interview.'),
  overallScore: z.number().describe('An overall score of the candidate\'s performance (0-100).'),
});
export type SummarizeCandidatePerformanceOutput = z.infer<typeof SummarizeCandidatePerformanceOutputSchema>;

export async function summarizeCandidatePerformance(input: SummarizeCandidatePerformanceInput): Promise<SummarizeCandidatePerformanceOutput> {
  return summarizeCandidatePerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCandidatePerformancePrompt',
  input: {schema: SummarizeCandidatePerformanceInputSchema},
  output: {schema: SummarizeCandidatePerformanceOutputSchema},
  prompt: `You are an expert interviewer and performance evaluator.

  Based on the candidate\'s resume data, the job description, and the interview transcript, provide a summary of the candidate\'s performance, their strengths, and weaknesses, and an overall score.

  Resume Data: {{{resumeData}}}
  Job Description: {{{jobDescription}}}
  Interview Transcript: {{{interviewTranscript}}}

  Be concise and provide actionable insights.
  Format the output as a JSON object with the following keys:
  - summary: A brief summary of the candidate\'s performance.
  - strengths: A list of the candidate\'s strengths.
  - weaknesses: A list of the candidate\'s weaknesses.
  - overallScore: An overall score of the candidate\'s performance (0-100).`,
});

const summarizeCandidatePerformanceFlow = ai.defineFlow(
  {
    name: 'summarizeCandidatePerformanceFlow',
    inputSchema: SummarizeCandidatePerformanceInputSchema,
    outputSchema: SummarizeCandidatePerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
