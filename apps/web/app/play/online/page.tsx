"use client";
import { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useSetRecoilState } from "recoil";
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




export default function GameLobby() {
    
    const { data: session, status } = useSession();
    const router = useRouter();
    const setRoomInfo = useSetRecoilState(roomInfo);
    const setMoves = useSetRecoilState(gameMoves);
    const [roomExist, setRoomExist] = useState<boolean>(false);
    const setPlayerTime = useSetRecoilState(playerTime);
    const setOpponentTime = useSetRecoilState(opponentTime);
    const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }
        if (status === 'loading') {
            return;
        }
    
        const socket = WebSocketClient.getInstance();
        console.log('READY STATE:', socket.readyState);
    
        if (socket.readyState === WebSocket.OPEN) {
            console.log('Socket already open, sending message immediately');
            // @ts-ignore
            socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user.jwt }));
        } else {
            console.log('Socket not open yet, adding open listener');
            socket.addOpenListener(() => {
                console.log('Socket opened, sending message');
                // @ts-ignore
                socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user.jwt }));
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
                // @ts-ignore
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
            // @ts-ignore
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user.jwt})
        );
    }

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


    if(roomExist){
        return <div className="flex justify-center items-center h-full lg:h-screen">
                <GameLayout/>
            </div>
    }

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
                <div className="lg:w-1/2 flex justify-center items-center flex-col p-10 px-">

                    <h1 className=" text-3xl font-extrabold text-center">Find an Opponent, Make Your Move!!</h1>
                    <h1 className=" text-lg font-medium text-center mt-3"> Jump into a real-time chess match against a random player and put your 
                        strategy to the test! Whether you're a beginner or a seasoned pro, every game is a new challenge. No sign-ups, no waiting—just 
                        quick matchmaking, intense battles, and the thrill of the game. Play now and outthink your opponent! 🚀 
                    </h1>
                    <div className="h-24 flex gap-4 justify-center items-center">
                        <Dropdown type={"audio"}/>
                        <div className="flex justify-center items-center rounded-2xl bg-red-600 h-10 w-10 hover:bg-red-700 hover:cursor-pointer">
                            <FaMicrophone className=" text-black text-lg"/>
                        </div>
                        <Dropdown type={"video"}/>
                        <div className="flex justify-center items-center rounded-2xl hover:bg-red-700 hover:cursor-pointer bg-red-600 h-10 w-10">
                            <FaCamera className=" text-black text-lg"/>
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
                        <Button 
                            className="w-full" 
                            onClick={joinRandomRoom} 
                            disabled={isJoiningGame}
                            >
                            {isJoiningGame ? (
                                <ClipLoader
                                color={'#000'}
                                size={20}  // Smaller size to fit the button nicely
                                aria-label="Loading Spinner"
                                data-testid="loader"
                                />
                                
                            ) : (
                                "Play a game"
                            )}
                            </Button>
                            <div className="w-full flex mt-2 justify-center items-center">
                                <div>
                                {isJoiningGame ? (<h1 className=" text-slate-500"> Waiting for players to join</h1>) : ("")}
                                </div>
                            </div>
                            
                    </div>
                </div>    
            </div>
        </div>
    );
}