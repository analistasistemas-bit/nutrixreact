// XP required for each level (cumulative)
export const LEVEL_THRESHOLDS = [
    0,     // Level 1
    100,   // Level 2
    250,   // Level 3
    450,   // Level 4
    700,   // Level 5
    1000,  // Level 6
    1400,  // Level 7
    1900,  // Level 8
    2500,  // Level 9
    3200,  // Level 10
    4000,  // Level 11
    5000,  // Level 12
    6200,  // Level 13
    7600,  // Level 14
    9200,  // Level 15
    11000, // Level 16
    13000, // Level 17
    15500, // Level 18
    18500, // Level 19
    22000, // Level 20
    26000, // Level 21
    30500, // Level 22
    35500, // Level 23
    41000, // Level 24
    47000, // Level 25
    53500, // Level 26
    60500, // Level 27
    68000, // Level 28
    76000, // Level 29
    85000, // Level 30
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

// XP rewards
export const XP_REWARDS = {
    LOG_MEAL: { xp: 15, label: 'Refeição registrada' },
    UPLOAD_EXAM: { xp: 50, label: 'Exame enviado' },
    UPLOAD_PLAN: { xp: 40, label: 'Plano alimentar enviado' },
    COMPLETE_CHALLENGE: { xp: 30, label: 'Desafio completo' },
    DAILY_STREAK: { xp: 10, label: 'Streak diário' }, // multiplied by streak count
    UNLOCK_ACHIEVEMENT: { xp: 100, label: 'Conquista desbloqueada' },
};

// Pet evolution stages
export const PET_STAGES = [
    {
        id: 'egg',
        name: 'Ovo Misterioso',
        emoji: '🥚',
        minLevel: 1,
        maxLevel: 1,
        description: 'Algo está prestes a nascer...',
        animation: 'animate-pulse',
        size: 'text-6xl',
    },
    {
        id: 'baby',
        name: 'Nutri Bebê',
        emoji: '🐣',
        minLevel: 2,
        maxLevel: 5,
        description: 'Seu Nutri acabou de nascer! Cuide bem dele.',
        animation: 'animate-bounce',
        size: 'text-7xl',
    },
    {
        id: 'young',
        name: 'Nutri Jovem',
        emoji: '🐱',
        minLevel: 6,
        maxLevel: 15,
        description: 'Nutri está crescendo saudável e forte!',
        animation: 'animate-bounce',
        size: 'text-8xl',
    },
    {
        id: 'teen',
        name: 'Nutri Guardião',
        emoji: '🦊',
        minLevel: 16,
        maxLevel: 25,
        description: 'Nutri evoluiu para uma criatura mágica!',
        animation: 'animate-bounce',
        size: 'text-8xl',
    },
    {
        id: 'legendary',
        name: 'Nutri Lendário',
        emoji: '🐉',
        minLevel: 26,
        maxLevel: 50,
        description: 'Nutri atingiu sua forma lendária! Você é incrível!',
        animation: 'animate-bounce',
        size: 'text-9xl',
    },
];

// Pet moods based on streak and daily activity
export const PET_MOODS = {
    epic: { emoji: '✨', label: 'Épico!', color: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', message: 'INCRÍVEL! Você é uma lenda!' },
    happy: { emoji: '😄', label: 'Feliz', color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20', message: 'Estou muito feliz com você!' },
    excited: { emoji: '🤩', label: 'Empolgado', color: 'text-cyan-500 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', message: 'Vamos conquistar o mundo!' },
    neutral: { emoji: '😊', label: 'Tranquilo', color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', message: 'Bom te ver por aqui.' },
    sad: { emoji: '😢', label: 'Triste', color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800/50', message: 'Sinto sua falta... volte sempre!' },
    sleepy: { emoji: '😴', label: 'Sonolento', color: 'text-indigo-400 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', message: 'Zzz... me acorde com ações!' },
};

// Achievements / Badges
export const ACHIEVEMENTS = [
    { id: 'first_meal', name: 'Primeira Refeição', description: 'Registre sua primeira refeição', emoji: '🍽️', category: 'food', condition: (stats) => stats.mealsLogged >= 1 },
    { id: 'meal_streak_3', name: 'Consistente', description: 'Mantenha um streak de 3 dias', emoji: '🔥', category: 'streak', condition: (stats) => stats.currentStreak >= 3 },
    { id: 'meal_streak_7', name: 'Semana Perfeita', description: 'Mantenha um streak de 7 dias', emoji: '⭐', category: 'streak', condition: (stats) => stats.currentStreak >= 7 },
    { id: 'meal_streak_30', name: 'Mês Invicto', description: 'Mantenha um streak de 30 dias', emoji: '👑', category: 'streak', condition: (stats) => stats.currentStreak >= 30 },
    { id: 'first_exam', name: 'Check-up', description: 'Envie seu primeiro exame', emoji: '🧪', category: 'labs', condition: (stats) => stats.examsUploaded >= 1 },
    { id: 'first_plan', name: 'Planejador', description: 'Envie seu primeiro plano alimentar', emoji: '📋', category: 'nutrition', condition: (stats) => stats.plansUploaded >= 1 },
    { id: 'level_5', name: 'Em Ascensão', description: 'Alcance o nível 5', emoji: '🚀', category: 'level', condition: (stats) => stats.level >= 5 },
    { id: 'level_10', name: 'Guerreiro da Saúde', description: 'Alcance o nível 10', emoji: '⚔️', category: 'level', condition: (stats) => stats.level >= 10 },
    { id: 'level_20', name: 'Mestre Nutricional', description: 'Alcance o nível 20', emoji: '🏆', category: 'level', condition: (stats) => stats.level >= 20 },
    { id: 'meals_10', name: 'Cozinheiro Dedicado', description: 'Registre 10 refeições', emoji: '👨‍🍳', category: 'food', condition: (stats) => stats.mealsLogged >= 10 },
    { id: 'meals_50', name: 'Chef de Saúde', description: 'Registre 50 refeições', emoji: '🌟', category: 'food', condition: (stats) => stats.mealsLogged >= 50 },
    { id: 'challenges_5', name: 'Desafiante', description: 'Complete 5 desafios', emoji: '🎯', category: 'challenges', condition: (stats) => stats.challengesCompleted >= 5 },
    { id: 'challenges_20', name: 'Imparável', description: 'Complete 20 desafios', emoji: '💪', category: 'challenges', condition: (stats) => stats.challengesCompleted >= 20 },
    { id: 'pet_evolved', name: 'Nutri Cresceu!', description: 'Evolua seu pet pela primeira vez', emoji: '🐾', category: 'pet', condition: (stats) => stats.level >= 2 },
    { id: 'pet_legendary', name: 'Lenda Viva', description: 'Evolua seu pet para a forma lendária', emoji: '🐉', category: 'pet', condition: (stats) => stats.level >= 26 },
];

// Daily challenges pool (3 are picked randomly each day)
export const CHALLENGE_POOL = [
    { id: 'log_3_meals', name: 'Tríade Saudável', description: 'Registre 3 refeições hoje', emoji: '🍽️', target: 3, type: 'meals' },
    { id: 'log_breakfast', name: 'Bom Dia!', description: 'Registre um café da manhã', emoji: '☕', target: 1, type: 'breakfast' },
    { id: 'drink_water', name: 'Hidratação Master', description: 'Beba 2 litros de água', emoji: '💧', target: 1, type: 'water' },
    { id: 'healthy_snack', name: 'Lanche Saudável', description: 'Registre um lanche saudável', emoji: '🍎', target: 1, type: 'snack' },
    { id: 'upload_exam', name: 'Saúde em Dia', description: 'Envie um exame para análise', emoji: '🧪', target: 1, type: 'exam' },
    { id: 'log_dinner', name: 'Jantar Completo', description: 'Registre seu jantar', emoji: '🌙', target: 1, type: 'dinner' },
    { id: 'log_all_meals', name: 'Dia Completo', description: 'Registre refeições em todos os horários', emoji: '🏆', target: 4, type: 'meals' },
    { id: 'mindful_eating', name: 'Comer Consciente', description: 'Registre uma refeição usando foto', emoji: '📸', target: 1, type: 'photo_meal' },
];

// Mock leaderboard data
export const LEADERBOARD_DATA = [
    { rank: 1, name: 'Ana S.', level: 28, xp: 72500, streak: 45, pet: '🐉', badge: '👑' },
    { rank: 2, name: 'Carlos M.', level: 24, xp: 55000, streak: 32, pet: '🦊', badge: '⚔️' },
    { rank: 3, name: 'Juliana R.', level: 22, xp: 48000, streak: 28, pet: '🦊', badge: '🏆' },
    { rank: 4, name: 'Pedro L.', level: 19, xp: 38000, streak: 21, pet: '🐱', badge: '🚀' },
    { rank: 5, name: 'Mariana F.', level: 16, xp: 29000, streak: 15, pet: '🐱', badge: '⭐' },
    { rank: 6, name: 'Lucas O.', level: 14, xp: 23000, streak: 12, pet: '🐱', badge: '🔥' },
    { rank: 7, name: 'Fernanda B.', level: 11, xp: 15000, streak: 9, pet: '🐱', badge: '🎯' },
    { rank: 8, name: 'Rafael C.', level: 8, xp: 8500, streak: 5, pet: '🐣', badge: '🍽️' },
];

// Level titles
export const LEVEL_TITLES = {
    1: 'Novato',
    2: 'Iniciante',
    5: 'Explorador',
    8: 'Aventureiro',
    10: 'Guerreiro',
    13: 'Veterano',
    15: 'Especialista',
    18: 'Mestre',
    20: 'Grão-Mestre',
    23: 'Campeão',
    25: 'Lenda',
    28: 'Mito',
    30: 'Divindade',
};

export const getLevelTitle = (level) => {
    const titles = Object.entries(LEVEL_TITLES).sort((a, b) => Number(b[0]) - Number(a[0]));
    for (const [minLevel, title] of titles) {
        if (level >= Number(minLevel)) return title;
    }
    return 'Novato';
};

export const getPetStage = (level) => {
    for (let i = PET_STAGES.length - 1; i >= 0; i--) {
        if (level >= PET_STAGES[i].minLevel) return PET_STAGES[i];
    }
    return PET_STAGES[0];
};

export const getPetMood = (streak, actionsToday) => {
    if (streak >= 7 && actionsToday >= 3) return PET_MOODS.epic;
    if (streak >= 5) return PET_MOODS.excited;
    if (streak >= 3 || actionsToday >= 2) return PET_MOODS.happy;
    if (actionsToday >= 1) return PET_MOODS.neutral;
    if (streak === 0) return PET_MOODS.sad;
    return PET_MOODS.sleepy;
};

// Pick N random challenges from the pool
export const pickDailyChallenges = (count = 3) => {
    const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(c => ({ ...c, progress: 0, completed: false }));
};

// Calculate level from total XP
export const calculateLevel = (totalXP) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
};

// Calculate XP progress within current level
export const calculateLevelProgress = (totalXP) => {
    const level = calculateLevel(totalXP);
    const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
    const progressXP = totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return { progressXP, requiredXP, percentage: Math.min((progressXP / requiredXP) * 100, 100) };
};
