import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    calculateLevel,
    calculateLevelProgress,
    getPetStage,
    getPetMood,
    getLevelTitle,
    pickDailyChallenges,
    CHALLENGE_POOL,
    ACHIEVEMENTS,
    XP_REWARDS,
} from '../data/gamificationData';
import { GamificationContext } from './GamificationContextInstance';
import { useGamificationSync } from '../hooks/useGamificationSync';

export const GamificationProvider = ({ children }) => {
    // Core state
    const [totalXP, setTotalXP] = useState(0);
    const [currentStreak] = useState(0);
    const [actionsToday, setActionsToday] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [dailyChallenges, setDailyChallenges] = useState(() => pickDailyChallenges(3));

    // Stats for achievement tracking
    const [stats, setStats] = useState({
        mealsLogged: 0,
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

    // Sync layer — usa email do AuthContext (JWT validado)
    const { user } = useAuth();
    const { persistXP } = useGamificationSync(totalXP, level, setTotalXP, user?.email || 'demo@nutrixo.com');

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

    // Refs to keep stable callback identities and avoid infinite loops
    const totalXPRef = useRef(totalXP);
    const statsRef = useRef(stats);
    const dailyChallengesRef = useRef(dailyChallenges);
    const currentStreakRef = useRef(currentStreak);

    React.useEffect(() => { totalXPRef.current = totalXP; }, [totalXP]);
    React.useEffect(() => { statsRef.current = stats; }, [stats]);
    React.useEffect(() => { dailyChallengesRef.current = dailyChallenges; }, [dailyChallenges]);

    // Track recently processed actions to avoid double-processing in the same render cycle
    const lastTrackedRef = useRef({});

    // Add XP and check for level ups and achievements
    const addXP = useCallback((rewardKey) => {
        const reward = XP_REWARDS[rewardKey];
        if (!reward) return;

        let xpGain = reward.xp;
        if (rewardKey === 'DAILY_STREAK') {
            xpGain = reward.xp * currentStreakRef.current;
        }

        const currentXP = totalXPRef.current;
        const oldLevel = calculateLevel(currentXP);
        const newTotalXP = currentXP + xpGain;
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

        // Persist to Insforge
        persistXP(newTotalXP, newLevel);

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
        setStats(prev => {
            const newStats = { ...prev, level: newLevel };
            if (rewardKey === 'LOG_MEAL') newStats.mealsLogged = (prev.mealsLogged || 0) + 1;
            if (rewardKey === 'UPLOAD_EXAM') newStats.examsUploaded = (prev.examsUploaded || 0) + 1;
            if (rewardKey === 'UPLOAD_PLAN') newStats.plansUploaded = (prev.plansUploaded || 0) + 1;
            if (rewardKey === 'COMPLETE_CHALLENGE') newStats.challengesCompleted = (prev.challengesCompleted || 0) + 1;

            // Check for new achievements inline to ensure they use latest stats
            checkAchievements({ ...newStats, currentStreak: currentStreakRef.current, level: newLevel });
            return newStats;
        });
    }, [persistXP, showToast, checkAchievements]);

    const addXPRef = useRef(addXP);
    React.useEffect(() => { addXPRef.current = addXP; }, [addXP]);

    // Track user actions for challenges
    const trackAction = useCallback((actionType, amount = 1) => {
        // Prevent multiple identical tracks in a very short window (e.g., re-renders or double mounts)
        const now = Date.now();
        if (lastTrackedRef.current[actionType] && now - lastTrackedRef.current[actionType] < 1000) {
            return;
        }
        lastTrackedRef.current[actionType] = now;

        setDailyChallenges(prev => {
            let challengeCompleted = false;
            const updated = prev.map(challenge => {
                if (!challenge.completed && challenge.type === actionType) {
                    const newProgress = Math.min(challenge.progress + amount, challenge.target);
                    const isNowCompleted = newProgress >= challenge.target;

                    if (isNowCompleted && !challenge.completed) {
                        challengeCompleted = true;
                        return { ...challenge, progress: newProgress, completed: true };
                    }
                    return { ...challenge, progress: newProgress };
                }
                return challenge;
            });

            if (challengeCompleted) {
                // XP is added with a small delay to separate from state update
                setTimeout(() => addXPRef.current('COMPLETE_CHALLENGE'), 100);

                // Replace challenge after a longer delay
                setTimeout(() => {
                    setDailyChallenges(current => {
                        const remaining = current.filter(c => !c.completed || c.type !== actionType);
                        if (remaining.length < 3) {
                            const usedIds = new Set(current.map(c => c.id));
                            const available = CHALLENGE_POOL.filter(c => !usedIds.has(c.id));
                            if (available.length > 0) {
                                const next = available[Math.floor(Math.random() * available.length)];
                                return [...remaining, { ...next, progress: 0, completed: false }];
                            }
                        }
                        return current;
                    });
                }, 4000);
            }

            return updated;
        });
    }, []);

    // Complete a daily challenge (legacy/manual - keeping for compatibility)
    const completeChallenge = useCallback((challengeId) => {
        setDailyChallenges(prev => prev.map(c => {
            if (c.id === challengeId && !c.completed) {
                addXPRef.current('COMPLETE_CHALLENGE');
                return { ...c, progress: c.target, completed: true };
            }
            return c;
        }));
    }, []);

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
        trackAction,
        dismissToast,
        dismissLevelUp,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};
