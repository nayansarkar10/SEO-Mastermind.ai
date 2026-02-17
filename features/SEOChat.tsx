import React, { useState, useRef, useEffect } from 'react';
import { generateSEOContent } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { ChatMessage, GroundingChunk } from '../types';
import { Send, User, Bot, Loader2, AlertCircle, Globe } from 'lucide-react';

const SEOChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your expert SEO Consultant. I can help with strategy, technical SEO questions, or content ideas. What's on your mind?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real chat, we'd send history. For this stateless demo, we send the last prompt
      // or a concatenated version. Let's send a concatenated version for context retention.
      const historyText = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.text}`).join('\n');
      const prompt = `${historyText}\nUser: ${userMsg.text}\nAgent:`;
      
      const response = await generateSEOContent({ 
        prompt,
        useGrounding: true // Consultant mode defaults to having access to world knowledge
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the SEO database. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex max-w-[85%] md:max-w-[75%] 
              ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
            `}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-brand-100 ml-3' : 'bg-slate-100 mr-3'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-brand-700" /> : <Bot className="w-5 h-5 text-slate-700" />}
              </div>
              
              <div className={`
                p-4 rounded-2xl shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 rounded-tl-none'}
                ${msg.isError ? 'bg-red-50 border-red-200 text-red-800' : ''}
              `}>
                {msg.role === 'model' ? (
                   <div className="text-slate-800">
                     <MarkdownRenderer content={msg.text} />
                   </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none ml-11">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">Consultant is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about SEO strategy..."
            className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="text-center mt-2">
            <span className="text-xs text-slate-400 flex items-center justify-center">
              <Globe className="w-3 h-3 mr-1" />
              Connected to real-time search grounding
            </span>
        </div>
      </div>
    </div>
  );
};

export default SEOChat;