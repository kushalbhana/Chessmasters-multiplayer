import {atom} from "recoil";


const countDown = atom<{localCount: number, turn: string | null}>({
  key: 'countDown',
  default: {
    localCount: 600,
    turn: null
  }
});

const countDownRemote = atom<{localCount: number, turn: string | null}>({
  key: 'countDownRemote',
  default: {
    localCount: 600,
    turn: null
  }
});



export default countDown;