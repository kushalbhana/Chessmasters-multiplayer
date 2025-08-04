"use client"
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSetRecoilState, useRecoilState } from "recoil";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { GameLayout } from "@/components/playpage/gamelayout";
import { clientSideRoom } from "@repo/lib/types";
import { GameManager } from "@/lib/game/gamemanager";
import { FaMicrophone,FaCamera } from "react-icons/fa";
import { Dropdown } from "@/components/ui/dropdown";
import { gameMoves } from "@/store/atoms/moves";
import { playerTime, opponentTime } from "@/store/atoms/game";
import { ClipLoader } from "react-spinners";
import { Chess } from "chess.js";
import { Input } from "@/components/ui/input";
import { micStatus, camStatus } from "@/store/atoms/videoutility";


export default function GamewithFriends(){
    const { data: session, status } = useSession();
    const router = useRouter();
        const setRoomInfo = useSetRecoilState(roomInfo);
        const setMoves = useSetRecoilState(gameMoves);
        const [roomExist, setRoomExist] = useState<boolean>(false);
        const setPlayerTime = useSetRecoilState(playerTime);
        const setOpponentTime = useSetRecoilState(opponentTime);
        const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);
        const [inviteCode, setInviteCode] = useState("");
        const [generatedCode, setGeneratedCode] = useState("");
        const [selectedColor, setSelectedColor] = useState("white")
        const [ws, setWs] = useState<WebSocketClient | null>(null);
        const { toast } = useToast();
        const [microphoneStatus, setMicStatus] = useRecoilState(micStatus);
        const [cameraStatus, setCamStatus] = useRecoilState(camStatus);
    

        useEffect(() => {
            if (status === 'unauthenticated') {
                router.push('/auth/login');
                return;
            }
            if (status === 'loading') {
                return;
            }
        
            const socket = WebSocketClient.getInstance();
             setWs(socket);
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
            // @ts-expect-error
            const handleCodeRecieved = (data) => {
                if(data?.code)
                    setGeneratedCode(data.code);
            }
        
            const handleMessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                if (data.type === WebSocketMessageType.CREATE_INVITE_LINK){
                    handleCodeRecieved(data);
                    return;
                }
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
                
                    if(session?.user?.id === roomData.room.whiteId){
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
        
        function generateRoom() {
            setIsJoiningGame(true);
            const socket = WebSocketClient.getInstance();
            socket.sendMessage(
                JSON.stringify({ type: WebSocketMessageType.CREATE_INVITE_LINK, JWT_token: session?.user?.jwt, color: selectedColor})
            );
        }

        if(roomExist){
            return <div className="flex justify-center items-center h-full lg:h-screen">
                    <GameLayout/>
                </div>
        }

          const handleCopy = async () => {
                try {
                    if(generatedCode === ""){
                        toast({
                        title: "No access code",
                        description: "Click on Generate Code to generate the code!",
                        })
                        return;
                    }
                    
                    await navigator.clipboard.writeText(generatedCode);
                    toast({
                        title: "Access code copied",
                        description: "Send it to a friend you want to challenge!",
                    });
                } catch (err) {
                console.error("Failed to copy", err);
                }
            };
        return (
        <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0] overflow-x-hidden py-6 pb-20">
            <div className="flex flex-col lg:flex-row w-11/12 max-w-6xl bg-[#111114] justify-center items-center p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-700">
            
            {/* Image Section */}
            <div className="lg:w-1/2 w-5/6 flex justify-center">
                <Image
                src="/images/PlaywithFriend.svg"
                alt="Chessmasters"
                width={700}
                height={700}
                className="bg-white max-w-full h-auto rounded-xl"
                />
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 w-full flex justify-center items-center flex-col p-4 sm:p-6 text-center">

                <h1 className="text-2xl sm:text-3xl font-extrabold">
                Invite. Play. Checkmate your friend!!
                </h1>
                <p className="text-sm sm:text-lg font-medium mt-3 px-2">
                Challenge your friend to a real-time chess duel and see who truly reigns supreme! 
                Just send an invite, and you're ready for head-to-head action—no hassle, no setup, just pure strategy. 
                Sharpen your tactics, outsmart your rival, and claim victory on the board. Play now and let the mind games begin! ♟️
                </p>

                {/* Audio / Video Controls - 2 Rows */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-5 w-full">
                
                {/* Row 1 - Audio */}
                <div className="flex flex-nowrap items-center justify-center gap-2 w-full sm:w-auto">
                    <Dropdown type="audio" />
                    <div className={`flex justify-center items-center rounded-2xl 
                        ${!microphoneStatus ? "bg-red-600 hover:bg-red-700" : "bg-current hover:bg-slate-300"}
                        h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 cursor-pointer `} onClick={() => setMicStatus((prev) => !prev)}>
                    <FaMicrophone className="text-black text-sm sm:text-base md:text-lg" />
                    </div>
                </div>

                {/* Row 2 - Video */}
                <div className="flex flex-nowrap items-center justify-center gap-2 w-full sm:w-auto">
                    <Dropdown type="video" />
                    <div className={`flex justify-center items-center rounded-2xl
                        ${!cameraStatus ? "bg-red-600 hover:bg-red-700" : "bg-current hover:bg-slate-300"}
                    h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 cursor-pointer`} onClick={() => setCamStatus((prev) => !prev)}>
                    <FaCamera className="text-black text-sm sm:text-base md:text-lg" />
                    </div>
                </div>

                </div>

                {/* Invitation + Generate Code Row */}
                <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-4 mt-6 w-full overflow-hidden">
                
                {/* Join Room */}
                <div className="flex items-center flex-shrink gap-0">
                    <Input 
                    placeholder="Enter code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-20 sm:w-24 md:w-32 lg:w-36 rounded-r-none text-xs sm:text-sm"
                    />
                    <Button 
                    className="h-9 sm:h-10 md:h-11 rounded-l-none text-xs sm:text-sm md:text-base px-3 sm:px-4"
                    onClick={() => {
                        ws?.sendMessage(JSON.stringify({ 
                        type: WebSocketMessageType.JOIN_FRIEND_ROOM, 
                        JWT_token: session?.user?.jwt, 
                        roomId: inviteCode 
                        }));
                    }}
                    >
                    Join
                    </Button>
                </div>

                {/* Generate Code */}
                <div className="flex items-center flex-shrink gap-0">
                    <Input 
                    placeholder="Generate"
                    readOnly
                    value={generatedCode}
                    className="w-20 sm:w-24 md:w-32 lg:w-36 h-9 sm:h-10 md:h-11 rounded-r-none text-xs sm:text-sm"
                    />
                    <Button 
                    onClick={handleCopy} 
                    variant="outline" 
                    className="h-9 sm:h-10 md:h-11 rounded-l-none px-3 sm:px-4"
                    >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                </div>
                </div>

                {/* Chess Icons */}
                <div className="flex gap-2 sm:gap-4 md:gap-6 mt-6 flex-wrap justify-center max-w-full">
                {[FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing, FaChessBishop, FaChessKnight, FaChessRook].map((Icon, i) => (
                    <Icon key={i} className="text-lg sm:text-2xl md:text-4xl" />
                ))}
                </div>

                {/* Generate Code Button */}
                <div className="mt-8 w-full max-w-lg">
                <Button 
                    className="w-full text-base sm:text-lg py-3 sm:py-4" 
                    onClick={generateRoom} 
                    disabled={isJoiningGame}
                >
                    {isJoiningGame ? (
                    <ClipLoader color={'#000'} size={20} />
                    ) : (
                    "Generate Code"
                    )}
                </Button>

                {isJoiningGame && (
                    <p className="text-slate-500 mt-2 text-xs sm:text-sm px-2">
                    Waiting for player to join using generated code...
                    </p>
                )}
                </div>

                {/* Color Selection */}
                <div className="flex gap-4 mt-6 w-full justify-center">
                <span 
                    onClick={() => setSelectedColor("white")}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border cursor-pointer ${
                    selectedColor === "white" ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{ backgroundColor: "white", borderColor: "black" }}
                />
                <span 
                    onClick={() => setSelectedColor("black")}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border cursor-pointer ${
                    selectedColor === "black" ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{ backgroundColor: "black" }}
                />
                </div>

            </div>
            </div>
        </div>
        );




}