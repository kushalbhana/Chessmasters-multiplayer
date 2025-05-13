"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { Chessboard } from "react-chessboard";
import { useSession } from "next-auth/react";

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


export default function GameLobby() {
    
    const { data: session, status } = useSession();
    const router = useRouter();
    const [room, setRoomInfo] = useRecoilState(roomInfo);
    const [roomExist, setRoomExist] = useState<boolean>(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }
        if (status === 'loading') {
            return;
        }
    
        const socket = WebSocketClient.getInstance();
        console.log('Checking Room Exist');
        console.log('Checking WebSocket ReadyState...');
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
                        game: data.room.game
                    }
                };
                setRoomInfo(roomData as clientSideRoom);
                GameManager.getInstance(roomData.room.game);
                setRoomExist(true);
            }
        };
    
        socket.onMessage(handleMessage);
    
        return () => {
            socket.removeMessageListener?.(handleMessage);
        };
    }, [status]);
    
    function joinRandomRoom() {
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            // @ts-ignore
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user.jwt})
        );
    }

    if(roomExist){
        return <div className="flex justify-center items-center h-full lg:h-screen">
                <GameLayout/>
            </div>
    }

    return (
        <div className="w-full lg:h-screen flex justify-center items-center">
            <div className="flex flex-col lg:flex-row w-11/12 bg-[#111114] justify-center items-center p-10 rounded-xl shadow-2xl shadow-slate-700">
                <div className="lg:w-1/2 w-5/6">
                    <Chessboard id="BasicBoard"/>
                </div>
                <div className="lg:w-1/2 flex justify-center items-center flex-col p-10 px-">

                    <h1 className=" text-3xl font-extrabold text-center">Find an Opponent, Make Your Move!!</h1>
                    <h1 className=" text-lg font-medium text-center mt-3"> Jump into a real-time chess match against a random player and put your 
                        strategy to the test! Whether you're a beginner or a seasoned pro, every game is a new challenge. No sign-ups, no waiting—just 
                        quick matchmaking, intense battles, and the thrill of the game. Play now and outthink your opponent! 🚀 
                    </h1>
                    <div className="h-24 flex gap-4 justify-center items-center">
                        <Dropdown/>
                        <div className="flex justify-center items-center rounded-2xl bg-red-600 h-10 w-10 hover:bg-red-700 hover:cursor-pointer">
                            <FaMicrophone className=" text-black text-lg"/>
                        </div>
                        <Dropdown/>
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
                        <Button className="w-full" onClick={joinRandomRoom}>Play a game</Button>
                    </div>
                </div>    
            </div>
        </div>
    );
}