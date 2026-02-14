import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useGamification } from '../../hooks/useGamification';

const XPBar = ({ compact = false }) => {
    const { level, levelProgress, totalXP, levelTitle, petStage } = useGamification();

    if (compact) {
        return (
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-full px-2.5 py-1">
                    <span className="text-sm">{petStage.emoji}</span>
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">Lv.{level}</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-50 dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-4 shadow-sm"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <motion.span
                        className="text-3xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        {petStage.emoji}
                    </motion.span>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 dark:text-text-primary text-lg">Nível {level}</span>
                            <span className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {levelTitle}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-text-muted">{petStage.name} • {totalXP} XP total</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">{levelProgress.progressXP}</span>
                    <span className="text-xs text-gray-400 dark:text-text-muted"> / {levelProgress.requiredXP} XP</span>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="relative h-3 bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default XPBar;
