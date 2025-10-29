import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Chat } from '@google/genai';
import { startChat, sendMessageToBot } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon, UserIcon, RobotIcon } from './icons';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></div>
    </div>
);


const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = startChat();
        setMessages([{ role: 'model', text: "Hi there, little artist! I'm Sparky, your coloring companion. Ask me about colors, animals, or anything you can imagine!" }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            const stream = await sendMessageToBot(chatRef.current, input);
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.text += chunkText;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                 if (lastMessage.role === 'model') {
                    lastMessage.text = "Oops! Something went wrong. Please try again.";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col h-[70vh] bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60">
            <div className="p-4 border-b border-gray-200/60">
                <h2 className="text-xl font-bold text-gray-800 text-center">Chat with Sparky</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                                <RobotIcon className="w-6 h-6" />
                           </div>
                        )}
                        <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                           {msg.text === '' && msg.role === 'model' ? <TypingIndicator /> : msg.text}
                        </div>
                         {msg.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 shadow-sm"><UserIcon className="w-6 h-6"/></div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200/60 bg-white/50 rounded-b-2xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Sparky anything..."
                        disabled={isLoading}
                        className="w-full px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-500 text-white p-3.5 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBot;