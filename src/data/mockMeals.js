export const MEAL_DATABASE = {
    morning: [
        { name: "Café da Manhã com Mandioca e Ovos", calories: 420, protein: 24, carbs: 45, fats: 15, ingredients: ["Mandioca cozida (150g)", "Ovo de galinha (4 unidades)", "Requeijão Cremoso Light (30g)"] },
        { name: "Tapioca com Frango e Queijo", calories: 380, protein: 22, carbs: 40, fats: 12, ingredients: ["Goma de tapioca (60g)", "Frango desfiado (80g)", "Queijo Cottage (30g)"] },
        { name: "Panqueca de Banana e Aveia", calories: 400, protein: 18, carbs: 55, fats: 10, ingredients: ["Banana (1 un)", "Ovo (2 un)", "Aveia (30g)", "Mel (1 fio)"] },
        { name: "Ovos Mexidos com Pão Integral", calories: 350, protein: 20, carbs: 30, fats: 14, ingredients: ["Pão integral (2 fatias)", "Ovos (3 un)", "Manteiga (5g)"] }
    ],
    lunch: [
        { name: "Almoço Balanceado com Frango", calories: 680, protein: 45, carbs: 60, fats: 18, ingredients: ["Peito de frango (140g)", "Arroz intregral (90g)", "Feijão (140g)", "Salada"] },
        { name: "Carne Moída com Purê de Batata", calories: 720, protein: 40, carbs: 65, fats: 22, ingredients: ["Carne moída (150g)", "Batata inglesa (200g)", "Legumes cozidos"] },
        { name: "Peixe Grelhado com Legumes", calories: 550, protein: 40, carbs: 30, fats: 15, ingredients: ["Tilápia (150g)", "Brócolis e cenoura (200g)", "Arroz (80g)"] },
        { name: "Strogonoff Light de Frango", calories: 650, protein: 42, carbs: 55, fats: 20, ingredients: ["Frango em cubos (150g)", "Creme de ricota light", "Arroz (100g)"] }
    ],
    snack: [
        { name: "Lanche Proteico com Banana e Whey", calories: 320, protein: 28, carbs: 35, fats: 5, ingredients: ["Banana (2 un)", "Whey Protein (30g)", "Aveia (15g)"] },
        { name: "Iogurte com Frutas e Granola", calories: 300, protein: 15, carbs: 40, fats: 8, ingredients: ["Iogurte natural (170g)", "Morango (5 un)", "Granola (20g)"] },
        { name: "Sanduíche de Atum", calories: 350, protein: 25, carbs: 30, fats: 10, ingredients: ["Pão integral (2 fatias)", "Atum (1 lata)", "Maionese light"] },
        { name: "Shake de Abacate e Cacau", calories: 400, protein: 10, carbs: 20, fats: 30, ingredients: ["Abacate (100g)", "Leite (200ml)", "Cacau em pó"] }
    ],
    dinner: [
        { name: "Jantar com Mandioca e Frango", calories: 450, protein: 35, carbs: 40, fats: 12, ingredients: ["Mandioca (150g)", "Frango (150g)"] },
        { name: "Omelete de Forno com Legumes", calories: 380, protein: 25, carbs: 10, fats: 20, ingredients: ["Ovos (3 un)", "Espinafre", "Tomate", "Queijo branco"] },
        { name: "Sopa de Legumes com Carne", calories: 300, protein: 20, carbs: 30, fats: 8, ingredients: ["Carne em cubos (100g)", "Legumes variados", "Macarrão (50g)"] },
        { name: "Salada Completa com Frango", calories: 350, protein: 30, carbs: 15, fats: 15, ingredients: ["Mix de folhas", "Frango desfiado (120g)", "Azeite (1 fio)"] }
    ],
    supper: [
        { name: "Ceia Sanduíche Integral", calories: 380, protein: 25, carbs: 30, fats: 10, ingredients: ["Pão integral (2 fatias)", "Frango (100g)", "Requeijão"] },
        { name: "Mingau de Aveia Proteico", calories: 300, protein: 20, carbs: 35, fats: 5, ingredients: ["Aveia (30g)", "Whey (1 scoop)", "Canela"] },
        { name: "Mix de Castanhas", calories: 200, protein: 5, carbs: 10, fats: 15, ingredients: ["Castanha do Pará (2 un)", "Nozes (2 un)", "Amêndoas (5 un)"] },
        { name: "Queijo Coalho com Orégano", calories: 250, protein: 15, carbs: 2, fats: 20, ingredients: ["Queijo Coalho (2 fatias)", "Orégano", "Azeite"] }
    ]
};

export const getRandomMeal = (type) => {
    const options = MEAL_DATABASE[type];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
};

export const getEmojiForMealType = (type) => {
    switch (type) {
        case 'Café da manhã':
            return '☕';
        case 'Almoço':
            return '🍱';
        case 'Jantar':
            return '🌙';
        case 'Lanche':
            return '🍎';
        default:
            return '🍽️';
    }
};
