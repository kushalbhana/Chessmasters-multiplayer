"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { useRecoilState, useRecoilValue, useRecoilCallback, useSetRecoilState } from "recoil";
import { Chess, Square } from "chess.js";
import { useSession } from "next-auth/react";

import { TimeAndUser } from "./timeAndUser";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { sendMove } from "@/lib/game/sendMove";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType, playerType } from "@repo/lib/status";
import { gameMoves } from "@/store/atoms/moves";
import { gameStatus, playerTime, opponentTime } from "@/store/atoms/game";
import { useToast } from "@/hooks/use-toast";

export function ChessboardAndUtility() {
  const { data: session, status } = useSession();
  const [room, setRoom] = useRecoilState(roomInfo);
  const setGameResult = useSetRecoilState(gameStatus);
  const [game, setGame] = useState(new Chess());
  const [playerTurn, setPlayerTurn] = useState(false);
  const [color, setColor] = useState("w");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const setMyTimeRemaining = useSetRecoilState(playerTime);
  const setOppTimeRemaining = useSetRecoilState(opponentTime);
  const moveSound = useMemo(() => new Audio('/sounds/move-self.mp3'), []);

  // New state for piece selection and move highlighting
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{from: Square, to: Square} | null>(null);
  const {toast, dismiss} = useToast();
  const disconnectToastId = useRef<string | null>(null);

  const addMove = useRecoilCallback(({ set }) => (move: string) => {
    set(gameMoves, (prev) => [...prev, move]);
  }, []);

  // Initialize the game and set the player's color
  useEffect(() => {
    if (status === "unauthenticated" || status === "loading") {
      return;
    }
    
    (session?.user?.id === room?.room.whiteId) ? setOrientation("white") : setOrientation("black");
    if (session?.user && room?.room.game) {
      const newGame = new Chess(room.room.game);
      setGame(newGame);

      if (session.user.id === room.room.whiteId) {
        setColor("w"); // White
      } else {
        setColor("b"); // Black
      }
    }
  }, [status]);

  useEffect(()=> {
    moveSound.currentTime = 0;
    moveSound.play();
  },[game])

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
    let socket = WebSocketClient.getInstance();
    if (!socket) return;

    /** 🔹 Handle incoming messages */
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === WebSocketMessageType.INGAMEMOVE) {
        const incomingMove = message.move;
        const newGame = new Chess(game.fen());
        const moveResult = newGame.move(incomingMove);

        if (moveResult) {
          setGame(newGame);
          setPlayerTurn(true);
          addMove(moveResult.san);

          setLastMove({ from: moveResult.from as Square, to: moveResult.to as Square });

          // Clear selection
          setSelectedSquare(null);
          setPossibleMoves([]);

          // Update room
          setRoom((prevRoom: any) => {
            if (!prevRoom) return null;
            return {
              ...prevRoom,
              room: { ...prevRoom.room, game: newGame.fen() },
            };
          });

          // Update timers
          if (orientation === "white") {
            setOppTimeRemaining(2 * message.blackTime);
            setMyTimeRemaining(2 * message.whiteTime);
          } else {
            setOppTimeRemaining(2 * message.whiteTime);
            setMyTimeRemaining(2 * message.blackTime);
          }
        } else {
          console.warn("Received invalid move from server:", incomingMove);
        }
      } else if (message.type === WebSocketMessageType.GAMEOVER) {
        const { gameOverType, gameOverMessage, OverType } = message;
        setGameResult((prev: any) => ({
          ...prev,
          isGameOver: true,
          gameOverType,
          gameOverMessage,
          OverType,
        }));
      }
    };

    /** 🔹 Handle Disconnection with Auto-Reconnect */
    const handleClose = () => {
      console.warn("WebSocket disconnected. Attempting to reconnect...");

      // Show toast if not already shown
      if (!disconnectToastId.current) {
        const id = toast({
          title: "Disconnected",
          description: "Trying to reconnect to the server...",
          variant: "destructive",
          duration: Infinity,
        }).id;
        disconnectToastId.current = id;
      }

      let retries = 0;
      const maxRetries = 5;

      const tryReconnect = () => {
        retries++;
        socket = WebSocketClient.reconnect();

        if (socket.isConnected()) {
          console.log("WebSocket reconnected successfully.");

          // Remove disconnect toast
          if (disconnectToastId.current) {
            dismiss(disconnectToastId.current);
            disconnectToastId.current = null;
          }

          socket.onMessage(handleMessage);
        } else if (retries < maxRetries) {
          const delay = Math.min(1000 * 2 ** retries, 10000); // 1s -> 2s -> 4s -> 8s -> 10s
          setTimeout(tryReconnect, delay);
        } else {
          console.error("Max WebSocket reconnection attempts reached.");
        }
      };

      tryReconnect();
    };

    /** Attach listeners */
    socket.onMessage(handleMessage);
    socket.onClose(handleClose);
    socket.onError(handleClose);

    return () => {
      socket.removeMessageListener(handleMessage);
      socket.removeCloseListener(handleClose);
      socket.removeErrorListener(handleClose);
    };
  }, [game]);


  // Handle square click for piece selection and move execution
  const handleSquareClick = (square: Square) => {
    if (!playerTurn) {
      return;
    }

    const piece = game.get(square);
    
    // If clicking on a square with possible moves, make the move
    if (selectedSquare && possibleMoves.includes(square)) {
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: "q", // always promote to a queen for simplicity
      });

      if (move) {
        // Send the move to the server
        if (session?.user?.jwt && room?.roomId && selectedSquare) {
          sendMove(session.user.jwt, 
            room.roomId, 
            color === 'w' ? playerType.WHITE : playerType.BLACK, 
            {
            from: selectedSquare,
            to: square,
            promotion: "q", 
          });
        }
        
        // Update last move highlight
        if (selectedSquare) {
          setLastMove({
            from: selectedSquare,
            to: square
          });
        }
        
        // Clear selection
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    // If clicking on own piece, select it and show possible moves
    if (piece && piece.color === color) {
      setSelectedSquare(square);
      
      // Get all possible moves for this piece
      const moves = game.moves({ square: square as Square, verbose: true });
      const moveSquares = moves.map(move => move.to as Square);
      setPossibleMoves(moveSquares);
    } else {
      // Clear selection if clicking on empty square or opponent's piece
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };
  

  function makeAMove(move: {from: Square, to: Square, promotion?: string}) {
    try {
      const validMove = game.move(move);
      if (!validMove) {
        console.error('Invalid move:', move);
        return null;
      }
      addMove(validMove.san);
      setGame(game); // Update the game object with the new move
      
      // Toggle the player's turn
      setPlayerTurn(false); 
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
  
  const handleMove = (sourceSquare: Square, targetSquare: Square) => {
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
      return false;
    }
    
    // Update last move highlight
    setLastMove({
      from: sourceSquare,
      to: targetSquare
    });
    
    // Clear selection
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    // Send the move to the server
    if (session?.user?.jwt && room?.roomId) {
      sendMove(session.user.jwt, 
        room.roomId, 
        color === 'w' ? playerType.WHITE : playerType.BLACK, 
        {
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", 
      });
    }
    return true;
  };

  // Custom square styles for highlighting
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    
    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
    }
    
    // Highlight last move squares
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: 'rgba(255, 255, 0, 0.6)'
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: 'rgba(255, 255, 0, 0.6)'
      };
    }
    
    return styles;
  }, [selectedSquare, possibleMoves, lastMove, game]);

  // Custom square component to render dots for possible moves
  const customSquare = ({ children, square, style }: any) => {
    const isPossibleMove = possibleMoves.includes(square);
    const piece = game.get(square);
    const hasCapture = isPossibleMove && piece;
    const hasMove = isPossibleMove && !piece;

    return (
      <div
        style={{
          ...style,
          position: 'relative',
        }}
      >
        {children}
        {hasMove && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '22%',
              height: '22%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
        {hasCapture && (
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              border: '4px solid rgba(255, 0, 0, 0.7)',
              borderRadius: '50%',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-1">
      <div className="pr-2">
        <TimeAndUser  profilePicture={ session?.user?.id !== room?.room.whiteId ? room?.room.whiteProfilePicture: room?.room.blackProfilePicture} profileName={session?.user?.id !== room?.room.whiteId ? room?.room.whiteName : room?.room.blackName} playerType={'opponent'} orientation={orientation} game={game}/>
      </div>
      <div className="p-2">
        <Chessboard
          id="BasicBoard"
          position={room?.room.game}
          arePiecesDraggable={playerTurn}
          onPieceDrop={handleMove}
          onSquareClick={handleSquareClick}
          boardOrientation={orientation}
          customSquareStyles={customSquareStyles}
          customSquare={customSquare}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>
      <div className="pr-2">
        <TimeAndUser profilePicture={ session?.user?.id === room?.room.whiteId ? room?.room.whiteProfilePicture: room?.room.blackProfilePicture} profileName={session?.user?.id === room?.room.whiteId ? room?.room.whiteName : room?.room.blackName} playerType={'player'} orientation={orientation} game={game}/> 
      </div>
    </div>
  );
}