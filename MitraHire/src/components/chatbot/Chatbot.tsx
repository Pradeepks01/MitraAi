'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Briefcase } from 'lucide-react';
import { GeminiChatService } from './GeminiChatService';

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

const CareerChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Welcome! I'm your AI Career Assistant. Ready to help you navigate your professional journey. What career guidance can I provide today?",
            sender: 'ai'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatService = useRef(new GeminiChatService());
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            text: inputMessage,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const aiResponse = await chatService.current.sendMessage(inputMessage);
            const aiMessage: Message = {
                text: aiResponse,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Message send error:', error);
            const errorMessage: Message = {
                text: "I apologize, but I'm experiencing some difficulties. Please try again.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chatbot Popup */}
            {isOpen && (
                <div className="w-96 h-[400px] bg-white rounded-2xl shadow-2xl border-2 border-blue-100 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Briefcase className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Career Coach AI</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-700 p-1.5 rounded-full transition-colors duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl shadow-md ${msg.sender === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-800 border border-blue-100'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 italic p-3 rounded-2xl border border-blue-100">
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Ask about your career path, resume, or professional growth..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-grow p-3 border border-blue-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Chatbot Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                    <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>
            )}
        </div>
    );
};

export default CareerChatbot;