"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePGNParser } from "@/hooks/usePGNParser";
import { useRecoilValue } from "recoil";
import { finalFENAtom } from "@/store/atoms/analysis";

export default function UploadPGN() {
  const [pgnText, setPgnText] = useState<string>("");
  const { parsePGN } = usePGNParser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fen = useRecoilValue(finalFENAtom);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        {fen === "" ? "Upload PGN File" : "Analyze your PGN"}
        
      </Button>
    </div>
  );
}
