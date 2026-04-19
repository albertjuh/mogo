
'use client';

import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
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
  loginWithGoogle: () => Promise<boolean>;
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
        let name = fbUser.displayName || "";

        const isSystemAdminEmail = fbUser.email?.toLowerCase() === 'berto.admin@bodaempire.com';
        
        try {
          // Attempt to get role from Firestore registry
          const [adminDoc, supervisorDoc, recruiterDoc, riderDoc] = await Promise.all([
            getDoc(doc(db, "admins", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "supervisors", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "recruiters", fbUser.uid)).catch(() => null),
            getDoc(doc(db, "riders", fbUser.uid)).catch(() => null)
          ]);
          
          if (adminDoc?.exists()) {
              role = 'admin';
              name = adminDoc.data().name || name;
          } else if (supervisorDoc?.exists()) {
              role = 'supervisor';
              name = supervisorDoc.data().name || name;
          } else if (recruiterDoc?.exists()) {
              role = 'recruiter';
              name = recruiterDoc.data().name || name;
          } else if (riderDoc?.exists()) {
              role = 'rider';
              name = riderDoc.data().name || name;
          }

          // System Admin Override
          if (isSystemAdminEmail) role = 'admin';

        } catch (e) {
          console.warn("Profile check failed, using defaults.");
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

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      // Check if profile exists, if not create one as 'rider'
      const riderDoc = await getDoc(doc(db, "riders", res.user.uid));
      if (!riderDoc.exists()) {
          const isSystemAdminEmail = res.user.email?.toLowerCase() === 'berto.admin@bodaempire.com';
          const collectionName = isSystemAdminEmail ? "admins" : "riders";
          
          await setDoc(doc(db, collectionName, res.user.uid), {
            email: res.user.email?.toLowerCase(),
            name: res.user.displayName || "",
            role: isSystemAdminEmail ? 'admin' : 'rider',
            createdAt: new Date().toISOString()
          }, { merge: true });
      }
      return true;
    } catch (e) {
      console.error("Google login failed:", e);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: AppUser['role']) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const isSystemAdminEmail = email.toLowerCase() === 'berto.admin@bodaempire.com';
      const collectionName = isSystemAdminEmail ? "admins" : "riders";
      
      await setDoc(doc(db, collectionName, res.user.uid), {
        email: email.toLowerCase(),
        name: name,
        role: isSystemAdminEmail ? 'admin' : 'rider', // Ignore external role choice for safety
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (e) {
      console.error("Signup failed:", e);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, logout, login, signup, loginWithGoogle, loading }}>
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
