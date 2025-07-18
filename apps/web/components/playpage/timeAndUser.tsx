"use client"
import { TimeSection } from "./timesection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TimeManager } from "./timemanager";


export function TimeAndUser({ profilePicture, profileName, playerType, orientation, game}: any) {
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
                <TimeManager game={game} orientation={orientation}/>
                <TimeSection playerType={playerType} orientation={orientation} game={game}/>
            </div>
        </div>
    )
}