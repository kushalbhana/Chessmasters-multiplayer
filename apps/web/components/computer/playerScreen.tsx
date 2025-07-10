"use client"
import { useSession } from "next-auth/react";
import Image from "next/image";

export function PlayerScreen() {
  const {data: session, status} =  useSession();
  return (
    <div className="w-full h-60 flex gap-2 p-2 shadow-slate-700">
      <div className="w-1/2 bg-black flex justify-center items-center border-">
        <div>
          <Image
            src={session?.user.image || ""}
            width={80}
            height={80}
            alt={session?.user.name || ""}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="w-1/2 bg-black"></div>
    </div>
  );
}