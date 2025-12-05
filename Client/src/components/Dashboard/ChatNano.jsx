import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';

const CHATANYWHERE_ENDPOINT = import.meta.env.VITE_CHATANYWHERE_ENDPOINT || "https://api.chatanywhere.tech/v1/chat/completions";
const DEFAULT_MODEL = import.meta.env.VITE_CHATANYWHERE_MODEL || "gpt-5-nano";
const ENV_API_KEY = import.meta.env.VITE_CHATANYWHERE_API_KEY;

const SYSTEM_CONTEXT = `You are a helpful assistant for the DID (Decentralized Identity) authentication system.

**Project Creators:**
- Vishal Kumar, Jatin Kumar, Nikhil Kumar
- Under guidance of Prof. Vishal Bhatnagar

**System Overview:**
- SIWE (Sign-In With Ethereum) wallet authentication
- No passwords - uses MetaMask signatures
- Backend: Express.js + MongoDB + JWT
- Frontend: React + Vite + Tailwind
- Deployed on Vercel

**Key Features:**
- Wallet-based login (MetaMask)
- JWT token authentication
- App registration & API key management
- ENS name resolution
- Rate limiting & security

**Research Paper:**
If user asks for research paper, documentation, or paper download, respond with:
"📄 Download the research paper: [Click here to download](/research_paper.docx)

The paper includes complete system architecture and implementation details."

**Response Style:**
- Be DIRECT and CONCISE
- Give practical answers
- Show code snippets when helpful
- Skip unnecessary details`;

const ChatNano = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(ENV_API_KEY || "");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your DID Auth Assistant.\n\nThis project was created by Vishal Kumar, Jatin Kumar & Nikhil Kumar under the guidance of Prof. Vishal Bhatnagar.\n\nAsk me anything about SIWE authentication!",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to render message content with clickable links
  const renderMessageContent = (content) => {
    // Match markdown links [text](url) and plain URLs
    const parts = content.split(/(\[.*?\]\(.*?\)|https?:\/\/[^\s]+|\/[^\s]+\.docx)/g);
    
    return parts.map((part, index) => {
      // Markdown link [text](url)
      const markdownMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (markdownMatch) {
        const [, text, url] = markdownMatch;
        return (
          <a
            key={index}
            href={url}
            download={url.endsWith('.docx')}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
            target={url.startsWith('http') ? '_blank' : undefined}
            rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {text}
          </a>
        );
      }
      
      // Plain URL or file path
      if (part.match(/^(https?:\/\/|\/)/)) {
        return (
          <a
            key={index}
            href={part}
            download={part.endsWith('.docx')}
            className="text-blue-600 hover:text-blue-800 underline break-all"
            target={part.startsWith('http') ? '_blank' : undefined}
            rel={part.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {part}
          </a>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Use env variable first, then check localStorage
    if (ENV_API_KEY) {
      setApiKey(ENV_API_KEY);
    } else {
      const savedKey = localStorage.getItem('chatanywhere_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!apiKey.trim()) {
      alert("Please enter your API key first!");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [
        { role: "system", content: SYSTEM_CONTEXT },
        ...messages.slice(-10), // Keep last 10 messages for context
        userMessage
      ];

      const response = await fetch(CHATANYWHERE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = `❌ Error: ${error.message}`;
      
      // More specific error messages
      if (error.message.includes('401')) {
        errorMessage = '❌ API Key is invalid. Please check your .env file.';
      } else if (error.message.includes('429')) {
        errorMessage = '❌ Too many requests. Please wait and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '❌ Network error. Check your connection.';
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('chatanywhere_api_key', apiKey);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-violet-100">Powered by {DEFAULT_MODEL}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* API Key Input - Only show if not set in env */}
          {!ENV_API_KEY && (
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onBlur={saveApiKey}
                  placeholder="Enter API Key (sk-...)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatNano;
