"use client";
import { useEffect, useState } from "react";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Chessboard } from "react-chessboard";
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRecoilState } from "recoil";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { GameLayout } from "@/components/playpage/gamelayout";
import { clientSideRoom } from "@repo/lib/types";
import { Chess } from "chess.js";

export default function GameLobby() {
    
    const { data: session, status } = useSession();
    const router = useRouter();
    const [room, setRoomInfo] = useRecoilState(roomInfo);
    const [roomExist, setRoomExist] = useState<boolean>(false);
 
    useEffect(() => {
        const fetchData = async () => {    
            if (status === 'unauthenticated') {
                router.push('/auth/login');
                return;
            }
    
            try {
                const response = await axios.get('http://localhost:3000/api/checkRoomExist/randomMatch');
                if(response.status == 200){
                    console.log(response.data.newRoomData);
                    const responseData: clientSideRoom = JSON.parse(response.data.newRoomData)
                    const roomData: clientSideRoom = {
                        type: responseData.type,
                        roomId: responseData.roomId,
                        room: {
                            whiteId: responseData.room.whiteId,
                            whiteName: responseData.room.whiteName,
                            whiteProfilePicture: responseData.room.whiteProfilePicture,
                            blackId: responseData.room.blackId,
                            blackName: responseData.room.blackName,
                            blackProfilePicture: responseData.room.blackProfilePicture,
                            whiteSocket: responseData.room.whiteSocket,
                            blackSocket: responseData.room.blackSocket,
                            game: typeof responseData.room.game === "string" ? new Chess(responseData.room.game) : responseData.room.game,
                        }
                    };
                    setRoomInfo(responseData as clientSideRoom);
                    setRoomExist(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, [status]);

    useEffect(() => {
        const socket = WebSocketClient.getInstance();
    
        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
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
                        game: typeof data.room.game === "string" ? new Chess(data.room.game) : data.room.game,
                    }
                };
                
                setRoomInfo(roomData as clientSideRoom);
                setRoomExist(true);
            }
        };
    
        socket.onMessage(handleMessage);
    
        return () => {
            socket.removeMessageListener?.(handleMessage);
        };
    }, []);
    
    
    function joinRandomRoom() {
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            // @ts-ignore
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user.jwt})
        );
    }


    if(roomExist){
        return <div className="flex justify-center items-center h-screen">
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