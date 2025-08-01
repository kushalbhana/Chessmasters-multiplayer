"use client"
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSetRecoilState } from "recoil";
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
import { FaMicrophone } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { Dropdown } from "@/components/ui/dropdown";
import { gameMoves } from "@/store/atoms/moves";
import { playerTime, opponentTime } from "@/store/atoms/game";
import { ClipLoader } from "react-spinners";
import { Chess } from "chess.js";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";


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
                socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user.jwt }));
            } else {
                console.log('Socket not open yet, adding open listener');
                socket.addOpenListener(() => {
                    console.log('Socket opened, sending message');
                    socket.sendMessage(JSON.stringify({ type: WebSocketMessageType.ROOMEXIST, JWT_token: session?.user.jwt }));
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
        
        function generateRoom() {
            setIsJoiningGame(true);
            const socket = WebSocketClient.getInstance();
            socket.sendMessage(
                JSON.stringify({ type: WebSocketMessageType.CREATE_INVITE_LINK, JWT_token: session?.user.jwt, color: selectedColor})
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
            <div className="w-full lg:h-screen flex justify-center items-center bg-[#e0e0e0]">
                <div className="flex flex-col lg:flex-row w-11/12 bg-[#111114] justify-center items-center p-10 rounded-3xl shadow-2xl shadow-slate-700">
                    <div className="lg:w-1/2 w-5/6 outline-white outline-8">
                        <Image
                            src="/images/PlaywithFriend.svg"
                            alt="Chessmasters"
                            width={700}
                            height={700}
                            className="bg-white"
                        />
                    </div>
                    <div className="lg:w-1/2 flex justify-center items-center flex-col p-10 px-">

                        <h1 className=" text-3xl font-extrabold text-center">Invite. Play. Checkmate your friend!!</h1>
                        <h1 className=" text-lg font-medium text-center mt-3"> Challenge your friend to a real-time chess duel and see who truly reigns supreme! 
                        Just send an invite, and you're ready for head-to-head action—no hassle, no setup, just pure strategy. Sharpen your tactics, outsmart your rival, 
                        and claim victory on the board. Play now and let the mind games begin! ♟️
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
                        <div className="flex flex-col gap-4 md:flex-row md:gap-10">
                            {/* Input for entering invitation code */}
                            <div className="flex justify-center items-center">
                                <Input 
                                    placeholder="Enter invitation code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-40 rounded-r-none"
                                />
                                <Button className="h-10 rounded-l-none"
                                onClick={() => {
                                    ws?.sendMessage(JSON.stringify({ type: WebSocketMessageType.JOIN_FRIEND_ROOM, JWT_token: session?.user.jwt, roomId: inviteCode}));
                                    console.log('Invite code sent')
                                }}>Join Room</Button>
                            </div>
                            {/* Input for generated code + copy button */}
                            <div className="flex justify-center items-center w-full md:w-auto">
                                <Input 
                                placeholder="Generate Code"
                                readOnly
                                value={generatedCode}
                                className="w-40 h-10 rounded-r-none"
                                />
                                <Button onClick={handleCopy} variant="outline" className="h-10 rounded-l-none">
                                <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-6 md:gap-10 mt-8">
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
                                onClick={generateRoom} 
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
                                    "Generate Code"
                                )}
                                </Button>
                                <div className="w-full flex mt-2 justify-center items-center">
                                    <div>
                                    {isJoiningGame ? (<h1 className=" text-slate-500"> Waiting for player to join using generated code...</h1>) : ("")}
                                    </div>
                                </div>
                                
                        </div>
                        <div className="flex gap-4 mt-6 w-full justify-center">
                            <span 
                            onClick={() => setSelectedColor("white")}
                            className={`w-8 h-8 rounded-full border cursor-pointer ${
                                selectedColor === "white" ? "ring-2 ring-blue-500" : ""
                            }`}
                            style={{ backgroundColor: "white", borderColor: "black" }}
                            />
                            <span 
                            onClick={() => setSelectedColor("black")}
                            className={`w-8 h-8 rounded-full border cursor-pointer ${
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