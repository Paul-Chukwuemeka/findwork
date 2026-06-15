import React, { useEffect, useState } from "react";
import { createContext, SetStateAction, Dispatch } from "react";
import { User } from "@prisma/client";

export type appContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
};

const appContext = createContext<appContextType | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const value = { user, setUser };
  
  useEffect(()=>{
    if(user) return
   async function loadUser(){
    
   }
   loadUser()
  },[user])

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
}
