import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChartLine, Database, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2 } from 'lucide-react';
import { getExamHistory } from '../services/aiService';

const Progress = () => {
    const [submenu, setSubmenu] = useState('biomarkers');
    const [exams, setExams] = useState([]);
    const [selectedBiomarker, setSelectedBiomarker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadExams = async () => {
            setIsLoading(true);
            try {
                const data = await getExamHistory();
                setExams(data);

                // Auto-select first biomarker if available
                if (data.length > 0) {
                    const nameSet = new Set();
                    data.forEach(exam => {
                        exam.analysis?.biomarkers?.forEach(b => nameSet.add(b.name));
                    });
                    const allBiomarkersList = Array.from(nameSet);
                    if (allBiomarkersList.length > 0) {
                        setSelectedBiomarker(allBiomarkersList[0]);
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar exames:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadExams();
    }, []);

    // Extract unique biomarker names from all exams
    const getAllBiomarkers = (examData) => {
        const nameSet = new Set();
        examData.forEach(exam => {
            exam.analysis?.biomarkers?.forEach(b => nameSet.add(b.name));
        });
        return Array.from(nameSet);
    };

    // Get values of a specific biomarker across exams (chronological)
    const getBiomarkerTrend = (biomarkerName) => {
        const trend = [];
        [...exams].reverse().forEach(exam => {
            const biomarker = exam.analysis?.biomarkers?.find(b => b.name === biomarkerName);
            if (biomarker) {
                trend.push({
                    value: biomarker.value,
                    unit: biomarker.unit,
                    reference: biomarker.reference,
                    status: biomarker.status,
                    date: new Date(exam.created_at).toLocaleDateString('pt-BR'),
                    examId: exam.id,
                });
            }
        });
        return trend;
    };

    // Exam summary stats
    const getExamStats = (exam) => {
        const biomarkers = exam.analysis?.biomarkers || [];
        return {
            total: biomarkers.length,
            normal: biomarkers.filter(b => b.status === 'normal').length,
            attention: biomarkers.filter(b => b.status === 'low' || b.status === 'high').length,
        };
    };

    const getStatusLabel = (exam) => {
        const stats = getExamStats(exam);
        if (stats.attention === 0) return { label: 'Ótimo', color: 'bg-green-100 text-green-800' };
        if (stats.attention <= 2) return { label: 'Atenção', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
    };

    const allBiomarkers = getAllBiomarkers(exams);
    const currentTrend = selectedBiomarker ? getBiomarkerTrend(selectedBiomarker) : [];
    const latestValue = currentTrend.length > 0 ? currentTrend[currentTrend.length - 1] : null;
    const prevValue = currentTrend.length > 1 ? currentTrend[currentTrend.length - 2] : null;

    const trendDirection = latestValue && prevValue
        ? latestValue.value < prevValue.value ? 'down' : latestValue.value > prevValue.value ? 'up' : 'stable'
        : 'stable';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <ChartLine className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Rastreamento de Progresso</h2>
                    <p className="text-gray-600 text-sm">Acompanhe sua jornada de saúde ao longo do tempo</p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 text-green-600 mx-auto animate-spin mb-2" />
                        <p className="text-gray-500 text-sm">Carregando dados...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && exams.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-600 mb-1">Nenhum exame importado</h3>
                        <p className="text-gray-400 text-sm">Faça upload de exames na seção 🔬 Labs para ver seu progresso aqui.</p>
                    </div>
                )}

                {!isLoading && exams.length > 0 && (
                    <>
                        {/* Submenu */}
                        <div className="flex flex-col gap-3 mb-6">
                            <motion.button
                                onClick={() => setSubmenu('exams')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl font-medium transition-all ${submenu === 'exams'
                                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Histórico de Exames ({exams.length})
                            </motion.button>
                            <motion.button
                                onClick={() => setSubmenu('biomarkers')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl font-medium transition-all ${submenu === 'biomarkers'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Tendências de Biomarcadores ({allBiomarkers.length})
                            </motion.button>
                        </div>

                        {/* Exam History */}
                        {submenu === 'exams' && (
                            <div className="space-y-4">
                                {exams.map((exam) => {
                                    const stats = getExamStats(exam);
                                    const status = getStatusLabel(exam);
                                    return (
                                        <motion.div
                                            key={exam.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">📄 {exam.file_name}</h4>
                                                    <span className="text-gray-500 text-xs">📅 {new Date(exam.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                                            </div>
                                            <div className="flex space-x-4">
                                                <div className="flex items-center space-x-1 text-xs">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                                    <span className="text-gray-600">Normal: <strong>{stats.normal}</strong></span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs">
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                                    <span className="text-gray-600">Atenção: <strong>{stats.attention}</strong></span>
                                                </div>
                                            </div>
                                            {/* Biomarker tags */}
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {exam.analysis?.biomarkers?.map((b, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === 'normal'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {b.name}: {b.value} {b.unit}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                                        <p className="text-gray-600 text-sm">Total de Exames</p>
                                        <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                                        <p className="text-gray-600 text-sm">Biomarcadores Rastreados</p>
                                        <p className="text-2xl font-bold text-gray-900">{allBiomarkers.length}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                                        <p className="text-gray-600 text-sm">Último Exame</p>
                                        <p className="text-lg font-bold text-gray-900">{new Date(exams[0]?.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Biomarker Trends */}
                        {submenu === 'biomarkers' && (
                            <div className="space-y-5">
                                {/* Biomarker Selector */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="font-medium text-gray-900 text-sm mb-3">Selecione o Biomarcador</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allBiomarkers.map((name) => (
                                            <motion.button
                                                key={name}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedBiomarker(name)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedBiomarker === name
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {name}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Trend Detail */}
                                {selectedBiomarker && currentTrend.length > 0 && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{selectedBiomarker}</h3>
                                                {latestValue && <p className="text-gray-500 text-xs">Ref: {latestValue.reference}</p>}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {trendDirection === 'down' && <TrendingDown className="w-5 h-5 text-green-600" />}
                                                {trendDirection === 'up' && <TrendingUp className="w-5 h-5 text-red-600" />}
                                                {trendDirection === 'stable' && <Minus className="w-5 h-5 text-gray-400" />}
                                                <span className={`font-medium text-sm ${trendDirection === 'down' ? 'text-green-600' : trendDirection === 'up' ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {trendDirection === 'down' ? 'Diminuindo' : trendDirection === 'up' ? 'Aumentando' : 'Estável'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Current Value */}
                                        {latestValue && (
                                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Valor Atual</p>
                                                        <p className="text-2xl font-bold text-gray-900">{latestValue.value} {latestValue.unit}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${latestValue.status === 'normal'
                                                        ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {latestValue.status === 'normal' ? '✅ Normal' : '⚠️ Atenção'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timeline */}
                                        <div className="overflow-x-auto mb-4">
                                            <div className="flex items-end space-x-4 min-w-max pb-2">
                                                {currentTrend.map((point, idx) => {
                                                    const maxVal = Math.max(...currentTrend.map(p => p.value));
                                                    const heightPct = maxVal > 0 ? (point.value / maxVal) * 100 : 50;
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, scaleY: 0 }}
                                                            animate={{ opacity: 1, scaleY: 1 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="flex flex-col items-center min-w-16"
                                                            style={{ originY: 1 }}
                                                        >
                                                            <span className="text-xs font-bold text-gray-700 mb-1">{point.value}</span>
                                                            <div
                                                                className={`w-10 rounded-lg flex items-end justify-center ${point.status === 'normal'
                                                                    ? 'bg-gradient-to-t from-green-500 to-emerald-400'
                                                                    : 'bg-gradient-to-t from-yellow-500 to-amber-400'
                                                                    }`}
                                                                style={{ height: `${Math.max(heightPct, 20)}px` }}
                                                            />
                                                            <span className="text-gray-500 text-xs mt-1">{point.date}</span>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedBiomarker && currentTrend.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        Nenhum dado disponível para este biomarcador.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Progress;
