'use server';

/**
 * @fileOverview A flow for evaluating a candidate's interview answers.
 *
 * - evaluateAnswers - A function that evaluates the answers.
 * - EvaluateAnswersInput - The input type for the evaluateAnswers function.
 * - EvaluateAnswersOutput - The return type for the evaluateAnswers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  timeTaken: z.number(),
});

const EvaluateAnswersInputSchema = z.object({
  answers: z.array(AnswerSchema),
  resumeText: z.string(),
  jobDescription: z.string().optional(),
});
export type EvaluateAnswersInput = z.infer<typeof EvaluateAnswersInputSchema>;

const EvaluationSchema = z.object({
  score: z.number().describe('A numeric score for the answer (out of 10).'),
  feedback: z.string().describe('A short feedback message for the answer.'),
});

const EvaluateAnswersOutputSchema = z.object({
  evaluations: z.array(EvaluationSchema),
  summary: z.string().describe('A short overall candidate summary.'),
});
export type EvaluateAnswersOutput = z.infer<typeof EvaluateAnswersOutputSchema>;

export async function evaluateAnswers(
  input: EvaluateAnswersInput
): Promise<EvaluateAnswersOutput> {
  return evaluateAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateAnswersPrompt',
  input: { schema: EvaluateAnswersInputSchema },
  output: { schema: EvaluateAnswersOutputSchema },
  prompt: `You are an expert interview evaluator. Evaluate the candidate's answers based on their resume, the job description, and the provided questions and answers.

For each answer, provide a numeric score (out of 10) and a short feedback message.

Also, provide a short overall summary of the candidate's performance.

Candidate's Resume:
{{resumeText}}

Job Description (optional):
{{jobDescription}}

Interview Questions and Answers:
{{#each answers}}
- Question ({{this.difficulty}}): {{this.question}}
  - Answer: {{this.answer}}
  - Time Taken: {{this.timeTaken}}s
{{/each}}
`,
});

const evaluateAnswersFlow = ai.defineFlow(
  {
    name: 'evaluateAnswersFlow',
    inputSchema: EvaluateAnswersInputSchema,
    outputSchema: EvaluateAnswersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
