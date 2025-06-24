"use client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <div className="h-20 flex justify-between items-center px-20">
      <div>
        <p className="text-slate-950 text-lg font-extrabold font-sans">
          Chessmasters multiplayer
        </p>
        <p className="text-slate-700 -my-1 font-sans">Kushal Bhana</p>
      </div>
      <div className="flex gap-4">
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
              className="bg-white text-black h-10 w-32"
              onClick={() => router.push("/spectate")}
            >
              Spectate
            </Button>
        </div>
      </div>
    </div>
  );
}
