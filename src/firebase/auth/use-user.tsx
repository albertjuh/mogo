
'use client';

import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

type AppUser = {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
};

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, role: AppUser['role']) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Parallel check for the user's role in Firestore collections
        const [adminDoc, supervisorDoc, recruiterDoc] = await Promise.all([
          getDoc(doc(db, "admins", fbUser.uid)),
          getDoc(doc(db, "supervisors", fbUser.uid)),
          getDoc(doc(db, "recruiters", fbUser.uid))
        ]);
        
        let role: AppUser['role'] = 'rider';
        if (adminDoc.exists()) role = 'admin';
        else if (supervisorDoc.exists()) role = 'supervisor';
        else if (recruiterDoc.exists()) role = 'recruiter';
        
        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          role: role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      console.error("Login error:", e);
      return false;
    }
  };

  const signup = async (email: string, password: string, role: AppUser['role']) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Create the role entry in the corresponding collection
      const collectionName = role === 'admin' ? 'admins' : 
                             role === 'supervisor' ? 'supervisors' : 
                             role === 'recruiter' ? 'recruiters' : 'riders';
      
      await setDoc(doc(db, collectionName, res.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (e) {
      console.error("Signup error:", e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, logout, login, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
}
