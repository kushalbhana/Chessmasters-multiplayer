// hooks/useResetGame.ts
"use client";
import { useResetRecoilState } from "recoil";
import { prevMove, movesAtom } from "@/store/atoms/bot";
import { gameResult } from "@/store/atoms/sharedGame";

export function useResetGame() {
  const resetPrev = useResetRecoilState(prevMove);
  const resetMoves = useResetRecoilState(movesAtom);
  const resetGameResult = useResetRecoilState(gameResult);

  const resetAll = () => {
    // 1️⃣ Clear localStorage
    localStorage.removeItem("fen");
    localStorage.removeItem("moves");

    // 2️⃣ Reset Recoil atoms
    resetPrev();
    resetMoves();
    resetGameResult();

    // 3️⃣ Optional: Set a flag to skip game restoration
    localStorage.setItem("resigned", "true");
  };

  return resetAll;
}
