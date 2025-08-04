"use client";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useSession } from "next-auth/react";
import { Chess } from "chess.js";

import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { GameLayout } from "@/components/playpage/gamelayout";
import { clientSideRoom } from "@repo/lib/types";
import { GameManager } from "@/lib/game/gamemanager";
import { FaMicrophone } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { Dropdown } from "@/components/ui/dropdown";
import { gameMoves } from "@/store/atoms/moves";
import { playerTime, opponentTime } from "@/store/atoms/game";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { camStatus, micStatus } from "@/store/atoms/videoutility";


export default function GameLobby() {
    
    const { data: session, status } = useSession();
    const setRoomInfo = useSetRecoilState(roomInfo);
    const setMoves = useSetRecoilState(gameMoves);
    const [roomExist, setRoomExist] = useState<boolean>(false);
    const setPlayerTime = useSetRecoilState(playerTime);
    const setOpponentTime = useSetRecoilState(opponentTime);
    const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);
    const [microphoneStatus, setMicStatus] = useRecoilState(micStatus);
    const [cameraStatus, setCamStatus] = useRecoilState(camStatus);

    useEffect(() => {
        if (status === 'loading') {
            return;
        }
    
        const socket = WebSocketClient.getInstance();
        console.log('READY STATE:', socket.readyState);
    
        if (socket.readyState === WebSocket.OPEN) {
            console.log('Socket already open, sending message immediately');
            socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user?.jwt }));
        } else {
            console.log('Socket not open yet, adding open listener');
            socket.addOpenListener(() => {
                console.log('Socket opened, sending message');
                socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user?.jwt }));
            });
        }
    
        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);
            if (data.type === WebSocketMessageType.JOINROOM) {
                const roomData: clientSideRoom = {
                    type: data.type,
                    roomId: data.roomId,
                    room: {
                        whiteId: data.room.whiteId,
                        whiteName: data.room.whiteName,
                        whiteProfilePicture: data.room.whiteProfilePicture,
                        blackId: data.room.blackId,
                        blackName: data.room.blackName,
                        blackProfilePicture: data.room.blackProfilePicture,
                        whiteSocket: data.room.whiteSocket,
                        blackSocket: data.room.blackSocket,
                        whiteTime: data.room.whiteTime,
                        blackTime: data.room.blackTime,
                        lastMoveTime: data.room.lastMoveTime,
                        game: data.room.game,
                        moves: data.room.moves
                    }
                };
                
                setRoomInfo(roomData as clientSideRoom);
                setMoves(JSON.parse(JSON.parse(data.room.moves)));
                GameManager.getInstance(roomData.room.game);
                setRoomExist(true);
                const chess = new Chess(data.room.game); // game is the FEN string
                const currentTurn = chess.turn();

                const rawTime = data.room.lastMoveTime?.trim().replace(/^"|"$/g, '');
                const timestamp = new Date(rawTime).getTime();
                const elapsedMs = Date.now() - timestamp;
                const elapsedSeconds = Math.floor(elapsedMs / 1000);
                console.log("Elapsed:", elapsedSeconds)

                
                let whiteTime = parseInt(data.room.whiteTime);
                let blackTime = parseInt(data.room.blackTime);
                
                if (currentTurn === 'w') {
                    whiteTime = Math.max(0, whiteTime - elapsedSeconds);
                } else {
                    blackTime = Math.max(0, blackTime - elapsedSeconds);
                }
                console.log('WhiteTime: ', whiteTime)
                console.log('Black time: ', blackTime)
                // @ts-expect-error
                if(session?.user.id === roomData.room.whiteId){
                    setPlayerTime(2*(whiteTime))
                    setOpponentTime(2*(blackTime));
                }else{
                    setPlayerTime(2*(blackTime))
                    setOpponentTime(2*(whiteTime));
                }
            }
        };
    
        socket.onMessage(handleMessage);
    
        return () => {
            socket.removeMessageListener?.(handleMessage);
        };
    }, [status]);
    
    function joinRandomRoom() {
        setIsJoiningGame(true);
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user?.jwt})
        );
    }

    const customSquareStyles: { [square: string]: React.CSSProperties } = {};

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

    for (const file of files) {
        for (const rank of ranks) {
        const square = `${file}${rank}`;
        const fileIndex = files.indexOf(file);
        const rankIndex = ranks.indexOf(rank);
        const isBlack = (fileIndex + rankIndex) % 2 === 1;
        customSquareStyles[square] = {
            backgroundColor: isBlack ? "#2e2e2e" : "#fff",
        };
        }
    }


    if(roomExist){
        return <div className="flex justify-center items-center h-full lg:h-screen">
                <GameLayout/>
            </div>
    }

    return (
        <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0] overflow-x-hidden py-6 pb-24 lg:w-full">
            <div className="flex flex-col lg:flex-row w-11/12 max-w-6xl bg-[#111114] justify-center items-center p-4 sm:p-6 md:p-10 rounded-2xl shadow-2xl shadow-slate-700">
            
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
                Find an Opponent, Make Your Move!!
                </h1>
                <p className="text-sm sm:text-lg font-medium mt-3 px-2">
                Jump into a real-time chess match against a random player and put your 
                strategy to the test! Whether you're a beginner or a seasoned pro, every game is a new challenge. 
                No sign-ups, no waiting—just quick matchmaking, intense battles, and the thrill of the game. 
                Play now and outthink your opponent! 🚀
                </p>

                {/* Controls */}
                <div className="h-24 flex flex-wrap gap-3 sm:gap-4 justify-center items-center mt-5">
                <Dropdown type={"audio"} />
                <div className={`flex justify-center items-center rounded-2xl ${!microphoneStatus ? "bg-red-600 hover:bg-red-700" : "bg-current hover:bg-slate-300"} h-9 w-9 sm:h-10 sm:w-10 cursor-pointer`}
                    onClick={() => setMicStatus((prev) => !prev)}
                    >
                    <FaMicrophone className="text-black text-base sm:text-lg"/>
                </div>
                <Dropdown type={"video"} />
                <div className={`flex justify-center items-center rounded-2xl ${!cameraStatus ? "bg-red-600 hover:bg-red-700" : "bg-current hover:bg-slate-300"}  h-9 w-9 sm:h-10 sm:w-10 cursor-pointer`}
                     onClick={() => setCamStatus((prev) => !prev)}
                    >
                    <FaCamera className="text-black text-base sm:text-lg" />
                </div>
                </div>

                {/* Chess Icons */}
                <div className="flex gap-3 sm:gap-5 md:gap-8 mt-5 flex-wrap justify-center max-w-full">
                {[FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaChessBishop, FaChessKnight, FaChessRook].map((Icon, i) => (
                    <Icon key={i} className="text-xl sm:text-3xl md:text-4xl" />
                ))}
                </div>

                {/* Play Button */}
                <div className="mt-8 w-full max-w-md">
                <Button 
                    className="w-full text-sm sm:text-base py-2 sm:py-3" 
                    onClick={joinRandomRoom} 
                    disabled={isJoiningGame}
                >
                    {isJoiningGame ? (
                    <ClipLoader color={'#000'} size={18} />
                    ) : (
                    "Play a game"
                    )}
                </Button>

                {isJoiningGame && (
                    <p className="text-slate-500 mt-2 text-xs sm:text-sm">
                    Waiting for players to join...
                    </p>
                )}
                </div>

            </div>
            </div>
        </div>
        );

}