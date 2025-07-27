// recoil/chessState.ts
import { atom } from "recoil";

export const movesAtom = atom<string[]>({
  key: "movesAtomFinal",
  default: [],
});

export const finalFENAtom = atom<string>({
  key: "finalFENAtom",
  default: "",
});

export const orientation = atom<"black" | "white">({
  key: 'analysisBoardOrientation',
  default: "white"
})

// Type definitions
export type MoveData = {
  move: string;
  uciMove: string;
  moveNumber: number;
  isWhite: boolean;
  score: number;
  classification: string;
  accuracy: number;
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
  isBrilliant: boolean;
  isGreat: boolean;
  isGood: boolean;
  bestMove: string;
  bestMoveUci: string;
  scoreDrop: number;
  position: string;
};

export type MovesData = {
  data: {
    moves: MoveData[];
    classifications:{}
  };
  currentMoveIndex: number; // Use number instead of -1
};

// ✅ Correctly typed atom
export const moveAnalyticsData = atom<MovesData>({
  key: 'analyticalMoves',
  default: {
    data: {
      moves: [],
      classifications: {}
    },
    currentMoveIndex: 0,
  },
});



