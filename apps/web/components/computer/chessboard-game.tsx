"use client";

import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import { useRecoilState } from "recoil";
import { movesAtom, MoveAnalytics } from "@/store/atoms/bot";
import { players } from "@repo/lib/status";
import { classificationAtom } from "@/store/atoms/bot";



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
  const [classification, setClassification] = useRecoilState(classificationAtom);

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

  const getMoveClassification = (scoreDiff: number) => {
    const absDiff = Math.abs(scoreDiff);
    if (absDiff < 20) return "excellent";
    if (absDiff < 50) return "good";
    if (absDiff < 100) return "inaccuracy";
    if (absDiff < 300) return "mistake";
    return "blunder";
  };

  const classificationCounts = {
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
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

      const engineMove = response.data;
    const moves = JSON.parse(localStorage.getItem("moves") || "[]");

    const classificationCounts = {
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    };

    // Evaluate player move quality (look at pairs)
    for (let i = 1; i < moves.length; i += 2) {
      const playerMove = moves[i - 1]; // even index (player)
      const botMove = moves[i];       // odd index (bot)

      if (!playerMove || !botMove || playerMove.by !== "player") continue;

      const scoreDiff = botMove.score - playerMove.score;

      const category = getMoveClassification(scoreDiff);
      classificationCounts[category]++;
    }

    localStorage.setItem("moveClassificationSummary", JSON.stringify(classificationCounts));
    setClassification(classificationCounts);
    return engineMove;
    } catch (error) {
      console.error("Bot move fetch failed:", error);
      return null;
    }
  }

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    try {
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
    } catch (error) {
      return false;
    }
    
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
    const savedClassification = localStorage.getItem("moveClassificationSummary");
      if (savedClassification) {
        try {
          setClassification(JSON.parse(savedClassification));
        } catch {
          // fallback to default or ignore
        }
      }
  },[])

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

  const pieceImages: { [key: string]: string } = {
    wK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wK.svg",
    wQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wQ.svg",
    wR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wR.svg",
    wB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wN.svg",
    wN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wK.svg",
    wP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wP.svg",
    bK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bK.svg",
    bQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bQ.svg",
    bR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bR.svg",
    bB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bB.svg",
    bN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bN.svg",
    bP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bP.svg",
  };const pieceImages1: { [key: string]: string } = {
    wK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wK.svg",
    wQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wQ.svg",
    wR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wR.svg",
    wB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wB.svg",
    wN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wN.svg",
    wP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/wP.svg",
    bK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bK.svg",
    bQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bQ.svg",
    bR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bR.svg",
    bB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bB.svg",
    bN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bN.svg",
    bP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/cardinal/bP.svg",
  };const pieceImages2: { [key: string]: string } = {
    wK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wK.svg",
    wQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wQ.svg",
    wR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wR.svg",
    wB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wN.svg",
    wN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wK.svg",
    wP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/wP.svg",
    bK: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bK.svg",
    bQ: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bQ.svg",
    bR: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bR.svg",
    bB: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bB.svg",
    bN: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bN.svg",
    bP: "https://raw.githubusercontent.com/lichess-org/lila/f1aba422b2a7936e92b4bf3a93f71946da57526a/public/piece/celtic/bP.svg",
  };

  const customPieces = Object.fromEntries(
    Object.entries(pieceImages1).map(([piece, url]) => [
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
