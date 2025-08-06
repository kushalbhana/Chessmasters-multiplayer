"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import axios from "axios";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  movesAtom,
  MoveAnalytics,
  differentPeices,
  prevMove,
} from "@/store/atoms/bot";
import { gameStatusMessage, players } from "@repo/lib/status";
import { getGameStatus } from "@/lib/game/gamestatus";
import { gameStatusObj } from "@repo/lib/status";
import { gameStatus } from "@/store/atoms/game";

// Simple type definition matching your first version API response
type BotResponse = {
  success: boolean;
  bestMove: string;
  bestMoveSan: string;
  evaluation: number;
  classification: string;
  confidence: number;
  alternativeMoves?: {
    move: string;
    moveSan: string;
    evaluation: number;
    classification: string;
  }[];
  analysis: {
    isCheckmate: boolean;
    isCheck: boolean;
    isStalemate: boolean;
    gamePhase: string;
    materialBalance: number;
  };
};

export function ChessboardGame() {
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [depth, setDepth] = useState<number>(4);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [lastPlayerMove, setLastPlayerMove] = useState<string | null>(null);
  const [botMoveInProgress, setBotMoveInProgress] = useState(false);
  const peices = useRecoilValue(differentPeices);
  const prev = useRecoilValue(prevMove);
  const moveSound = useMemo(() => new Audio('/sounds/move-self.mp3'), []);
  const botMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // New state for piece selection and move highlighting
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{from: Square, to: Square} | null>(null);

  const [, setBot] = useState({
    id: "p1",
    name: "AlphaBot",
    rating: 400,
    avatar: "🤖",
  });

  useEffect(()=> {
    moveSound.currentTime = 0;
    moveSound.play();
  },[fen])

  console.log(game.turn())
  const [moves, setMoves] = useRecoilState(movesAtom);
  const setGameStat = useSetRecoilState(gameStatus);
  console.log(moves)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
      }
    };
  }, []);

  async function makeBotMove(
    fen: string,
    depth: number
  ): Promise<BotResponse | null> {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_CHESS_ENGINE}api/bot-move`, {
        fen,
        depth,
        playerLevel: 'beginner',
      });

      return response.data;
    } catch (error) {
      console.error("Bot move fetch failed:", error);
      return null;
    }
  }

  // Function to execute bot move with animation
  const executeBotMove = async (from: Square, to: Square, promotion?: string, bestMoveSan?: string, evaluation?: number) => {
    // Create a temporary game instance to validate the move
    const tempGame = new Chess(game.fen());
    const move = tempGame.move({
      from,
      to,
      promotion: promotion || undefined,
    });

    if (!move) {
      console.error("Invalid bot move:", from, to);
      setBotMoveInProgress(false);
      return;
    }

    // Update the game state and FEN
    const newGame = new Chess(game.fen());
    const validMove = newGame.move({
      from,
      to,
      promotion: promotion || undefined,
    });

    if (validMove) {
      setGame(newGame);
      setFen(newGame.fen());
      setPlayerTurn(true);
      setBotMoveInProgress(false);
      localStorage.setItem("fen", newGame.fen());

      // Update last move highlight for bot move
      setLastMove({
        from: from,
        to: to
      });

      // Clear player selection when bot moves
      setSelectedSquare(null);
      setPossibleMoves([]);

      setGameOver('bot');
      setMoves((prev) => [
        ...prev,
        {
          move: from + to + (promotion || ''),
          moveSan: bestMoveSan || validMove.san,
          by: "bot",
          score: evaluation || 0,
          fen: newGame.fen()
        },
      ]);
    }
  };

  useEffect(() => {
    if (moves.length === 0) return;

    const updatedMoves = [...moves];
    updatedMoves.pop(); // remove last move

    const lastFen = updatedMoves.length > 0
      ? updatedMoves[updatedMoves.length - 1].fen
      : undefined;

    if (lastFen) {
      setGame(new Chess(lastFen)) 
      setFen(lastFen)
      setMoves(updatedMoves)
      localStorage.setItem('moves', JSON.stringify(updatedMoves));
      localStorage.setItem('fen', lastFen);
    }

    setMoves(updatedMoves);
  },[prev])

  const setGameOver = (player: string) => {
    const isGameOver = getGameStatus(game);
    if (isGameOver !== gameStatusObj.ONGOING) {
      if (isGameOver === gameStatusObj.CHECKMATE) {
        setGameStat({
          isGameOver: true,
          gameOverType: gameStatusObj.CHECKMATE,
          gameOverMessage: player === 'player' ? gameStatusMessage.CheckmateWin : gameStatusMessage.CheckmateLoss,
          OverType: player === 'player' ? 'Win' : 'Lose'
        });
        console.log("Checkmate! Game over.");
      }
      if (isGameOver === gameStatusObj.STALEMATE) {
        setGameStat({
          isGameOver: true,
          gameOverType: gameStatusObj.STALEMATE,
          gameOverMessage: gameStatusMessage.Stalemate,
          OverType: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.DRAW) {
        setGameStat({
          isGameOver: true,
          gameOverType: gameStatusObj.DRAW,
          gameOverMessage: gameStatusMessage.Draw,
          OverType: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.INSUFFICIENT_MATERIAL) {
        setGameStat({
          isGameOver: true,
          gameOverType: gameStatusObj.INSUFFICIENT_MATERIAL,
          gameOverMessage: gameStatusMessage.Insufficient_Material,
          OverType: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.THREEFOLD_REPETITION) {
        setGameStat({
          isGameOver: true,
          gameOverType: gameStatusObj.THREEFOLD_REPETITION,
          gameOverMessage: gameStatusMessage.Threefold_Repetition,
          OverType: 'Draw'
        });
      }
      localStorage.removeItem("fen");
    }
  };

  // Handle square click for piece selection and move execution
  const handleSquareClick = (square: Square) => {
    if (!playerTurn || botMoveInProgress) {
      console.log("It's not your turn or bot move is in progress.");
      return;
    }

    const piece = game.get(square);
    const playerColor = orientation === "white" ? "w" : "b";
    
    // If clicking on a square with possible moves, make the move
    if (selectedSquare && possibleMoves.includes(square)) {
      const move = makeMove(selectedSquare, square);

      if (move) {
        // Update last move highlight
        setLastMove({
          from: selectedSquare,
          to: square
        });
        
        // Clear selection
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    // If clicking on own piece, select it and show possible moves
    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      
      // Get all possible moves for this piece
      const moves = game.moves({ square: square, verbose: true });
      const moveSquares = moves.map(move => move.to as Square);
      setPossibleMoves(moveSquares);
    } else {
      // Clear selection if clicking on empty square or opponent's piece
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Extract move logic into separate function for reuse
  function makeMove(sourceSquare: Square, targetSquare: Square): boolean {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      const newMove: MoveAnalytics = {
        move: move.from + move.to,
        by: "player",
        fen: game.fen(),
        moveSan: move.san
      };

      setFen(game.fen());
      setPlayerTurn(false);
      setMoves((prev) => [...prev, newMove]);
      setLastPlayerMove(newMove.move);
      localStorage.setItem("fen", game.fen());
      setGameOver('player');
      localStorage.setItem('moves', JSON.stringify([...moves, newMove]));

      return true;
    } catch {
      return false;
    }
  }

  function handleMove(sourceSquare: Square, targetSquare: Square): boolean {
    if (!playerTurn || botMoveInProgress) {
      return false;
    }

    const success = makeMove(sourceSquare, targetSquare);
    
    if (success) {
      // Update last move highlight
      setLastMove({
        from: sourceSquare,
        to: targetSquare
      });
      
      // Clear selection
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
    
    return success;
  }

  useEffect(() => {
    async function runBotMove() {
      // If it's bot's turn and no bot move is in progress, make a move
      if (!playerTurn && 
          !botMoveInProgress && 
          game.turn() === (orientation === "white" ? "b" : "w")) {
        
        setBotMoveInProgress(true);
        
        const response = await makeBotMove(fen, depth);
        console.log(response);
        
        if (!response || !response.success) {
          setBotMoveInProgress(false);
          return;
        }

        const { bestMove, evaluation, bestMoveSan } = response;
        const from = bestMove.slice(0, 2) as Square;
        const to = bestMove.slice(2, 4) as Square;
        const promotion = bestMove.slice(4) || undefined;

        // Execute bot move with 1 second delay
        botMoveTimeoutRef.current = setTimeout(() => {
          executeBotMove(from, to, promotion, bestMoveSan, evaluation);
        }, 1000);
      }
    }

    runBotMove();
  }, [fen, playerTurn, game, orientation, depth, lastPlayerMove, botMoveInProgress]);

  useEffect(() => {
  if (localStorage.getItem("resigned") === "true") {
    localStorage.removeItem("resigned"); // consume the flag
    return; // skip restoring old game
  }

  const savedFen =
    localStorage.getItem("fen") ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const savedMoves: MoveAnalytics[] = JSON.parse(localStorage.getItem("moves") || "[]");
  const savedColor = localStorage.getItem("color") || "white";
  const savedDepth = Number(localStorage.getItem("depth")) || 4;
  const savedPlayerId = localStorage.getItem("playerId") || "p2";

  const newGame = new Chess(savedFen);
  const isPlayersTurn =
    (savedColor === "white" && newGame.turn() === "w") ||
    (savedColor === "black" && newGame.turn() === "b");

  setFen(savedFen);
  setDepth(savedDepth);
  setMoves(savedMoves);
  setOrientation(savedColor === "black" ? "black" : "white");
  setPlayerTurn(isPlayersTurn);
  setGame(newGame);

  const botPlayer = players.find((p) => p.id === savedPlayerId);
  if (botPlayer) setBot(botPlayer);
}, []);


  const customPieces = Object.fromEntries(
    Object.entries(peices).map(([piece, url]) => [
      piece,
      ({ squareWidth }: { squareWidth: number }) => (
        <img src={url} style={{ width: squareWidth, height: squareWidth }} />
      ),
    ])
  );

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
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
    <div className="w-full h-full">
      <Chessboard
        id="BasicBoard"
        position={fen}
        arePiecesDraggable={playerTurn && !botMoveInProgress}
        onPieceDrop={handleMove}
        onSquareClick={handleSquareClick}
        boardOrientation={orientation}
        customPieces={customPieces}
        customSquareStyles={customSquareStyles}
        customSquare={customSquare}
      />
    </div>
  );
}