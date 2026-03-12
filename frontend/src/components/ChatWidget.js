import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid';

const API_URL = 'http://localhost:9090/api/chat';

const WELCOME = {
    sender: 'bot',
    text: '👋 Hi! I\'m your SecureVote assistant. Ask me anything about registration, voting, EPIC numbers, OTP login, or how to cast your vote!',
};

const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-saffron flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    </div>
);

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        // Immediately show user message
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(API_URL, { message: text });
            const reply = res.data?.reply || 'Sorry, I could not get a response.';
            setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
        } catch {
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: '⚠️ Connection error. Please try again.' },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* ─── Chat Window ─────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 flex flex-col"
                    style={{
                        width: '370px',
                        height: '520px',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        background: 'white',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">SecureVote Assistant</p>
                                <p className="text-orange-100 text-xs">🟢 Online • Powered by AI</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto px-4 py-3"
                        style={{ background: '#F8F9FA' }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-end gap-2 mb-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                {msg.sender === 'bot' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                                        <SparklesIcon className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {/* Bubble */}
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: msg.sender === 'user'
                                            ? '18px 18px 4px 18px'
                                            : '18px 18px 18px 4px',
                                        background: msg.sender === 'user'
                                            ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                                            : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#1F2937',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && <TypingIndicator />}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        className="border-t border-gray-100 px-3 py-3"
                        style={{ background: 'white' }}
                    >
                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-orange-400 transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything…"
                                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                                disabled={isTyping}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isTyping}
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                                style={{
                                    background: input.trim() && !isTyping
                                        ? 'linear-gradient(135deg, #FF6B35, #F7931E)'
                                        : '#E5E7EB',
                                }}
                            >
                                <PaperAirplaneIcon
                                    className="w-4 h-4"
                                    style={{ color: input.trim() && !isTyping ? 'white' : '#9CA3AF' }}
                                />
                            </button>
                        </div>
                        <p className="text-center text-gray-300 text-xs mt-2">Powered by Groq · Llama 3</p>
                    </div>
                </div>
            )}

            {/* ─── Floating Toggle Button ───────────────────────────────── */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: isOpen
                        ? '#6B7280'
                        : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                    boxShadow: '0 6px 24px rgba(255, 107, 53, 0.5)',
                }}
                title="Chat with SecureVote Assistant"
            >
                {isOpen
                    ? <XMarkIcon className="w-6 h-6 text-white" />
                    : <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                }
            </button>
        </>
    );
};

export default ChatWidget;
