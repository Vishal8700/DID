import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2, BookOpen, Minimize2 } from 'lucide-react';

const CHATANYWHERE_ENDPOINT = import.meta.env.VITE_CHATANYWHERE_ENDPOINT || "https://api.chatanywhere.tech/v1/chat/completions";
const DEFAULT_MODEL = import.meta.env.VITE_CHATANYWHERE_MODEL || "gpt-5-nano";
const ENV_API_KEY = import.meta.env.VITE_CHATANYWHERE_API_KEY;

const AUTH_PACKAGE = "npm i @gitalien/auth_package";

const SYSTEM_CONTEXT = `You are a straightforward AI assistant for the DID (Decentralized Identity) authentication system.

**Project Info:**
- Created by: Vishal Kumar, Jatin Kumar, and Nikhil Kumar
- Under guidance of: Prof. Vishal Bhatnagar
- Purpose: SIWE (Sign-In With Ethereum) wallet-based authentication
- No passwords needed - uses MetaMask wallet signatures

**Tech Stack:**
- Backend: Express.js, MongoDB Atlas, JWT, SIWE 3.0
- Frontend: React 19, Vite, Tailwind CSS, ethers.js 6.15
- Features: JWT sessions, rate limiting, ENS resolution, app registration

**API Endpoints:**
- GET /api/challenge/:address - Get SIWE challenge
- POST /api/auth - Verify signature, get JWT
- GET /api/userinfo - User profile (authenticated)
- POST /api/register-app - Register new app (authenticated)
- GET /api/my-apps - List user's apps (authenticated)
- GET /api/stats/users - Public statistics

**Database Models:**
- User: address, logins[], ensName, reloginPeriod
- Challenge: address, challenge, expiresAt, used
- App: appId, appName, developerName, apiKey, ownerAddress

**Response Style:**
- Give DIRECT, SHORT answers
- Show code only when needed
- Skip unnecessary explanations
- Be practical and actionable
- ONLY mention npm package "${AUTH_PACKAGE}" if user asks about installation`;

const ChatbotSidebar = ({ onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "👋 Hi! I'm your DID Auth Assistant.\n\nCreated by Vishal Kumar, Jatin Kumar & Nikhil Kumar under Prof. Vishal Bhatnagar.\n\nAsk me anything about SIWE authentication, setup, or integration!",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    onOpenChange?.(isOpen && !isMinimized);
  }, [isOpen, isMinimized, onOpenChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!ENV_API_KEY) {
      alert("API key not configured. Please check your .env file.");
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
          "Authorization": `Bearer ${ENV_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 1000,
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${error.message}. Please try again or check your configuration.`,
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

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "👋 Hi! I'm your DID Auth Assistant.\n\nCreated by Vishal Kumar, Jatin Kumar & Nikhil Kumar under Prof. Vishal Bhatnagar.\n\nAsk me anything about SIWE authentication, setup, or integration!",
    }]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50 group"
        aria-label="Open documentation assistant"
      >
        <img src="/bot.png" alt="Bot" className="w-8 h-8" />
        <span className="absolute -top-2 -left-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask me about SIWE Auth
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-0 top-0 h-screen bg-white shadow-2xl flex flex-col z-50 border-l border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-16' : 'w-96'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
        {!isMinimized && (
          <div className="flex items-center space-x-2 flex-1">
            <img src="/bot.png" alt="Bot" className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Documentation Assistant</h3>
              <p className="text-xs text-violet-100">SIWE Auth Expert</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <MessageCircle className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInput("npm package install")}
                className="text-xs px-3 py-1.5 bg-white hover:bg-violet-50 text-violet-700 rounded-full border border-violet-200 transition-colors"
              >
                📦 NPM Install
              </button>
              <button
                onClick={() => setInput("Quick setup guide")}
                className="text-xs px-3 py-1.5 bg-white hover:bg-violet-50 text-violet-700 rounded-full border border-violet-200 transition-colors"
              >
                Setup
              </button>
              <button
                onClick={() => setInput("React example")}
                className="text-xs px-3 py-1.5 bg-white hover:bg-violet-50 text-violet-700 rounded-full border border-violet-200 transition-colors"
              >
                React
              </button>
              <button
                onClick={clearChat}
                className="text-xs px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 rounded-full border border-red-200 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 flex items-center space-x-2 shadow-sm border border-gray-200">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about SIWE authentication..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by {DEFAULT_MODEL} • Press Enter to send
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotSidebar;
