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

export const AnanlyticalMoves = atom({
  key: 'analyticalMoves',
  default: {
    moves: [],
    currentMoveIndex: 0
  }
})