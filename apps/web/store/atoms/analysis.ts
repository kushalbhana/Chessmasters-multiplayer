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
