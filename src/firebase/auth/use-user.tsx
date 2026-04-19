
"use client";

import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
};

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hardcodedUsers: Record<string, { password: string; role: 'admin' | 'supervisor' | 'rider' | 'recruiter', id: string }> = {
  'admin@bodaempire.com': { password: 'password123', role: 'admin', id: 'user-admin' },
  'supervisor@bodaempire.com': { password: 'password123', role: 'supervisor', id: 'user-supervisor' },
  'recruiter@bodaempire.com': { password: 'password123', role: 'recruiter', id: 'user-recruiter' },
  'juma@bodaempire.com': { password: 'password123', role: 'rider', id: 'rider-1' },
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('boda-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('boda-user');
    }
    setLoading(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    const foundUser = hardcodedUsers[email];
    if (foundUser && foundUser.password === pass) {
      const userPayload = { email, role: foundUser.role, id: foundUser.id };
      localStorage.setItem('boda-user', JSON.stringify(userPayload));
      setUser(userPayload);
      router.push('/');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('boda-user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
