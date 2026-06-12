import MessageBubble from "./MessageBubble"
import { useEffect, useRef } from "react"

function ChatMessages({ messages, isTyping }) {
  const bottomRef = useRef(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:py-8 w-full">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            steps={message.steps}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-2 text-xs text-gray-400 font-medium pl-1 animate-pulse">
            <svg className="animate-spin h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>Formulating response...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default ChatMessages