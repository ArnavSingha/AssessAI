
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import interviewReducer from './features/interview/interviewSlice';
import candidateProfileReducer from './features/candidate/candidateProfileSlice';
import candidatesReducer from './features/candidates/candidatesSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidates', 'interview', 'candidateProfile'], // Persist all relevant slices
};

const appReducer = combineReducers({
  interview: interviewReducer,
  candidateProfile: candidateProfileReducer,
  candidates: candidatesReducer,
});

const rootReducer = (state: any, action: any) => {
  // when resetting interview, we clear interview and candidate profile, but keep candidates
  if (action.type === 'interview/resetInterview' || action.type === 'candidateProfile/resetCandidateProfile') {
    const { candidates, candidateProfile } = state;
    // Create a new state object with the initial state for the resetting slices
    let newState: any = {
        ...appReducer(undefined, action),
        candidates: candidates,
    };
    
    // if we are only restarting the interview, we want to keep the chat history
    if(action.type === 'interview/resetInterview') {
       newState.candidateProfile = {
           ...candidateProfile,
           ...appReducer(undefined, action).candidateProfile,
       };
    }

    if (action.type === 'candidateProfile/resetCandidateProfile') {
        newState.interview = state.interview;
    }


    return appReducer(newState, action);
  }

  return appReducer(state, action);
};


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types from redux-persist
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PURGE',
            'persist/REGISTER',
            'setCandidateProfile'
          ],
           ignoredPaths: ['candidateProfile.resumeFile', 'candidateProfile.jobDescriptionFile', 'interview.timerRef', 'interview.startTimeRef'],
        },
      }),
  });

  const persistor = persistStore(store);
  return { store, persistor };
};

export type RootState = ReturnType<typeof appReducer>;
export type AppStore = ReturnType<typeof makeStore>['store'];
export type AppDispatch = AppStore['dispatch'];
