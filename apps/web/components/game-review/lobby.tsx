import Image from "next/image";
import {
  FaChessRook,
  FaChessKnight,
  FaChessBishop,
  FaChessQueen,
  FaChessKing,
} from "react-icons/fa";
import UploadPGN from "./uploadpgn";
import { FenInputBox } from "./fenInput";
// import { PlayButton } from "./playbutton";

export default function Lobby() {
  return (
    <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0] overflow-x-hidden py-6 pb-20">
      <div className="flex flex-col lg:flex-row w-11/12 max-w-6xl bg-[#111114] justify-center items-center p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-700">
        
        {/* Left Section - Image */}
        <div className="lg:w-1/2 w-5/6 flex justify-center">
          <Image
            src="/images/ChessMasters-playpage.svg"
            alt="Chessmasters"
            width={700}
            height={700}
            className="bg-white max-w-full h-auto rounded-xl"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:w-1/2 w-full flex justify-center items-center flex-col p-4 sm:p-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Know Your Game, Master Your Moves!
          </h1>
          <p className="text-sm sm:text-lg font-medium mt-3 px-2">
            Face off against an intelligent chess bot and elevate your game in real-time! 
            Whether you're a beginner learning the basics or a seasoned player refining your strategy, 
            every match is a new chance to outthink your opponent. No registrations, no waiting—just fast-paced games, 
            sharp tactics, and endless challenges. Jump in and make your move! ♟️🤖
          </p>

          {/* Fen Input */}
          <div className="w-full mt-5 max-w-sm sm:max-w-md md:max-w-lg">
            {/* <DropdownComputerBot/> */}
            {/* <PlayerTabs/> */}
            <FenInputBox />
          </div>

          {/* OR Divider */}
          <div className="w-full flex justify-center items-center mt-2 text-gray-400 text-sm sm:text-base">
            <span>or</span>
          </div>

          {/* Chess Icons */}
          <div className="flex gap-2 sm:gap-4 md:gap-6 mt-5 flex-wrap justify-center">
            {[FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaChessBishop, FaChessKnight, FaChessRook].map((Icon, i) => (
              <Icon key={i} className="text-lg sm:text-2xl md:text-4xl text-white" />
            ))}
          </div>

          {/* Upload PGN / Play Button */}
          <div className="mt-8 w-full max-w-xs">
            {/* <PlayButton /> */}
            <UploadPGN />
          </div>
        </div>
      </div>
    </div>
  );
}
