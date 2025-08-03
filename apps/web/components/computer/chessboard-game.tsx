"use client";
import { useEffect, useState, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  movesAtom,
  MoveAnalytics,
  differentPeices,
  prevMove,
} from "@/store/atoms/bot";
import { players } from "@repo/lib/status";
import { getGameStatus } from "@/lib/game/gamestatus";
import { gameResult } from "@/store/atoms/sharedGame";
import { gameStatusObj } from "@repo/lib/status";

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
  const peices = useRecoilValue(differentPeices);
  const prev = useRecoilValue(prevMove);
  const moveSound = useMemo(() => new Audio('/sounds/move-self.mp3'), []);

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
  const setGameStat = useSetRecoilState(gameResult);
  console.log(moves)
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

  useEffect(() => {
    if (moves.length === 0) return;

    const updatedMoves = [...moves];
    updatedMoves.pop(); // remove last move

    const lastFen = updatedMoves.length > 0
      ? updatedMoves[updatedMoves.length - 1].fen
      : undefined;

    if (lastFen) {
      setGame(new Chess(lastFen)) // update game instance
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
          overType: gameStatusObj.CHECKMATE,
          status: player === 'player' ? 'Win' : 'Lose'
        });
        console.log("Checkmate! Game over.");
      }
      if (isGameOver === gameStatusObj.STALEMATE) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.STALEMATE,
          status: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.DRAW) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.DRAW,
          status: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.INSUFFICIENT_MATERIAL) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.INSUFFICIENT_MATERIAL,
          status: 'Draw'
        });
      }
      if (isGameOver === gameStatusObj.THREEFOLD_REPETITION) {
        setGameStat({
          isGameOver: true,
          overType: gameStatusObj.THREEFOLD_REPETITION,
          status: 'Draw'
        });
      }
      localStorage.removeItem("fen");
    }
  };

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
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


  useEffect(() => {
    async function runBotMove() {
      // If it's bot's turn, make a move
      if (!playerTurn && game.turn() === (orientation === "white" ? "b" : "w")) {
        const response = await makeBotMove(fen, depth);
        console.log(response)
        if (!response || !response.success) return;

        const { bestMove, evaluation, bestMoveSan } = response;
        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);
        const promotion = bestMove.slice(4) || undefined;

        const move = game.move({
          from,
          to,
          promotion: promotion,
        });

        if (move) {
          setFen(game.fen());
          setPlayerTurn(true);
          localStorage.setItem("fen", game.fen());

          setGameOver('bot');
          setMoves((prev) => [
            ...prev,
            {
              move: bestMove,
              moveSan: bestMoveSan,
              by: "bot",
              score: evaluation || 0,
              fen: game.fen()
            },
          ]);
        }
      }
    }

    runBotMove();
  }, [fen, playerTurn, game, orientation, depth, lastPlayerMove]);

  useEffect(() => {
    const savedFen =
      localStorage.getItem("fen") ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const savedPlayerId = localStorage.getItem("playerId") || "p2";
    const savedDepth = Number(localStorage.getItem("depth")) || 4;
    const savedColor = localStorage.getItem("color") || "white";
    const savedMoves: MoveAnalytics[] = JSON.parse(localStorage.getItem("moves") || "[]");

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

  return (
    <div className="w-full h-full">
      <Chessboard
        id="BasicBoard"
        position={fen}
        arePiecesDraggable={playerTurn}
        onPieceDrop={handleMove}
        boardOrientation={orientation}
        customDarkSquareStyle={{
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        customLightSquareStyle={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        customPieces={customPieces}
      />
    </div>
  );
}