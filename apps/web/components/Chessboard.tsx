"use client";
import { Chessboard } from "react-chessboard";
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

export default function ChessBoard({ roomId }: any) {
  const [game, setGame] = useState(new Chess());
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('black');
  const [myChance, setMyChance] = useState<boolean>();
  const [customSquareStyles, setCustomSquareStyles] = useState({});

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setSocket(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'sender', roomId }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'move') {
        console.log(message.move);
        makeAMove(message.move);
      }

      if (message.type === 'color') {
        setBoardOrientation(message.color);
        setMyChance(message.color === 'white');
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  const highlightSquare = (sourceSquare: any, targetSquare: any, color? : any) => {

    setCustomSquareStyles({
      [sourceSquare]: { backgroundColor: color || '#FFF333' },
      [targetSquare]: { backgroundColor: color || '#FFF333' },
    });
  };

  function makeAMove(move: any) {
    let gameCopy = new Chess(game.fen());
    setMyChance(true);

    if (move.fen) gameCopy = new Chess(move.fen);

    const validMove = gameCopy.move(move);
    if (!validMove) {
      console.error('Invalid move:', move);
      return null;
    }

    if (!move.fen) {
      setMyChance(false);
      move.fen = game.fen();
      if (socket) {
        const messageType = boardOrientation === 'white' ? 'moveFromSender' : 'moveFromReceiver';
        socket.send(JSON.stringify({ type: messageType, move, roomId }));
      }
    }

    highlightSquare(move.from, move.to);

    if (gameCopy.inCheck()) {
      const queenPosition = findQueenPosition(gameCopy);
      highlightSquare(move.to, queenPosition, '#D63326');
      console.log(`Queen's position in check: ${queenPosition}`);
    }

    setGame(gameCopy);
    return validMove;
  }

  function findQueenPosition(chessInstance: any) {
    const board = chessInstance.board();
    const turn = chessInstance.turn();
    const checkColor = turn === 'w' ? 'w' : 'b'; // The color of the side in check
  
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] && board[i][j].type === 'k' && board[i][j].color === checkColor) {
          const file = String.fromCharCode(97 + j); // Convert column index to file letter
          const rank = 8 - i; // Convert row index to rank number
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

  return (
    <div>
      <Chessboard
        id="BasicBoard"
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={myChance}
        customSquareStyles={customSquareStyles}
      />
    </div>
  );
}
