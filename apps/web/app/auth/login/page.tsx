"use client"
import { useEffect, useState } from "react";
import { FaChessQueen } from "react-icons/fa6";
import { AuthTab } from "@/components/shared/auth-tab";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



export default function LoginPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  useEffect( () => {
    if(status === 'authenticated')
    router.push("/");
  },[status]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2  bg-slate-200">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-black ml-5">
            <FaChessQueen />
            </div>
            <h1 className="text-black">
              Chessmasters multiplayer
            </h1>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
           <AuthTab />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1571236207041-5fb70cec466e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNoZXNzfGVufDB8fDB8fHww"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
