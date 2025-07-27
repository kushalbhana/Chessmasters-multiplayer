"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePGNParser } from "@/hooks/usePGNParser";
import { useRecoilValue } from "recoil";
import { finalFENAtom, moveAnalyticsData } from "@/store/atoms/analysis";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // spinner icon

export default function UploadPGN() {
  const [pgnText, setPgnText] = useState<string>("");
  const { parsePGN } = usePGNParser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fen = useRecoilValue(finalFENAtom);
  const analyticsData = useRecoilValue(moveAnalyticsData);
  const [analyzeState, setAnalyzeState] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(analyticsData.data.moves) && analyticsData.data.moves.length > 0) {
      router.push("/analysis/game-review/game");
    }
  }, [analyticsData.data.moves, router]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzeState(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setPgnText(text);
        parsePGN(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pgn"
        onChange={handleFileUpload}
        className="sr-only"
      />
      <Button
        type="button"
        onClick={() => {
          if (!fen && !analyzeState) {
            fileInputRef.current?.click();
          }
        }}
        className="w-full"
        disabled={analyzeState}
      >
        {analyzeState ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Analyzing...
          </>
        ) : fen === "" ? (
          "Upload PGN File"
        ) : (
          "Analyze your PGN"
        )}
      </Button>
    </div>
  );
}
