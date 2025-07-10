"use client";

import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import { useRecoilState } from "recoil";
import { movesAtom, MoveAnalytics } from "@/store/atoms/bot";
import { players } from "@repo/lib/status";

export function ChessboardGame() {
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [depth, setDepth] = useState<number>(4);
  const [playerId, setPlayerId] = useState("p2");
  const [playerTurn, setPlayerTurn] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [lastPlayerMove, setLastPlayerMove] = useState<string | null>(null);
  const [bot, setBot] = useState({
    id: "p1",
    name: "AlphaBot",
    rating: 400,
    avatar: "🤖",
  });

  const [moves, setMoves] = useRecoilState(movesAtom);
  console.log(moves)

  // Sync to localStorage when moves change
  useEffect(() => {
    localStorage.setItem("moves", JSON.stringify(moves));
  }, [moves]);

  type EngineResponse = {
    bestMove: string;
    evaluation: {
      lastPlayerMove?: string;
      lastPlayerScore?: number;
      bestMoveScore?: number;
    };
  };

  async function makeBotMove(
    fen: string,
    depth: number,
    lastPlayerMove: string | null
  ): Promise<EngineResponse | null> {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_CHESS_ENGINE}bestmove`, {
        fen,
        depth,
        lastPlayerMove,
      });
      return response.data;
    } catch (error) {
      console.error("Bot move fetch failed:", error);
      return null;
    }
  }

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    const newMove: MoveAnalytics = {
      move: move.from + move.to,
      by: "player",
    };

    setFen(game.fen());
    setPlayerTurn(false);
    setMoves((prev) => [...prev, newMove]);
    setLastPlayerMove(newMove.move);
    localStorage.setItem("fen", game.fen());

    return true;
  }

  useEffect(() => {
    async function runBotMove() {
      if (!playerTurn && game.turn() === (orientation === "white" ? "b" : "w")) {
        const response = await makeBotMove(fen, depth, lastPlayerMove);
        if (!response) return;

        const { bestMove, evaluation } = response;
        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);

        const move = game.move({
          from,
          to,
          promotion: "q",
        });

        if (move) {
          setFen(game.fen());
          setPlayerTurn(true);
          localStorage.setItem("fen", game.fen());

          // Store bot move with score
          setMoves((prev) => [
            ...prev,
            {
              move: bestMove,
              by: "bot",
              score: evaluation?.bestMoveScore,
            },
          ]);

          // Update last player move with its score
          if (evaluation?.lastPlayerScore !== undefined) {
            setMoves((prev) =>
              prev.map((m, i) =>
                i === prev.length - 2 && m.by === "player"
                  ? { ...m, score: evaluation.lastPlayerScore }
                  : m
              )
            );
          }

          setLastPlayerMove(null); // clear it after sending
        }
      }
    }

    runBotMove();
  }, [fen]);

  useEffect(() => {
    const savedFen =
      localStorage.getItem("fen") ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const savedPlayerId = localStorage.getItem("playerId") || "p2";
    const savedDepth = Number(localStorage.getItem("depth")) || 4;
    const savedColor = localStorage.getItem("color");
    const savedMoves: MoveAnalytics[] = JSON.parse(localStorage.getItem("moves") || "[]");

    setFen(savedFen);
    setPlayerId(savedPlayerId);
    setDepth(savedDepth);
    setMoves(savedMoves);
    setGame(new Chess(savedFen));

    if (
      (savedColor === "white" && game.turn() === "w") ||
      (savedColor === "black" && game.turn() === "b")
    ) {
      setPlayerTurn(true);
    }

    setOrientation(savedColor === "black" ? "black" : "white");

    const botPlayer = players.find((p) => p.id === savedPlayerId);
    if (botPlayer) setBot(botPlayer);
  }, []);

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

      />
    </div>
  );
}
