import Image from "next/image"
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import UploadPGN from "./uploadpgn";
import { FenInputBox } from "./fenInput";
// import { PlayButton } from "./playbutton";

export default function Lobby(){
    return (
         <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0]">
            <div className="flex flex-col lg:flex-row w-11/12 bg-[#111114] justify-center items-center p-10 rounded-3xl shadow-2xl shadow-slate-700">
                <div className="lg:w-1/2 w-5/6 outline-white outline-8">
                    {/* <Chessboard 
                    id="BasicBoard"
                    customSquareStyles={customSquareStyles}
                    /> */}
                    <Image
                        src="/images/ChessMasters-playpage.svg"
                        alt="Chessmasters"
                        width={700}
                        height={700}
                        className="bg-white"
                    />
                </div>
                <div className="lg:w-1/2 flex justify-center items-center flex-col p-10">

                    <h1 className=" text-3xl font-extrabold text-center">Choose an Opponent, Make Your Move!!</h1>
                    <h1 className=" text-lg font-medium text-center mt-3"> Challenge a smart chess bot and sharpen your skills in real-time! 
                        Whether you're learning the ropes or testing your grandmaster instincts, each match offers a fresh opportunity to think deeper 
                        and play smarter. No sign-ups, no delays—just instant games, strategic battles, and nonstop action. 
                        Play now and outsmart the bot! 🤖♟️
                    </h1>
                    <div className="h-full w-full mt-5">
                            {/* <DropdownComputerBot/> */}
                            {/* <PlayerTabs/> */}
                            <FenInputBox/>
                    </div>
                    <div className="w-full flex justify-center items-center mt-2">
                        <div>
                            or
                        </div>
                    </div>
                    <div className="flex gap-6 md:gap-10 mt-5">
                        <h1 className="md:text-4xl"> <FaChessRook /> </h1>
                        <h1 className="md:text-4xl"> <FaChessKnight /> </h1>
                        <h1 className="md:text-4xl"> <FaChessBishop /> </h1>
                        <h1 className="md:text-4xl"> <FaChessQueen /> </h1>
                        <h1 className="md:text-4xl"> <FaChessKing /> </h1>
                        <h1 className="md:text-4xl"> <FaChessBishop /> </h1>
                        <h1 className="md:text-4xl"> <FaChessKnight /> </h1>
                        <h1 className="md:text-4xl"> <FaChessRook /> </h1>
                    </div>
                    <div className="mt-10 w-full">
                        {/* <PlayButton/> */}
                        <UploadPGN/>
                    </div>
                </div>    
            </div>
        </div>
    )
}