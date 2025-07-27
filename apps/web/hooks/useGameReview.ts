import { moveAnalyticsData } from "@/store/atoms/analysis";
import { Chess } from "chess.js";
import { useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";

export const useGameReview = (game: Chess, setFen: (fen: string) => void) => {
  const [analyticsData] = useRecoilState(moveAnalyticsData);

  // Memoize bestMove to avoid unnecessary recalculations
  const bestMove = useMemo(() => {
    if (
      analyticsData.currentMoveIndex >= 0 &&
      analyticsData.data?.moves?.[analyticsData.currentMoveIndex]?.bestMoveUci
    ) {
      return analyticsData.data.moves[analyticsData.currentMoveIndex].bestMoveUci;
    }
    return null;
  }, [analyticsData]);

  useEffect(() => {
    if (!analyticsData.data?.moves || analyticsData.currentMoveIndex < 0) {
      game.reset();
      return;
    }

    setFen(analyticsData.data.moves[analyticsData.currentMoveIndex+1]?.position || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }, [analyticsData.currentMoveIndex, analyticsData.data?.moves, game, setFen]);

  return { bestMove };
};
