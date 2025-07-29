"use client"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkeletonProfile } from "../shared/profile-skeleton";

export function ProfileSection(){
    const { data: session, status } = useSession();

    if(status === 'loading')
        return <div><SkeletonProfile/></div>
    
    if(status === 'unauthenticated')
        return (
            <div className="w-full flex justify-center items-end">
               
            </div>
        )
        
    return(
        <div className=" h-24">
            <div className="flex gap-4">
                <div>
                    <Avatar>
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h1 className="text-xl font-bold">
                        {session?.user?.name
                            ? session.user.name.length > 12
                            ? session.user.name.slice(0, 12) + "..."
                            : session.user.name
                            : ""}
                    </h1>
                    <h1 className=" text-slate-500">
                        New User
                    </h1>
                </div>
            </div>
        </div>
    )
}
