'use client';

import { useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { makeStore, type AppStore } from './store';

interface Props {
  children: ReactNode;
}

export default function StoreProvider({ children }: Props) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<any>(null);

  if (!storeRef.current) {
    const { store, persistor } = makeStore();
    storeRef.current = store;
    persistorRef.current = persistor;
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
}
