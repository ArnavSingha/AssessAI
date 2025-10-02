'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-candidate-performance.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/provide-automated-interview-feedback.ts';
import '@/ai/flows/calculate-candidate-score.ts';
import '@/ai/flows/evaluate-answers';
