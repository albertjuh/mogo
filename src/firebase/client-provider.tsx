"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FirebaseProvider, initializeFirebase } from ".";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      const firebaseInstances = await initializeFirebase();
      setFirebase(firebaseInstances);
    };

    init();
  }, []);

  if (!firebase) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
