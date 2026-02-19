import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Camera, Mic, Loader2, AlertTriangle, CheckCircle, RefreshCw, UtensilsCrossed, MicOff, Pencil, Trash2, Copy, CalendarDays, Eye } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeFoodPhoto, analyzeFoodDescription, getMealsByDateRange, updateMealEntry, deleteMealEntry, duplicateMealEntry, reanalyzeMealEntry } from '../services/aiService';
import { formatPtBrNumber } from '../lib/numberLocale';

const MEAL_TYPES = [
    { id: 'cafe-da-manha', label: 'Café da Manhã', emoji: '🌅' },
    { id: 'almoco', label: 'Almoço', emoji: '☀️' },
    { id: 'lanche', label: 'Lanche', emoji: '🍎' },
    { id: 'jantar', label: 'Jantar', emoji: '🌙' },
];

const QUANTITY_PATTERNS = [
    /\b\d+(?:[.,]\d+)?\s?(?:g|gramas?|kg|ml|l|litros?|colheres?|x[ií]caras?|xicaras?|fatias?|unidades?|unid\.?)\b/i,
    /\b\d+(?:[.,]\d+)?\s?(?:de\s+)?[a-zà-ÿ]{2,}\b/i,
];

const hasFoodQuantity = (text = '') => {
    const normalized = text.trim();
    if (!normalized) return false;
    return QUANTITY_PATTERNS.some((pattern) => pattern.test(normalized));
};

const toDateInput = (value) => {
    const date = new Date(value);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
};

const todayInputValue = () => toDateInput(new Date());
const formatValue = (value) => formatPtBrNumber(value);

const Food = () => {
    const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0]);
    const [activeMode, setActiveMode] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [voiceText, setVoiceText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [estimationNotice, setEstimationNotice] = useState('');
    const [pendingAnalysis, setPendingAnalysis] = useState(null);
    const [historyMeals, setHistoryMeals] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [quickRange, setQuickRange] = useState('today');
    const [startDate, setStartDate] = useState(todayInputValue());
    const [endDate, setEndDate] = useState(todayInputValue());
    const [selectedHistoryMeal, setSelectedHistoryMeal] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isReanalyzingEdit, setIsReanalyzingEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        meal_type: MEAL_TYPES[0].label,
        description: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const { addXP } = useGamification();

    const loadHistory = async (dateFrom = startDate, dateTo = endDate) => {
        setHistoryLoading(true);
        setHistoryError('');
        try {
            const meals = await getMealsByDateRange(dateFrom, dateTo);
            setHistoryMeals(meals);
        } catch (err) {
            setHistoryError(err?.message || 'Erro ao carregar histórico.');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        loadHistory(startDate, endDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const applyQuickRange = (range) => {
        const now = new Date();
        const end = todayInputValue();
        let start = end;

        if (range === '7d') {
            const d = new Date(now);
            d.setDate(d.getDate() - 6);
            start = toDateInput(d);
        }
        if (range === '30d') {
            const d = new Date(now);
            d.setDate(d.getDate() - 29);
            start = toDateInput(d);
        }

        setQuickRange(range);
        setStartDate(start);
        setEndDate(end);
    };

    const openMealDetail = (meal) => {
        setSelectedHistoryMeal(meal);
        setEditForm({
            meal_type: meal.meal_type || MEAL_TYPES[0].label,
            description: meal.description || meal.analysis?.description || '',
            calories: meal.calories || meal.analysis?.totalCalories || 0,
            protein: meal.protein || meal.analysis?.totalProtein || 0,
            carbs: meal.carbs || meal.analysis?.totalCarbs || 0,
            fats: meal.fats || meal.analysis?.totalFats || 0,
        });
    };

    const closeMealDetail = () => {
        setSelectedHistoryMeal(null);
    };

    const saveMealEdit = async () => {
        if (!selectedHistoryMeal) return;
        setIsSavingEdit(true);
        try {
            const updated = await updateMealEntry(selectedHistoryMeal.id, {
                meal_type: editForm.meal_type,
                description: editForm.description,
                calories: Number(editForm.calories) || 0,
                protein: Number(editForm.protein) || 0,
                carbs: Number(editForm.carbs) || 0,
                fats: Number(editForm.fats) || 0,
                input_method: 'manual',
                analysis: {
                    ...(selectedHistoryMeal.analysis || {}),
                    description: editForm.description,
                    totalCalories: Number(editForm.calories) || 0,
                    totalProtein: Number(editForm.protein) || 0,
                    totalCarbs: Number(editForm.carbs) || 0,
                    totalFats: Number(editForm.fats) || 0,
                },
            });
            openMealDetail(updated);
            await loadHistory();
        } catch (err) {
            setHistoryError(err?.message || 'Erro ao salvar edição.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const runMealReanalysis = async () => {
        if (!selectedHistoryMeal?.id || !editForm.description.trim()) return;
        setIsReanalyzingEdit(true);
        try {
            const updated = await reanalyzeMealEntry(selectedHistoryMeal.id, {
                description: editForm.description.trim(),
                mealType: editForm.meal_type,
            });
            openMealDetail(updated);
            await loadHistory();
        } catch (err) {
            setHistoryError(err?.message || 'Erro ao reanalisar refeição.');
        } finally {
            setIsReanalyzingEdit(false);
        }
    };

    const removeMeal = async (mealId) => {
        if (!window.confirm('Excluir esta refeição? Essa ação não pode ser desfeita.')) return;
        try {
            await deleteMealEntry(mealId);
            if (selectedHistoryMeal?.id === mealId) {
                closeMealDetail();
            }
            await loadHistory();
        } catch (err) {
            setHistoryError(err?.message || 'Erro ao excluir refeição.');
        }
    };

    const duplicateMeal = async (meal) => {
        try {
            await duplicateMealEntry(meal);
            await loadHistory();
        } catch (err) {
            setHistoryError(err?.message || 'Erro ao duplicar refeição.');
        }
    };

    // ========== PHOTO ==========
    const handlePhotoCapture = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setActiveMode('photo');
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeFoodPhoto(file, selectedMeal.label);
            setAnalysisResult(result.analysis);
            addXP('LOG_MEAL');
            await loadHistory();
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message || 'Erro ao analisar a foto.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ========== VOICE ==========
    const startVoiceRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Reconhecimento de voz não suportado neste navegador.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(r => r[0].transcript)
                .join('');
            setVoiceText(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error !== 'no-speech') {
                setError('Erro no reconhecimento de voz: ' + event.error);
            }
        };

        setActiveMode('voice');
        setIsListening(true);
        setError(null);
        setAnalysisResult(null);
        recognition.start();
    };

    const stopVoiceRecognition = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const runTextAnalysis = async (text, inputMethod, shouldAssumeDefaultPortions) => {
        if (!text.trim()) return;

        setActiveMode(inputMethod === 'manual' ? 'manual' : 'voice');
        setIsAnalyzing(true);
        setError(null);
        setEstimationNotice(
            shouldAssumeDefaultPortions
                ? 'Sem quantidades informadas. A IA vai usar porções padrão para estimar os nutrientes.'
                : ''
        );

        try {
            const result = await analyzeFoodDescription(text, selectedMeal.label, { inputMethod });
            const nextAnalysis = {
                ...result.analysis,
                ...(shouldAssumeDefaultPortions
                    ? {
                        assumedPortions: true,
                        estimationWarning:
                                result.analysis?.estimationWarning ||
                                'Quantidades não informadas. A estimativa foi feita com porções padrão.',
                    }
                    : {}),
            };
            setAnalysisResult(nextAnalysis);
            addXP('LOG_MEAL');
            await loadHistory();
        } catch (err) {
            console.error('Erro:', err);
            const errorMessage = err?.message || 'Erro ao analisar.';
            if (/invalid token|sess[aã]o/i.test(errorMessage)) {
                setError('Sessão inválida ou expirada. Faça logout e login novamente para continuar.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const submitVoiceText = async () => {
        if (!voiceText.trim()) return;
        const shouldAssumeDefaultPortions = !hasFoodQuantity(voiceText);

        if (shouldAssumeDefaultPortions) {
            setPendingAnalysis({ text: voiceText, inputMethod: 'voice' });
            return;
        }

        await runTextAnalysis(voiceText, 'voice', false);
    };

    // ========== MANUAL TEXT ==========
    const [manualText, setManualText] = useState('');
    const handleManualSubmit = async () => {
        if (!manualText.trim()) return;
        const shouldAssumeDefaultPortions = !hasFoodQuantity(manualText);
        if (shouldAssumeDefaultPortions) {
            setPendingAnalysis({ text: manualText, inputMethod: 'manual' });
            return;
        }

        await runTextAnalysis(manualText, 'manual', false);
    };

    const confirmEstimatedAnalysis = async () => {
        if (!pendingAnalysis?.text) return;
        const { text, inputMethod } = pendingAnalysis;
        setPendingAnalysis(null);
        await runTextAnalysis(text, inputMethod, true);
    };

    const cancelEstimatedAnalysis = () => {
        setPendingAnalysis(null);
        setEstimationNotice('');
    };

    // ========== RESET ==========
    const reset = () => {
        setActiveMode(null);
        setAnalysisResult(null);
        setError(null);
        setPreviewUrl(null);
        setVoiceText('');
        setManualText('');
        setIsListening(false);
        setEstimationNotice('');
        setPendingAnalysis(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="bg-white dark:bg-bg-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm shadow-cyan-900/30">
                        <UtensilsCrossed className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🍽️ Registrar Alimentação</h2>
                    <p className="text-gray-600 dark:text-text-secondary text-sm">Tire uma foto, use a voz ou descreva o que comeu</p>
                </div>

                {/* Meal Type Selector */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {MEAL_TYPES.map((meal) => (
                        <motion.button
                            key={meal.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMeal(meal)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedMeal.id === meal.id
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-900/30'
                                : 'bg-gray-100 dark:bg-bg-secondary text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-hover'
                                }`}
                        >
                            {meal.emoji} {meal.label}
                        </motion.button>
                    ))}
                </div>

                {/* Input Methods — show only if no active mode or analyzing */}
                {!activeMode && !isAnalyzing && !analysisResult && (
                    <div className="space-y-4">
                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Photo */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} ref={fileInputRef} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:from-cyan-400 hover:to-blue-500 transition-all"
                                >
                                    <Camera className="w-5 h-5" />
                                    <span>📸 Tirar Foto da Refeição</span>
                                </button>
                            </motion.div>

                            {/* Voice */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    onClick={startVoiceRecognition}
                                    className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:from-blue-400 hover:to-cyan-400 transition-all"
                                >
                                    <Mic className="w-5 h-5" />
                                    <span>🎤 Ditar por Voz</span>
                                </button>
                            </motion.div>
                        </div>

                        {/* Manual Text Input */}
                        <div className="border border-gray-200 dark:border-border-subtle rounded-xl p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">✍️ Ou descreva manualmente:</h3>
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Ex: 120g arroz integral, 150g frango grelhado, 80g feijão e 60g salada"
                                className="w-full p-3 border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none resize-none dark:text-white dark:placeholder-gray-500"
                                rows={3}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-text-muted">
                                Para maior precisão, informe alimento + quantidade em gramas.
                            </p>
                            <button
                                onClick={handleManualSubmit}
                                disabled={!manualText.trim()}
                                className="mt-2 w-full py-2 bg-cyan-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors"
                            >
                                Analisar com IA 🤖
                            </button>
                            {pendingAnalysis?.inputMethod === 'manual' && (
                                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3">
                                    <p className="text-xs text-amber-900 font-semibold">
                                        Não encontramos quantidades na descrição. Deseja continuar com estimativa padrão?
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            onClick={confirmEstimatedAnalysis}
                                            className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-400"
                                        >
                                            Continuar
                                        </button>
                                        <button
                                            onClick={cancelEstimatedAnalysis}
                                            className="flex-1 py-2 rounded-lg border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100"
                                        >
                                            Não, revisar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Voice Recording UI */}
                {activeMode === 'voice' && !analysisResult && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                            {isListening ? (
                                <>
                                    <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center animate-pulse">
                                        <Mic className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="font-bold text-blue-800">🎤 Ouvindo...</p>
                                    <p className="text-blue-600 text-sm mt-1">Diga o que você comeu</p>
                                    <button onClick={stopVoiceRecognition} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center space-x-1 mx-auto">
                                        <MicOff className="w-4 h-4" />
                                        <span>Parar</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Mic className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                                    <p className="font-bold text-blue-800 text-sm">Gravação finalizada</p>
                                </>
                            )}
                        </div>

                        {voiceText && (
                            <div className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-4">
                                <p className="text-sm text-gray-600 dark:text-text-secondary mb-1">Texto reconhecido:</p>
                                <p className="font-medium text-gray-900 dark:text-white">"{voiceText}"</p>
                                <div className="flex space-x-2 mt-3">
                                    <button onClick={submitVoiceText} className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-400">
                                        Analisar com IA 🤖
                                    </button>
                                    <button onClick={reset} className="px-4 py-2 border border-gray-200 dark:border-border-subtle rounded-lg text-sm text-gray-600 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-bg-hover">
                                        Cancelar
                                    </button>
                                </div>
                                {pendingAnalysis?.inputMethod === 'voice' && (
                                    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3">
                                        <p className="text-xs text-amber-900 font-semibold">
                                            Não encontramos quantidades na descrição. Deseja continuar com estimativa padrão?
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={confirmEstimatedAnalysis}
                                                className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-400"
                                            >
                                                Continuar
                                            </button>
                                            <button
                                                onClick={cancelEstimatedAnalysis}
                                                className="flex-1 py-2 rounded-lg border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100"
                                            >
                                                Não, revisar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Photo Preview */}
                {previewUrl && activeMode === 'photo' && (
                    <div className="mb-4">
                        <img src={previewUrl} alt="Foto da refeição" className="w-full max-h-64 object-cover rounded-xl border border-gray-200" />
                    </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cyan-50 border border-cyan-200 dark:bg-cyan-900/10 dark:border-cyan-900/40 rounded-xl p-5 text-center mt-4">
                        <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-300 mx-auto mb-3 animate-spin" />
                        <h3 className="font-bold text-cyan-800 dark:text-cyan-200 text-lg">🤖 IA Analisando {selectedMeal.label}...</h3>
                        <p className="text-cyan-700 dark:text-cyan-300/90 text-sm mt-1">Identificando alimentos e estimando nutrientes ⚡</p>
                        {estimationNotice && (
                            <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 inline-block">
                                ⚠️ {estimationNotice}
                            </p>
                        )}
                        <div className="mt-3 w-full bg-cyan-200 dark:bg-cyan-950/50 rounded-full h-2">
                            <motion.div className="bg-cyan-500 h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 6, ease: 'easeOut' }} />
                        </div>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-800 text-sm">Erro</h3>
                                    <p className="text-red-700 text-xs">{error}</p>
                                </div>
                            </div>
                            <button onClick={reset} className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                                <RefreshCw className="w-3 h-3" /><span>Tentar novamente</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {analysisResult && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                            {/* Success */}
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-bold text-green-800 text-sm">Refeição Registrada! +25 XP</span>
                                </div>
                                <button onClick={reset} className="text-green-700 text-xs font-medium underline">Nova refeição</button>
                            </div>

                            {/* Totals */}
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-900/30 rounded-xl p-5">
                                <h3 className="font-bold text-cyan-800 dark:text-cyan-300 mb-3">{selectedMeal.emoji} {selectedMeal.label}</h3>
                                {analysisResult.description && (
                                    <p className="text-gray-600 dark:text-text-secondary text-sm mb-3">{analysisResult.description}</p>
                                )}
                                {analysisResult.estimationWarning && (
                                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
                                        ⚠️ {analysisResult.estimationWarning}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-white dark:bg-bg-primary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                        <p className="text-xs text-gray-500 dark:text-text-muted">🔥 Calorias</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatValue(analysisResult.totalCalories)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-bg-primary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                        <p className="text-xs text-gray-500 dark:text-text-muted">🥩 Proteínas</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatValue(analysisResult.totalProtein)}g</p>
                                    </div>
                                    <div className="bg-white dark:bg-bg-primary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                        <p className="text-xs text-gray-500 dark:text-text-muted">🍞 Carbos</p>
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatValue(analysisResult.totalCarbs)}g</p>
                                    </div>
                                    <div className="bg-white dark:bg-bg-primary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                        <p className="text-xs text-gray-500 dark:text-text-muted">🥑 Gorduras</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatValue(analysisResult.totalFats)}g</p>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Foods */}
                            {analysisResult.foods?.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-sm text-gray-700 dark:text-text-primary">🍴 Alimentos Identificados</h3>
                                    {analysisResult.foods.map((food, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="flex items-center justify-between bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{food.name}</p>
                                                <p className="text-gray-500 dark:text-text-muted text-xs">{food.portion}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{formatValue(food.calories)} kcal</p>
                                                <p className="text-gray-400 dark:text-text-disabled text-xs">P:{formatValue(food.protein)}g C:{formatValue(food.carbs)}g G:{formatValue(food.fats)}g</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Health Score & Tips */}
                            {analysisResult.healthScore && (
                                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-cyan-800 text-sm">Nota de Saúde</p>
                                        {analysisResult.tips && <p className="text-cyan-700 text-xs mt-1">{analysisResult.tips}</p>}
                                    </div>
                                    <div className="text-3xl font-bold text-cyan-600">{analysisResult.healthScore}/10</div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 border-t border-gray-200 dark:border-border-subtle pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">📚 Histórico de Refeições</h3>
                        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-border-subtle p-1 bg-gray-50 dark:bg-bg-secondary">
                            <button
                                onClick={() => applyQuickRange('today')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${quickRange === 'today' ? 'bg-cyan-600 text-white' : 'text-gray-600 dark:text-text-secondary'}`}
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => applyQuickRange('7d')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${quickRange === '7d' ? 'bg-cyan-600 text-white' : 'text-gray-600 dark:text-text-secondary'}`}
                            >
                                7 dias
                            </button>
                            <button
                                onClick={() => applyQuickRange('30d')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${quickRange === '30d' ? 'bg-cyan-600 text-white' : 'text-gray-600 dark:text-text-secondary'}`}
                            >
                                30 dias
                            </button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        <label className="text-xs text-gray-600 dark:text-text-secondary">
                            <span className="inline-flex items-center gap-1 mb-1 font-semibold"><CalendarDays className="w-3.5 h-3.5" /> Data inicial</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setQuickRange('custom');
                                    setStartDate(e.target.value);
                                }}
                                className="w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="text-xs text-gray-600 dark:text-text-secondary">
                            <span className="inline-flex items-center gap-1 mb-1 font-semibold"><CalendarDays className="w-3.5 h-3.5" /> Data final</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setQuickRange('custom');
                                    setEndDate(e.target.value);
                                }}
                                className="w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                            />
                        </label>
                    </div>

                    {historyError && (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {historyError}
                        </div>
                    )}

                    {historyLoading ? (
                        <div className="rounded-xl border border-gray-200 dark:border-border-subtle p-4 text-sm text-gray-500 dark:text-text-muted">
                            Carregando histórico...
                        </div>
                    ) : historyMeals.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-border-subtle p-6 text-sm text-gray-500 dark:text-text-muted text-center">
                            Nenhuma refeição encontrada no período selecionado.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historyMeals.map((meal) => (
                                <button
                                    key={meal.id}
                                    onClick={() => openMealDetail(meal)}
                                    className="w-full text-left rounded-xl border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-secondary p-4 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{meal.meal_type || 'Refeição'}</p>
                                            <p className="text-xs text-gray-500 dark:text-text-muted">{new Date(meal.created_at).toLocaleString('pt-BR')}</p>
                                            <p className="text-sm text-gray-600 dark:text-text-secondary mt-1">
                                                {meal.description || meal.analysis?.description || 'Sem descrição'}
                                            </p>
                                        </div>
                                    <div className="text-right">
                                            <p className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{formatValue(meal.calories || meal.analysis?.totalCalories || 0)} kcal</p>
                                            <p className="text-[11px] text-gray-500 dark:text-text-muted">
                                                P:{formatValue(meal.protein || meal.analysis?.totalProtein || 0)}g C:{formatValue(meal.carbs || meal.analysis?.totalCarbs || 0)}g G:{formatValue(meal.fats || meal.analysis?.totalFats || 0)}g
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                            <Eye className="w-3 h-3" /> Detalhes
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openMealDetail(meal);
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-bg-tertiary dark:text-text-secondary"
                                        >
                                            <Pencil className="w-3 h-3" /> Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await duplicateMeal(meal);
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-bg-tertiary dark:text-text-secondary"
                                        >
                                            <Copy className="w-3 h-3" /> Duplicar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await removeMeal(meal.id);
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                        >
                                            <Trash2 className="w-3 h-3" /> Excluir
                                        </button>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedHistoryMeal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center"
                        onClick={closeMealDetail}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-elevated p-5 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Editar refeição</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <label className="text-xs text-gray-600 dark:text-text-secondary">
                                    Tipo de refeição
                                    <select
                                        value={editForm.meal_type}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, meal_type: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                                    >
                                        {MEAL_TYPES.map((meal) => (
                                            <option key={meal.id} value={meal.label}>{meal.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-xs text-gray-600 dark:text-text-secondary">
                                    Calorias
                                    <input
                                        type="number"
                                        value={editForm.calories}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, calories: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="text-xs text-gray-600 dark:text-text-secondary">
                                    Proteínas (g)
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editForm.protein}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, protein: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="text-xs text-gray-600 dark:text-text-secondary">
                                    Carboidratos (g)
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editForm.carbs}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, carbs: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="text-xs text-gray-600 dark:text-text-secondary sm:col-span-2">
                                    Gorduras (g)
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editForm.fats}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, fats: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="text-xs text-gray-600 dark:text-text-secondary sm:col-span-2">
                                    Descrição
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-border-subtle bg-white dark:bg-bg-primary px-3 py-2 text-sm min-h-[90px]"
                                    />
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={saveMealEdit}
                                    disabled={isSavingEdit}
                                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-500 disabled:opacity-60"
                                >
                                    {isSavingEdit ? 'Salvando...' : 'Salvar edição'}
                                </button>
                                <button
                                    onClick={runMealReanalysis}
                                    disabled={isReanalyzingEdit || !editForm.description.trim()}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {isReanalyzingEdit ? 'Reanalisando...' : 'Reanalisar com IA'}
                                </button>
                                <button
                                    onClick={() => duplicateMeal(selectedHistoryMeal)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-border-subtle text-sm font-semibold"
                                >
                                    Duplicar
                                </button>
                                <button
                                    onClick={() => removeMeal(selectedHistoryMeal.id)}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-500"
                                >
                                    Excluir
                                </button>
                                <button
                                    onClick={closeMealDetail}
                                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-border-subtle text-sm font-semibold"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Food;
