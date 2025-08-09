// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const ChatPage = () => {
  const { avatarId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Mock avatar data based on ID
  const avatars = {
    '1': { name: 'Sarah', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500' },
    '2': { name: 'Orion', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500' },
    '3': { name: 'Nova', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500' },
    '4': { name: 'Kai', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500' }
  };

  const avatar = avatars[avatarId] || avatars['1'];

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        { text: `Hello! I'm ${avatar.name}, your AI companion. How can I assist you today?`, sender: 'avatar' }
      ]);
    }, 500);
  }, [avatar.name]);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');

    // Simulate avatar thinking
    setIsSpeaking(true);
    
    // Simulate avatar response after delay
    setTimeout(() => {
      const responses = [
        "That's an interesting point. I'd love to hear more about your thoughts on this.",
        "I understand what you're saying. Let me think about how I can help with that.",
        "Thanks for sharing that with me. I have some ideas that might be helpful.",
        "I appreciate your perspective. Here's what I think about that topic.",
        "That's a great question! Let me provide some insights based on my knowledge."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { text: response, sender: 'avatar' }]);
      setIsSpeaking(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Avatars
        </Link>
        <h1 className="text-xl font-bold text-indigo-900">Chat with {avatar.name}</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* MAIN CONTAINER - Fixed height with min-h-0 to prevent overflow */}
      <div className="flex flex-1 min-h-0 p-4">
        {/* UE Avatar Container - Fixed height */}
        <div className="w-1/2 pr-2 flex flex-col min-h-0">
          <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col min-h-0">
            <div className="bg-indigo-600 text-white py-3 px-4 text-center font-semibold">
              UE Avatar - Real-time Audio to Facial Animation
            </div>
            <div className="flex-1 flex items-center justify-center relative bg-gray-900 min-h-0">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500 relative">
                <img 
                  src={avatar.image} 
                  alt={avatar.name} 
                  className="w-full h-full object-cover"
                />
                {isSpeaking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-ping absolute h-32 w-32 rounded-full bg-indigo-400 opacity-75"></div>
                  </div>
                )}
              </div>
              
              {isSpeaking && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-indigo-400 rounded-full"
                      style={{ 
                        height: `${Math.floor(Math.random() * 30) + 10}px`,
                        animation: `pulse ${0.5 + Math.random() * 0.5}s infinite`
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-800 text-white text-sm">
              <p>Connected to UE Avatar instance at: <code className="bg-gray-700 px-2 py-1 rounded">ws://avatar-server:8080</code></p>
              <p className="mt-2">Status: <span className="text-green-400">Active</span> | Audio Processing: <span className="text-indigo-300">Real-time</span></p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="w-1/2 pl-2 flex flex-col min-h-0">
          <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col min-h-0">
            <div className="border-b p-4 flex items-center">
              <img 
                src={avatar.image} 
                alt={avatar.name} 
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <h2 className="font-semibold">{avatar.name}</h2>
                <div className="text-xs text-gray-500 flex items-center">
                  {isSpeaking ? (
                    <span className="flex items-center text-indigo-600">
                      <span className="flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative h-2 w-2 rounded-full bg-indigo-500"></span>
                      </span>
                      Speaking...
                    </span>
                  ) : (
                    <span className="text-green-600">Online</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Chat Messages - Fixed height with scrolling */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar min-h-0"
            >
              <div className="flex flex-col">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${
                        message.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border rounded-bl-none shadow'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSend} className="border-t p-4">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;