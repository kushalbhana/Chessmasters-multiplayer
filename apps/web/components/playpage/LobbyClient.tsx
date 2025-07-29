"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSetRecoilState } from "recoil";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { gameMoves } from "@/store/atoms/moves";
import { playerTime, opponentTime } from "@/store/atoms/game";
import { GameLayout } from "@/components/playpage/gamelayout";
import { Chess } from "chess.js";
import { clientSideRoom } from "@repo/lib/types";
import { GameManager } from "@/lib/game/gamemanager";

export default function LobbyClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setRoomInfo = useSetRecoilState(roomInfo);
  const setMoves = useSetRecoilState(gameMoves);
  const setPlayerTime = useSetRecoilState(playerTime);
  const setOpponentTime = useSetRecoilState(opponentTime);
  const [roomExist, setRoomExist] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "loading") {
      return;
    }

    const socket = WebSocketClient.getInstance();

    const sendRoomExist = () => {
      socket.sendMessage(
        JSON.stringify({
          type: WebSocketMessageType.ROOMEXIST,
          JWT_token: session?.user.jwt,
        })
      );
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendRoomExist();
    } else {
      socket.addOpenListener(sendRoomExist);
    }

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === WebSocketMessageType.JOINROOM) {
        const roomData: clientSideRoom = {
          type: data.type,
          roomId: data.roomId,
          room: { ...data.room },
        };

        setRoomInfo(roomData);
        setMoves(JSON.parse(JSON.parse(data.room.moves)));
        GameManager.getInstance(data.room.game);
        setRoomExist(true);

        const chess = new Chess(data.room.game);
        const currentTurn = chess.turn();

        const rawTime = data.room.lastMoveTime?.trim().replace(/^"|"$/g, "");
        const timestamp = new Date(rawTime).getTime();
        const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);

        const whiteTime = Math.max(0, parseInt(data.room.whiteTime) - (currentTurn === "w" ? elapsedSeconds : 0));
        const blackTime = Math.max(0, parseInt(data.room.blackTime) - (currentTurn === "b" ? elapsedSeconds : 0));

        if (session?.user.id === roomData.room.whiteId) {
          setPlayerTime(2 * whiteTime);
          setOpponentTime(2 * blackTime);
        } else {
          setPlayerTime(2 * blackTime);
          setOpponentTime(2 * whiteTime);
        }
      }
    };

    socket.onMessage(handleMessage);
    return () => {
      socket.removeMessageListener?.(handleMessage);
    };
  }, [status]);

  const joinRandomRoom = () => {
    const socket = WebSocketClient.getInstance();
    socket.sendMessage(
      JSON.stringify({
        type: WebSocketMessageType.JOINLOBBY,
        JWT_token: session?.user.jwt,
      })
    );
  };

  if (roomExist) {
    return (
      <div className="flex justify-center items-center h-full lg:h-screen">
        <GameLayout />
      </div>
    );
  }

  return (
    <Button className="w-full" onClick={joinRandomRoom}>
      Play a game
    </Button>
  );
}
