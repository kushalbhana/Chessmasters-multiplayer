import { NEXT_AUTH_CONFIG } from "@/lib/auth"
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import RedisSingleton from "@repo/redis/client"

export async function GET(req: NextRequest){
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        const redis = RedisSingleton.getInstance();
        
        const exists = await redis.exists(`player:${session.jwt}`);
        if (!exists) {
            return NextResponse.json({message: 'The room does not exist'}, {status: 404});
          }

          const playerData = await redis.hGetAll(`player:${session.jwt}`);
        return NextResponse.json({playerData}, {status: 200});
    } catch (error) {
        return NextResponse.json({name: 'Kushal'})
    }
}