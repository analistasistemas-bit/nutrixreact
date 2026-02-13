import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

const DailyChallenges = () => {
    const { dailyChallenges, completeChallenge } = useGamification();

    const completedCount = dailyChallenges.filter(c => c.completed).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-text-primary text-sm">🎯 Desafios do Dia</h3>
                        <p className="text-[10px] text-zinc-500 dark:text-text-muted">{completedCount}/{dailyChallenges.length} completos • +30 XP cada</p>
                    </div>
                </div>
                {completedCount === dailyChallenges.length && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200"
                    >
                        ✅ Tudo Feito!
                    </motion.span>
                )}
            </div>

            <div className="space-y-2">
                {dailyChallenges.map((challenge, index) => (
                    <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${challenge.completed
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                            : 'bg-zinc-50 dark:bg-bg-secondary border-zinc-200 dark:border-border-subtle hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/30'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-xl">{challenge.emoji}</span>
                            <div>
                                <h4 className={`font-bold text-sm ${challenge.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-zinc-900 dark:text-text-primary'}`}>
                                    {challenge.name}
                                </h4>
                                <p className={`text-xs ${challenge.completed ? 'text-green-600 dark:text-green-500' : 'text-zinc-500 dark:text-text-muted'}`}>
                                    {challenge.description}
                                </p>
                            </div>
                        </div>

                        {challenge.completed ? (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm"
                            >
                                <CheckCircle className="w-5 h-5 text-white" />
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => completeChallenge(challenge.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-lg shadow-sm hover:from-cyan-400 hover:to-blue-400 transition-all"
                            >
                                Completar
                            </motion.button>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default DailyChallenges;
