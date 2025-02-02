"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function JoinChessGame() {
  const [gameCode, setGameCode] = useState("");
  const router = useRouter();

  const handleJoinGame = () => {
    if (gameCode.trim()) {
      router.push(`/chess/game/${gameCode}`);
    }
  };

  const handleCreateGame = () => {
    router.push("/chess/create");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div 
        className="w-full max-w-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-xl bg-gray-800 text-white">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Join a Chess Game</h2>
            <Input
              className="text-black"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
            />
            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleJoinGame}>
              Join Game
            </Button>
            <div className="text-center text-gray-400">or</div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleCreateGame}>
              Create New Game
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
