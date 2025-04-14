import { TimeSection } from "./timesection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export function TimeAndUser(){
    return(
        <div className="flex justify-between">
            <div className="flex gap-2 justify-center">
                <div>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                </div>
                <div>
                    Kushal Bhana <br />
                   <h1 className="text-slate-400"> New User </h1>
                </div>

            </div>
            <div>
                <TimeSection/>
            </div>
        </div>
    )
}