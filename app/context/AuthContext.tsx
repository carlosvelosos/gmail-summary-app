"use client";

import { createContext, useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const session = useSession();

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);