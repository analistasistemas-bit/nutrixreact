import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { User, Target, ShieldAlert, Sparkles, Loader2, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { getLatestMeasurements, generateNutritionPlanByAI } from '../../services/aiService';

const CustomSelect = ({ label, name, options, value, onChange, placeholder = "Selecione..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">{label}</label>}
            <div
                className="w-full bg-gray-50 dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-2 cursor-pointer flex items-center justify-between transition-all hover:border-cyan-500/50 shadow-sm h-[42px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? "text-gray-900 dark:text-text-primary text-sm" : "text-gray-400 text-sm"}>
                    {options.find(o => (o.value || o) === value)?.label || value || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-white/90 dark:bg-bg-elevated/90 backdrop-blur-xl border border-gray-200/50 dark:border-border-subtle rounded-2xl shadow-xl overflow-hidden p-1 backdrop-saturate-150"
                        >
                            {options.map((opt) => {
                                const optValue = opt.value ?? opt;
                                const optLabel = opt.label ?? opt;
                                const isSelected = value === optValue;

                                return (
                                    <div
                                        key={optValue}
                                        onClick={() => {
                                            onChange({ target: { name, value: optValue } });
                                            setIsOpen(false);
                                        }}
                                        className={`px-3 py-2.5 cursor-pointer text-sm font-medium transition-all rounded-xl flex items-center justify-between ${isSelected
                                                ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-bg-tertiary/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {optLabel}
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const CreatePlanWizard = ({ onGenerated, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        height: '',
        weight: '',
        activityLevel: 'Sedentário',
        goal: 'Manutenção',
        restrictions: [],
        aversions: '',
        budget: 'Padrão',
        mealCount: 4
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // Auto load measurements if available
    useEffect(() => {
        const loadMeasurements = async () => {
            try {
                const measurements = await getLatestMeasurements();
                if (measurements?.analysis?.measurements) {
                    const weightVal = measurements.analysis.measurements.weight?.value;
                    const heightVal = measurements.analysis.measurements.height?.value;

                    setFormData(prev => ({
                        ...prev,
                        weight: weightVal || prev.weight,
                        // Height in cm if it's stored in meters like 1.80
                        height: heightVal ? (heightVal < 3 ? Math.round(heightVal * 100) : heightVal) : prev.height
                    }));
                }
            } catch {
                console.error("No measurement history found to prefill");
            }
        };
        loadMeasurements();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const toggleRestriction = (restriction) => {
        setFormData(prev => {
            const current = [...prev.restrictions];
            if (current.includes(restriction)) {
                return { ...prev, restrictions: current.filter(r => r !== restriction) };
            } else {
                return { ...prev, restrictions: [...current, restriction] };
            }
        });
    };

    const validateStep = (currentStep) => {
        const errors = {};

        if (currentStep === 1) {
            const age = String(formData.age ?? '').trim();
            const gender = String(formData.gender ?? '').trim();

            if (!age) errors.age = 'Informe a idade para continuar.';
            if (!gender) errors.gender = 'Selecione o sexo biológico para continuar.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (!validateStep(step)) return;
        setStep(prev => Math.min(prev + 1, 4));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleGenerate = async () => {
        if (!validateStep(1)) {
            setStep(1);
            return;
        }

        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateNutritionPlanByAI(formData);
            onGenerated(result);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro ao gerar o plano. Tente novamente.');
            setIsGenerating(false);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const direction = 1;

    return (
        <div className="bg-white dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-2xl p-6 shadow-sm max-w-2xl mx-auto overflow-hidden">
            {/* Header & Progress */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-500" />
                        Criar com Inteligência Artificial
                    </h2>
                    <p className="text-gray-500 dark:text-text-secondary text-sm">
                        Responda as perguntas abaixo para gerarmos a dieta perfeita.
                    </p>
                </div>
                {!isGenerating && (
                    <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-900 underline">
                        Cancelar
                    </button>
                )}
            </div>

            {/* Stepper */}
            {!isGenerating && (
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-bg-tertiary'}`} />
                    ))}
                </div>
            )}

            {isGenerating ? (
                <div className="py-12 text-center">
                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-2">Montando sua dieta...</h3>
                    <p className="text-gray-500 dark:text-text-secondary text-sm">Essa operação pode demorar até 1 minuto.</p>
                </div>
            ) : error ? (
                <div className="py-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
                    <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="font-bold text-red-800 dark:text-red-400 mb-4">{error}</h3>
                    <button
                        onClick={() => { setError(null); handleGenerate(); }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center mx-auto gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Tentar Novamente
                    </button>
                </div>
            ) : (
                <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            {/* STEP 1: DADOS FÍSICOS */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-text-primary flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-gray-400" /> Corpo e Perfil
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Idade</label>
                                            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Ex: 30"
                                                className="w-full bg-gray-50 dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-text-primary" />
                                            {fieldErrors.age && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors.age}</p>
                                            )}
                                        </div>
                                        <div className="z-40 relative">
                                            <CustomSelect
                                                label="Sexo (Biológico)"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'Masculino', label: 'Masculino' },
                                                    { value: 'Feminino', label: 'Feminino' }
                                                ]}
                                            />
                                            {fieldErrors.gender && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Altura (cm)</label>
                                            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Ex: 175"
                                                className="w-full bg-gray-50 dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-text-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">Peso (kg)</label>
                                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Ex: 70"
                                                className="w-full bg-gray-50 dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-text-primary" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: OBJETIVO */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-text-primary flex items-center gap-2 mb-4">
                                        <Target className="w-5 h-5 text-gray-400" /> Objetivo & Rotina
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">Qual seu principal alvo com essa dieta?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Emagrecimento', 'Ganho de Massa', 'Manutenção', 'Reeducação'].map(goal => (
                                                <button key={goal} onClick={() => setFormData(prev => ({ ...prev, goal }))}
                                                    className={`py-2 px-3 border rounded-xl text-sm font-medium transition-colors ${formData.goal === goal ? 'bg-cyan-50 border-cyan-500 text-cyan-700 dark:bg-cyan-900/30' : 'bg-white dark:bg-bg-tertiary border-gray-200 dark:border-border-subtle text-gray-600 dark:text-text-secondary hover:bg-gray-50'}`}>
                                                    {goal}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="z-30 relative">
                                        <CustomSelect
                                            label="Nível de atividade física semanal"
                                            name="activityLevel"
                                            value={formData.activityLevel}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'Sedentário', label: 'Sedentário (Nenhuma)' },
                                                { value: 'Leve', label: 'Leve (1-2x por semana)' },
                                                { value: 'Moderado', label: 'Moderado (3-4x por semana)' },
                                                { value: 'Intenso', label: 'Intenso (5+ vezes por semana)' }
                                            ]}
                                        />
                                    </div>

                                    <div className="z-20 relative">
                                        <CustomSelect
                                            label="Estilo / Orçamento"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'Baixo Custo', label: 'Simples / Popular (Arroz, Frango, Ovo, Feijão)' },
                                                { value: 'Padrão', label: 'Padrão' },
                                                { value: 'Livre', label: 'Variada (Salmão, Castanhas, Suplementos)' }
                                            ]}
                                        />
                                    </div>

                                </div>
                            )}

                            {/* STEP 3: PREFERENCIAS */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-text-primary flex items-center gap-2 mb-4">
                                        <ShieldAlert className="w-5 h-5 text-gray-400" /> Adaptações
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">Quantas refeições por dia?</label>
                                        <div className="flex gap-2">
                                            {[3, 4, 5, 6].map(num => (
                                                <button key={num} onClick={() => setFormData(prev => ({ ...prev, mealCount: num }))}
                                                    className={`py-2 flex-1 border rounded-xl text-sm font-medium transition-colors ${formData.mealCount === num ? 'bg-cyan-50 border-cyan-500 text-cyan-700 dark:bg-cyan-900/30' : 'bg-white dark:bg-bg-tertiary border-gray-200 dark:border-border-subtle text-gray-600 dark:text-text-secondary hover:bg-gray-50'}`}>
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">Restrições (Marque se tiver)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Sem Glúten', 'Sem Lactose', 'Vegetariano', 'Vegano'].map(r => (
                                                <button key={r} onClick={() => toggleRestriction(r)}
                                                    className={`py-1.5 px-3 border rounded-xl text-xs font-medium transition-colors ${formData.restrictions.includes(r) ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30' : 'bg-white dark:bg-bg-tertiary border-gray-200 dark:border-border-subtle text-gray-600 dark:text-text-secondary hover:bg-gray-50'}`}>
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">O que você odeia? (Aversões)</label>
                                        <input type="text" name="aversions" value={formData.aversions} onChange={handleChange} placeholder="Ex: Peixe, batata doce, tomate..."
                                            className="w-full bg-gray-50 dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-text-primary" />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* Actions */}
            {!isGenerating && !error && (
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-border-subtle">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${step === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 dark:text-text-secondary dark:hover:bg-bg-tertiary'}`}
                    >
                        Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="bg-gray-900 hover:bg-black text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 px-6 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Gerar Dieta
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatePlanWizard;
