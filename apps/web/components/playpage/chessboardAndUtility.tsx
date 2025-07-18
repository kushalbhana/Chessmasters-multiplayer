"use client";
import { use, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useRecoilState, useRecoilValue, useRecoilCallback, useSetRecoilState } from "recoil";
import { Chess } from "chess.js";
import { useSession } from "next-auth/react";

import { TimeAndUser } from "./timeAndUser";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { sendMove } from "@/lib/game/sendMove";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType, gameStatusObj, playerType } from "@repo/lib/status";
import { gameMoves } from "@/store/atoms/moves";
import { getGameStatus } from "@/lib/game/gamestatus";
import { gameStatus, playerTime, opponentTime } from "@/store/atoms/game";

export function ChessboardAndUtility() {
  const { data: session, status } = useSession();
  const [room, setRoom] = useRecoilState(roomInfo);
  const setGameStat = useSetRecoilState(gameStatus);
  const [game, setGame] = useState<any>(new Chess());
  const [playerTurn, setPlayerTurn] = useState(false);
  const [color, setColor] = useState("w");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const moves = useRecoilValue(gameMoves);
  const setMyTimeRemaining = useSetRecoilState(playerTime);
  const setOppTimeRemaining = useSetRecoilState(opponentTime);

  const addMove = useRecoilCallback(({ set }) => (move: string) => {
    set(gameMoves, (prev) => [...prev, move]);
  }, []);

  // Initialize the game and set the player's color
  useEffect(() => {
    if (status === "unauthenticated" || status === "loading") {
      return;
    }
    // @ts-ignore
    session?.user.id === room?.room.whiteId ? setOrientation("white") : setOrientation("black");
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

  useEffect(() => {
    const socket = WebSocketClient.getInstance();
  
    if (!socket) return;
  
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
  
      if (message.type === WebSocketMessageType.INGAMEMOVE) {
        const incomingMove = message.move;
  
        const newGame = new Chess(game.fen());
        const moveResult = newGame.move(incomingMove);

        if (moveResult) {
          setGame(newGame);
          setPlayerTurn(true); // Your turn now
          addMove(moveResult.san);
          setRoom((prevRoom) => {
            if (!prevRoom) return null;
            return {
              ...prevRoom,
              room: {
                ...prevRoom.room,
                game: newGame.fen(),
              },
              type: prevRoom.type,
              roomId: prevRoom.roomId,
            };
          });

          if(orientation === 'white'){
            setOppTimeRemaining(2*message.blackTime);
            setMyTimeRemaining(2*message.whiteTime);
          }else{
            setOppTimeRemaining(2*message.whiteTime);
            setMyTimeRemaining(2*message.blackTime);
          }

          // Check if the game is over
          const isGameOver = getGameStatus(newGame);
          if (isGameOver !== gameStatusObj.ONGOING) {
            if (isGameOver === gameStatusObj.CHECKMATE) {
              setGameStat({
                isGameOver: true,
                overType: gameStatusObj.CHECKMATE,
                status: 'Lost'})
              console.log("Checkmate! Game over.");
            }
            if (isGameOver === gameStatusObj.STALEMATE) {
              setGameStat({
                isGameOver: true,
                overType: gameStatusObj.STALEMATE,
                status: 'Draw'})
            }
            if (isGameOver === gameStatusObj.DRAW) {
              setGameStat({
                isGameOver: true,
                overType: gameStatusObj.DRAW,
                status: 'Draw'})
            }
            if (isGameOver === gameStatusObj.INSUFFICIENT_MATERIAL) {
              setGameStat({
                isGameOver: true,
                overType: gameStatusObj.INSUFFICIENT_MATERIAL,
                status: 'Draw'})
            }
            if (isGameOver === gameStatusObj.THREEFOLD_REPETITION) {
              setGameStat({
                isGameOver: true,
                overType: gameStatusObj.THREEFOLD_REPETITION,
                status: 'Draw'})
            }
          }
        } else {
          console.warn("Received invalid move from server:", incomingMove);
        }
      }
    };
  
    socket.onMessage(handleMessage);
  
    return () => {
      socket.removeMessageListener(handleMessage);
    };
  }, [game]);
  

  function makeAMove(move: any) {
    try {
      const validMove = game.move(move);
      if (!validMove) {
        console.error('Invalid move:', move);
        return null;
      }
      addMove(validMove.san);
  
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
    } catch (error) {
      console.error('Error making move:', error);
    }
   
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
    // @ts-ignore
    // Send the move to the server
    sendMove(session?.user.jwt, 
      room?.roomId!, 
      color === 'w' ? playerType.WHITE : playerType.BLACK, 
      {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", 
    });
    const isGameOver = getGameStatus(game);
    if (isGameOver !== gameStatusObj.ONGOING) {
      if (isGameOver === gameStatusObj.CHECKMATE) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.CHECKMATE,
          status: 'Win'})
        console.log("Checkmate! Game over.");
      }
      if (isGameOver === gameStatusObj.STALEMATE) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.STALEMATE,
          status: 'Draw'})
      }
      if (isGameOver === gameStatusObj.DRAW) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.DRAW,
          status: 'Draw'})
      }
      if (isGameOver === gameStatusObj.INSUFFICIENT_MATERIAL) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.INSUFFICIENT_MATERIAL,
          status: 'Draw'})
      }
      if (isGameOver === gameStatusObj.THREEFOLD_REPETITION) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.THREEFOLD_REPETITION,
          status: 'Draw'})
      }
    }
    return true;
  };
console.log("Moves: ", moves);
  return (
    <div className="flex flex-col gap-1">
      <div className="pr-2">
        {/* @ts-ignore */}
        <TimeAndUser  profilePicture={ session?.user.id !== room?.room.whiteId ? room?.room.whiteProfilePicture: room?.room.blackProfilePicture} profileName={session?.user.id !== room?.room.whiteId ? room?.room.whiteName : room?.room.blackName} playerType={'opponent'} orientation={orientation} game={game}/>
      </div>
      <div className="p-2">
        <Chessboard
          id="BasicBoard"
          position={room?.room.game}
          arePiecesDraggable={playerTurn}
          onPieceDrop={handleMove}
          boardOrientation={orientation}
        />
      </div>
      <div className="pr-2">
        {/* @ts-ignore */}
        <TimeAndUser profilePicture={ session?.user.id === room?.room.whiteId ? room?.room.whiteProfilePicture: room?.room.blackProfilePicture} profileName={session?.user.id === room?.room.whiteId ? room?.room.whiteName : room?.room.blackName} playerType={'player'} orientation={orientation} game={game}/> 
      </div>
    </div>
  );
}
