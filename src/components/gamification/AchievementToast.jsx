import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

const AchievementToast = () => {
    const { toastQueue, dismissToast } = useGamification();

    return (
        <div className="fixed top-20 right-4 z-[100] space-y-2 pointer-events-none">
            <AnimatePresence>
                {toastQueue.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border min-w-[280px] ${toast.type === 'xp'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-white'
                            : toast.type === 'achievement'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    >
                        <motion.span
                            className="text-2xl"
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            {toast.emoji}
                        </motion.span>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{toast.title}</p>
                            <p className={`text-xs ${toast.type === 'xp' || toast.type === 'achievement' ? 'text-white/80' : 'text-gray-500'}`}>
                                {toast.description}
                            </p>
                        </div>
                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Progress bar timer */}
                        <motion.div
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 3.5, ease: "linear" }}
                            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left rounded-b-xl ${toast.type === 'xp' || toast.type === 'achievement' ? 'bg-white/40' : 'bg-cyan-400'
                                }`}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default AchievementToast;
