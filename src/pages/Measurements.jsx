import React, { useState, useEffect } from 'react';
import { Ruler, Scale, CheckCircle, Calendar, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeMeasurements, getMeasurementHistory } from '../services/aiService';
import AIAnalysisPage, { AIAnalysisResults } from '../components/common/AIAnalysisPage';
import { motion, AnimatePresence } from 'framer-motion';

const Measurements = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [expandedExamId, setExpandedExamId] = useState(null);
    const { addXP } = useGamification();

    useEffect(() => {
        loadHistory();
    }, [analysisResult]);

    const loadHistory = async () => {
        try {
            const data = await getMeasurementHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFile(file.name);
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeMeasurements(file);
            setAnalysisResult(result.analysis);
            addXP('UPLOAD_EXAM');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar as medidas. Tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        setError(null);
    };

    const toggleExamDetails = (id) => {
        setExpandedExamId(expandedExamId === id ? null : id);
    };

    const getBMIColor = (value) => {
        if (value < 18.5) return 'text-yellow-600';
        if (value < 25) return 'text-green-600';
        if (value < 30) return 'text-orange-600';
        return 'text-red-600';
    };

    // Sub-componente para exibir os detalhes da análise (reutilizado no histórico)
    const MeasurementDetailView = ({ analysis }) => {
        const measurements = analysis?.measurements || {};

        return (
            <AIAnalysisResults show={true}>
                {/* IMC Card */}
                {analysis?.bmi && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-border-subtle rounded-xl p-5 shadow-sm mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-bold text-blue-800 dark:text-blue-400">IMC</h3>
                                </div>
                                <p className={`text-3xl font-bold ${getBMIColor(analysis.bmi.value)}`}>
                                    {analysis.bmi.value}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700 dark:text-text-primary">{analysis.bmi.classification}</p>
                                {analysis.waistHipRatio && (
                                    <p className="text-xs text-gray-500 dark:text-text-muted mt-1">
                                        Cintura/Quadril: {analysis.waistHipRatio.value} ({analysis.waistHipRatio.classification})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Measurements Grid */}
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-3">📐 Medidas Extraídas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {(() => {
                        const getFriendlyLabel = (k) => {
                            const metadata = {
                                weight: '⚖️ Peso', height: '📏 Altura', waist: '🔵 Cintura',
                                hip: '🟢 Quadril', chest: '🟡 Tórax', bodyFat: '🔥 % Gordura',
                                abdomen: '🔴 Abdominal', muscleMass: '💪 Massa Muscular',
                                visceralFat: '⚠️ Gordura Visceral'
                            };
                            if (metadata[k]) return metadata[k];

                            let label = k.replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .replace('Arm', 'Braço')
                                .replace('Thigh', 'Coxa')
                                .replace('Calf', 'Panturrilha')
                                .replace('Forearm', 'Antebraço')
                                .replace('Right', 'Direito')
                                .replace('Left', 'Esquerdo')
                                .replace('Mass', 'Massa')
                                .replace('Fat', 'Gordura')
                                .replace('BasalMetabolicRate', 'Taxa Metabólica Basal')
                                .trim();

                            if (label.includes('Coxa')) {
                                label = label.replace('Direito', 'Direita').replace('Esquerdo', 'Esquerda');
                            }
                            return label;
                        };

                        return Object.entries(measurements)
                            .filter(([_, data]) => data && data.value)
                            .sort(([keyA], [keyB]) => {
                                const labelA = getFriendlyLabel(keyA).replace(/[^\w\s]/gi, '').trim();
                                const labelB = getFriendlyLabel(keyB).replace(/[^\w\s]/gi, '').trim();
                                return labelA.localeCompare(labelB);
                            })
                            .map(([key, data], idx) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-3 text-center"
                                >
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-text-muted mb-1 uppercase tracking-tighter">
                                        {getFriendlyLabel(key)}
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-text-primary">{data.value}</p>
                                    <p className="text-xs text-gray-400 dark:text-text-muted">{data.unit}</p>
                                </motion.div>
                            ));
                    })()}
                </div>

                {/* Summary */}
                {analysis?.summary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-border-subtle rounded-xl p-4">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">📝 Análise</h3>
                        <p className="text-blue-700 dark:text-text-secondary text-sm">{analysis.summary}</p>
                    </div>
                )}
            </AIAnalysisResults>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
                <AIAnalysisPage.Header
                    icon={Ruler}
                    title="Análise de Medidas Corporais"
                    description="Faça upload das suas medidas corporais e receba uma análise personalizada por IA 🧠"
                    gradient="from-blue-500 to-cyan-500"
                />

                <AIAnalysisPage.UploadZone
                    onUpload={handleFileUpload}
                    uploadedFile={uploadedFile}
                    accept=".pdf"
                />

                <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message="IA Analisando Medidas..." />
                <AIAnalysisPage.Error error={error} onReset={resetUpload} />

                {/* Current Analysis Result */}
                {analysisResult && (
                    <div className="mt-8">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-bold text-green-800 dark:text-green-400 text-sm">Análise Completa! +30 XP</span>
                            </div>
                            <button onClick={resetUpload} className="text-green-700 dark:text-green-400 text-xs font-medium underline hover:text-green-900 dark:hover:text-green-300">
                                Enviar novas medidas
                            </button>
                        </div>
                        <MeasurementDetailView analysis={analysisResult} />
                    </div>
                )}

                <AIAnalysisPage.Disclaimer />
            </AIAnalysisPage>

            {/* History Section */}
            <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
                <div className="flex items-center space-x-2 mb-6 ml-1">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-text-secondary">Histórico de Importações</h3>
                </div>

                {isLoadingHistory ? (
                    <div className="text-center py-8 text-gray-400">Carregando histórico...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-bg-elevated rounded-2xl border border-dashed border-gray-200 dark:border-border-subtle">
                        <p className="text-gray-400 text-sm">Nenhuma medição importada ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((exam) => (
                            <motion.div
                                key={exam.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-bg-elevated rounded-2xl border border-gray-200 dark:border-border-subtle overflow-hidden shadow-sm"
                            >
                                <div
                                    onClick={() => toggleExamDetails(exam.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-bg-secondary transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Ruler className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex flex-col items-start gap-1 mb-1">
                                                <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm truncate w-full pr-4" title={exam.file_name}>
                                                    {exam.file_name}
                                                </h4>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase font-bold">
                                                    Analisado
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-text-muted mt-1 space-x-3">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(exam.created_at).toLocaleDateString()}
                                                </span>
                                                {exam.analysis?.bmi && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium">IMC {exam.analysis.bmi.value}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedExamId === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedExamId === exam.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100 dark:border-border-subtle bg-gray-50/50 dark:bg-bg-secondary/30"
                                        >
                                            <div className="p-4 md:p-6">
                                                <MeasurementDetailView analysis={exam.analysis} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Measurements;
