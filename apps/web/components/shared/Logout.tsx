"use client"
import { TbLogout2 } from "react-icons/tb";
import Link from "next/link";
import {signOut } from "next-auth/react"
import { useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";

export default function Logout(){
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className="flex ml-1 mt-4 ">
                    <div>
                        <Skeleton className="h-4 w-[140px] mb-1" />
                        <Skeleton className="h-4 w-[120px]" />
                    </div>
                </div>;
    }

    if (session){
        return (
            <Link href={"/"} onClick={ () => signOut()}>
            <div className="flex items-center min-h-16"><TbLogout2 className="mr-2"/>Logout</div>
            </Link>
        )
    } 
    return(
        <div></div>
    )
}