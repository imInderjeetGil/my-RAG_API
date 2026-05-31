function MessageBubble({role, content}) {
    const isUser = role === "user";

  return (
    <div
        className={`flex mb-4 ${
            isUser ? 'justify-end':'justify-start'
        }`}>

    <div
    className={`max-w-[70%] p-3 rounded-lg ${
        isUser
        ? "bg-blue-500 text-white"
        : "bg-grey-200 text-black"
    }`}>
        {content}
    </div>

    </div>
  )
}

export default MessageBubble