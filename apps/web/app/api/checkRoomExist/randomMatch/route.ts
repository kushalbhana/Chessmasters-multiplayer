import { NEXT_AUTH_CONFIG } from "@/lib/auth"
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import RedisSingleton from "@repo/redis/client"
import { PlayerHash, gameRoom } from "@repo/lib/types"

export async function GET(req: NextRequest){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        const redis = RedisSingleton.getInstance();
        
        // If a user is already engaged in a game
        const exists = await redis.exists(`player:${session.user.id}`);
        if (!exists) {

            console.log('Session does not exist...')
            return NextResponse.json({message: 'The room does not exist'}, {status: 404});
          }
        const rawUserData = await redis.hGetAll(`player:${session.user.id}`);

        if (!rawUserData.id || !rawUserData.room || !rawUserData.color) {
            throw new Error("Invalid player data from Redis");
        }

        //   If necessary fields are not present
        const playerData: PlayerHash = {
            id: rawUserData.id,
            room: rawUserData.room,
            color: rawUserData.color,
        };

        const userRoomRawData = await redis.hGetAll(`gameRoom:${playerData.room}`)
        const newRoomData: gameRoom = {
            whiteId: userRoomRawData.whiteId,
            whiteName: userRoomRawData.whiteName,
            whiteProfilePicture: userRoomRawData.whiteProfilePicture,
            blackId: userRoomRawData.blackId,
            blackName: userRoomRawData.blackName,
            blackProfilePicture: userRoomRawData.blackProfilePicture,
            game: JSON.parse(userRoomRawData.game)
        }

        return NextResponse.json({playerData, newRoomData}, {status: 200});
    } catch (error) {
        return NextResponse.json({name: 'Kushal'})
    }
}