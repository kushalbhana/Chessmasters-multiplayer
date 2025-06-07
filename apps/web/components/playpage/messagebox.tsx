import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import clsx from "clsx"

export function MessageBox() {
  const [message, setMessage] = useState([
    { from: "user", message: "Hiii.. This is Kushal" },
    { from: "opponent", message: "I am gonna win this match" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (!newMessage.trim()) return
    setMessage([...message, { from: "user", message: newMessage }])
    setNewMessage("")
  }

  return (
    <div className="w-full">
      <ScrollArea className="h-80 w-full rounded-md border bg-muted p-4">
        <div className="flex flex-col gap-3">
          {message.map((msg, idx) => (
            <div
              key={idx}
              className={clsx(
                "max-w-[75%] px-4 py-2 rounded-xl text-sm",
                msg.from === "user"
                  ? "ml-auto bg-blue-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-200 text-black rounded-bl-none"
              )}
            >
              {msg.message}
            </div>
          ))}
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
  )
}
