import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Trophy, Target, Flame, Star, Shield, Crown, ChevronUp, Medal, Camera } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { ACHIEVEMENTS, LEADERBOARD_DATA, PET_STAGES, getLevelTitle } from '../data/gamificationData';
import PetWidget from '../components/gamification/PetWidget';
import XPBar from '../components/gamification/XPBar';
import StreakCounter from '../components/gamification/StreakCounter';

const GamerProfile = () => {
    const { level, totalXP, unlockedBadges, stats, currentStreak, petStage } = useGamification();
    const [activeSection, setActiveSection] = useState('badges');

    const sections = [
        { id: 'badges', name: 'Conquistas', emoji: '🏅', icon: Medal, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { id: 'leaderboard', name: 'Ranking', emoji: '🏆', icon: Trophy, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        { id: 'pet', name: 'Meu Pet', emoji: '🐾', icon: Star, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
    ];

    const badgeCategories = [
        { id: 'all', label: 'Todas' },
        { id: 'streak', label: '🔥 Streak' },
        { id: 'food', label: '🍽️ Refeições' },
        { id: 'level', label: '⭐ Nível' },
        { id: 'labs', label: '🧪 Exames' },
        { id: 'pet', label: '🐾 Pet' },
        { id: 'challenges', label: '🎯 Desafios' },
    ];

    const [badgeFilter, setBadgeFilter] = useState('all');

    const filteredAchievements = badgeFilter === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === badgeFilter);

    // Find user rank in leaderboard
    const userEntry = {
        rank: 9,
        name: 'Diego (Você)',
        level,
        xp: totalXP,
        streak: currentStreak,
        pet: petStage.emoji,
        badge: '🐾',
        isUser: true,
    };

    const fullLeaderboard = [...LEADERBOARD_DATA, userEntry].sort((a, b) => b.xp - a.xp).map((entry, i) => ({ ...entry, rank: i + 1 }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 pt-4 space-y-6 min-h-[calc(100vh-100px)]"
        >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Pet avatar */}
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/20"
                    >
                        <span className="text-5xl">{petStage.emoji}</span>
                    </motion.div>

                    <div className="text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                            <h1 className="text-2xl font-black">Diego</h1>
                            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                                {getLevelTitle(level)}
                            </span>
                        </div>
                        <p className="text-cyan-100 text-sm mb-3">Nível {level} • {totalXP} XP total</p>

                        {/* Mini stats */}
                        <div className="flex items-center justify-center sm:justify-start space-x-4">
                            <div className="text-center group">
                                <div className="flex items-center justify-center space-x-1 mb-0.5">
                                    <Camera className="w-3.5 h-3.5 text-cyan-200" />
                                    <span className="text-xl font-black">{stats.mealsLogged}</span>
                                </div>
                                <p className="text-[10px] text-cyan-200 font-medium uppercase tracking-wider opacity-80">Refeições</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="text-center group">
                                <div className="flex items-center justify-center space-x-1 mb-0.5">
                                    <Flame className="w-3.5 h-3.5 text-orange-300" />
                                    <span className="text-xl font-black">{currentStreak}</span>
                                </div>
                                <p className="text-[10px] text-cyan-200 font-medium uppercase tracking-wider opacity-80">Streak</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="text-center group">
                                <div className="flex items-center justify-center space-x-1 mb-0.5">
                                    <Medal className="w-3.5 h-3.5 text-yellow-300" />
                                    <span className="text-xl font-black">{unlockedBadges.length}</span>
                                </div>
                                <p className="text-[10px] text-cyan-200 font-medium uppercase tracking-wider opacity-80">Conquistas</p>
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="text-center group">
                                <div className="flex items-center justify-center space-x-1 mb-0.5">
                                    <Target className="w-3.5 h-3.5 text-indigo-300" />
                                    <span className="text-xl font-black">{stats.challengesCompleted}</span>
                                </div>
                                <p className="text-[10px] text-cyan-200 font-medium uppercase tracking-wider opacity-80">Desafios</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* XP Bar */}
            <XPBar />

            {/* Section Navigation */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
                {sections.map((section) => (
                    <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${activeSection === section.id
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md ring-2 ring-cyan-500/20'
                            : 'bg-white dark:bg-zinc-900/50 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                            }`}
                    >
                        <div className={`p-1.5 rounded-lg ${activeSection === section.id ? 'bg-white/20' : section.bgColor}`}>
                            <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-white' : section.color}`} />
                        </div>
                        <span>{section.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {/* Badges Section */}
                {activeSection === 'badges' && (
                    <motion.div
                        key="badges"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Category filter */}
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                            {badgeCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setBadgeFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${badgeFilter === cat.id
                                        ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-white border-transparent shadow-md ring-2 ring-cyan-500/20'
                                        : 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-cyan-600 dark:hover:text-cyan-400'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-xs text-gray-500 mb-2">
                            {unlockedBadges.length}/{ACHIEVEMENTS.length} desbloqueadas
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredAchievements.map((achievement, index) => {
                                const isUnlocked = unlockedBadges.includes(achievement.id);
                                return (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative p-4 rounded-xl border text-center transition-all ${isUnlocked
                                            ? 'bg-white dark:bg-zinc-900 border-yellow-200 dark:border-yellow-700/50 shadow-sm ring-1 ring-yellow-500/5 hover:border-yellow-300 dark:hover:border-yellow-600'
                                            : 'bg-gray-50/50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800/80 opacity-60'
                                            }`}
                                    >
                                        {isUnlocked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm"
                                            >
                                                <span className="text-[10px] text-white">✓</span>
                                            </motion.div>
                                        )}
                                        <motion.span
                                            className="text-3xl block mb-2"
                                            animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 3 }}
                                        >
                                            {achievement.emoji}
                                        </motion.span>
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{achievement.name}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-zinc-300 mt-1">{achievement.description}</p>
                                        {isUnlocked && (
                                            <span className="inline-block mt-2 text-[9px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                +100 XP
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard Section */}
                {activeSection === 'leaderboard' && (
                    <motion.div
                        key="leaderboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-100 dark:border-yellow-900/30">
                            <h3 className="font-bold text-gray-900 dark:text-text-primary flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span>Ranking Global</span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-text-muted">Top players do Nutrixo</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {fullLeaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center p-4 transition-colors ${entry.isUser
                                        ? 'bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-bg-hover'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className="w-10 text-center mr-3">
                                        {entry.rank === 1 ? (
                                            <span className="text-2xl">🥇</span>
                                        ) : entry.rank === 2 ? (
                                            <span className="text-2xl">🥈</span>
                                        ) : entry.rank === 3 ? (
                                            <span className="text-2xl">🥉</span>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
                                        )}
                                    </div>

                                    {/* Pet + Info */}
                                    <div className="flex items-center flex-1 space-x-3">
                                        <span className="text-2xl">{entry.pet}</span>
                                        <div>
                                            <p className={`font-bold text-sm ${entry.isUser ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-900 dark:text-text-primary'}`}>
                                                {entry.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-zinc-300">
                                                Nível {entry.level} • {entry.streak}🔥
                                            </p>
                                        </div>
                                    </div>

                                    {/* XP */}
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{(entry.xp / 1000).toFixed(1)}k</span>
                                        <p className="text-[10px] text-gray-400 dark:text-zinc-400">XP</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Pet Section */}
                {activeSection === 'pet' && (
                    <motion.div
                        key="pet"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <PetWidget showDetails={true} />

                        {/* Evolution Path */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm mb-4">🗺️ Caminho da Evolução</h3>
                            <div className="space-y-3">
                                {PET_STAGES.map((stage) => {
                                    const isActive = petStage.id === stage.id;
                                    const isUnlocked = level >= stage.minLevel;
                                    return (
                                        <div
                                            key={stage.id}
                                            className={`flex items-center space-x-4 p-3 rounded-xl border transition-all ${isActive
                                                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-300 dark:border-cyan-800 shadow-sm'
                                                : isUnlocked
                                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                    : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-800 opacity-60'
                                                }`}
                                        >
                                            <motion.span
                                                className="text-3xl"
                                                animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                {isUnlocked ? stage.emoji : '🔒'}
                                            </motion.span>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-text-primary">{stage.name}</h4>
                                                    {isActive && (
                                                        <span className="text-[9px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded-full uppercase">Atual</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-zinc-300">Nível {stage.minLevel}-{stage.maxLevel}</p>
                                            </div>
                                            {isUnlocked ? (
                                                <span className="text-xs font-bold text-green-600">✓</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Nv. {stage.minLevel}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Streak */}
                        <StreakCounter />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GamerProfile;
