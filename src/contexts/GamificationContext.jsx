import React, { useState, useCallback, useRef } from 'react';
import {
    calculateLevel,
    calculateLevelProgress,
    getPetStage,
    getPetMood,
    getLevelTitle,
    pickDailyChallenges,
    ACHIEVEMENTS,
    XP_REWARDS,
} from '../data/gamificationData';
import { GamificationContext } from './GamificationContextInstance';

export const GamificationProvider = ({ children }) => {
    // Core state
    const [totalXP, setTotalXP] = useState(75); // Start with a bit of XP so user sees progress
    const [currentStreak] = useState(2);
    const [actionsToday, setActionsToday] = useState(1);
    const [unlockedBadges, setUnlockedBadges] = useState(['first_meal', 'pet_evolved']);
    const [dailyChallenges, setDailyChallenges] = useState(() => pickDailyChallenges(3));

    // Stats for achievement tracking
    const [stats, setStats] = useState({
        mealsLogged: 5,
        examsUploaded: 0,
        plansUploaded: 0,
        challengesCompleted: 0,
    });

    // Toast queue
    const [toastQueue, setToastQueue] = useState([]);
    const toastIdRef = useRef(0);

    // Derived values
    const level = calculateLevel(totalXP);
    const levelProgress = calculateLevelProgress(totalXP);
    const petStage = getPetStage(level);
    const petMood = getPetMood(currentStreak, actionsToday);
    const levelTitle = getLevelTitle(level);

    // Show toast notification
    const showToast = useCallback((toast) => {
        const id = ++toastIdRef.current;
        setToastQueue(prev => [...prev, { ...toast, id }]);
        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    // Dismiss toast
    const dismissToast = useCallback((id) => {
        setToastQueue(prev => prev.filter(t => t.id !== id));
    }, []);

    // Level up state
    const [levelUpData, setLevelUpData] = useState(null);

    // Check and unlock achievements
    const checkAchievements = useCallback((currentStats) => {
        ACHIEVEMENTS.forEach((achievement) => {
            if (!unlockedBadges.includes(achievement.id) && achievement.condition(currentStats)) {
                setUnlockedBadges(prev => [...prev, achievement.id]);
                setTimeout(() => {
                    showToast({
                        type: 'achievement',
                        title: 'Conquista Desbloqueada! 🏅',
                        description: `${achievement.emoji} ${achievement.name}`,
                        emoji: '🎉',
                    });
                }, 1500);
            }
        });
    }, [unlockedBadges, showToast]);

    // Add XP and check for level ups and achievements
    const addXP = useCallback((rewardKey) => {
        const reward = XP_REWARDS[rewardKey];
        if (!reward) return;

        let xpGain = reward.xp;
        if (rewardKey === 'DAILY_STREAK') {
            xpGain = reward.xp * currentStreak;
        }

        const oldLevel = calculateLevel(totalXP);
        const newTotalXP = totalXP + xpGain;
        const newLevel = calculateLevel(newTotalXP);

        setTotalXP(newTotalXP);
        setActionsToday(prev => prev + 1);

        // Show XP toast
        showToast({
            type: 'xp',
            title: `+${xpGain} XP`,
            description: reward.label,
            emoji: '⚡',
        });

        // Check level up
        if (newLevel > oldLevel) {
            const oldPetStage = getPetStage(oldLevel);
            const newPetStage = getPetStage(newLevel);
            const petEvolved = newPetStage.id !== oldPetStage.id;

            setTimeout(() => {
                setLevelUpData({
                    newLevel,
                    oldLevel,
                    title: getLevelTitle(newLevel),
                    petEvolved,
                    newPetStage: petEvolved ? newPetStage : null,
                });
            }, 800);
        }

        // Update stats
        const newStats = { ...stats, level: newLevel };
        if (rewardKey === 'LOG_MEAL') newStats.mealsLogged = (stats.mealsLogged || 0) + 1;
        if (rewardKey === 'UPLOAD_EXAM') newStats.examsUploaded = (stats.examsUploaded || 0) + 1;
        if (rewardKey === 'UPLOAD_PLAN') newStats.plansUploaded = (stats.plansUploaded || 0) + 1;
        if (rewardKey === 'COMPLETE_CHALLENGE') newStats.challengesCompleted = (stats.challengesCompleted || 0) + 1;
        setStats(newStats);

        // Check for new achievements
        checkAchievements({ ...newStats, currentStreak, level: newLevel });
    }, [totalXP, currentStreak, stats, showToast, checkAchievements]);

    // Complete a daily challenge
    const completeChallenge = useCallback((challengeId) => {
        setDailyChallenges(prev => prev.map(c => {
            if (c.id === challengeId && !c.completed) {
                return { ...c, progress: c.target, completed: true };
            }
            return c;
        }));
        addXP('COMPLETE_CHALLENGE');
    }, [addXP]);

    // Dismiss level up modal
    const dismissLevelUp = useCallback(() => {
        setLevelUpData(null);
    }, []);

    const value = {
        // State
        totalXP,
        level,
        levelProgress,
        levelTitle,
        currentStreak,
        actionsToday,
        petStage,
        petMood,
        unlockedBadges,
        dailyChallenges,
        stats,
        toastQueue,
        levelUpData,
        // Actions
        addXP,
        completeChallenge,
        dismissToast,
        dismissLevelUp,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

