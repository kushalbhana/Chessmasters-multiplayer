"use client";

import { useEffect, useState, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  differentPeices,
} from "@/store/atoms/bot";

import { moveAnalyticsData, orientation } from "@/store/atoms/analysis";
import { useGameReview } from "@/hooks/useGameReview";

export function ChessboardGame() {
  const [playerTurn, setPlayerTurn] = useState(false);
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const orientat = useRecoilValue(orientation)
  const peices = useRecoilValue(differentPeices);
  const { bestMove } = useGameReview(game, setFen);
  const analyticsData = useRecoilValue(moveAnalyticsData)

  useEffect(() => {
    // Update FEN when game updates
    setFen(game.fen());
  }, [game]);

  const customPieces = Object.fromEntries(
    Object.entries(peices).map(([piece, url]) => [
      piece,
      ({ squareWidth }: { squareWidth: number }) => (
        <img src={url} style={{ width: squareWidth, height: squareWidth }} />
      ),
    ])
  );
  const bestMoveArrow: [string, string][] = useMemo(() => {
    if (
      analyticsData.currentMoveIndex >= 0 &&
      analyticsData.data?.moves?.[analyticsData.currentMoveIndex+1]?.bestMoveUci
    ) {
      const bestMove = analyticsData.data.moves[analyticsData.currentMoveIndex].bestMoveUci;
      return [[bestMove.slice(0, 2), bestMove.slice(2, 4)]] as [string, string][];
    }
    return [];
  }, [analyticsData]);
  
  return (
    <div className="w-full h-full">
      <Chessboard
        id="BasicBoard"
        position={fen}
        arePiecesDraggable={playerTurn}
        // onPieceDrop={handleMove}
        boardOrientation={orientat}
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
        // @ts-ignore
        customArrows={bestMoveArrow}
        customArrowColor="green"
      />
    </div>
  );
}
