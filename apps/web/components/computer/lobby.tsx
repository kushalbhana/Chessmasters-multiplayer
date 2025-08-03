import Image from "next/image"
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import { PlayerTabs } from "@/components/computer/selectplayer";
import { PlayButton } from "./playbutton";

export default function Lobby(){
    return (
        <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0] overflow-x-hidden py-6 pb-24">
            <div className="flex flex-col lg:flex-row w-11/12 max-w-6xl bg-[#111114] justify-center items-center p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-700">
            
            {/* Image Section */}
            <div className="lg:w-1/2 w-5/6 flex justify-center">
                <Image
                src="/images/ChessMasters-playpage.svg"
                alt="Chessmasters"
                width={700}
                height={700}
                className="bg-white max-w-full h-auto rounded-xl"
                />
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 w-full flex justify-center items-center flex-col p-4 sm:p-6 text-center">

                <h1 className="text-2xl sm:text-3xl font-extrabold">
                Choose an Opponent, Make Your Move!!
                </h1>
                <p className="text-sm sm:text-lg font-medium mt-3 px-2">
                Challenge a smart chess bot and sharpen your skills in real-time! 
                Whether you're learning the ropes or testing your grandmaster instincts, 
                each match offers a fresh opportunity to think deeper and play smarter. 
                No sign-ups, no delays—just instant games, strategic battles, and nonstop action. 
                Play now and outsmart the bot! 🤖♟️
                </p>

                {/* Player Tabs */}
                <div className="h-full w-full max-w-xs sm:max-w-sm flex justify-center items-center mt-5">
                {/* <DropdownComputerBot/> */}
                <PlayerTabs />
                </div>

                {/* Chess Icons */}
                <div className="flex gap-2 sm:gap-4 md:gap-6 mt-6 flex-wrap justify-center max-w-full">
                {[FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaChessBishop, FaChessKnight, FaChessRook].map((Icon, i) => (
                    <Icon key={i} className="text-lg sm:text-2xl md:text-4xl" />
                ))}
                </div>

                {/* Play Button */}
                <div className="mt-10 w-full max-w-xs">
                <PlayButton />
                </div>

            </div>
            </div>
        </div>
    );

}