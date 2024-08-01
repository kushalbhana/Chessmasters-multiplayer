"use client"
import { Chessboard } from "react-chessboard";
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WebSocketClient from '../lib/WebSocketClient';
import GameOver from './shared/GameOver';
import Countdown from "./shared/Countdown";
import { countDownHook } from '@repo/store/src';


export default function ChessBoard({ roomId }: any) {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('black');
  const [myChance, setMyChance] = useState<boolean>(true);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [forceUpdate, setForceUpdate] = useState(1);
  const [showCheckmateDialog, setShowCheckmateDialog] = useState(false);
  const [gameResult, setGameResult] = useState<string>("");
  const { data: session, status } = useSession();

  const router = useRouter();
  // const count = countDownHook();

  useEffect(() => {
    if (status === "loading") return; 
    else if (session==null){
      router.push('/'); //If not authenticated then redirect to home page for now
    }
  },[])

  useEffect(() => {
    if (status === "loading") return; 

    // @ts-ignore
    if (status === "authenticated" && session?.user?.jwt) {
      // @ts-ignore
      const token = session.user.jwt;
      const socket = WebSocketClient.getInstance();

      socket.onOpen(() => {
        socket.sendMessage(JSON.stringify({ type: 'sender', roomId, token }));
      });

      socket.onMessage((event: MessageEvent) => {
        const message = JSON.parse(event.data);

        if (message.type === 'move') {
          makeAMove(message.move);
        }

        if (message.type === 'color') {
          setBoardOrientation(message.color);
        }

        if (message.type === 'checkmate') {
          console.log(message);
          setGameResult("Lost");
          setShowCheckmateDialog(true);

        }

        if (message.type === 'authorization') {
          if(message.status !== "200"){
            console.log(message);
            router.push('/');
          }
        }

        if (message.type === 'boardState') {
          const chess = new Chess();
          chess.load(message.boardState);
          setGame(chess);

          if (message.color === 'white') {
            game.turn() === 'w' && message.color === 'white' ? setMyChance(true) : setMyChance(false);
          } else {
            game.turn() === 'b' && message.color === 'black' ? setMyChance(true) : setMyChance(true);
          }
          forceUpdate === 1 ? setForceUpdate(0) : setForceUpdate(1);
        }
      });

      socket.onClose(() => {
        console.log('WebSocket connection closed');
      });

      socket.onError((error: any) => {
        console.error('WebSocket error', error);
      });

      return () => {
        socket.close();
      };
    }
  }, [roomId, status]);

  const highlightSquare = (sourceSquare: any, targetSquare: any, color?: any) => {
    setCustomSquareStyles({
      [sourceSquare]: { backgroundColor: color || '#FFF333' },
      [targetSquare]: { backgroundColor: color || '#FFF333' },
    });
  };

  function makeAMove(move: any) {
    let gameCopy = new Chess(game.fen());
    setMyChance(true);

    if (move.fen) gameCopy = new Chess(move.fen);

    try {
      const validMove = gameCopy.move(move);
      if (!validMove) {
        return null;
      }

      if (!move.fen) {
        setMyChance(false);
        move.fen = game.fen();
        let boardState = gameCopy.fen();
        
        const socket = WebSocketClient.getInstance();
        if (socket) {
          const messageType = boardOrientation === 'white' ? 'moveFromSender' : 'moveFromReceiver';
          socket.sendMessage(JSON.stringify({ type: messageType, move, roomId, boardState }));

          if (gameCopy.isCheckmate()){
            socket.sendMessage(JSON.stringify({ type: 'checkmate', winner: boardOrientation, roomId, endType: 'Winner' }));
            setGameResult("Winner");
            setShowCheckmateDialog(true);
          }
          if (gameCopy.isDraw()){
            socket.sendMessage(JSON.stringify({ type: 'checkmate', winner: boardOrientation, roomId, endType: 'Draw' }));
            setGameResult("Draw");
            setShowCheckmateDialog(true);
          }
          if (gameCopy.isStalemate()){
            socket.sendMessage(JSON.stringify({ type: 'checkmate', winner: boardOrientation, roomId, endType: 'Stalemate' }));
            setGameResult("Stalemate");
            setShowCheckmateDialog(true);
          }
        }
      }

      highlightSquare(move.from, move.to);

      if (gameCopy.inCheck()) {
        const queenPosition = findQueenPosition(gameCopy);
        setCustomSquareStyles({
          [queenPosition!]: { backgroundColor: '#D63326' },
        });
      }
      setGame(gameCopy);
      return validMove;

    } catch (error) {
      console.log(error);
    }
  }

  function findQueenPosition(chessInstance: any) {
    const board = chessInstance.board();
    const turn = chessInstance.turn();
    const checkColor = turn === 'w' ? 'w' : 'b';

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] && board[i][j].type === 'k' && board[i][j].color === checkColor) {
          const file = String.fromCharCode(97 + j);
          const rank = 8 - i;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }

  function onDrop(sourceSquare: any, targetSquare: any) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) {
      return false;
    }
    return true;
  }

  // const count = countDown();

  return (
    <div>
      <Chessboard
        id="BasicBoard"
        position={game.fen()}
        key={forceUpdate}
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={myChance}
        customSquareStyles={customSquareStyles}
      />
      <GameOver gameResult={gameResult} open={showCheckmateDialog} onClose={() => setShowCheckmateDialog(false)} />

    </div>
  );
}
