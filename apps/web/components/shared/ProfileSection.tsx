"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { AuthDialogbox } from "./AuthDialogbox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export default function ProfileSection() {
    const { data: session, status } = useSession();

    const truncateEmail = (email: string) => {
        const maxLength = 15;
        return email.length > maxLength ? email.slice(0, maxLength) + '...' : email;
    };

    if (status === "loading") {
        return <div className="flex ml-5 gap-3 mt-5 min-h-28 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                    <Skeleton className="h-4 w-[140px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                </div>
            </div>;
    }

    if (session) {
        return (
            <div className="flex ml-5 gap-3 mt-5 min-h-28 items-center">
                <Avatar>
                    <AvatarImage src={session.user?.image!} />
                    <AvatarFallback>{session.user?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="text-lg font-semibold">{session.user?.name}</div>
                    <div className="text-sm font-semibold">{truncateEmail(session.user?.email!)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col ml-5 gap-3 mt-10 min-h-28">
            <AuthDialogbox />
            <AuthDialogbox />
        </div>
    );
}
