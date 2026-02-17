import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplet, Circle, ChevronDown } from 'lucide-react';

const NutrientCard = ({ icon: Icon, title, consumed, goal, unit, colorClass, gradientClass, glowColor, compact }) => {
    const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : (consumed > 0 ? 100 : 0);

    return (
        <motion.div
            whileHover={{
                scale: 1.02,
                boxShadow: `0 0 25px ${glowColor}`,
            }}
            transition={{
                boxShadow: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                },
                scale: { duration: 0.2 }
            }}
            className={`relative overflow-hidden bg-white/60 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/5 transition-all duration-300 shadow-lg shadow-black/5`}
        >
            <div className="flex items-center space-x-2 mb-3">
                <Icon className={`w-5 h-5 ${colorClass}`} />
                <h3 className={`font-bold text-zinc-900 dark:text-text-primary ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h3>
            </div>
            <div className="mb-2">
                <span className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-zinc-900 dark:text-text-primary`}>{consumed}</span>
                <span className={`text-zinc-600 dark:text-text-muted ml-1 font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>{unit || `/ ${goal}`}</span>
            </div>
            <div className="relative pt-1">
                <div className={`overflow-hidden ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-zinc-200/50 dark:bg-zinc-900/50`}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${gradientClass}`}
                    ></motion.div>
                </div>
            </div>
            {!compact && goal > 0 && (
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-text-muted">
                    {Math.max(goal - consumed, 0)}{unit || 'g'} restantes
                </div>
            )}
        </motion.div>
    );
};

const MacroNutrientsCard = ({ calories, macroNutrients, compact = false }) => {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2`}>
            <NutrientCard
                icon={Flame}
                title="Calorias"
                consumed={calories.consumed}
                goal={calories.goal}
                colorClass="text-orange-500"
                gradientClass="bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-orange-400"
                glowColor="rgba(249, 115, 22, 0.25)"
                compact={compact}
            />

            <NutrientCard
                icon={Droplet}
                title="Proteína"
                consumed={macroNutrients.protein.consumed}
                goal={macroNutrients.protein.goal}
                unit="g"
                colorClass="text-blue-500"
                gradientClass="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-400"
                glowColor="rgba(59, 130, 246, 0.25)"
                compact={compact}
            />

            <NutrientCard
                icon={Circle}
                title="Carbos"
                consumed={macroNutrients.carbs.consumed}
                goal={macroNutrients.carbs.goal}
                unit="g"
                colorClass="text-green-500"
                gradientClass="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-400"
                glowColor="rgba(34, 197, 94, 0.25)"
                compact={compact}
            />

            <NutrientCard
                icon={ChevronDown}
                title="Gorduras"
                consumed={macroNutrients.fats.consumed}
                goal={macroNutrients.fats.goal}
                unit="g"
                colorClass="text-purple-500"
                gradientClass="bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-400"
                glowColor="rgba(168, 85, 247, 0.25)"
                compact={compact}
                iconProps={{ className: "rotate-180" }}
            />
        </div>
    );
};

export default MacroNutrientsCard;
