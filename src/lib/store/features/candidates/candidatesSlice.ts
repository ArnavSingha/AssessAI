import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CandidateProfileState,
} from '../candidate/candidateProfileSlice';
import type { InterviewState } from '../interview/interviewSlice';

// We only need a subset of the profile for the final candidate list
export interface Candidate {
  profile: Pick<CandidateProfileState, 'name' | 'email' | 'phone'>;
  interview: InterviewState;
}

export interface CandidatesState {
  candidates: Candidate[];
}

const initialState: CandidatesState = {
  candidates: [],
};

export const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      // Avoid duplicates based on email
      const existingIndex = state.candidates.findIndex(
        (c) => c.profile.email === action.payload.profile.email
      );
      if (existingIndex !== -1) {
        state.candidates[existingIndex] = action.payload;
      } else {
        state.candidates.push(action.payload);
      }
    },
  },
});

export const { addCandidate } = candidatesSlice.actions;

export default candidatesSlice.reducer;
