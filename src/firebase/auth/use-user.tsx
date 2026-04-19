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
  name?: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
};

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: AppUser['role']) => Promise<boolean>;
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
        let role: AppUser['role'] = 'rider';
        let name = "";

        // Administrative Override for specific email - check this FIRST to avoid lockout
        if (fbUser.email === 'berto.admin@bodaempire.com') {
          role = 'admin';
        }

        try {
          // Attempt to get role from Firestore, but don't let it crash the login
          const [adminDoc, supervisorDoc, recruiterDoc, riderDoc] = await Promise.all([
            getDoc(doc(db, "admins", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "supervisors", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "recruiters", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "riders", fbUser.uid)).catch(() => null)
          ]);
          
          if (adminDoc?.exists()) {
              role = 'admin';
              name = adminDoc.data().name || "";
          } else if (supervisorDoc?.exists()) {
              role = 'supervisor';
              name = supervisorDoc.data().name || "";
          } else if (recruiterDoc?.exists()) {
              role = 'recruiter';
              name = recruiterDoc.data().name || "";
          } else if (riderDoc?.exists()) {
              role = 'rider';
              name = riderDoc.data().name || "";
          }
        } catch (e) {
          console.warn("Could not fetch user role profile, falling back to default.", e);
        }
        
        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          name: name,
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

  const signup = async (email: string, password: string, name: string, role: AppUser['role']) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the role entry in the corresponding collection
      const collectionName = role === 'admin' ? 'admins' : 
                             role === 'supervisor' ? 'supervisors' : 
                             role === 'recruiter' ? 'recruiters' : 'riders';
      
      await setDoc(doc(db, collectionName, res.user.uid), {
        email: email,
        name: name,
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
    setLoading(true);
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
