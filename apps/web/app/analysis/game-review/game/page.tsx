"use client";

import dynamic from "next/dynamic";

// Lazy load the named export `GameReviewPage`
const GameReviewPage = dynamic(() =>
  import("@/components/game-review/reviewPage").then(mod => mod.GameReviewPage), {
    loading: () => <p>Loading review page...</p>,
    ssr: false,
  }
);

export default function GameReviewPageWrapper() {
  return (
    <div>
      <GameReviewPage />
    </div>
  );
}
