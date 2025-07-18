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



  const [moves, setMoves] = useRecoilState(movesAtom);
  const [classification, setClassification] = useRecoilState(classificationAtom);
  const setGameStat = useSetRecoilState(gameResult);



  return (
    <div className="w-full h-full">
      <Chessboard
        id="BasicBoard"
        position={fen}
        arePiecesDraggable={playerTurn}
        // onPieceDrop={handleMove}
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
        // customPieces={customPieces}
      />
    </div>
  );
}
