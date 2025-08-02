"use client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function Header() {
  const router = useRouter();
  const { status } = useSession();

  return (
    <div className="h-20 flex justify-between items-center px-6 lg:px-20">
      <div className="hidden lg:block">
        <p className="text-slate-950 text-lg font-extrabold font-sans">
          Chessmasters multiplayer
        </p>
        <p className="text-slate-700 -my-1 font-sans">Kushal Bhana</p>
      </div>
      <div className="w-full flex lg:gap-4 justify-end items-end">
        <div>
          {status !== "authenticated" ? (
            <Button
              variant="outline"
              className="bg-white text-black h-10 w-32"
              onClick={() => router.push("/auth/login")}
            >
              Sign in
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-white text-black h-10 w-32"
              onClick={() => router.push("/play/online")}
            >
              Play now
            </Button>
          )}
        </div>
        <div>
          <Button
              variant="outline"
              className="bg-white text-black h-10 w-32 hidden lg:block" 
              onClick={() => router.push("/analysis/game-review")}
            >
            Review Game
            </Button>
        </div>
      </div>
    </div>
  );
}
