'use server';

/**
 * @fileOverview Calculates a score for the candidate based on their interview performance.
 *
 * - calculateCandidateScore - A function that calculates the candidate score.
 * - CalculateCandidateScoreInput - The input type for the calculateCandidateScore function.
 * - CalculateCandidateScoreOutput - The return type for the calculateCandidateScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateCandidateScoreInputSchema = z.object({
  interviewTranscript: z
    .string()
    .describe('The transcript of the interview, containing questions and answers.'),
  jobDescription: z
    .string()
    .describe('The job description for the position the candidate is interviewing for.'),
  resume: z.string().describe('The candidate\'s resume text content.'),
});
export type CalculateCandidateScoreInput = z.infer<
  typeof CalculateCandidateScoreInputSchema
>;

const CalculateCandidateScoreOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'The overall score of the candidate, out of 100, based on their interview performance.'
    ),
  summary: z
    .string()
    .describe(
      'A summary of the candidate\'s strengths and weaknesses based on their interview performance.'
    ),
});
export type CalculateCandidateScoreOutput = z.infer<
  typeof CalculateCandidateScoreOutputSchema
>;

export async function calculateCandidateScore(
  input: CalculateCandidateScoreInput
): Promise<CalculateCandidateScoreOutput> {
  return calculateCandidateScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateCandidateScorePrompt',
  input: {schema: CalculateCandidateScoreInputSchema},
  output: {schema: CalculateCandidateScoreOutputSchema},
  prompt: `You are an expert interview evaluator. You will take the
interview transcript, job description, and resume, and calculate a score for the candidate out of 100.

You will also provide a summary of the candidate's strengths and weaknesses.

Consider the job description and resume when evaluating the candidate's performance. Strive to be as objective as possible.

Job Description: {{{jobDescription}}}

Resume: {{{resume}}}

Interview Transcript: {{{interviewTranscript}}}`,
});

const calculateCandidateScoreFlow = ai.defineFlow(
  {
    name: 'calculateCandidateScoreFlow',
    inputSchema: CalculateCandidateScoreInputSchema,
    outputSchema: CalculateCandidateScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
