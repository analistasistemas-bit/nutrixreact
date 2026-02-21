import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ClipboardList, UtensilsCrossed, CheckCircle, Download, Database, Clock, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeNutritionPlan, getNutritionPlanHistory, importGeneratedPlanToNutritionPlan } from '../services/aiService';
import AIAnalysisPage from '../components/common/AIAnalysisPage';
import AnalysisRenderBoundary from '../components/common/AnalysisRenderBoundary';
import CreatePlanWizard from '../components/dashboard/CreatePlanWizard';
import { buildImportStageNotification, pushNotification } from '../services/notificationService';
import { formatPtBrNumber } from '../lib/numberLocale';

const SafeMealsList = ({ meals, formatValue }) => {
    if (!Array.isArray(meals) || meals.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-lg text-cyan-700 dark:text-cyan-300">🍽️ Refeições do Plano</h3>
            {meals.map((meal, idx) => {
                if (!meal || typeof meal !== 'object') {
                    return (
                        <div
                            key={idx}
                            className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-amber-800 dark:text-amber-300 text-sm"
                        >
                            Não foi possível exibir uma refeição deste plano por inconsistência de formato.
                        </div>
                    );
                }

                const ingredients = Array.isArray(meal.ingredients)
                    ? meal.ingredients
                    : (typeof meal.ingredients === 'string' ? [meal.ingredients] : []);

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <UtensilsCrossed className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <h4 className="font-bold text-gray-900 dark:text-text-primary">
                                    {meal.time || 'Refeição'} — {meal.name || 'Opção sugerida'}
                                </h4>
                            </div>
                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                {formatValue(meal.calories)} kcal
                            </span>
                        </div>

                        {ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {ingredients.map((ing, i) => (
                                    <span key={i} className="bg-white dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle text-gray-600 dark:text-text-secondary text-xs px-2 py-1 rounded-lg">
                                        {typeof ing === 'string' ? ing : String(ing)}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-text-muted">
                            <span>P: {formatValue(meal.protein)}g</span>
                            <span>C: {formatValue(meal.carbs)}g</span>
                            <span>G: {formatValue(meal.fats)}g</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const NutritionPlan = () => {
    const { addXP } = useGamification();

    const [mode, setMode] = useState('upload'); // 'upload' or 'wizard'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisSource, setAnalysisSource] = useState(null); // 'upload' | 'ai'
    const [generatedPlanId, setGeneratedPlanId] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImportingPlan, setIsImportingPlan] = useState(false);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const historySectionRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getNutritionPlanHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to load nutrition plan history:', err);
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
        pushNotification(buildImportStageNotification('plans', 'queued'));

        try {
            const result = await analyzeNutritionPlan(file, {
                onProgress: (progress) => {
                    setImportProgress(progress);
                },
            });
            setGeneratedPlanId(result.id || null);
            setAnalysisResult(result.analysis);
            setAnalysisSource('upload');
            setActionMessage(null);
            loadHistory();
            pushNotification(buildImportStageNotification('plans', 'completed'));
            addXP('UPLOAD_PLAN');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar o plano. Tente novamente.');
            pushNotification(buildImportStageNotification('plans', 'failed'));
        } finally {
            setIsAnalyzing(false);
            setImportProgress(null);
        }
    };

    const handleWizardGenerated = (result) => {
        setGeneratedPlanId(result?.id || null);
        setAnalysisResult(result?.analysis || null);
        setAnalysisSource('ai');
        setActionMessage(null);
        pushNotification(buildImportStageNotification('plans', 'completed'));
        addXP('AI_PLAN_GENERATED');
        loadHistory();
        setMode('upload');
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        setAnalysisSource(null);
        setGeneratedPlanId(null);
        setActionMessage(null);
        setError(null);
        setMode('upload');
    };

    const openPlanPdfPrint = ({ plan, planId = null }) => {
        if (!plan) return;

        const meals = Array.isArray(plan.meals) ? plan.meals : [];
        const suggestions = Array.isArray(plan.suggestions) ? plan.suggestions : [];
        const macros = plan.dailyMacros || {};
        const currentDate = new Date().toLocaleDateString('pt-BR');

        const mealsHtml = meals.map((meal) => {
            const ingredients = Array.isArray(meal?.ingredients) ? meal.ingredients : [];
            const ingredientsHtml = ingredients.map((ing) => `<li>${escapeHtml(ing)}</li>`).join('');
            return `
                <section style="margin-bottom:14px;padding:12px;border:1px solid #dbeafe;border-radius:8px;">
                    <h3 style="margin:0 0 6px 0;font-size:16px;">${escapeHtml(meal?.time || 'Refeição')} - ${escapeHtml(meal?.name || 'Opção')}</h3>
                    <p style="margin:0 0 6px 0;font-size:13px;">${escapeHtml(formatValue(meal?.calories))} kcal | P: ${escapeHtml(formatValue(meal?.protein))}g | C: ${escapeHtml(formatValue(meal?.carbs))}g | G: ${escapeHtml(formatValue(meal?.fats))}g</p>
                    ${ingredientsHtml ? `<ul style="margin:0;padding-left:18px;font-size:13px;">${ingredientsHtml}</ul>` : ''}
                </section>
            `;
        }).join('');

        const suggestionsHtml = suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

        const html = `
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Plano Alimentar Nutrixo</title>
                </head>
                <body style="font-family: Arial, sans-serif; color: #111; padding: 24px;">
                    <h1 style="margin:0 0 8px 0;">Plano Alimentar Inteligente</h1>
                    <p style="margin:0 0 12px 0; color:#444;">Gerado em ${escapeHtml(currentDate)}${planId ? ` • ID: ${escapeHtml(planId)}` : ''}</p>
                    <h2 style="margin:12px 0 6px 0;">Macros Diários</h2>
                    <p style="margin:0 0 12px 0;">
                        Calorias: ${escapeHtml(formatValue(macros.calories))} kcal |
                        Proteínas: ${escapeHtml(formatValue(macros.protein))}g |
                        Carboidratos: ${escapeHtml(formatValue(macros.carbs))}g |
                        Gorduras: ${escapeHtml(formatValue(macros.fats))}g
                    </p>
                    <h2 style="margin:12px 0 8px 0;">Refeições</h2>
                    ${mealsHtml || '<p>Nenhuma refeição disponível.</p>'}
                    ${plan?.summary ? `<h2 style="margin:12px 0 6px 0;">Resumo</h2><p style="margin:0 0 12px 0;line-height:1.4;">${escapeHtml(plan.summary)}</p>` : ''}
                    ${suggestionsHtml ? `<h2 style="margin:12px 0 6px 0;">Sugestões</h2><ul style="margin:0;padding-left:18px;">${suggestionsHtml}</ul>` : ''}
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            setActionMessage({ type: 'error', text: 'Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up.' });
            return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 200);
    };

    const downloadPlanAsPdf = () => {
        if (!analysisResult) return;
        openPlanPdfPrint({ plan: analysisResult, planId: generatedPlanId || null });
    };

    const handleImportDiet = async () => {
        if (!analysisResult || isImportingPlan) return;
        setIsImportingPlan(true);
        setActionMessage(null);
        try {
            const result = await importGeneratedPlanToNutritionPlan(analysisResult, {
                existingPlanId: generatedPlanId || null,
                fileName: 'Plano Importado da IA'
            });
            if (result?.id) {
                setGeneratedPlanId(result.id);
            }
            loadHistory();
            setActionMessage({
                type: 'success',
                text: 'Plano importado com sucesso na área de Plano Alimentar.'
            });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message || 'Erro ao importar dieta para o Plano Alimentar.' });
        } finally {
            setIsImportingPlan(false);
        }
    };

    const getLoadingMessage = () => {
        const stageMap = {
            queued: 'Na fila',
            extract: 'Extraindo arquivo',
            clean: 'Limpando markdown',
            llm: 'Processando com IA',
            save: 'Salvando resultado',
            completed: 'Concluído',
        };
        if (!importProgress) return 'IA Analisando Plano...';
        const label = stageMap[importProgress.stage] || 'Processando';
        const percent = Number(importProgress.percent || 0);
        return `${label} (${percent}%)`;
    };

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '--';
        if (typeof value === 'number') return formatPtBrNumber(value);
        return value;
    };

    const getImportStatusBadge = (status) => {
        if (status === 'failed') {
            return { label: 'Falhou', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        }
        if (status === 'analyzing') {
            return { label: 'Analisando', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
        }
        return { label: 'Concluído', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    };

    const handleViewCurrentDiet = () => {
        if (!history.length) {
            setActionMessage({ type: 'error', text: 'Ainda não existe plano no histórico para visualizar.' });
            return;
        }
        const latestPlan = history[0];
        setExpandedHistoryId(latestPlan.id);
        historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getPlanOriginBadge = (plan) => {
        const fileName = String(plan?.file_name || '').toLowerCase();

        if (fileName.includes('importado da ia')) {
            return {
                label: 'Importado da IA',
                cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
            };
        }
        if (fileName.includes('gerado por ia')) {
            return {
                label: 'Gerado com IA',
                cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
            };
        }
        if (plan?.file_url || plan?.file_key || fileName.endsWith('.pdf')) {
            return {
                label: 'Upload PDF',
                cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            };
        }
        return {
            label: 'Plano',
            cls: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
        };
    };

    return (
        <div className="space-y-8 pb-20">
            <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
                <AIAnalysisPage.Header
                    icon={ClipboardList}
                    title="Plano Alimentar Inteligente"
                    description={mode === 'upload' ? "Faça upload do seu plano ou crie um zero com a IA 🤖" : "Preencha as informações para a IA montar seu plano."}
                    gradient="from-cyan-500 to-blue-600"
                />

                {history.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={handleViewCurrentDiet}
                            className="w-full bg-zinc-100 dark:bg-bg-secondary text-zinc-800 dark:text-text-primary font-semibold py-2.5 rounded-xl border border-zinc-200 dark:border-border-subtle hover:bg-zinc-200 dark:hover:bg-bg-tertiary transition-colors"
                        >
                            Ver dieta atual
                        </button>
                    </div>
                )}

            {!analysisResult && !isAnalyzing && mode === 'upload' && (
                <div className="mb-6 flex gap-4">
                    <button
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-sm"
                        onClick={() => setMode('wizard')}
                    >
                        ✨ Criar Plano com a IA
                    </button>
                </div>
            )}

            {mode === 'wizard' && !analysisResult ? (
                <div className="mb-8 relative z-10 w-full">
                    <CreatePlanWizard
                        onGenerated={handleWizardGenerated}
                        onCancel={() => setMode('upload')}
                    />
                </div>
            ) : (
                <AIAnalysisPage.UploadZone
                    onUpload={handleFileUpload}
                    uploadedFile={uploadedFile}
                    accept=".pdf"
                    label="Selecionar PDF do Plano Alimentar"
                />
            )}

            <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message={getLoadingMessage()} gradient="bg-cyan-500" />
            <AIAnalysisPage.Error error={error} onReset={resetUpload} />

            <AnalysisRenderBoundary
                fallbackTitle="Não foi possível exibir o plano gerado"
                fallbackMessage="Houve um erro ao montar os resultados na tela. Tente gerar novamente."
                onReset={resetUpload}
                resetKey={`${mode}-${uploadedFile || 'none'}-${Boolean(analysisResult)}`}
            >
                <AIAnalysisPage.Results show={!!analysisResult}>
                    {/* Success */}
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            <span className="font-bold text-cyan-800 dark:text-cyan-300 text-sm">
                                {analysisSource === 'ai' ? 'Plano feito por IA! +40 XP' : 'Plano Analisado! +40 XP'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadPlanAsPdf}
                                className="inline-flex items-center gap-1 text-cyan-700 dark:text-cyan-300 text-xs font-medium underline hover:text-cyan-900 dark:hover:text-cyan-200"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Baixar em PDF
                            </button>
                            <button
                                onClick={handleImportDiet}
                                disabled={isImportingPlan}
                                className="inline-flex items-center gap-1 text-cyan-700 dark:text-cyan-300 text-xs font-medium underline hover:text-cyan-900 dark:hover:text-cyan-200 disabled:opacity-50"
                            >
                                <Database className="w-3.5 h-3.5" />
                                {isImportingPlan ? 'Importando...' : 'Importar no Plano'}
                            </button>
                            <button onClick={resetUpload} className="text-cyan-700 dark:text-cyan-300 text-xs font-medium underline hover:text-cyan-900 dark:hover:text-cyan-200">
                                Fazer Novo Plano
                            </button>
                        </div>
                    </div>
                    {actionMessage && (
                        <div className={`rounded-xl p-3 text-sm border ${actionMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
                            }`}>
                            {actionMessage.text}
                        </div>
                    )}

                    {/* Daily Macros */}
                    {analysisResult?.dailyMacros && (
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-border-subtle rounded-xl p-5 shadow-sm">
                            <h3 className="font-bold text-cyan-800 dark:text-cyan-300 mb-3 text-lg">🔥 Macros Diários do Plano</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                    <p className="text-xs text-gray-500 dark:text-text-muted">Calorias</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{formatValue(analysisResult.dailyMacros.calories)}</p>
                                    <p className="text-xs text-gray-400">kcal</p>
                                </div>
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                    <p className="text-xs text-gray-500 dark:text-text-muted">🥩 Proteínas</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatValue(analysisResult.dailyMacros.protein)}g</p>
                                </div>
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                    <p className="text-xs text-gray-500 dark:text-text-muted">🍞 Carboidratos</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatValue(analysisResult.dailyMacros.carbs)}g</p>
                                </div>
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                    <p className="text-xs text-gray-500 dark:text-text-muted">🥑 Gorduras</p>
                                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{formatValue(analysisResult.dailyMacros.fats)}g</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <SafeMealsList meals={analysisResult?.meals} formatValue={formatValue} />

                    {/* Summary */}
                    {analysisResult?.summary && (
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-border-subtle rounded-xl p-4">
                            <h3 className="font-bold text-cyan-800 dark:text-cyan-300 text-sm mb-1">📝 Resumo do Plano</h3>
                            <p className="text-cyan-700 dark:text-text-secondary text-sm">{analysisResult.summary}</p>
                        </div>
                    )}

                    {/* Suggestions */}
                    {analysisResult?.suggestions?.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-border-subtle rounded-xl p-4">
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">💡 Sugestões da IA</h3>
                            <ul className="space-y-1">
                                {analysisResult.suggestions.map((sug, idx) => (
                                    <li key={idx} className="flex items-start space-x-2 text-sm text-blue-700 dark:text-text-secondary">
                                        <span className="text-blue-400 mt-1">•</span>
                                        <span>{sug}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </AIAnalysisPage.Results>
            </AnalysisRenderBoundary>

                <AIAnalysisPage.Disclaimer />
            </AIAnalysisPage>

            <div ref={historySectionRef} className="max-w-4xl mx-auto w-full px-4 md:px-0">
                <div className="flex items-center space-x-2 mb-6">
                    <Clock className="w-5 h-5 text-zinc-400 dark:text-text-muted" />
                    <h3 className="text-lg font-bold text-zinc-700 dark:text-text-secondary">Histórico de Importações</h3>
                    {history.length > 0 && (
                        <span className="ml-auto text-xs text-zinc-400 dark:text-text-muted">
                            {history.length} plano{history.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {isLoadingHistory ? (
                    <div className="text-center py-8 text-zinc-400 dark:text-text-muted">Carregando histórico...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-50 dark:bg-bg-elevated rounded-2xl border border-dashed border-zinc-200 dark:border-border-subtle">
                        <p className="text-zinc-400 dark:text-text-muted text-sm">Nenhum plano importado ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((plan) => {
                            const status = getImportStatusBadge(plan.status);
                            const origin = getPlanOriginBadge(plan);
                            const isExpanded = expandedHistoryId === plan.id;
                            const mealCount = Array.isArray(plan?.analysis?.meals) ? plan.analysis.meals.length : 0;
                            return (
                                <div
                                    key={plan.id}
                                    className="bg-white dark:bg-bg-elevated border border-gray-200 dark:border-border-subtle rounded-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedHistoryId(isExpanded ? null : plan.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-bg-secondary transition-colors"
                                    >
                                        <div className="text-left min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${status.cls}`}>{status.label}</span>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${origin.cls}`}>{origin.label}</span>
                                                <span className="font-semibold text-sm text-gray-900 dark:text-text-primary truncate max-w-[240px]">
                                                    {plan.file_name || 'Plano Alimentar'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-text-muted">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {mealCount} refeição(ões)
                                                </span>
                                            </div>
                                        </div>
                                        {isExpanded
                                            ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-text-muted" />
                                            : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-text-muted" />
                                        }
                                    </button>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-gray-100 dark:border-border-subtle space-y-3">
                                            {plan.analysis?.dailyMacros && (
                                                <p className="text-xs text-gray-600 dark:text-text-secondary pt-3">
                                                    <strong>Macros:</strong> {formatValue(plan.analysis.dailyMacros.calories)} kcal • P {formatValue(plan.analysis.dailyMacros.protein)}g • C {formatValue(plan.analysis.dailyMacros.carbs)}g • G {formatValue(plan.analysis.dailyMacros.fats)}g
                                                </p>
                                            )}
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => openPlanPdfPrint({ plan: plan.analysis, planId: plan.id })}
                                                    className="inline-flex items-center gap-1 text-cyan-700 dark:text-cyan-300 text-xs font-medium underline hover:text-cyan-900 dark:hover:text-cyan-200"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Baixar PDF
                                                </button>
                                            </div>
                                            {Array.isArray(plan.analysis?.meals) && plan.analysis.meals.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-300">Refeições do plano</h4>
                                                    {plan.analysis.meals.map((meal, idx) => (
                                                        <div
                                                            key={`${plan.id}-meal-${idx}`}
                                                            className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-lg p-3"
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <UtensilsCrossed className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                                                    <p className="text-sm font-semibold text-gray-900 dark:text-text-primary truncate">
                                                                        {meal?.time || 'Refeição'} — {meal?.name || 'Opção'}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                                                                    {formatValue(meal?.calories)} kcal
                                                                </p>
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 dark:text-text-muted mt-1">
                                                                P {formatValue(meal?.protein)}g • C {formatValue(meal?.carbs)}g • G {formatValue(meal?.fats)}g
                                                            </p>
                                                            {Array.isArray(meal?.ingredients) && meal.ingredients.length > 0 && (
                                                                <ul className="mt-2 space-y-1">
                                                                    {meal.ingredients.map((ing, ingIdx) => (
                                                                        <li
                                                                            key={`${plan.id}-meal-${idx}-ing-${ingIdx}`}
                                                                            className="text-xs text-gray-700 dark:text-text-secondary"
                                                                        >
                                                                            • {ing}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {plan.analysis?.summary && (
                                                <p className="text-sm text-gray-700 dark:text-text-secondary">{plan.analysis.summary}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionPlan;
