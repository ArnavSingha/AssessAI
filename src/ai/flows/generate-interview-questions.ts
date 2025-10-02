'use server';

/**
 * @fileOverview A flow for generating interview questions based on a candidate's resume.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  resumeText: z
    .string()
    .describe("The text extracted from the candidate's resume."),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description for the role.'),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const QuestionSchema = z.object({
  question: z.string().describe('The interview question.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty of the question.'),
  options: z.array(z.string()).optional().describe('An array of 4 options for Multiple Choice Questions (only for "Easy" difficulty).')
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated interview questions.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert interview question generator for a full stack (React/Node) developer role.

  Based on the candidate's resume and the job description, generate a list of 6 interview questions with the following structure:
  - 2 "Easy" questions: These must be Multiple Choice Questions (MCQs). Provide 4 distinct options for each, and store them in the 'options' array.
  - 2 "Medium" questions: These should require a short text answer (1-5 words).
  - 2 "Hard" questions: These should require a one-line explanatory answer.

  The questions should be relevant to the role and the candidate's experience.

  Candidate's Resume:
  {{resumeText}}

  Job Description (optional):
  {{jobDescription}}
  `,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
