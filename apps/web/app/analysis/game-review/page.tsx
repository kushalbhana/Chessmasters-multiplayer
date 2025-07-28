"use client";

import dynamic from "next/dynamic";

// Lazy load the Lobby component
const Lobby = dynamic(() => import("@/components/game-review/lobby"), {
  loading: () => <p>Loading lobby...</p>,
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <Lobby />
    </div>
  );
}
