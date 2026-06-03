import {useState} from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import './index.css'


function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  async function addMessage(content) {
  const newMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content
  };

  setMessages(prev => [...prev, newMessage]);

  setIsTyping(true);

  try {
    const response = await fetch(
  `http://localhost:8000/ask?question=${encodeURIComponent(content)}`,
  {
    method: "POST",
  }
);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    const aiMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.answer,
    };

    setMessages(prev => [...prev, aiMessage]);

  } catch (error) {
    console.error(error);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Something went wrong.",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
}

  async function uploadDocument(file) {
  try {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setMessages(prev => [
  ...prev,
  {
    id: crypto.randomUUID(),
    role: "assistant",
    content: data.message
  }
]);

  } catch (error) {
    console.error(error);
  }
}
  
  return (
    <div className='h-screen flex flex-col'>
      <ChatHeader />
      <ChatMessages messages = {messages} isTyping = {isTyping} />
      <ChatInput addMessage={addMessage}
      isTyping={isTyping}
      uploadDocument = {uploadDocument}
      />
    </div>
  )
}

export default App