import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useGamification } from '../../hooks/useGamification';

const PetWidget = ({ showDetails = true }) => {
    const { petStage, petMood, level, currentStreak, actionsToday } = useGamification();

    const speechBubbleMessages = React.useMemo(() => [
        petMood.message,
        `Estou no nível ${level}!`,
        currentStreak > 0 ? `${currentStreak} dias juntos! 💕` : 'Vamos começar hoje?',
        actionsToday > 0 ? 'Bom trabalho hoje!' : 'Faça algo por sua saúde!',
    ], [petMood.message, level, currentStreak, actionsToday]);

    const [randomMessage, setRandomMessage] = React.useState('');
    const [sparkles, setSparkles] = React.useState([]);

    React.useEffect(() => {
        setRandomMessage(speechBubbleMessages[Math.floor(Math.random() * speechBubbleMessages.length)]);
        setSparkles([...Array(4)].map((_, i) => ({
            id: i,
            top: `${30 + Math.random() * 40}%`,
            left: `${20 + Math.random() * 60}%`,
            duration: 1.5 + Math.random(),
        })));
    }, [speechBubbleMessages]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-3xl border shadow-sm overflow-hidden 
                bg-white dark:bg-bg-elevated 
                border-zinc-200 dark:border-border-subtle shadow-black/5`}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-10">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full blur-xl"></div>
            </div>

            <div className="relative p-5">
                {/* Pet name + stage */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm">🐾 {petStage.name}</h3>
                        <p className="text-[10px] text-gray-500 dark:text-text-muted">{petStage.description}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${petMood.color} ${petMood.bgColor} dark:bg-bg-secondary border border-current/10 dark:border-border-subtle shadow-sm`}>
                        <span>{petMood.emoji}</span>
                        <span>{petMood.label}</span>
                    </div>
                </div>

                {/* Pet display */}
                <div className="flex flex-col items-center py-4">
                    {/* Speech bubble */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative mb-3 bg-white dark:bg-bg-tertiary rounded-xl px-4 py-2 shadow-sm border border-gray-100 dark:border-border-subtle max-w-[200px]"
                    >
                        <p className="text-xs text-gray-700 dark:text-text-secondary text-center font-medium">{randomMessage}</p>
                        {/* Triangle */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-bg-tertiary border-b border-r border-gray-100 dark:border-border-subtle transform rotate-45"></div>
                    </motion.div>

                    {/* Pet emoji with animation */}
                    <motion.div
                        animate={{
                            y: [0, -8, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut",
                        }}
                        className="relative"
                    >
                        <span className={petStage.size} role="img" aria-label={petStage.name}>
                            {petStage.emoji}
                        </span>

                        {/* Glow under pet */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent rounded-full blur-sm"></div>
                    </motion.div>

                    {/* Sparkles around pet when mood is good */}
                    {(petMood.label === 'Épico!' || petMood.label === 'Empolgado') && (
                        <>
                            {sparkles.map((sparkle) => (
                                <motion.span
                                    key={sparkle.id}
                                    className="absolute text-sm"
                                    style={{
                                        top: sparkle.top,
                                        left: sparkle.left,
                                    }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0.5, 1, 0.5],
                                        y: [0, -15, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: sparkle.duration,
                                        delay: sparkle.id * 0.3,
                                    }}
                                >
                                    ✨
                                </motion.span>
                            ))}
                        </>
                    )}
                </div>

                {/* Pet stats */}
                {showDetails && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center bg-white/60 dark:bg-bg-secondary rounded-lg p-2 border border-gray-100 dark:border-border-subtle">
                            <span className="text-lg">❤️</span>
                            <p className="text-[10px] text-gray-600 dark:text-text-muted font-medium">Saúde</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-text-primary">{Math.min(actionsToday * 25, 100)}%</p>
                        </div>
                        <div className="text-center bg-white/60 dark:bg-bg-secondary rounded-lg p-2 border border-gray-100 dark:border-border-subtle">
                            <span className="text-lg">😊</span>
                            <p className="text-[10px] text-gray-600 dark:text-text-muted font-medium">Humor</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-text-primary">{petMood.label}</p>
                        </div>
                        <div className="text-center bg-white/60 dark:bg-bg-secondary rounded-lg p-2 border border-gray-100 dark:border-border-subtle">
                            <span className="text-lg">⭐</span>
                            <p className="text-[10px] text-gray-600 dark:text-text-muted font-medium">Nível</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-text-primary">{level}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PetWidget;
