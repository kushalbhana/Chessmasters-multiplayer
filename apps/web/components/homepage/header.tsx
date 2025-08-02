"use client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Generate fallback initials for Avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "US";
    const words = name.split(" ");
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-20 flex justify-between items-center px-6 lg:px-20">
      {/* Logo Section */}
      <div className="lg:block">
        <p className="text-slate-950 text-base font-extrabold font-sans whitespace-nowrap">
          Chessmasters multiplayer
        </p>
        <p className="text-slate-700 -my-1 font-sans">Kushal Bhana</p>
      </div>

      {/* Right Side Actions */}
      <div className="w-full flex lg:gap-4 justify-end items-center">
        {status !== "authenticated" ? (
          <Button
            variant="outline"
            className="bg-white text-black h-10 lg:w-32 w-24"
            onClick={() => router.push("/auth/login")}
          >
            Sign in
          </Button>
        ) : (
          <>
            {/* Large devices */}
            <Button
              variant="outline"
              className="bg-white text-black h-10 w-32 hidden lg:block"
              onClick={() => router.push("/play/online")}
            >
              Play now
            </Button>
            <Button
              variant="outline"
              className="bg-white text-black h-10 w-32 hidden lg:block"
              onClick={() => router.push("/analysis/game-review")}
            >
              Review Game
            </Button>

            {/* Small Devices: Avatar + Logout */}
            <div className="flex items-center gap-3 lg:hidden">
              <Avatar className="h-10 w-10 outline-4 outline-black">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
