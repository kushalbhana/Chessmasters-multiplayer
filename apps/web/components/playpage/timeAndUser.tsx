"use client"
import { TimeSection } from "./timesection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export function TimeAndUser({ profilePicture, profileName}: any) {
    return(
        <div className="flex justify-between">
            <div className="flex gap-2 justify-center">
                <div>
                <Avatar>
                    <AvatarImage src={profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                </div>
                <div>
                    { profileName } <br />
                   <h1 className="text-slate-400"> New User </h1>
                </div>

            </div>
            <div>
                <TimeSection/>
            </div>
        </div>
    )
}