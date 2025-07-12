"use client";

import { Chess } from "chess.js";
import React from "react";

export default function DownloadPGNButton() {
  const downloadPGN = () => {
    const stored = localStorage.getItem("moves");
    if (!stored) return;

    const moves = JSON.parse(stored);
    const chess = new Chess();

    // Apply each move from localStorage
    for (const m of moves) {
      if (m.move.length >= 4) {
        const moveObj = {
          from: m.move.slice(0, 2),
          to: m.move.slice(2, 4),
          promotion: "q",
        };
        chess.move(moveObj);
      }
    }

    const pgn = chess.pgn({ newline: "\n" });

    // Create a Blob and trigger download
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.pgn";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadPGN}
      className="px-4 h-9 text-white bg-slate-600/60 rounded hover:bg-blue-300 text-sm"
    >
      Download PGN
    </button>
  );
}
