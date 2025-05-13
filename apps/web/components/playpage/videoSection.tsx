import { useRecoilState } from "recoil";
import { useSession } from "next-auth/react";
import { roomInfo } from "@/store/selectors/getRoomSelector";

export function VideoSection() {
    const [room, setRoom] = useRecoilState(roomInfo);
    const { data: session, status } = useSession();
    return (
        <div className="bg-slate-500 bg-opacity-20">
            <div className="w-full h-full flex shadow-xl">
                <div className="w-1/2 p-2 shadow-xl">
                    <video 
                        src="" 
                        className="bg-black w-full h-auto"
                        
                    />
                    <div className="h-8 flex justify-center items-center">
                        {/* @ts-ignore */}
                        {session?.user?.id !== room?.room.whiteId ? room?.room.whiteName : room?.room.blackName}
                    </div>
                </div>
                <div className="w-1/2 p-2">
                    <video 
                        src="" 
                        className="bg-black w-full h-auto"
                    />
                    <div className="h-8 flex justify-center items-center">
                        {/* @ts-ignore */}
                        {session?.user?.id === room?.room.whiteId ? room?.room.whiteName : room?.room.blackName}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
