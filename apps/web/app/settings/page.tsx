"use client"

import { useSession } from "next-auth/react"

export default function Settings(){
    const {data: session} = useSession();
    console.log(session?.user?.image)
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div>
                No Settings to change right now
            </div>
        </div>
    )
}