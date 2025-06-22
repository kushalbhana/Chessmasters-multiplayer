import dynamic from "next/dynamic";
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaMicrophone, FaCamera } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Chessboard } from "react-chessboard";

// Dynamically import client logic
const LobbyClient = dynamic(() => import("./LobbyClient"), { ssr: false });

export default function LobbySSR() {
  const customSquareStyles: { [square: string]: React.CSSProperties } = {};
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

  for (let file of files) {
    for (let rank of ranks) {
      const square = `${file}${rank}`;
      const fileIndex = files.indexOf(file);
      const rankIndex = ranks.indexOf(rank);
      const isBlack = (fileIndex + rankIndex) % 2 === 1;
      customSquareStyles[square] = {
        backgroundColor: isBlack ? "#2e2e2e" : "#fff",
      };
    }
  }

  return (
    <div className="w-full lg:h-screen flex justify-center items-center bg-[#f1f1f1]">
      <div className="flex flex-col lg:flex-row w-11/12 bg-[#111114] justify-center items-center p-10 rounded-3xl shadow-2xl shadow-slate-700">
        <div className="lg:w-1/2 w-5/6 outline-white outline-8">
          {/* <Chessboard id="BasicBoard" customSquareStyles={customSquareStyles} /> */}
        </div>
        <div className="lg:w-1/2 flex justify-center items-center flex-col p-10">
          <h1 className="text-3xl font-extrabold text-center">Find an Opponent, Make Your Move!!</h1>
          <h1 className="text-lg font-medium text-center mt-3">
            Jump into a real-time chess match against a random player and put your strategy to the test! Whether you're a beginner or a seasoned pro, every game is a new challenge. No sign-ups, no waiting—just quick matchmaking, intense battles, and the thrill of the game. Play now and outthink your opponent! 🚀
          </h1>
          <div className="h-24 flex gap-4 justify-center items-center">
            {/* <Dropdown /> */}
            <div className="flex justify-center items-center rounded-2xl bg-red-600 h-10 w-10 hover:bg-red-700 hover:cursor-pointer">
              <FaMicrophone className="text-black text-lg" />
            </div>
            {/* <Dropdown /> */}
            <div className="flex justify-center items-center rounded-2xl hover:bg-red-700 hover:cursor-pointer bg-red-600 h-10 w-10">
              <FaCamera className="text-black text-lg" />
            </div>
          </div>
          <div className="flex gap-6 md:gap-10 mt-5">
            {[FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaChessBishop, FaChessKnight, FaChessRook].map((Icon, index) => (
              <Icon key={index} className="md:text-4xl" />
            ))}
          </div>
          <div className="mt-10 w-full">
            <LobbyClient />
          </div>
        </div>
      </div>
    </div>
  );
}
