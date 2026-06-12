import { useState } from 'react';

function ChatInput({ addMessage, isTyping, uploadDocument, isUploading }) {
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSend = () => {
    if (query.trim()) {
      addMessage(query);
      setQuery("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  async function handleUpload(file) {
    if (!file) return;
    try {
      await uploadDocument(file);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className='p-4 bg-white border-t border-gray-100 w-full shrink-0'>
      <div className='max-w-3xl mx-auto flex flex-col gap-2'>
        
        {/* Attachment Processing Status Notification Banner */}
        {selectedFile && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-xl text-xs text-gray-600">
            <span className="truncate max-w-[200px] font-medium">📎 {selectedFile.name}</span>
            <button 
              onClick={() => {
                handleUpload(selectedFile);
                setSelectedFile(null);
              }}
              disabled={isUploading}
              className="px-2.5 py-1 font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-all text-[11px] flex items-center gap-1.5"
            >
              {isUploading ? (
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : "Index File"}
            </button>
          </div>
        )}

        {/* Unified Input Capsule */}
        <div className='relative flex items-center bg-gray-50 border border-gray-200/80 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-400 transition-all'>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-all shrink-0"
            title="Attach knowledge document"
          >
            {/* Paperclip SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </label>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className='w-full bg-transparent px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none min-w-0'
            placeholder='Ask anything...'
          />
          
          <button
            onClick={handleSend}
            disabled={isTyping || !query.trim()}
            className='p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all shrink-0 shadow-sm'
          >
            {/* Arrow Up SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-1">Contextualized RAG Interface — secure streaming enabled</p>
      </div>
    </div>
  );
}

export default ChatInput;