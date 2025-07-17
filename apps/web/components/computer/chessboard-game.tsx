"use client";

import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  movesAtom,
  MoveAnalytics,
  classificationAtom,
  differentPeices,
} from "@/store/atoms/bot";
import { players } from "@repo/lib/status";
import { getGameStatus } from "@/lib/game/gamestatus";
import { gameResult } from "@/store/atoms/sharedGame";
import { gameStatusObj } from "@repo/lib/status";

export function ChessboardGame() {
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [depth, setDepth] = useState<number>(4);
  const [playerId, setPlayerId] = useState("p2");
  const [playerTurn, setPlayerTurn] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [lastPlayerMove, setLastPlayerMove] = useState<string | null>(null);
  const peices = useRecoilValue(differentPeices);

  const [bot, setBot] = useState({
    id: "p1",
    name: "AlphaBot",
    rating: 400,
    avatar: "🤖",
  });

  const [moves, setMoves] = useRecoilState(movesAtom);
  const [classification, setClassification] = useRecoilState(classificationAtom);
  const setGameStat = useSetRecoilState(gameResult);

  type EngineResponse = {
    bestMove: string;
    evaluation: {
      scoreLoss: number;
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

      for (let i = 1; i < moves.length; i += 2) {
        const playerMove = moves[i - 1];
        const botMove = moves[i];
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

  const setGameOver  = (player: string) => {
    const isGameOver = getGameStatus(game);
        if (isGameOver !== gameStatusObj.ONGOING) {
          if (isGameOver === gameStatusObj.CHECKMATE) {
            setGameStat({
              isGameOver: true,
              overType: gameStatusObj.CHECKMATE,
              status: player === 'player' ? 'Win' : 'Lose'})
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
          localStorage.removeItem("fen")
        }
  }
  
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
      };

      setFen(game.fen());
      setPlayerTurn(false);
      setMoves((prev) => [...prev, newMove]);
      setLastPlayerMove(newMove.move);
      localStorage.setItem("fen", game.fen());
      setGameOver('player');
      localStorage.setItem('moves', JSON.stringify(moves))

      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
  async function runBotMove() {
    // If it's bot's turn, make a move
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

        setGameOver('bot');
        setMoves((prev) => [
          ...prev,
          {
            move: bestMove,
            by: "bot",
            score: evaluation?.scoreLoss | 1,
          },
        ]);

        if (evaluation?.lastPlayerScore !== undefined) {
          setMoves((prev) =>
            prev.map((m, i) =>
              i === prev.length - 2 && m.by === "player"
                ? { ...m, score: evaluation.lastPlayerScore }
                : m
            )
          );
        }

        setLastPlayerMove(null);
      }
    }
  }

  runBotMove(); // run once only if it's bot's turn
}, [fen, playerTurn, game, orientation, depth, lastPlayerMove]);

  useEffect(() => {
    const savedClassification = localStorage.getItem("moveClassificationSummary");
    if (savedClassification) {
      try {
        setClassification(JSON.parse(savedClassification));
      } catch {}
    }

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
    setPlayerId(savedPlayerId);
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
