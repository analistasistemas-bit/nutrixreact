import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, ChevronDown, ChevronUp, FileText, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { analyzeExam, getExamHistory } from '../services/aiService';
import AIAnalysisPage, { AIAnalysisResults } from '../components/common/AIAnalysisPage';
import { buildImportStageNotification, pushNotification } from '../services/notificationService';
import { formatPtBrNumber } from '../lib/numberLocale';
import Badge from '../components/common/Badge';

// ─── Helpers ────────────────────────────────────────────────────────────────

const isNew = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // menos de 7 dias
};

const groupByDate = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const monthAgo = today - 30 * 86400000;

    const groups = { Hoje: [], Ontem: [], 'Esta semana': [], 'Este mês': [], Anteriores: [] };

    items.forEach((item) => {
        const t = new Date(item.created_at).getTime();
        if (t >= today)           groups['Hoje'].push(item);
        else if (t >= yesterday)  groups['Ontem'].push(item);
        else if (t >= weekAgo)    groups['Esta semana'].push(item);
        else if (t >= monthAgo)   groups['Este mês'].push(item);
        else                      groups['Anteriores'].push(item);
    });

    return Object.entries(groups).filter(([, v]) => v.length > 0);
};

const getDelta = (currentBiomarker, previousAnalysis) => {
    if (!previousAnalysis?.biomarkers) return null;
    const prev = previousAnalysis.biomarkers.find(
        (b) => b.name?.toLowerCase() === currentBiomarker.name?.toLowerCase()
    );
    if (!prev || prev.value === null || prev.value === undefined) return null;
    const diff = Number(currentBiomarker.value) - Number(prev.value);
    if (Math.abs(diff) < 0.001) return null;
    return { diff, up: diff > 0 };
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    if (status === 'failed')    return <Badge variant="error">Falhou</Badge>;
    if (status === 'analyzing') return <Badge variant="warning">Analisando</Badge>;
    return <Badge variant="success">Analisado</Badge>;
};

const BiomarkerStatusColor = (status) => {
    if (status === 'low' || status === 'high')
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
};

const BiomarkerStatusLabel = (status) => {
    if (status === 'low')  return '⚠️ Baixo';
    if (status === 'high') return '⚠️ Alto';
    return '✅ Normal';
};

const DeltaIndicator = ({ delta }) => {
    if (!delta) return <Minus className="w-3 h-3 text-zinc-400" />;
    return delta.up
        ? <span className="flex items-center gap-0.5 text-red-500 text-[10px] font-bold"><TrendingUp className="w-3 h-3" />{formatPtBrNumber(Math.abs(delta.diff))}</span>
        : <span className="flex items-center gap-0.5 text-green-500 text-[10px] font-bold"><TrendingDown className="w-3 h-3" />{formatPtBrNumber(Math.abs(delta.diff))}</span>;
};

// ─── Componente principal ─────────────────────────────────────────────────────

const Labs = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [expandedExamId, setExpandedExamId] = useState(null);
    const { addXP } = useGamification();

    useEffect(() => { loadHistory(); }, [analysisResult]);

    const loadHistory = async () => {
        try {
            const data = await getExamHistory();
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
        pushNotification(buildImportStageNotification('exams', 'queued'));

        try {
            const result = await analyzeExam(file, {
                onProgress: (progress) => setImportProgress(progress),
            });
            setAnalysisResult(result.analysis);
            pushNotification(buildImportStageNotification('exams', 'completed'));
            addXP('UPLOAD_EXAM');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar o exame. Tente novamente.');
            pushNotification(buildImportStageNotification('exams', 'failed'));
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

    const getLoadingMessage = () => {
        const stageMap = {
            queued:    'Na fila',
            extract:   'Extraindo arquivo',
            clean:     'Limpando markdown',
            llm:       'Extraindo indicadores com IA',
            save:      'Salvando resultado',
            completed: 'Concluído',
        };
        if (!importProgress) return 'IA Analisando seu Exame...';
        const label = stageMap[importProgress.stage] || 'Processando';
        return `${label} (${Number(importProgress.percent || 0)}%)`;
    };

    // Detalhes de um exame — com delta em relação ao exame anterior
    const AnalysisDetailView = ({ analysis, previousAnalysis }) => {
        const ptBrCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
        const biomarkers = [...(analysis?.biomarkers || [])].sort((a, b) =>
            ptBrCollator.compare(a?.name || '', b?.name || '')
        );

        return (
            <AIAnalysisResults show={true}>
                {analysis?.summary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">📝 Resumo</h3>
                        <p className="text-blue-700 dark:text-text-secondary text-sm">{analysis.summary}</p>
                    </div>
                )}

                <h3 className="font-bold text-xl text-cyan-700 dark:text-cyan-400 mt-4">
                    📊 Biomarcadores
                    {previousAnalysis && (
                        <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-text-muted">
                            (▲▼ vs. exame anterior)
                        </span>
                    )}
                </h3>

                <div className="space-y-3">
                    {biomarkers.map((biomarker, idx) => {
                        const delta = getDelta(biomarker, previousAnalysis);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-4 bg-white dark:bg-bg-secondary rounded-xl border border-gray-200 dark:border-border-subtle hover:shadow-sm transition-shadow"
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base text-gray-900 dark:text-text-primary">{biomarker.name}</h4>
                                    <p className="text-gray-600 dark:text-text-muted text-sm">
                                        <span className="font-medium">{formatPtBrNumber(biomarker.value)} {biomarker.unit}</span>
                                        <span className="mx-2 text-gray-300 dark:text-border-subtle">|</span>
                                        <span className="text-xs">Ref: {biomarker.reference}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    {previousAnalysis && <DeltaIndicator delta={delta} />}
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${BiomarkerStatusColor(biomarker.status)}`}>
                                        {BiomarkerStatusLabel(biomarker.status)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {analysis?.recommendations?.length > 0 && (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-border-subtle rounded-xl p-4 mt-4">
                        <h3 className="font-bold text-cyan-800 dark:text-cyan-400 text-sm mb-2">💡 Recomendações</h3>
                        <ul className="space-y-1">
                            {analysis.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm text-cyan-700 dark:text-text-secondary">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </AIAnalysisResults>
        );
    };

    const groupedHistory = groupByDate(history);

    return (
        <div className="space-y-8 pb-20">
            {/* Upload Section */}
            <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
                <AIAnalysisPage.Header
                    icon={CheckCircle}
                    title="Análise de Exames de Sangue"
                    description="Faça upload do seu exame e receba uma análise personalizada por IA 🧠"
                    gradient="from-blue-500 to-cyan-500"
                />
                <AIAnalysisPage.UploadZone onUpload={handleFileUpload} uploadedFile={uploadedFile} accept=".pdf" />
                <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message={getLoadingMessage()} />
                <AIAnalysisPage.Error error={error} onReset={resetUpload} />

                {analysisResult && (
                    <div className="mt-8">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-bold text-green-800 dark:text-green-400 text-sm">Análise Completa! +50 XP</span>
                            </div>
                            <button
                                onClick={resetUpload}
                                className="text-green-700 dark:text-green-400 text-xs font-medium underline hover:text-green-900 dark:hover:text-green-300"
                            >
                                Enviar novo exame
                            </button>
                        </div>
                        <AnalysisDetailView analysis={analysisResult} previousAnalysis={history[0]?.analysis} />
                    </div>
                )}

                <AIAnalysisPage.Disclaimer />
            </AIAnalysisPage>

            {/* History Section — agrupado por data */}
            <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
                <div className="flex items-center space-x-2 mb-6">
                    <Clock className="w-5 h-5 text-zinc-400 dark:text-text-muted" />
                    <h3 className="text-lg font-bold text-zinc-700 dark:text-text-secondary">Histórico de Importações</h3>
                    {history.length > 0 && (
                        <span className="ml-auto text-xs text-zinc-400 dark:text-text-muted">{history.length} exame{history.length > 1 ? 's' : ''}</span>
                    )}
                </div>

                {isLoadingHistory ? (
                    <div className="text-center py-8 text-zinc-400 dark:text-text-muted">Carregando histórico...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-50 dark:bg-bg-elevated rounded-2xl border border-dashed border-zinc-200 dark:border-border-subtle">
                        <p className="text-zinc-400 dark:text-text-muted text-sm">Nenhum exame importado ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedHistory.map(([groupLabel, exams]) => (
                            <div key={groupLabel}>
                                {/* Separador de grupo (timeline label) */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-text-muted whitespace-nowrap">
                                        {groupLabel}
                                    </span>
                                    <div className="flex-1 h-px bg-zinc-200 dark:bg-border-subtle" />
                                </div>

                                <div className="space-y-3">
                                    {exams.map((exam, examIdx) => {
                                        // O exame "anterior" no histórico geral (não no grupo)
                                        const globalIdx = history.findIndex((h) => h.id === exam.id);
                                        const previousExam = history[globalIdx + 1] ?? null;

                                        return (
                                            <motion.div
                                                key={exam.id}
                                                layout
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: examIdx * 0.04 }}
                                                className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle overflow-hidden shadow-sm"
                                            >
                                                <div
                                                    onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-bg-secondary transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4 min-w-0">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                                                <h4 className="font-bold text-zinc-900 dark:text-text-primary text-sm truncate" title={exam.file_name}>
                                                                    {exam.file_name}
                                                                </h4>
                                                                <StatusBadge status={exam.status} />
                                                                {isNew(exam.created_at) && <Badge variant="new">Novo</Badge>}
                                                            </div>
                                                            <div className="flex items-center text-xs text-zinc-500 dark:text-text-muted space-x-2">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{new Date(exam.created_at).toLocaleDateString('pt-BR')}</span>
                                                                <span>•</span>
                                                                <span>{exam.analysis?.biomarkers?.length || 0} biomarcadores</span>
                                                                {previousExam && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-cyan-600 dark:text-cyan-400">▲▼ comparação disponível</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-zinc-400 dark:text-text-muted flex-shrink-0 ml-2">
                                                        {expandedExamId === exam.id
                                                            ? <ChevronUp className="w-5 h-5" />
                                                            : <ChevronDown className="w-5 h-5" />}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedExamId === exam.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="border-t border-zinc-100 dark:border-border-subtle bg-zinc-50/50 dark:bg-bg-secondary/30"
                                                        >
                                                            <div className="p-4 md:p-6">
                                                                {exam.status === 'completed' ? (
                                                                    <AnalysisDetailView
                                                                        analysis={exam.analysis}
                                                                        previousAnalysis={previousExam?.analysis}
                                                                    />
                                                                ) : (
                                                                    <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Labs;
