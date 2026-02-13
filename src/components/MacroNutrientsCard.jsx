import React from 'react';
import { Flame, Droplet, Circle, ChevronDown } from 'lucide-react';

const MacroNutrientsCard = ({ calories, macroNutrients, title = "📊 Nutrientes Diários", compact = false }) => {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4`}>
            {/* Calories */}
            <div className="bg-zinc-50 dark:bg-bg-secondary rounded-xl p-4 border border-zinc-200 dark:border-border-subtle transition-colors">
                <div className="flex items-center space-x-2 mb-3">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className={`font-medium text-zinc-900 dark:text-text-primary ${compact ? 'text-sm' : ''}`}>Calorias</h3>
                </div>
                <div className="mb-2">
                    <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-zinc-900 dark:text-text-primary`}>{calories.consumed}</span>
                    <span className={`text-zinc-600 dark:text-text-muted ml-1 ${compact ? 'text-xs' : ''}`}>{calories.unit || `/ ${calories.goal}`}</span>
                </div>
                <div className="relative pt-1">
                    <div className={`overflow-hidden ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-zinc-200 dark:bg-zinc-800`}>
                        <div
                            style={{ width: `${Math.min((calories.consumed / (calories.goal || calories.consumed)) * 100, 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-orange-400"
                        ></div>
                    </div>
                </div>
                {!compact && calories.goal && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-text-muted">
                        {calories.goal - calories.consumed} cal restantes
                    </div>
                )}
            </div>

            {/* Protein */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 dark:backdrop-blur-md rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 transition-colors">
                <div className="flex items-center space-x-2 mb-3">
                    <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className={`font-medium text-zinc-900 dark:text-zinc-200 ${compact ? 'text-sm' : ''}`}>Proteína</h3>
                </div>
                <div className="mb-2">
                    <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-zinc-900 dark:text-white`}>{macroNutrients.protein.consumed}</span>
                    <span className={`text-zinc-600 dark:text-zinc-400 ml-1 ${compact ? 'text-xs' : ''}`}>g{macroNutrients.protein.goal ? ` / ${macroNutrients.protein.goal}g` : ''}</span>
                </div>
                <div className="relative pt-1">
                    <div className={`overflow-hidden ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-zinc-200 dark:bg-zinc-800`}>
                        <div
                            style={{ width: `${Math.min((macroNutrients.protein.consumed / (macroNutrients.protein.goal || macroNutrients.protein.consumed)) * 100, 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-400"
                        ></div>
                    </div>
                </div>
                {!compact && macroNutrients.protein.goal && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {macroNutrients.protein.goal - macroNutrients.protein.consumed}g restantes
                    </div>
                )}
            </div>

            {/* Carbs */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 dark:backdrop-blur-md rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 transition-colors">
                <div className="flex items-center space-x-2 mb-3">
                    <Circle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className={`font-medium text-zinc-900 dark:text-zinc-200 ${compact ? 'text-sm' : ''}`}>Carboidratos</h3>
                </div>
                <div className="mb-2">
                    <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-zinc-900 dark:text-white`}>{macroNutrients.carbs.consumed}</span>
                    <span className={`text-zinc-600 dark:text-zinc-400 ml-1 ${compact ? 'text-xs' : ''}`}>g{macroNutrients.carbs.goal ? ` / ${macroNutrients.carbs.goal}g` : ''}</span>
                </div>
                <div className="relative pt-1">
                    <div className={`overflow-hidden ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-zinc-200 dark:bg-zinc-800`}>
                        <div
                            style={{ width: `${Math.min((macroNutrients.carbs.consumed / (macroNutrients.carbs.goal || macroNutrients.carbs.consumed)) * 100, 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-400"
                        ></div>
                    </div>
                </div>
                {!compact && macroNutrients.carbs.goal && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {macroNutrients.carbs.goal - macroNutrients.carbs.consumed}g restantes
                    </div>
                )}
            </div>

            {/* Fats */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 dark:backdrop-blur-md rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 transition-colors">
                <div className="flex items-center space-x-2 mb-3">
                    <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400 rotate-180" />
                    <h3 className={`font-medium text-zinc-900 dark:text-zinc-200 ${compact ? 'text-sm' : ''}`}>Gorduras</h3>
                </div>
                <div className="mb-2">
                    <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-zinc-900 dark:text-white`}>{macroNutrients.fats.consumed}</span>
                    <span className={`text-zinc-600 dark:text-zinc-400 ml-1 ${compact ? 'text-xs' : ''}`}>g{macroNutrients.fats.goal ? ` / ${macroNutrients.fats.goal}g` : ''}</span>
                </div>
                <div className="relative pt-1">
                    <div className={`overflow-hidden ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-zinc-200 dark:bg-zinc-800`}>
                        <div
                            style={{ width: `${Math.min((macroNutrients.fats.consumed / (macroNutrients.fats.goal || macroNutrients.fats.consumed)) * 100, 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-400"
                        ></div>
                    </div>
                </div>
                {!compact && macroNutrients.fats.goal && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {macroNutrients.fats.goal - macroNutrients.fats.consumed}g restantes
                    </div>
                )}
            </div>
        </div>
    );
};

export default MacroNutrientsCard;
