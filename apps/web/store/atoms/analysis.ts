// recoil/chessState.ts
import { atom } from "recoil";

export const movesAtom = atom<string[]>({
  key: "movesAtom",
  default: [],
});

export const finalFENAtom = atom<string>({
  key: "finalFENAtom",
  default: "",
});
