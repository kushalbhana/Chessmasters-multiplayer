import chessmaster from "../lib/images/chessmasters.svg";
import Image from 'next/image';
import ProfileSection from "./shared/ProfileSection"
import Logout from "./shared/Logout";
import Home from "./shared/Home";
import Spectate from "./shared/SpectateList";
import VsFriend from "./shared/VsFriends";
import VsRandom from "./shared/VsRandom";
import Settings from "./shared/Settings";

export default function Sidebar(){
    return (
        <div className="w-60">
            <div>
                <Image src={chessmaster}  alt="Chessmaster Logo" className=" mt-5 p-4"></Image>
            </div>

            <div>
                <ProfileSection />
            </div>
            <div className=" flex flex-col gap-y-4">
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <Home/>
                </div>
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <VsFriend/>
                </div>
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <VsRandom/>
                </div>
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <Spectate/>
                </div>
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <Settings/>
                </div>
                <div className="hover:bg-red-400 rounded pl-4 ml-2">
                    <Logout/>
                </div>
            </div>
        </div>
    )
}