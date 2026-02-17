import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Snowflake } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

const StreakCounter = ({ compact = false }) => {
    const { currentStreak } = useGamification();

    const getStreakColor = () => {
        if (currentStreak >= 30) return 'from-yellow-400 to-orange-500';
        if (currentStreak >= 7) return 'from-orange-400 to-red-500'; // Heat check para streaks longos
        // Default para 0-6 dias (Identidade Nutrixo Viva)
        return 'from-cyan-400 to-blue-600';
    };

    const getStreakIcon = () => {
        if (currentStreak >= 30) return <Trophy className="w-6 h-6 text-white" fill="currentColor" />;
        if (currentStreak >= 7) return <Flame className="w-6 h-6 text-white" fill="currentColor" />;
        // Ícone padrão sempre aceso
        return <Zap className="w-6 h-6 text-white" fill="currentColor" />;
    };

    if (compact) {
        return (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/20 rounded-full px-3 py-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" fill="currentColor" />
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{currentStreak}d</span>
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
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStreakColor()} flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-white/20`}
                    >
                        {getStreakIcon()}
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
                        className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getStreakColor()}`}
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
                            ? `bg-gradient-to-r ${getStreakColor()}`
                            : 'bg-zinc-200 dark:bg-zinc-700'
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
