import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Camera, Mic, Scan, Loader2, AlertTriangle, CheckCircle, RefreshCw, UtensilsCrossed, X, MicOff } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeFoodPhoto, analyzeFoodDescription } from '../services/aiService';

const MEAL_TYPES = [
    { id: 'cafe-da-manha', label: 'Café da Manhã', emoji: '🌅' },
    { id: 'almoco', label: 'Almoço', emoji: '☀️' },
    { id: 'lanche', label: 'Lanche', emoji: '🍎' },
    { id: 'jantar', label: 'Jantar', emoji: '🌙' },
];

const Food = () => {
    const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0]);
    const [activeMode, setActiveMode] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [voiceText, setVoiceText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const { addXP } = useGamification();

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

    const submitVoiceText = async () => {
        if (!voiceText.trim()) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await analyzeFoodDescription(voiceText, selectedMeal.label);
            setAnalysisResult(result.analysis);
            addXP('LOG_MEAL');
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message || 'Erro ao analisar a descrição.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ========== MANUAL TEXT ==========
    const [manualText, setManualText] = useState('');
    const handleManualSubmit = async () => {
        if (!manualText.trim()) return;
        setActiveMode('manual');
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeFoodDescription(manualText, selectedMeal.label);
            setAnalysisResult(result.analysis);
            addXP('LOG_MEAL');
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message || 'Erro ao analisar.');
        } finally {
            setIsAnalyzing(false);
        }
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
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <UtensilsCrossed className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🍽️ Registrar Alimentação</h2>
                    <p className="text-gray-600 text-sm">Tire uma foto, use a voz ou descreva o que comeu</p>
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
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                    className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:from-orange-400 hover:to-red-400 transition-all"
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
                        <div className="border border-gray-200 rounded-xl p-4">
                            <h3 className="font-bold text-gray-900 text-sm mb-2">✍️ Ou descreva manualmente:</h3>
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Ex: Arroz integral, frango grelhado, salada e feijão..."
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                                rows={3}
                            />
                            <button
                                onClick={handleManualSubmit}
                                disabled={!manualText.trim()}
                                className="mt-2 w-full py-2 bg-orange-500 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-400 transition-colors"
                            >
                                Analisar com IA 🤖
                            </button>
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
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Texto reconhecido:</p>
                                <p className="font-medium text-gray-900">"{voiceText}"</p>
                                <div className="flex space-x-2 mt-3">
                                    <button onClick={submitVoiceText} className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-400">
                                        Analisar com IA 🤖
                                    </button>
                                    <button onClick={reset} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                                        Cancelar
                                    </button>
                                </div>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center mt-4">
                        <Loader2 className="w-10 h-10 text-orange-600 mx-auto mb-3 animate-spin" />
                        <h3 className="font-bold text-orange-800 text-lg">🤖 IA Analisando {selectedMeal.label}...</h3>
                        <p className="text-orange-700 text-sm mt-1">Identificando alimentos e estimando nutrientes ⚡</p>
                        <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                            <motion.div className="bg-orange-500 h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 6, ease: 'easeOut' }} />
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
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5">
                                <h3 className="font-bold text-orange-800 mb-3">{selectedMeal.emoji} {selectedMeal.label}</h3>
                                {analysisResult.description && (
                                    <p className="text-gray-600 text-sm mb-3">{analysisResult.description}</p>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-xs text-gray-500">🔥 Calorias</p>
                                        <p className="text-2xl font-bold text-gray-900">{analysisResult.totalCalories}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-xs text-gray-500">🥩 Proteínas</p>
                                        <p className="text-2xl font-bold text-red-600">{analysisResult.totalProtein}g</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-xs text-gray-500">🍞 Carbos</p>
                                        <p className="text-2xl font-bold text-amber-600">{analysisResult.totalCarbs}g</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-xs text-gray-500">🥑 Gorduras</p>
                                        <p className="text-2xl font-bold text-green-600">{analysisResult.totalFats}g</p>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Foods */}
                            {analysisResult.foods?.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-sm text-gray-700">🍴 Alimentos Identificados</h3>
                                    {analysisResult.foods.map((food, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                                                <p className="text-gray-500 text-xs">{food.portion}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-orange-600 text-sm">{food.calories} kcal</p>
                                                <p className="text-gray-400 text-xs">P:{food.protein}g C:{food.carbs}g G:{food.fats}g</p>
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
            </div>
        </motion.div>
    );
};

export default Food;
