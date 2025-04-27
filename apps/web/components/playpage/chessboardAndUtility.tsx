"use client";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useRecoilState } from "recoil";
import { Chess } from "chess.js";
import { useSession } from "next-auth/react";

import { TimeAndUser } from "./timeAndUser";
import { roomInfo } from "@/store/selectors/getRoomSelector";

export function ChessboardAndUtility() {
  const { data: session, status } = useSession();
  const [room, setRoom] = useRecoilState(roomInfo);
  const [game, setGame] = useState<any>(new Chess());
  const [playerTurn, setPlayerTurn] = useState(false);
  const [color, setColor] = useState("w");

  // Initialize the game and set the player's color
  useEffect(() => {
    if (status === "unauthenticated" || status === "loading") {
      return;
    }

    if (session?.user && room?.room.game) {
      const newGame = new Chess(room.room.game);
      setGame(newGame);

    //   @ts-ignore
      if (session.user.id === room.room.whiteId) {
        setColor("w"); // White
      } else {
        setColor("b"); // Black
      }
    }
  }, [status]);

  // Check if it's the player's turn
  useEffect(() => {
    const turn = game.turn();
    if (turn === color) {
      setPlayerTurn(true);
    } else {
      setPlayerTurn(false);
    }
  }, [game, color]);

  function makeAMove(move: any) {
    const validMove = game.move(move);
    if (!validMove) {
      console.error('Invalid move:', move);
      return null;
    }

    console.log('Move made:', validMove);
    setGame(game); // Update the game object with the new move
    
    // Toggle the player's turn
    setPlayerTurn(false); // Assume the opponent's turn now
    setRoom((prevRoom) => {
      if (!prevRoom) return null; 
    
      return {
        ...prevRoom,
        room: {
          ...prevRoom.room,
          game: game.fen(), // update game field only
        },
        type: prevRoom.type, // preserve type
        roomId: prevRoom.roomId, // preserve roomId
      };
    });
    return true;
  }

  const handleMove = (sourceSquare: any, targetSquare: any) => {
    if (!playerTurn) {
      console.log("It's not your turn.");
      return false;
    }

    const move = makeAMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for simplicity
      });

    if (move === null) {
      console.log("Invalid move.");
      return false;
    }
    console.log('Returning True...');
    return true;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="pr-2">
        <TimeAndUser />
      </div>
      <div className="p-2">
        <Chessboard
          id="BasicBoard"
          position={room?.room.game}
          arePiecesDraggable={playerTurn}
          onPieceDrop={handleMove}
        />
      </div>
      <div className="pr-2">
        <TimeAndUser />
      </div>
    </div>
  );
}
