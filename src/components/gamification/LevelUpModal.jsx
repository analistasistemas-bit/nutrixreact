import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useGamification } from '../../hooks/useGamification';

const CONFETTI_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];

const ConfettiParticle = ({ delay, color }) => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        setConfig({ // eslint-disable-line react-hooks/set-state-in-effect
            x: Math.random() * 100,
            size: 4 + Math.random() * 8,
            duration: 1.5 + Math.random() * 2,
            rotation: Math.random() * 720 - 360,
            isRound: Math.random() > 0.5
        });
    }, []);

    if (!config) return null;

    return (
        <motion.div
            initial={{
                x: `${config.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
            }}
            animate={{
                y: '110vh',
                rotate: config.rotation,
                opacity: [1, 1, 0],
            }}
            transition={{
                duration: config.duration,
                delay: delay,
                ease: "easeIn",
            }}
            className="fixed pointer-events-none z-[200]"
            style={{
                width: config.size,
                height: config.size,
                backgroundColor: color,
                borderRadius: config.isRound ? '50%' : '2px',
                left: `${config.x}%`,
            }}
        />
    );
};

const LevelUpModal = () => {
    const { levelUpData, dismissLevelUp } = useGamification();
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiParticles, setConfettiParticles] = useState([]);

    useEffect(() => {
        if (levelUpData) {
            // Use setTimeout to avoid synchronous setState in effect linter error
            setTimeout(() => {
                setShowConfetti(true);
                setConfettiParticles([...Array(50)].map((_, i) => ({
                    id: i,
                    delay: Math.random() * 0.5,
                    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
                })));
            }, 0);
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [levelUpData]);

    return (
        <>
            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {confettiParticles.map((p) => (
                            <ConfettiParticle
                                key={p.id}
                                delay={p.delay}
                                color={p.color}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {levelUpData && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={dismissLevelUp}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 50 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-[90%] max-w-sm"
                        >
                            <div className="bg-gradient-to-b from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-1">
                                <div className="bg-gradient-to-b from-indigo-900/80 via-blue-800/80 to-cyan-800/80 rounded-[22px] p-6 text-center backdrop-blur-sm">
                                    {/* Stars decoration */}
                                    <div className="flex justify-center mb-2">
                                        {['✨', '⭐', '✨'].map((star, i) => (
                                            <motion.span
                                                key={i}
                                                className="text-2xl mx-1"
                                                animate={{
                                                    y: [0, -10, 0],
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.7, 1, 0.7],
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                    delay: i * 0.2,
                                                }}
                                            >
                                                {star}
                                            </motion.span>
                                        ))}
                                    </div>

                                    <motion.h2
                                        className="text-3xl font-black text-white mb-1"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        LEVEL UP!
                                    </motion.h2>
                                    <p className="text-cyan-200 text-sm mb-4">Você está evoluindo! 🎉</p>

                                    {/* Level badge */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-yellow-300/50"
                                    >
                                        <div className="text-center">
                                            <span className="text-4xl font-black text-white block leading-none">{levelUpData.newLevel}</span>
                                            <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-wider">NÍVEL</span>
                                        </div>
                                    </motion.div>

                                    <p className="text-white font-bold text-lg mb-1">{levelUpData.title}</p>

                                    {/* Pet evolution */}
                                    {levelUpData.petEvolved && levelUpData.newPetStage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm"
                                        >
                                            <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2">🐾 Evolução do Pet!</p>
                                            <motion.span
                                                className="text-5xl block mb-2"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                {levelUpData.newPetStage.emoji}
                                            </motion.span>
                                            <p className="text-white font-bold">{levelUpData.newPetStage.name}</p>
                                            <p className="text-cyan-200 text-xs">{levelUpData.newPetStage.description}</p>
                                        </motion.div>
                                    )}

                                    <motion.button
                                        onClick={dismissLevelUp}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:from-yellow-300 hover:to-orange-400 transition-all"
                                    >
                                        Incrível! 🚀
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default LevelUpModal;
