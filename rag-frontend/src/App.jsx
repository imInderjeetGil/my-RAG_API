import { useState, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import './index.css'


function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  // Login aur Logout ke functions
  function onLogin(newToken, newUsername) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    fetchUploadedFiles();
    fetchSessions();
  }
  function onLogout() {
  localStorage.clear();
  setToken(null);
  setUsername(null);
  setMessages([]);
  setSessions([]);
  setCurrentSessionId(null);
}

  // Auth headers ke liye ek helper function
  function authHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
  }


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setUsername(localStorage.getItem("username"));
      fetchUploadedFiles();
      fetchSessions();
    }
  }, [token]);


  // Sessions aur Uploaded Files fetch karne ke functions
  async function fetchSessions() {
    try {
      const response = await fetch("http://localhost:8000/sessions", {
        headers: authHeaders()
      });
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error(error);
    }
  }
  async function fetchUploadedFiles() {
    try {
      const response = await fetch("http://localhost:8000/files");
      const data = await response.json();
      setUploadedFiles(data.files);
    } catch (error) {
      console.error(error);
    }
  }

  // Session create
  async function createSession() {
    try {
      // Agar current session already empty hai toh naya mat banao
      if (currentSessionId && messages.length === 0) return;

      const response = await fetch("http://localhost:8000/sessions", {
        method: "POST",
        headers: authHeaders()
      });
      const data = await response.json();
      setCurrentSessionId(data.session_id);
      setMessages([]);
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  }

  // Session load karne ka function
  async function loadSession(sessionId) {
    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}/messages`, {
        headers: authHeaders()
      });
      const data = await response.json();
      setMessages(data.messages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error(error);
    }
  }

// Saving chats to DB
  async function saveMessage(sessionId, role, content) {
    if (!sessionId) return;
    try {
      await fetch(`http://localhost:8000/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ role, content }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  // New session ka title update function
  async function updateSessionTitle(sessionId) {
    try {
      await fetch(`http://localhost:8000/sessions/${sessionId}/title`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  }


  // CHATS of User and Assistant
  async function addMessage(content) {
    const newMessage = { id: crypto.randomUUID(),role: "user", content };
    setMessages(prev => [...prev, newMessage]);
    saveMessage(currentSessionId, "user", content);
    setIsTyping(true);

    const aiMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: aiMessageId, role: "assistant", content: ""}]);

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedContent += chunk; // Update our tracking string

        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      if (accumulatedContent.trim()) {
        await saveMessage(currentSessionId, "assistant", accumulatedContent);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: "Something went wrong." }
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
    saveMessage(currentSessionId, "user", content);
    updateSessionTitle(currentSessionId);
  }


  // Document upload
  async function uploadDocument(file) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload", { method: "POST",body: formData});
      const data = await response.json();

      if (!data.doc_id) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message
        }]);
        return;
      }

      const progressMessageId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: progressMessageId,
        role: "assistant",
        content: data.message,
        steps: {}
      }]);

      const eventSource = new EventSource(`http://localhost:8000/upload/status/${data.doc_id}`);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "step") {
            setMessages(prev => prev.map(msg => {
              if (msg.id !== progressMessageId) return msg;
              const steps = msg.steps ? { ...msg.steps } : {};
              steps[data.key] = { status: data.status, count: data.count };
              return { ...msg, steps };
            }));
          }
          if (data.key === "embed" && data.status === "done") {
            eventSource.close();
            setIsUploading(false);
            fetchUploadedFiles();
          }
        } catch {
          eventSource.close();
          setIsUploading(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsUploading(false);
      };

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Upload failed.",
      }]);
      setIsUploading(false);
    }
  }
  if (!token) {
    return <Login onLogin={onLogin} />
  }


  return (
    <div className='h-screen w-screen flex bg-[#F5F5F7] overflow-hidden relative select-none'>
      
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          uploadedFiles={uploadedFiles}
          sessions={sessions}
          currentSessionId={currentSessionId}
          createSession={createSession}
          loadSession={loadSession}
          username={username}
          onLogout={onLogout}
        />
      </div>

      {/* Main Container */}
      <div className='flex-1 flex flex-col h-full min-w-0 bg-white'>
        
        {/* Top Minimal Navigation Bar */}
        <header className="h-14 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 md:hidden text-gray-600 transition-colors"
          >
            {/* Inline Menu Hamburger SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          
          <span className="text-sm font-semibold tracking-tight text-gray-800 mx-auto md:mx-0">
            {sessions.find(s => s.id === currentSessionId)?.title || "RAG Assistant"}
          </span>
          
          <div className="w-8 md:hidden" /> 
        </header>

        {/* Content Screens - Restored strict flex distribution */}
        <ChatMessages messages={messages} isTyping={isTyping} />
        
        <ChatInput
          addMessage={addMessage}
          isTyping={isTyping}
          uploadDocument={uploadDocument}
          isUploading={isUploading}
        />
      </div>
    </div>
  )
}

export default App