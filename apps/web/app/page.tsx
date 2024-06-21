import { getServerSession } from "next-auth"
import { NEXT_AUTH_CONFIG } from "../lib/auth";

async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}

export default async function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        
      </h1>

    </div>
  )
}