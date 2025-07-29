"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import clsx from "clsx";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { roomInfo } from "@/store/selectors/getRoomSelector";

export function MessageBox() {
  const { data: session } = useSession();
  const [room] = useRecoilState(roomInfo);

  const [message, setMessage] = useState([
    { from: "user", message: "Hii, You can drop a text.." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = WebSocketClient.getInstance();

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Message:", data.message?.message);

      if (data.type === WebSocketMessageType.TEXTMESSAGE) {
        const incomingText =
          typeof data.message?.message === "string"
            ? data.message.message
            : JSON.stringify(data.message);

        setMessage((prev) => [...prev, { from: "opponent", message: incomingText }]);
      }
    };

    socket.onMessage(handleMessage);
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const socket = WebSocketClient.getInstance();

    setMessage((prev) => [...prev, { from: "user", message: newMessage }]);

    socket.sendMessage(
      JSON.stringify({
        type: WebSocketMessageType.TEXTMESSAGE,
        message: newMessage,
        JWT_token: session?.user.jwt,
        roomId: room?.roomId,
      })
    );

    setNewMessage("");
  };

  // Scroll to the end div on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="w-full">
      <ScrollArea className="h-80 w-full rounded-md border bg-muted p-4">
        <div className="flex flex-col gap-3">
          {message.map((msg, idx) => (
            <div
              key={idx}
              className={clsx(
                "max-w-[75%] px-4 py-2 rounded-xl text-sm break-words whitespace-pre-wrap",
                msg.from === "user"
                  ? "ml-auto bg-blue-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-200 text-black rounded-bl-none"
              )}
            >
              {String(msg.message)}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 pt-4">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message"
          className="flex-grow"
        />
        <Button onClick={handleSend} className="shrink-0">
          Send
        </Button>
      </div>
    </div>
  );
}
