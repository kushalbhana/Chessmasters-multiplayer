import { useRecoilValue } from "recoil"
import { countDown } from "../atoms/countDown"
import {selector} from "recoil";

export const countDownHook = selector({
    key: 'courseDetailsState',
    get: ({get}) => {
      const state = get(countDown);
  
      return state.localCount;
    },
  });