"use client";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import WebSocketClient from '../lib/WebSocketClient';
import { useSession } from "next-auth/react";

interface Message {
  id: number;
  text: string;
  type: "sent" | "received";
}

export function ChatBox({ roomId }: any)  {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();

    if (status === "loading") return;
    if (status !== "authenticated") return;

    const socket = WebSocketClient.getInstance();

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'textMessage') {
        const messageRecieved: string = message.message.text;
        handleReceiveMessage(messageRecieved)
      }
    };

    socket.onMessage(handleMessage);

    socket.onClose(() => {
      console.log('WebSocket connection closed');
    });

    socket.onError((error: any) => {
      console.error('WebSocket error', error);
    });

    socket.onOpen(() => {
      console.log('WebSocket connection opened');
    });

    return () => {
      socket.close();
    };
  }, [status]);

  const handleSendMessage = () => {
    const socket = WebSocketClient.getInstance();
    if (inputMessage.trim() !== "") {
      const newMessage: Message = {
        id: Date.now(),
        text: inputMessage,
        type: "sent",
      };
      setMessages([...messages, newMessage]);
      try {
        if(socket){
          // @ts-ignore
          socket.sendMessage(JSON.stringify({ type: 'textMessage', text: newMessage, roomId: roomId }));
        }
        
      } catch (error) {
        console.log(error)
      }
      setInputMessage("");
    }
  };

  const handleReceiveMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      type: "received",
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };


  return (
    <div className="flex flex-col h-full p-4 bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto rounded bg-gray-700" style={{ maxHeight: "25rem", scrollbarWidth: "thin" }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex mb-2 ${message.type === "sent" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded-lg py-2 px-4 max-w-xs break-words mt-1 ${message.type === "sent" ? "bg-orange-500 text-white mr-2" : "bg-blue-500 text-white ml-2"}`}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-1 border p-2 rounded bg-gray-700 text-white"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button
          className="ml-2 bg-blue-500 text-white p-2 rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
