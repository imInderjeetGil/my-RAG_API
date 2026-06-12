import { useState } from 'react'

function Sidebar({ uploadedFiles, sessions, currentSessionId, createSession, loadSession, username, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className='hidden md:flex w-14 h-full border-r border-gray-200/60 flex-col items-center py-4 bg-[#F5F5F7]'>
        <button
          onClick={() => setCollapsed(false)}
          className='p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 transition-all'
          title="Expand sidebar"
        >
          {/* Chevron Right SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    )
  }

  return (
    <div className='w-64 h-full border-r border-gray-200/60 flex flex-col bg-[#F5F5F7] select-none shadow-sm md:shadow-none'>
      {/* Top Header */}
      <div className='h-14 px-4 border-b border-gray-200/60 flex justify-between items-center shrink-0'>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          <span className='font-semibold text-sm tracking-tight text-gray-800'>Knowledge Workspace</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className='hidden md:block p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 transition-all'
          title="Collapse sidebar"
        >
          {/* Chevron Left SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Content Scroller */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
        
        {/* Section: Documents */}
        <div>
          <div className='px-2 mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-gray-400'>
            {/* Folder SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            <span>Documents</span>
          </div>
          {uploadedFiles.length === 0 ? (
            <p className='px-2 py-1.5 text-xs text-gray-400 italic'>No files uploaded</p>
          ) : (
            <ul className='space-y-0.5'>
              {uploadedFiles.map((filename, index) => (
                <li
                  key={index}
                  className='flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg text-gray-600 truncate bg-white/40 border border-gray-200/30'
                  title={filename}
                >
                  {/* File Text SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  <span className="truncate">{filename}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section: Chat Records */}
        <div>
          <div className='px-2 mb-1.5 flex items-center justify-between'>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-gray-400">
              {/* Message Square SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Conversations</span>
            </div>
            <button
              onClick={createSession}
              className='p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200/80 transition-all'
              title="New Chat"
            >
              {/* Plus SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className='px-2 py-1.5 text-xs text-gray-400 italic'>No history yet</p>
          ) : (
            <ul className='space-y-0.5'>
              {sessions.map(session => {
                const isActive = currentSessionId === session.id;
                return (
                  <li
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`group flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg cursor-pointer truncate transition-all duration-150
                      ${isActive 
                        ? 'bg-white font-medium text-gray-900 shadow-sm border border-gray-200/50' 
                        : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="truncate flex-1">{session.title || "Untitled Chat"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* User Dashboard Bar */}
      <div className='p-3 border-t border-gray-200/60 flex items-center justify-between bg-gray-100/50 shrink-0'>
        <div className='flex items-center gap-2 min-w-0'>
          <div className='w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold uppercase shrink-0 shadow-sm'>
            {username?.charAt(0)}
          </div>
          <span className='text-xs font-medium text-gray-700 truncate'>{username}</span>
        </div>
        <button
          onClick={onLogout}
          className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors'
          title="Sign Out"
        >
          {/* Logout SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>  
    </div>
  )
}

export default Sidebar