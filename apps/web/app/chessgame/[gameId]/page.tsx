import React from 'react';
import ChessBoard from '../../../components/Chessboard';
import { Button } from '../../../components/ui/button';
import { FaMicrophone, FaCamera } from 'react-icons/fa';
import ChatBox from '../../../components/Chatbox';

export default function App({ params: { gameId } }: any) {
  return (
    <div className="flex h-full">
      {/* Sidebar (Assumed to be defined globally in layout.tsx) */}

      {/* Main content area */}
      <div className="flex flex-col flex-grow w-[80vw]">
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Left panel with ChessBoard */}
          <div className="flex flex-col h-full md:w-3/6">
            <div className="p-3 flex-grow">
              <div className="max-h-full">
                <ChessBoard roomId={gameId} className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Right panel with video sections and chat */}
          <div className="flex flex-col md:flex-col md:w-3/6 h-full p-4 md:pr-4 overflow-hidden">
            {/* Video Sections */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4 overflow-hidden">
              {/* Video 1 */}
              <div className="flex flex-col items-center bg-black h-1/2 md:h-full w-full md:w-1/2 p-4">
                <video src="" className="w-full h-full object-cover" />
              </div>

              {/* Video 2 */}
              <div className="flex flex-col items-center bg-black h-1/2 md:h-full w-full md:w-1/2 p-4">
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
              <ChatBox roomId={gameId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
