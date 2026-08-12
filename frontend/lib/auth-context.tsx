'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@/lib/api';

interface AuthContextValue {
  user: AuthResponse | null;
  setUser: (user: AuthResponse | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUserState] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();


  useEffect(() => {

    const storedUser = localStorage.getItem("auth_user");

    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);

  }, []);



  function setUser(user: AuthResponse | null) {

    setUserState(user);

    if(user){

      localStorage.setItem(
        "auth_user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "token",
        user.token
      );

    }
    else{

      localStorage.removeItem("auth_user");
      localStorage.removeItem("token");

    }

  }



  function logout(){

    setUser(null);
    router.replace("/login");

  }



  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth(){

 const context = useContext(AuthContext);

 if(!context){
   throw new Error("useAuth must be inside AuthProvider");
 }

 return context;

}