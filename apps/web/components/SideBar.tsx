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
        <div className="w-60 h-full">
            <div>
                <Image src={chessmaster}  alt="Chessmaster Logo" className=" mt-5 p-4"></Image>
            </div>

            <div>
                <ProfileSection />
            </div>
            <div className=" flex flex-col ml-5 gap-y-4">
                <div>
                    <Home/>
                </div>
                <div>
                    <VsFriend/>
                </div>
                <div>
                    <VsRandom/>
                </div>
                <div>
                    <Spectate/>
                </div>
                <div>
                    <Settings/>
                </div>
                <div>
                    <Logout/>
                </div>
            </div>
        </div>
    )
}