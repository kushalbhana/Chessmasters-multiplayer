import { atom } from "recoil";

export const fenState = atom({
    key: 'fenState',
    default: '', 
  });

export const playerTime = atom({
    key: 'playerTime',
    default: 600, 
});
export const opponentTime = atom({
    key: 'opponentTime',
    default: 600, 
  });

export const gameStatus = atom({ 
    key: 'gameStatus',
    default: {
      isGameOver: false,
      overType: 'Stalemate', // checkmate, stalemate, draw
      status: 'Lost', //win, lost, draw
    }, 
  });