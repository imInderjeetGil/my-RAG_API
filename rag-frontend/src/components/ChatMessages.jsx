import MessageBubble from "./MessageBubble"
import { useEffect, useRef } from "react"

function ChatMessages({ messages, isTyping}) {
  const bottomRef = useRef(null);
  
  useEffect(()=> {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(message => (
          <MessageBubble 
        key={message.id}
        role={message.role}
        content={message.content}
        steps={message.steps}
        />
        ))}
      
      {isTyping && (
        <div className="flex justify-start mb-4">
        <div className="p-3 rounded-lg">
        Thinking...
        </div>
        </div>
)}
        <div
        ref={bottomRef}
        ></div>
    </div>
  )
}

export default ChatMessages