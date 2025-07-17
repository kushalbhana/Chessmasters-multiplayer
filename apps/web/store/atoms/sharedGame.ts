import { atom } from "recoil";

export const gameResult = atom({ 
    key: 'gameResult',
    default: {
      isGameOver: false,
      overType: 'Stalemate', 
      status: 'Lost',
    }, 
  });