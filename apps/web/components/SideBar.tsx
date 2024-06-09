import chessmaster from "../lib/images/chessmasters.svg";
import Image from 'next/image';
import ProfileSection from "./shared/ProfileSection"

export default function Sidebar(){
    return (
        <div className=" min-w-48 max-w-60 h-full">
            <div>
                <Image src={chessmaster}  alt="Chessmaster Logo" className=" mt-5 p-4"></Image>
            </div>

            <div>
                <ProfileSection />
            </div>
        </div>
    )
}