import { useState } from 'react';

function ChatInput({ addMessage, isTyping, uploadDocument }) {
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSend = (e) => {
   
    if (e.key === "Enter" && query.trim()) {
      addMessage(query);
      setQuery("");
    }
  };
  
  async function handleUpload() {
  if (!selectedFile) return;

  try {
    await uploadDocument(selectedFile);
  } catch (error) {
    console.error(error);
  }
}
  return (
    <div className='border-t p-4 flex gap-2'>
      <input
  type="file"
  id="file-upload"
  className="hidden"
  onChange={(e) =>
    setSelectedFile(e.target.files[0])
  }
/>
<label
  htmlFor="file-upload"
  className="cursor-pointer border px-3 py-2 rounded  hover:bg-green-500 hover:text-white
        active:bg-green-700 active:text-white
        transition-colors duration-200"
>
  +
</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSend}
        disabled={isTyping}
        className='border p-2 flex-1  hover:bg-gray-800 hover:text-white
        active:bg-gray-500 active:text-white
        transition-colors duration-200'
        placeholder='type message...'
      />
      
    {
  selectedFile && (
     <button
      onClick={handleUpload}
      className="border px-3 py-1 rounded bg-gray-100 text-gray-800
        hover:bg-blue-500 hover:text-white
        active:bg-blue-700 active:text-white
        transition-colors duration-200"
    >
      {selectedFile.name}
    </button>
  )
}
      <button
        onClick={() => {
          if (query.trim()) {
            addMessage(query);
            setQuery("");
          }
        }}
        disabled={isTyping}
        className='px-4 py-2 border  hover:bg-red-500 hover:text-white
        active:bg-red-700 active:text-white
        transition-colors duration-200'
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;
