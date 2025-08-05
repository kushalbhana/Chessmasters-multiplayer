"use client";
import { motion } from "framer-motion";
import { useRecoilState, useRecoilValue } from "recoil";
import {  } from "@/store/atoms/game";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FaTrophy } from "react-icons/fa";
import { LuLollipop } from "react-icons/lu";
import { gameStatus } from "@/store/atoms/game";
import { roomInfo } from "@/store/selectors/getRoomSelector";

export function GameOverDialog() {
  const [result, setResult] = useRecoilState(gameStatus);
  const Room = useRecoilValue(roomInfo);

  const onClose = () => {
    setResult((prev) => ({
      ...prev,
      isGameOver: false,
      // optional: reset messages
      gameOverType: "",
      gameOverMessage: "",
      OverType: "",
    }));
  };

  return (
    <Dialog open={result.isGameOver} onOpenChange={onClose}>
      <DialogContent className="border-none bg-gradient-to-br from-[#111114] to-[#1c1c1f] p-0 max-w-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="bg-transparent shadow-xl text-center text-white rounded-2xl overflow-hidden">
            <CardContent className="py-10 px-6 space-y-6">
              <div className="flex flex-col items-center justify-center">
                {/* OverType */}
                <div>
                  <h1 className="text-2xl font-bold">{result.gameOverType}!!</h1>
                </div>

                {/* Player Avatars */}
                <div className="flex items-center gap-4 justify-center mt-4">
                  <div>
                    <img
                      src={Room?.room.whiteProfilePicture}
                      alt="Player-1"
                      className="rounded-full h-16 w-16"
                    />
                  </div>
                  <div className="font-bold">VS</div>
                  <div>
                    <img
                      src={Room?.room.blackProfilePicture}
                      alt="Player-2"
                      className="rounded-full h-16 w-16"
                    />
                  </div>
                </div>

                {/* Trophy or Lollipop */}
                <div className="mt-8">
                  {result.OverType === "Win" ? (
                    <div className="flex gap-2">
                      <FaTrophy className=" text-amber-400 text-xl" />
                      <FaTrophy className=" text-amber-400 text-xl" />
                      <FaTrophy className=" text-amber-400 text-xl" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <LuLollipop className=" text-red-600 text-xl" />
                      <LuLollipop className=" text-red-600 text-xl" />
                      <LuLollipop className=" text-red-600 text-xl" />
                    </div>
                  )}
                </div>

                {/* GameOverMessage */}
                <div className="mt-2">
                  <h1 className="text-base">{result.gameOverMessage}</h1>
                </div>

                {/* Quote */}
                <h1 className="text-sm text-gray-500">
                  "Chess is the only game where a pawn can become a queen…
                  sounds like a royal plot twist!"
                </h1>
              </div>

              {/* Buttons */}
              <div>
                <div className="flex gap-x-4 w-full justify-center">
                  <Button onClick={onClose} className="mt-6 w-1/2">
                    Close
                  </Button>
                  <Button className="mt-6 w-1/2">New Game</Button>
                </div>
                <div className="flex w-full justify-center">
                  <Button className="mt-2 w-full">Rematch</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
