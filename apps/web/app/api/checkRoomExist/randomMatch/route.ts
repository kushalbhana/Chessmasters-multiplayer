export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import RedisSingleton from "@repo/redis/client";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { PlayerHash, RedisRoom, clientSideRoom } from "@repo/lib/types";
import { WebSocketMessageType } from "@repo/lib/status";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);

    if (!session?.user?.id) {
      console.warn("Unauthenticated request or missing user ID in session.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const redis = RedisSingleton.getInstance();
    const playerKey = `player:${session.user.id}`;
    const playerExists = await redis.exists(playerKey);

    if (!playerExists) {
      console.info(`Player data not found for user ID: ${session.user.id}`);
      return NextResponse.json({ message: "Player not in any game room." }, { status: 404 });
    }

    const rawUserData = await redis.hGetAll(playerKey);

    if (!rawUserData?.id || !rawUserData?.room || !rawUserData?.color) {
      console.error("Incomplete player data in Redis:", rawUserData);
      return NextResponse.json({ message: "Corrupted player data." }, { status: 500 });
    }

    const playerData: PlayerHash = {
      id: rawUserData.id,
      room: rawUserData.room,
      color: rawUserData.color,
    };

    const roomKey = `gameRoom:${playerData.room}`;
    const roomData = await redis.hGetAll(roomKey);

    if (!roomData || !roomData.game) {
      console.warn(`Room data missing or incomplete for room ID: ${playerData.room}`);
      return NextResponse.json({ message: "Room data not found." }, { status: 404 });
    }

    const redisRoom: RedisRoom = {
      whiteId: roomData.whiteId,
      whiteName: roomData.whiteName,
      whiteProfilePicture: roomData.whiteProfilePicture,
      blackId: roomData.blackId,
      blackName: roomData.blackName,
      blackProfilePicture: roomData.blackProfilePicture,
      whiteSocket: roomData.whiteSocket ? "connected" : "disconnected",
      blackSocket: roomData.blackSocket ? "connected" : "disconnected",
      whiteTime: roomData.whiteTime ? parseInt(roomData.whiteTime) : 600,
      blackTime: roomData.blackTime ? parseInt(roomData.blackTime) : 600,
      lastMoveTime: roomData.lastMoveTime,
      game: roomData.game,
      moves: roomData.moves,
    };

    const responsePayload: clientSideRoom = {
      type: WebSocketMessageType.JOINROOM,
      roomId: playerData.room,
      room: redisRoom,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("An error occurred while fetching game session:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
