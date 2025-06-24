"use client"
import Image from "next/image";
import { useState } from "react";

import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";
import { FaMicrophone, FaCamera } from "react-icons/fa";
import { Dropdown } from "@/components/ui/dropdown";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import WebSocketClient from "@/lib/websocket/websocket-client";

export default function GamewithFriends(){
    const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);
    function joinRandomRoom() {
        setIsJoiningGame(true);
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            // @ts-ignore
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user.jwt})
        );
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