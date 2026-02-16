export const healthMetrics = [
    { name: 'Vitamina D', value: '28 ng/mL', status: 'Abaixo do normal', trend: 'up', emoji: '💊' },
    { name: 'Ferro', value: '120 µg/dL', status: 'Normal', trend: 'stable', emoji: '🩸' },
    { name: 'Colesterol', value: '220 mg/dL', status: 'Acima do normal', trend: 'down', emoji: '⚠️' }
];

export const initialMacroNutrients = {
    protein: { consumed: 78, goal: 120, unit: 'g' },
    carbs: { consumed: 156, goal: 250, unit: 'g' },
    fats: { consumed: 42, goal: 65, unit: 'g' }
};

export const initialMealLog = [
    { id: 1, type: 'Café da manhã', calories: 350, time: '08:30', emoji: '☕' },
    { id: 2, type: 'Almoço', calories: 500, time: '13:15', emoji: '🍱' },
    { id: 3, type: 'Lanche', calories: 0, time: '16:00', emoji: '🍎' }
];
