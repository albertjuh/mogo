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
  signInWithPopup,
  sendEmailVerification,
  reload
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  reloadUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SYSTEM_ADMIN_EMAILS = [
  'berto.admin@bodaempire.com',
  'aljohme@gmail.com'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const auth = getAuth();

  const reloadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setFirebaseUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const isSystemAdminEmail = SYSTEM_ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || "");
        let role: AppUser['role'] = isSystemAdminEmail ? 'admin' : 'rider';
        let name = fbUser.displayName || "";

        try {
          // Verify role from database collections
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

          // Force admin role for master emails even if not in registry yet
          if (isSystemAdminEmail) role = 'admin';

        } catch (e) {
          console.warn("Role check failed, using safe defaults.");
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
      
      const isSystemAdminEmail = SYSTEM_ADMIN_EMAILS.includes(res.user.email?.toLowerCase() || "");
      const collectionName = isSystemAdminEmail ? "admins" : "riders";
      
      // Auto-register in the database if document doesn't exist
      await setDoc(doc(db, collectionName, res.user.uid), {
        email: res.user.email?.toLowerCase(),
        name: res.user.displayName || "",
        role: isSystemAdminEmail ? 'admin' : 'rider',
        createdAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (e: any) {
      console.error("Google Auth error:", e);
      let message = "Could not sign in with Google.";
      if (e.code === 'auth/operation-not-allowed') message = "Google login not enabled in Firebase Console.";
      if (e.code === 'auth/popup-closed-by-user') message = "Login popup was closed.";
      return { success: false, error: message };
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

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(res.user);

      const isSystemAdminEmail = SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase());
      const collectionName = isSystemAdminEmail ? "admins" : "riders";
      
      await setDoc(doc(db, collectionName, res.user.uid), {
        email: email.toLowerCase(),
        name: name,
        role: isSystemAdminEmail ? 'admin' : 'rider',
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
    <AuthContext.Provider value={{ user, firebaseUser, logout, login, signup, loginWithGoogle, reloadUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useUser must be used within an AuthProvider");
  return context;
}