import { useState } from 'react'

function Sidebar({ uploadedFiles, sessions, currentSessionId, createSession, loadSession }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className='w-10 border-r flex flex-col items-center py-4 bg-gray-50'>
        <button
          onClick={() => setCollapsed(false)}
          className='text-gray-500 hover:text-black transition-colors'
          title="Expand sidebar"
        >
          <img src="./logo.png" alt="logo" className='w-7 cursor-e-resize'/>
        </button>
      </div>
    )
  }

  return (
    <div className='w-64 border-r flex flex-col bg-gray-50'>
      <div className='p-4 border-b font-bold text-lg flex justify-between items-center'>
        RAG Assistant
        <button
          onClick={() => setCollapsed(true)}
          className='text-gray-500 hover:text-black transition-colors text-sm'
          title="Collapse sidebar"
        >
          <img src="./arrows.png" alt="collapse" className='cursor-pointer' />
        </button>
      </div>

      {/* Uploaded Files */}
      <div className='p-3 border-b'>
        <p className='text-sm font-semibold text-gray-500 mb-2'><img src="./files.png" alt="files" className='mb-1 w-6 inline-block'/> Uploaded Files</p>
        {uploadedFiles.length === 0 ? (
          <p className='text-xs text-gray-400'>No files yet</p>
        ) : (
          <ul className='flex flex-col gap-1'>
            {uploadedFiles.map((filename, index) => (
              <li
                key={index}
                className='text-xs bg-white border rounded px-2 py-1 truncate text-gray-700'
                title={filename}
              >
                📄 {filename}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat History */}
      <div className='p-3 flex-1 overflow-y-auto'>
        <div className='flex justify-between items-center mb-2'>
          <p className='text-sm font-semibold text-gray-500'><img src="./chat.png" alt="files" className='w-5 inline-block'/> Chat History</p>
          <button
            onClick={createSession}
            className='text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors'
          >
            + New
          </button>
        </div>
        {sessions.length === 0 ? (
          <p className='text-xs text-gray-400'>No chats yet</p>
        ) : (
          <ul className='flex flex-col gap-1'>
            {sessions.map(session => (
              <li
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`text-xs px-2 py-2 rounded cursor-pointer truncate transition-colors
                  ${currentSessionId === session.id 
                    ? 'bg-black text-white' 
                    : 'bg-white border text-gray-700 hover:bg-gray-100'
                  }`}
              >
                💬 {session.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Sidebar