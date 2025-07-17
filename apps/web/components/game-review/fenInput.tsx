"use client";
import { usePGNParser } from "@/hooks/usePGNParser";

export function FenInputBox() {
  const { parsePGN } = usePGNParser();

  return (
    <div>
      <textarea
        className="w-full h-24 text-center bg-[#111114] placeholder:text-center p-4 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Paste Your PGN"
        onChange={(e) => parsePGN(e.target.value)}
      />
    </div>
  );
}
