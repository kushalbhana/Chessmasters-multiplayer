"use client";
import React, { useEffect, useState } from "react";
import { players } from "@repo/lib/status";

export function PlayerTabs() {
  const [selectedId, setSelectedId] = useState<string>("");

  function getStockfishDepthFromRating(rating: number): number {
    if (rating <= 800) return 4;
    if (rating <= 1000) return 7;
    if (rating <= 1400) return 9;
    if (rating <= 1600) return 10;
    if (rating <= 1800) return 12;
    if (rating <= 2000) return 14;
    return 16; // Beyond 2000
  }

  const selectPlayer = (playerId: string) => {
    setSelectedId(playerId);
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    localStorage.setItem("fen", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    localStorage.setItem("playerId", playerId);
    const depth = getStockfishDepthFromRating(player.rating);
    localStorage.setItem("depth", depth.toString());
  };

  return (
    <div className="flex gap-4 justify-center mt-6">
      {players.map((player) => {
        const isSelected = player.id === selectedId;

        return (
          <button
            key={player.id}
            onClick={() => selectPlayer(player.id)}
            className={`flex flex-col items-center p-4 rounded-xl border-2 w-24 transition-all 
              ${isSelected ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
          >
            <div className="text-3xl">{player.avatar}</div>
            <div className={`mt-2 text-sm font-semibold ${isSelected ? "text-black" : "text-gray-700"}`}>
              {player.name}
            </div>
            <div className={`text-xs ${isSelected ? "text-black" : "text-gray-500"}`}>
              Rating: {player.rating}
            </div>
          </button>
        );
      })}
    </div>
  );
}
