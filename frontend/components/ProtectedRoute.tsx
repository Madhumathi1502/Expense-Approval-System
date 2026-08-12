'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { AuthResponse } from "@/lib/api";


type Role = AuthResponse["role"];


export default function ProtectedRoute({
 children,
 allowedRoles
}:{
 children:React.ReactNode;
 allowedRoles:Role[];
}){


 const {user,isLoading}=useAuth();

 const router=useRouter();



 useEffect(()=>{


   if(isLoading) return;


   if(!user){

     router.replace("/login");
     return;

   }


   if(!allowedRoles.includes(user.role)){

     const dashboard={
       EMPLOYEE:"/employee",
       MANAGER:"/manager",
       FINANCE:"/finance"
     };


     router.replace(dashboard[user.role]);

   }


 },[user,isLoading]);


 if(isLoading){

   return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
   );

 }


 if(!user) return null;


 if(!allowedRoles.includes(user.role)) return null;


 return children;


}