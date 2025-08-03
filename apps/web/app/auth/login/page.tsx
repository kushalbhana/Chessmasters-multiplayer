"use client";
import { useEffect } from "react";
import { FaChessQueen } from "react-icons/fa6";
import { AuthTab } from "@/components/shared/auth-tab";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status]);

 return (
  <div className="grid min-h-screen lg:grid-cols-2 bg-slate-200 overflow-x-hidden">
    {/* Left Section */}
    <div className="flex flex-col items-center justify-center gap-6 px-4 sm:px-6 md:px-10 py-8 w-full max-w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-black">
          <FaChessQueen />
        </div>
        <h1 className="text-black text-xl sm:text-2xl font-bold text-center break-words">
          Chessmasters multiplayer
        </h1>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
        <AuthTab />
      </div>
    </div>

    {/* Right Section */}
    <div className="relative hidden lg:block">
      <img
        src="https://images.unsplash.com/photo-1571236207041-5fb70cec466e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNoZXNzfGVufDB8fDB8fHww"
        alt="Chess"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
);

}
