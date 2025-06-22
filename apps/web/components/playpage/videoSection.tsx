// components/VideoSection.tsx
import { useRecoilState } from "recoil";
import { useSession } from "next-auth/react";
import { roomInfo } from "@/store/selectors/getRoomSelector";
import { PlayerType } from "@repo/lib/types";
import { useWebRTC } from "@/hooks/useWebRTC";

export function VideoSection() {
  const [room] = useRecoilState(roomInfo);
  const { data: session } = useSession();

  const isWhite = session?.user?.id === room?.room.whiteId;
  const playerType = isWhite ? PlayerType.WHITE : PlayerType.BLACK;

  const { localVideoRef, remoteVideoRef } = useWebRTC(playerType);

  const localName = isWhite ? room?.room.whiteName : room?.room.blackName;
  const remoteName = isWhite ? room?.room.blackName : room?.room.whiteName;

  return (
    <div className="bg-slate-500 bg-opacity-20">
      <div className="w-full h-full flex shadow-xl">
        <div className="w-1/2 p-2 shadow-xl">
          <video ref={localVideoRef} autoPlay muted playsInline className="bg-black w-full h-40" />
          <div className="h-8 flex justify-center items-center">{localName}</div>
        </div>
        <div className="w-1/2 p-2">
          <video ref={remoteVideoRef} autoPlay playsInline className="bg-black w-full h-40" />
          <div className="h-8 flex justify-center items-center">{remoteName}</div>
        </div>
      </div>
    </div>
  );
}
