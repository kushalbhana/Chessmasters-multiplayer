"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRecoilValue } from "recoil";
import { isBotChoosen } from "@/store/atoms/bot";

// Correct lazy loading of named exports
const PlayPage = dynamic(() =>
  import("@/components/computer/playpage").then((mod) => mod.PlayPage), {
    loading: () => <p>Loading game...</p>,
    ssr: true,
  }
);

const Lobby = dynamic(() =>
  import("@/components/computer/lobby").then((mod) => mod.default), {
    loading: () => <p>Loading lobby...</p>,
    ssr: true,
  }
);

export default function PlayWithComputer() {
  const [ingame, setInGame] = useState<boolean>(false);
  const renderGame = useRecoilValue(isBotChoosen);

  useEffect(() => {
    if (
      localStorage.getItem("fen") &&
      localStorage.getItem("playerId") &&
      localStorage.getItem("depth")
    ) {
      setInGame(true);
    }
  }, []);

  if (renderGame.gameStarted || ingame) {
    return (
      <div className="flex justify-center items-center h-full lg:h-screen">
        <PlayPage />
      </div>
    );
  }

  return (
    <div>
      <Lobby />
    </div>
  );
}
