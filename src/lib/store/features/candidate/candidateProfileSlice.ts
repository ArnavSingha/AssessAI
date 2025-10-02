
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  sender: 'user' | 'system';
  text: string;
  type?: 'mcq';
  options?: string[];
}

export interface CandidateProfileState {
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  resumeFile: {
    name: string;
    type: string;
  } | null;
  jobDescriptionFile: {
    name: string;
    type: string;
  } | null;
  chatHistory: ChatMessage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CandidateProfileState = {
  name: '',
  email: '',
  phone: '',
  resumeText: '',
  resumeFile: null,
  jobDescriptionFile: null,
  chatHistory: [],
  status: 'idle',
  error: null,
};

export const candidateProfileSlice = createSlice({
  name: 'candidateProfile',
  initialState,
  reducers: {
    setCandidateProfile: (
      state,
      action: PayloadAction<
        Omit<CandidateProfileState, 'chatHistory' | 'status' | 'error'>
      >
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.resumeText = action.payload.resumeText;
      state.resumeFile = action.payload.resumeFile;
      state.jobDescriptionFile = action.payload.jobDescriptionFile;
      state.status = 'succeeded';
    },
    updateCandidateField: (
      state,
      action: PayloadAction<{ field: 'name' | 'email' | 'phone'; value: string }>
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    resetCandidateProfile: (state) => {
      return initialState;
    },
  },
});

export const {
  setCandidateProfile,
  updateCandidateField,
  addMessage,
  clearChatHistory,
  setLoading,
  setError,
  resetCandidateProfile,
} = candidateProfileSlice.actions;

export default candidateProfileSlice.reducer;
