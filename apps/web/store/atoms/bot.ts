import { atom } from "recoil";
import { peicesVariety } from "@repo/lib/board-acessories";
import { boolean } from "zod";

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

export type ClassificationCounts = {
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
};

export const classificationAtom = atom<ClassificationCounts>({
  key: "classificationAtom",
  default: {
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  },
});

export const differentPeices = atom({
  key: 'differentPeices',
  default: peicesVariety.dubrovny
})

export const isBotChoosen = atom({
  key: 'isBotChoosen',
  default: {selecBot: false, gameStarted: false }
}) 

