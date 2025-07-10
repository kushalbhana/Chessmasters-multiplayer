import { atom } from "recoil";

export const color = atom({
    key: 'color',
    default: 'white'
})

export type MoveAnalytics = {
  move: string;
  by: "player" | "bot";
  score?: number;
};

function loadMovesFromLocalStorage(): MoveAnalytics[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("moves");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse saved moves:", e);
    }
  }
  return [];
}

export const movesAtom = atom<MoveAnalytics[]>({
  key: "movesAtom",
  default: loadMovesFromLocalStorage(),
});

