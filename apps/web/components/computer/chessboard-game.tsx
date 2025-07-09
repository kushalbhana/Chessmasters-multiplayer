import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";

import { players } from "@repo/lib/status";

export function ChessboardGame() {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [depth, setDepth] = useState<number>(4);
  const [playerId, setPlayerId] = useState("p2");
  const [playerTurn, setPlayerTurn] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [bot, setBot] = useState({
    id: "p1",
    name: "AlphaBot",
    rating: 400,
    avatar: "🤖",
  });

  // ✅ Axios call to bot API
  async function makeBotMove(fen: string, depth: number): Promise<string | null> {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER}/bestmove`!, {
        fen,
        depth,
      });
      return response.data?.move || null;
    } catch (error) {
      console.error("Bot move fetch failed:", error);
      return null;
    }
  }

  // ✅ Handle player move (must be synchronous)
  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setFen(game.fen());
    setPlayerTurn(false); // Give control to bot
    return true;
  }

  useEffect(() => {
    async function runBotMove() {
      if (!playerTurn && game.turn() === (orientation === "white" ? "b" : "w")) {
        const botMove = await makeBotMove(fen, depth);
        if (!botMove) return;

        const from = botMove.slice(0, 2);
        const to = botMove.slice(2, 4);

        const move = game.move({
          from,
          to,
          promotion: "q",
        });

        if (move) {
          setFen(game.fen());
          setPlayerTurn(true); // Back to player
        }
      }
    }

    runBotMove();
  }, [fen]);

  // ✅ Load settings from localStorage
  useEffect(() => {
    const savedFen =
      localStorage.getItem("fen") ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const savedPlayerId = localStorage.getItem("playerId") || "p2";
    const savedDepth = Number(localStorage.getItem("depth")) || 4;
    const savedColor = localStorage.getItem("color");

    setFen(savedFen);
    setPlayerId(savedPlayerId);
    setDepth(savedDepth);
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
      />
    </div>
  );
}
