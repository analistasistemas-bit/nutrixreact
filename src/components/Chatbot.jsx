import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Bot, X, Loader2 } from 'lucide-react';
import { chatWithAssistant, getExamHistory, getTodayMeals, getLatestMeasurements } from '../services/aiService';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const Chatbot = () => {
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, type: 'ai', message: 'Olá! Sou o assistente Nutrixo 🤖 Posso te ajudar com dúvidas sobre nutrição, interpretar exames (de forma educacional) e dar dicas de saúde. Como posso ajudar? 💡' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (userInput.trim() === '' || isLoading) return;

        const userMessage = { id: Date.now(), type: 'user', message: userInput };
        setChatMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        // Build message history for context
        const messageHistory = chatMessages
            .filter(m => m.type !== 'system')
            .map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.message,
            }));
        messageHistory.push({ role: 'user', content: userInput });

        // Get user context
        let userContext = {};
        try {
            const [exams, meals, measurements] = await Promise.all([
                getExamHistory().catch(() => []),
                getTodayMeals().catch(() => []),
                getLatestMeasurements().catch(() => null),
            ]);
            if (exams.length > 0) {
                userContext.lastExam = exams[0]?.analysis;
            }
            if (meals.length > 0) {
                userContext.todayMeals = meals.map(m => ({
                    type: m.meal_type,
                    calories: m.calories,
                    description: m.description,
                }));
            }
            if (measurements?.analysis) {
                userContext.measurements = measurements.analysis;
            }
        } catch {
            // Continue without context
        }

        // Add streaming AI message
        const aiMessageId = Date.now() + 1;
        setChatMessages(prev => [...prev, { id: aiMessageId, type: 'ai', message: '', isStreaming: true }]);

        try {
            const stream = await chatWithAssistant(messageHistory, userContext);
            let fullResponse = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    fullResponse += content;
                    setChatMessages(prev =>
                        prev.map(m => m.id === aiMessageId ? { ...m, message: fullResponse } : m)
                    );
                }
            }

            // Finalize streaming
            setChatMessages(prev =>
                prev.map(m => m.id === aiMessageId ? { ...m, isStreaming: false } : m)
            );
        } catch (err) {
            console.error('Erro no chat:', err);
            setChatMessages(prev =>
                prev.map(m =>
                    m.id === aiMessageId
                        ? { ...m, message: 'Desculpe, tive um problema ao processar sua pergunta. Tente novamente! 😅', isStreaming: false }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed right-4 z-[60] bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] lg:bottom-4">
            <AnimatePresence>
                {!showChatbot ? (
                    <div className="relative"> {/* Wrapper relativo para conter o pulso absoluto */}
                        <div className="absolute inset-0 rounded-full animate-pulse-ring z-0"></div> {/* O "Ovo" Pulsante */}
                        <motion.button
                            key="chatbot-button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowChatbot(true)}
                            className="relative z-10 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white overflow-hidden p-0 border-2 border-white/20"
                        >
                            <img
                                src="/chatbot-icon.png"
                                alt="Nutrixo AI"
                                className="w-full h-full object-cover"
                            />
                        </motion.button>
                    </div>
                ) : (
                    <motion.div
                        key="chatbot-panel"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 h-[28rem] flex flex-col"
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-2xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                                        <img
                                            src="/chatbot-icon.png"
                                            alt="Bot"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Assistente Nutrixo</h3>
                                        <p className="text-cyan-100 text-xs">
                                            {isLoading ? '✍️ Digitando...' : '🟢 Online'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowChatbot(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${message.type === 'user'
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {message.message}
                                        {message.isStreaming && (
                                            <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={isLoading ? 'Aguarde...' : 'Pergunte sobre nutrição...'}
                                    disabled={isLoading}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-border-subtle rounded-full text-sm text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted bg-white dark:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !userInput.trim()}
                                    className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon />}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
