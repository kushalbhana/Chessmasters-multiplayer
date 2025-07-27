"use client";
import React from "react";
import { moveAnalyticsData } from "@/store/atoms/analysis";
import { useRecoilValue } from "recoil";

const moveTypeConfig: Record<string, { bgColor: string }> = {
  blunder: { bgColor: "#e74c3c" },
  mistake: { bgColor: "#e67e22" },
  inaccuracy: { bgColor: "#f1c40f" },
  good: { bgColor: "#2ecc71" },
  brilliant: { bgColor: "#9b59b6" },
  great: { bgColor: "#3498db" },
  book: { bgColor: "#95a5a6" },
};

export function MoveClassificationText() {
  const data = useRecoilValue(moveAnalyticsData);
  const classification =
    data.currentMoveIndex !== -1
      ? data.data.moves[data.currentMoveIndex]?.classification
      : "Initial";

  const createCornerIcon = (classification: string): string => {
    const config = moveTypeConfig[classification];
    if (!config) return "";

    let svgContent = "";

    switch (classification) {
      case "blunder":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><text x='10' y='15' text-anchor='middle' fill='white' font-size='12' font-weight='bold' font-family='Arial, sans-serif'>??</text></svg>`;
        break;
      case "mistake":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><text x='10' y='15' text-anchor='middle' fill='white' font-size='14' font-weight='bold' font-family='Arial, sans-serif'>?</text></svg>`;
        break;
      case "inaccuracy":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><text x='10' y='15' text-anchor='middle' fill='white' font-size='11' font-weight='bold' font-family='Arial, sans-serif'>?!</text></svg>`;
        break;
      case "good":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><text x='10' y='15' text-anchor='middle' fill='white' font-size='14' font-weight='bold' font-family='Arial, sans-serif'>!</text></svg>`;
        break;
      case "brilliant":
      case "great":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><text x='10' y='15' text-anchor='middle' fill='white' font-size='12' font-weight='bold' font-family='Arial, sans-serif'>!!</text></svg>`;
        break;
      case "book":
        svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='10' fill='${config.bgColor}'/><rect x='7' y='6' width='6' height='8' rx='1' fill='white'/><line x1='8' y1='8' x2='12' y2='8' stroke='${config.bgColor}' stroke-width='0.5'/><line x1='8' y1='10' x2='12' y2='10' stroke='${config.bgColor}' stroke-width='0.5'/><line x1='8' y1='12' x2='12' y2='12' stroke='${config.bgColor}' stroke-width='0.5'/></svg>`;
        break;
      default:
        return "";
    }

    // Encode SVG to base64
    const base64 = btoa(unescape(encodeURIComponent(svgContent)));
    return `data:image/svg+xml;base64,${base64}`;
  };

  const iconSrc =
    classification !== "Initial" ? createCornerIcon(classification) : null;

  return (
    <div className="flex items-center gap-2">
      {iconSrc && (
        <img src={iconSrc} alt={classification} className="w-5 h-5" />
      )}
      <span>This {(classification === "inaccuracy" || classification === "book") ? "" : "Move" } is {classification === "book" ? "a Book Move" : classification}!!</span>
    </div>
  );
}
