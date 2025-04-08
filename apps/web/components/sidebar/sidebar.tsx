"use client";
import { signOut } from "next-auth/react"
export function Sidebar(){
    return(
        <div className="w-72 h-full bg-[#111114] absolute z-10">
            <p>Hii</p>
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    )
}