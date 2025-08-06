"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useRecoilValue } from "recoil";
import { differentPeices } from "@/store/atoms/bot";
import { moveAnalyticsData, orientation } from "@/store/atoms/analysis";
import { useGameReview } from "@/hooks/useGameReview";

export function ChessboardGame() {
  const [playerTurn, setPlayerTurn] = useState(false);
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const orientat = useRecoilValue(orientation);
  const peices = useRecoilValue(differentPeices);
  const analyticsData = useRecoilValue(moveAnalyticsData);
  useGameReview(game, setFen);
  const moveSound = useMemo(() => new Audio('/sounds/move-self.mp3'), []);
  
  useEffect( () => {
    if(analyticsData.currentMoveIndex>=0){
      setFen(analyticsData.data.moves[analyticsData.currentMoveIndex+1]?.position);
    }
  },[orientat])

  useEffect(()=> {
      moveSound.currentTime = 0;
      moveSound.play();
    },[fen]);

  useEffect(() => {
    setFen(game.fen());
    setPlayerTurn(
      (orientat === "white" && game.turn() === "w") ||
      (orientat === "black" && game.turn() === "b")
    );
  }, [game, orientat]);

  const customPieces = Object.fromEntries(
    Object.entries(peices).map(([piece, url]) => [
      piece,
      ({ squareWidth }: { squareWidth: number }) => (
        <img src={url} style={{ width: squareWidth, height: squareWidth }} alt={piece} />
      ),
    ])
  );

  // Define move type colors like Chess.com with background colors
  const moveTypeConfig: Record<string, { 
    bgColor: string;
    squareBgColor: string;
    opacity: number;
  }> = {
    blunder: { 
      bgColor: "#dc2626", // red-600
      squareBgColor: "#C22828", // red-200 for light background
      opacity: 0.8
    },
    book: { 
      bgColor: "#3b82f6", // blue-500
      squareBgColor: "#bfdbfe", // blue-200
      opacity: 0.8
    },
    brilliant: { 
      bgColor: "#22c55e", // green-500
      squareBgColor: "#bbf7d0", // green-200
      opacity: 0.8
    },
    good: { 
      bgColor: "#22c55e", // green-500
      squareBgColor: "#bbf7d0", // green-200
      opacity: 0.8
    },
    great: { 
      bgColor: "#a855f7", // purple-500
      squareBgColor: "#ddd6fe", // purple-200
      opacity: 0.8
    },
    inaccuracy: { 
      bgColor: "#fb923c", // orange-400
      squareBgColor: "#FEC567", // orange-200
      opacity: 0.8
    },
    mistake: { 
      bgColor: "#facc15", // yellow-400
      squareBgColor: "#DEA441", // yellow-200
      opacity: 0.9
    },
  };

  const bestMoveArrow: [string, string][] = useMemo(() => {
    if (
      analyticsData.currentMoveIndex >= 0 &&
      analyticsData.data?.moves?.[analyticsData.currentMoveIndex]?.bestMoveUci
    ) {
      const bestMove = analyticsData.data.moves[analyticsData.currentMoveIndex].bestMoveUci;
      return [[bestMove.slice(0, 2), bestMove.slice(2, 4)]];
    }
    return [];
  }, [analyticsData]);

  // Create Chess.com-style move classification icons
  const createCornerIcon = (classification: string): string => {
    const config = moveTypeConfig[classification];
    if (!config) return "";

    let svgContent = "";
    
    switch (classification) {
      case 'blunder':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">??</text>
          </svg>
        `;
        break;
      case 'mistake':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">?</text>
          </svg>
        `;
        break;
      case 'inaccuracy':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial, sans-serif">?!</text>
          </svg>
        `;
        break;
      case 'good':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">!</text>
          </svg>
        `;
        break;
      case 'brilliant':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">!!</text>
          </svg>
        `;
        break;
      case 'great':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <text x="10" y="15" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">!!</text>
          </svg>
        `;
        break;
      case 'book':
        svgContent = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="${config.bgColor}"/>
            <rect x="7" y="6" width="6" height="8" rx="1" fill="white"/>
            <line x1="8" y1="8" x2="12" y2="8" stroke="${config.bgColor}" stroke-width="0.5"/>
            <line x1="8" y1="10" x2="12" y2="10" stroke="${config.bgColor}" stroke-width="0.5"/>
            <line x1="8" y1="12" x2="12" y2="12" stroke="${config.bgColor}" stroke-width="0.5"/>
          </svg>
        `;
        break;
      default:
        return "";
    }

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const customSquareStyles: { [square: string]: React.CSSProperties } = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Only show styling if we have valid data
    if (
      analyticsData.currentMoveIndex >= 0 &&
      analyticsData.data?.moves?.[analyticsData.currentMoveIndex]
    ) {
      const currentMove = analyticsData.data.moves[analyticsData.currentMoveIndex];
      const classification = currentMove?.classification;
      const toSquare = currentMove?.move?.slice(-2);

      if (toSquare && classification && moveTypeConfig[classification]) {
        const config = moveTypeConfig[classification];
        const iconUrl = createCornerIcon(classification);
        
        // Combine background color and icon
        styles[toSquare] = {
          backgroundColor: config.squareBgColor,
          opacity: config.opacity,
          ...(iconUrl && {
            backgroundImage: `url("${iconUrl}")`,
            backgroundSize: "20px 20px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top 4px right 4px",
          })
        };
      }
    }

    return styles;
  }, [analyticsData]);

  return (
    <div className="w-full h-full">
      <Chessboard
        id="BasicBoard"
        position={fen}
        arePiecesDraggable={playerTurn}
        boardOrientation={orientat}
        customSquareStyles={customSquareStyles}
        customPieces={customPieces}
        // @ts-expect-error
        customArrows={bestMoveArrow}
        customArrowColor="green"
      />
    </div>
  );
}