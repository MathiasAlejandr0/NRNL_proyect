
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUserProfileDocument } from '@/services/user'; // Import the Prisma user service function
import { Loader2 } from 'lucide-react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Make listener async
      setUser(currentUser);
      if (currentUser) {
         // If user is logged in, ensure their profile exists in Prisma DB
         try {
             // Call the Prisma-based user service function
             await createUserProfileDocument(currentUser);
         } catch (error) {
              console.error("Failed to ensure user profile exists in DB:", error);
              // Handle error appropriately, maybe log out user or show error message
         }
      }
      setLoading(false);
      console.log("Auth State Changed. User:", currentUser?.uid);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
