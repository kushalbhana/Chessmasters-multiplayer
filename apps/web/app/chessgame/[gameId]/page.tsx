import ChessBoard from "../../../components/Chessboard";
import { Button } from "../../../components/ui/button";
import { FaMicrophone, FaCamera } from "react-icons/fa";
import ChatBox from "../../../components/Chatbox";
import { GameOver } from "../../../components/shared/GameOver";

export default function App({ params: { gameId } }: any) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left panel with ChessBoard */}
      <div className="flex flex-col h-full w-full md:w-auto">
        <div className="p-3 flex-grow min-w-[800px]">
          <ChessBoard roomId={gameId} />
        </div>
      </div>
      <GameOver/>
      {/* Right panel with video sections and chat */}
      <div className="flex flex-col md:flex-grow md:w-1/3 h-full p-4 md:pr-4 overflow-hidden">
        {/* Video Sections */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4 overflow-hidden">
          {/* Video 1 */}
          <div className="flex flex-col items-center bg-black h-1/2 md:h-auto w-full md:w-auto p-4">
            <video src="" className="w-full h-full object-cover" />
          </div>
   
          {/* Video 2 */}
          <div className="flex flex-col items-center bg-black h-1/2 md:h-auto w-full md:w-auto p-4">
            <video src="" className="w-full h-full object-cover" />
            <div className="flex justify-center gap-4 mt-2">
              <span className="bg-white rounded-full p-2 text-slate-900" aria-label="Microphone">
                <FaMicrophone />
              </span>
              <span className="bg-red-500 rounded-full p-2 text-white" aria-label="Camera">
                <FaCamera />
              </span>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex justify-between gap-2">
          <Button className="bg-white w-1/2">Resign!</Button>
          <Button className="bg-orange-500 text-slate-50 w-1/2">Draw</Button>
        </div>

        {/* ChatBox */}
        <div className="flex-grow overflow-hidden">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
