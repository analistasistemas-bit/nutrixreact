import React, { useState, useEffect } from 'react';
import { Ruler, Scale, CheckCircle, Calendar, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeMeasurements, getMeasurementHistory } from '../services/aiService';
import AIAnalysisPage, { AIAnalysisResults } from '../components/common/AIAnalysisPage';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { formatPtBrNumber, parsePtBrNumber } from '../lib/numberLocale';
import { buildImportStageNotification, pushNotification } from '../services/notificationService';

const Measurements = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
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
        setImportProgress({ stage: 'queued', percent: 0 });
        pushNotification(buildImportStageNotification('measurements', 'queued'));

        try {
            const result = await analyzeMeasurements(file, {
                onProgress: (progress) => {
                    setImportProgress(progress);
                },
            });
            setAnalysisResult(result.analysis);
            pushNotification(buildImportStageNotification('measurements', 'completed'));
            addXP('UPLOAD_EXAM');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar as medidas. Tente novamente.');
            pushNotification(buildImportStageNotification('measurements', 'failed'));
        } finally {
            setIsAnalyzing(false);
            setImportProgress(null);
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

    const getImportStatusBadge = (status) => {
        if (status === 'failed') {
            return { label: 'Falhou', cls: 'bg-red-100 text-red-700' };
        }
        if (status === 'analyzing') {
            return { label: 'Analisando', cls: 'bg-amber-100 text-amber-700' };
        }
        return { label: 'Analisado', cls: 'bg-green-100 text-green-700' };
    };

    const getLoadingMessage = () => {
        const stageMap = {
            queued: 'Na fila',
            extract: 'Extraindo arquivo',
            clean: 'Limpando markdown',
            llm: 'Extraindo medidas com IA',
            save: 'Salvando resultado',
            completed: 'Concluído',
        };
        if (!importProgress) return 'IA Analisando Medidas...';
        const label = stageMap[importProgress.stage] || 'Processando';
        const percent = Number(importProgress.percent || 0);
        return `${label} (${percent}%)`;
    };

    // Sub-componente para exibir os detalhes da análise (reutilizado no histórico)
    const MeasurementDetailView = ({ analysis }) => {
        // Se a IA não retornar a chave 'measurements', tentamos usar o próprio objeto 'analysis' (fallback para objetos planos)
        // Mas ignoramos chaves padrão como 'summary', 'recommendations', 'bmi'
        const baseData = analysis?.measurements || analysis || {};
        const ptBrCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

        // Helper recursivo para buscar valor em estruturas aninhadas ou strings com unidade
        const findValue = (obj, targetKey) => {
            if (!obj || typeof obj !== 'object') return undefined;

            let item = obj[targetKey];

            // Se o item for uma string (ex: "94.2 kg"), tentamos extrair o número e a unidade
            if (typeof item === 'string') {
                const match = item.match(/([\d.,]+)\s*(.*)/);
                if (match) {
                    return {
                        value: parsePtBrNumber(match[1]),
                        unit: match[2].trim() || ''
                    };
                }
            }

            if (item !== undefined && item !== null) {
                if (typeof item === 'object' && item.value !== undefined) return item;
                if (typeof item === 'number') return { value: item, unit: '' };
            }

            // Busca recursiva se não achou no nível atual
            for (const k in obj) {
                if (typeof obj[k] === 'object' && obj[k] !== null && k !== 'bmi') {
                    const found = findValue(obj[k], targetKey);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const getFriendlyLabel = (k) => {
            const metadata = {
                weight: '⚖️ Peso',
                height: '📏 Altura',
                waist: '🔵 Cintura',
                hip: '🟢 Quadril',
                chest: '🟡 Tórax',
                bodyFat: '🔥 % Gordura',
                bodyFatPercentage: '🔥 % Gordura',
                abdomen: '🔴 Abdominal',
                muscleMass: '💪 Massa Muscular',
                visceralFat: '⚠️ Gordura Visceral',
                basalMetabolicRate: '⚡ Taxa Metabólica Basal',
                basalMetabolism: '⚡ Taxa Metabólica Basal',
                fatMass: '🥩 Massa Gorda',
                leanMass: '💎 Massa Magra',
                leanBodyMass: '💎 Massa Magra',
                totalBodyWater: '💧 Água corporal',
                metabolicAge: '🕰️ Idade Metabólica',
                gripStrength: '✊ Força de Preensão',
                flexibility: '🧘 Flexibilidade',
                vo2Max: '🫁 VO2 Máximo',
                bloodPressure: '🩺 Pressão Arterial',
                restingHeartRate: '❤️ FC Repouso',
                waistCircumference: '🔵 Cintura'
            };
            if (metadata[k]) return metadata[k];

            let label = k.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace('Arm', 'Braço')
                .replace('Thigh', 'Coxa')
                .replace('Calf', 'Panturrilha')
                .replace('Forearm', 'Antebraço')
                .replace('Leg', 'Perna')
                .replace('Right', 'Direito')
                .replace('Left', 'Esquerdo')
                .replace('Mass', 'Massa')
                .replace('Fat', 'Gordura')
                .replace('Torax', 'Tórax')
                .trim();

            if (label.includes('Coxa') || label.includes('Panturrilha')) {
                label = label.replace('Direito', 'Direita').replace('Esquerdo', 'Esquerda');
            }

            // Correções específicas para ordem natural em PT-BR
            label = label.replace('Gordura Massa', 'Massa Gorda')
                .replace('Lean Massa', 'Massa Magra')
                .replace('Muscle Massa', 'Massa Muscular');

            return label;
        };

        // Coletar todas as chaves únicas (filtrando as que não são medidas)
        const allKeys = Object.keys(baseData).filter(k =>
            !['summary', 'recommendations', 'bmi', 'goal', 'previousInjuries', 'trainingDuration', 'trainingFrequency', 'sportsHistory', 'performanceIndicators'].includes(k)
        );
        const entries = allKeys
            .map(key => ({ key, data: findValue(baseData, key) }))
            .filter(({ data }) => data && data.value !== null && data.value !== undefined)
            .sort((a, b) => {
                const la = a?.data?.label || getFriendlyLabel(a.key);
                const lb = b?.data?.label || getFriendlyLabel(b.key);
                return ptBrCollator.compare(la, lb);
            });

        const groupedEntries = entries.reduce((acc, entry) => {
            const unit = String(entry?.data?.unit || '')
                .toLowerCase()
                .replace(/[()\s]/g, '');
            if (unit === 'cm') {
                acc.circunferencias.push(entry);
            } else if (unit === 'mm') {
                acc.dobrasCutaneas.push(entry);
            } else {
                acc.geral.push(entry);
            }
            return acc;
        }, {
            circunferencias: [],
            dobrasCutaneas: [],
            geral: [],
        });

        // Helper para extrair valor numérico do IMC caso venha como string
        const parseBMI = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const match = val.match(/([\d.,]+)/);
                return match ? parsePtBrNumber(match[1]) : null;
            }
            if (val && typeof val === 'object' && val.value) return val.value;
            return null;
        };

        const bmiValue = parseBMI(analysis?.bmi);

        return (
            <AIAnalysisResults show={true}>
                {/* IMC Card */}
                {bmiValue && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-border-subtle rounded-xl p-5 shadow-sm mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm uppercase">IMC</h3>
                                </div>
                                <p className={`text-4xl font-black ${getBMIColor(bmiValue)}`}>
                                    {formatPtBrNumber(bmiValue)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-700 dark:text-text-primary uppercase tracking-wider">
                                    {analysis?.bmi?.classification || (bmiValue < 25 ? 'Normal' : bmiValue < 30 ? 'Sobrepeso' : 'Obesidade')}
                                </p>
                                {analysis.waistHipRatio && (
                                    <p className="text-[10px] text-gray-500 dark:text-text-muted mt-1 font-medium">
                                        Cintura/Quadril: {typeof analysis.waistHipRatio === 'string' ? analysis.waistHipRatio : formatPtBrNumber(analysis.waistHipRatio.value)}
                                        {analysis.waistHipRatio.classification ? ` (${analysis.waistHipRatio.classification})` : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Measurements Grid */}
                <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-4 h-4 text-blue-500" />
                    <h3 className="font-black text-xs uppercase tracking-widest text-blue-700 dark:text-blue-400">Medidas Extraídas</h3>
                </div>

                {[
                    { id: 'circunferencias', title: 'Circunferências', items: groupedEntries.circunferencias },
                    { id: 'dobras-cutaneas', title: 'Dobras Cutâneas', items: groupedEntries.dobrasCutaneas },
                    { id: 'geral', title: 'Geral', items: groupedEntries.geral },
                ].filter(section => section.items.length > 0).map(section => (
                    <div key={section.id} className="mb-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-text-muted mb-3">
                            {section.title}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {section.items.map(({ key, data }, idx) => (
                                <motion.div
                                    key={`${section.id}-${key}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="bg-white dark:bg-bg-elevated border border-gray-100 dark:border-border-subtle rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                                >
                                    <p className="text-[9px] font-black text-gray-400 dark:text-text-muted mb-2 uppercase tracking-widest">
                                        {data?.label || getFriendlyLabel(key)}
                                    </p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-text-primary">
                                        {typeof data.value === 'number' ? formatPtBrNumber(data.value) : data.value}
                                    </p>
                                    <p className="text-[10px] font-bold text-blue-500/70 dark:text-blue-400/50 mt-1 uppercase">
                                        {data.unit}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}

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

                <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message={getLoadingMessage()} />
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
                        {history.map((exam) => {
                            const badge = getImportStatusBadge(exam.status);
                            return (
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
                                                    <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold ${badge.cls}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-text-muted mt-1 space-x-3">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    {exam.analysis?.bmi && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium">IMC {formatPtBrNumber(exam.analysis.bmi.value)}</span>
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
                                                    {exam.status === 'completed' ? (
                                                        <MeasurementDetailView analysis={exam.analysis} />
                                                    ) : (
                                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                            {exam.analysis?.error || 'Não foi possível concluir a análise deste arquivo.'}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Measurements;
