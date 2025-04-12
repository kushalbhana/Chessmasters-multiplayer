"use client"
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading")
    return <p>Loading...</p>; 

  if (status === "authenticated") {
    return (
      <div className="flex h-full justify-center items-center break-words">
        <p>
        <img src={session?.user?.image || ""} alt="" />
        <br />
        {session?.user?.email}
        <br />
        {session?.user?.name}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>You are not logged in.</p>
    </div>
  );
  
}
