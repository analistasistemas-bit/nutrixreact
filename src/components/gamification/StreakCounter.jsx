import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useGamification } from '../../hooks/useGamification';

const StreakCounter = ({ compact = false }) => {
    const { currentStreak } = useGamification();

    const getStreakColor = () => {
        if (currentStreak >= 30) return 'from-yellow-400 to-orange-500';
        if (currentStreak >= 7) return 'from-orange-400 to-red-500';
        if (currentStreak >= 3) return 'from-cyan-400 to-blue-500';
        return 'from-gray-300 to-gray-400';
    };

    const getStreakEmoji = () => {
        if (currentStreak >= 30) return '🌟';
        if (currentStreak >= 7) return '🔥';
        if (currentStreak >= 3) return '💪';
        if (currentStreak >= 1) return '✨';
        return '❄️';
    };

    if (compact) {
        return (
            <div className="flex items-center space-x-1 bg-orange-100/30 dark:bg-orange-900/40 backdrop-blur-md border border-orange-200/50 dark:border-orange-500/20 rounded-full px-2.5 py-1">
                <span className="text-sm">{getStreakEmoji()}</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{currentStreak}d</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-3xl border shadow-sm
                bg-white dark:bg-bg-elevated 
                border-zinc-200 dark:border-border-subtle p-5 shadow-black/5`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <motion.div
                        animate={currentStreak >= 3 ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, -5, 5, 0],
                        } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStreakColor()} flex items-center justify-center shadow-md`}
                    >
                        <span className="text-2xl">{getStreakEmoji()}</span>
                    </motion.div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm">Streak Diário</h3>
                        <p className="text-xs text-gray-500 dark:text-text-muted">
                            {currentStreak === 0 ? 'Comece hoje!' :
                                currentStreak === 1 ? 'Ótimo começo!' :
                                    `${currentStreak} dias consecutivos!`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <motion.span
                        key={currentStreak}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
                    >
                        {currentStreak}
                    </motion.span>
                    <p className="text-[10px] text-gray-400 font-medium">DIAS</p>
                </div>
            </div>

            {/* Streak dots */}
            <div className="flex items-center space-x-1 mt-3">
                {[...Array(7)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex-1 h-1.5 rounded-full ${i < currentStreak % 7
                            ? 'bg-gradient-to-r from-orange-400 to-red-400'
                            : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-center">
                {7 - (currentStreak % 7)} dias para o próximo marco semanal
            </p>
        </motion.div>
    );
};

export default StreakCounter;
