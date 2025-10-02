
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options?: string[];
}

export interface Answer {
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeTaken: number;
}

export interface Evaluation {
  score: number;
  feedback: string;
}

export interface InterviewState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (Answer & Evaluation)[];
  summary: {
    evaluations: Evaluation[];
    text: string;
    totalScore: number;
  };
  status: 'idle' | 'in-progress' | 'evaluating' | 'completed' | 'failed';
  error: string | null;
  userId: string | null;
}

const initialState: InterviewState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  summary: {
    evaluations: [],
    text: '',
    totalScore: 0,
  },
  status: 'idle',
  error: null,
  userId: null,
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = [];
      state.summary = initialState.summary;
      state.status = 'in-progress';
      state.error = null;
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    addAnswer: (state, action: PayloadAction<Answer>) => {
      // Add a placeholder evaluation
      state.answers.push({ ...action.payload, score: 0, feedback: '' });
    },
    setSummary: (state, action: PayloadAction<InterviewState['summary']>) => {
      state.summary = action.payload;
      // Update answers with evaluations
      state.answers = state.answers.map((answer, index) => ({
        ...answer,
        score: action.payload.evaluations[index]?.score ?? 0,
        feedback: action.payload.evaluations[index]?.feedback ?? 'N/A',
      }));
    },
    setStatus: (state, action: PayloadAction<InterviewState['status']>) => {
      state.status = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
    resetInterview: () => initialState,
  },
});

export const {
  setQuestions,
  setCurrentQuestionIndex,
  addAnswer,
  setSummary,
  setStatus,
  setUserId,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
