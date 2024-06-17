"use client"
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";

interface Message {
  id: number;
  text: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage: Message = {
        id: Date.now(),
        text: inputMessage,
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
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
        {messages.slice(0).reverse().map((message) => (
          <div key={message.id} className="flex justify-end mb-2">
            <div className="bg-orange-500 rounded-lg py-2 px-4 text-white max-w-xs break-words mt-1 mr-2">
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