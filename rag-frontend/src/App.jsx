import { useState, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import './index.css'


function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    fetchUploadedFiles();
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const response = await fetch("http://localhost:8000/sessions");
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
  async function createSession() {
  try {
    // Agar current session already empty hai toh naya mat banao
    if (currentSessionId && messages.length === 0) return;

    const response = await fetch("http://localhost:8000/sessions", {
      method: "POST",
    });
    const data = await response.json();
    setCurrentSessionId(data.session_id);
    setMessages([]);
    fetchSessions();
  } catch (error) {
    console.error(error);
  }
}

  async function loadSession(sessionId) {
    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveMessage(sessionId, role, content) {
    if (!sessionId) return;
    try {
      await fetch(`http://localhost:8000/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
    } catch (error) {
      console.error(error);
    }
  }
  async function addMessage(content) {
  const newMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content
  };

  setMessages(prev => [...prev, newMessage]);
  saveMessage(currentSessionId, "user", content);
  setIsTyping(true);

  const aiMessageId = crypto.randomUUID();

  setMessages(prev => [...prev, {
    id: aiMessageId,
    role: "assistant",
    content: ""
  }]);

  try {
    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: content }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // 1. Create a local variable to accumulate the stream content reliably
    let accumulatedContent = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // Loop drops down below when the stream is finished

      const chunk = decoder.decode(value);
      accumulatedContent += chunk; // Update our tracking string

      // 2. Update the UI state continuously so the user sees the animation
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: accumulatedContent }
          : msg
      ));
    }

    // 3. Save to the database ONLY ONCE after the full content is ready
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
}

  async function uploadDocument(file) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

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

  return (
    <div className='h-screen flex'>
      <Sidebar uploadedFiles={uploadedFiles}
        sessions={sessions}
        currentSessionId={currentSessionId}
        createSession={createSession}
        loadSession={loadSession} />
      <div className='flex-1 flex flex-col'>
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