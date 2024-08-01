import { atom } from "recoil";

export const jwtAuthToken = atom<string | null>({
    key: "jwtAuthToken",
    default: null,
})