import {atom} from "recoil";

const countDown = atom<{localCount: number}>({
  key: 'countDown',
  default: {
    localCount: 600 
  }
});

export default countDown;