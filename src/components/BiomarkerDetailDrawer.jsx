import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Calendar, Activity, ArrowUpRight, ArrowDownRight, Minus, Info, History } from 'lucide-react';

const BiomarkerDetailDrawer = ({ isOpen, onClose, biomarker }) => {
    if (!biomarker) return null;

    // Helper para formatar valores
    const formatValue = (val) => {
        if (val === null || val === undefined) return '--';
        return val.toLocaleString('pt-BR');
    };

    // Helper para status
    const getStatusColor = (value, target) => {
        if (!target) return 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800';
        const [min, max] = target;
        if (min !== null && value < min) return 'text-amber-500 bg-amber-500/10';
        if (max !== null && value > max) return 'text-red-500 bg-red-500/10';
        return 'text-emerald-500 bg-emerald-500/10';
    };

    const getStatusLabel = (value, target) => {
        if (!target) return 'N/A';
        const [min, max] = target;
        if (min !== null && value < min) return 'BAIXO';
        if (max !== null && value > max) return 'ALTO';
        return 'NORMAL';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-bg-elevated shadow-2xl z-[70] border-l border-zinc-200 dark:border-border-subtle flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-border-subtle flex items-center justify-between bg-zinc-50/50 dark:bg-bg-secondary/50">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl bg-white dark:bg-bg-elevated shadow-sm`} style={{ color: biomarker.color }}>
                                    <biomarker.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white leading-none mb-1">{biomarker.label}</h3>
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{biomarker.technical}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Current Value Highlight */}
                            <div className="text-center space-y-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${biomarker.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                    biomarker.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    Status Atual
                                </span>
                                <div className="flex items-baseline justify-center gap-2">
                                    <h2 className="text-5xl font-mono font-bold dark:text-white tracking-tighter">
                                        {biomarker.trend[biomarker.trend.length - 1]?.details ?
                                            `${biomarker.trend[biomarker.trend.length - 1].details.left} / ${biomarker.trend[biomarker.trend.length - 1].details.right}` :
                                            biomarker.value}
                                    </h2>
                                    <span className="text-lg text-zinc-400 font-medium">{biomarker.unit}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Última medição em {biomarker.trend[biomarker.trend.length - 1]?.date}</span>
                                </div>
                            </div>

                            {/* Reference Range Info */}
                            {biomarker.target && (
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-bg-secondary border border-zinc-100 dark:border-border-subtle flex items-start gap-3">
                                    <Info className="w-5 h-5 text-zinc-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold dark:text-white mb-1">Faixa de Referência</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            O valor ideal para este marcador está entre <span className="font-mono font-bold dark:text-zinc-300">{biomarker.target[0] ?? 0}</span> e <span className="font-mono font-bold dark:text-zinc-300">{biomarker.target[1] ?? '∞'}</span> {biomarker.unit}.
                                            Seus resultados são comparados com protocolos de saúde funcional.
                                        </p>
                                    </div>
                                </div>
                            )}


                            {/* History Table */}
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                    <History className="w-4 h-4" /> Histórico Completo
                                </h4>
                                <div className="rounded-2xl border border-zinc-100 dark:border-border-subtle overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 dark:bg-bg-secondary text-zinc-400 font-medium text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Data</th>
                                                <th className="px-4 py-3">Valor</th>
                                                <th className="px-4 py-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-border-subtle bg-white dark:bg-bg-elevated">
                                            {[...biomarker.trend].reverse().map((point, index) => {
                                                const pointStatusLabel = getStatusLabel(point.value, biomarker.target);
                                                const pointStatusColor = getStatusColor(point.value, biomarker.target);

                                                return (
                                                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-zinc-500">{point.date}</td>
                                                        <td className="px-4 py-3 font-bold dark:text-white">
                                                            {point.details ?
                                                                <span className="text-xs">E: {point.details.left} / D: {point.details.right}</span> :
                                                                point.value
                                                            } <span className="text-[10px] text-zinc-400 font-normal">{point.unit}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${pointStatusColor}`}>
                                                                {pointStatusLabel}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        {biomarker.trend.length === 0 && (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-8 text-center text-zinc-400">Nenhum histórico disponível.</td>
                                                </tr>
                                            </tbody>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BiomarkerDetailDrawer;
