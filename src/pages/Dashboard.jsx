import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { TrendingUp, ChevronDown, Upload, Camera, MessageCircle, FileText, Shield, Lock, Sparkles, HeartPulse, Info, AlertTriangle } from 'lucide-react';
import { healthMetrics } from '../data/mocks/mockMetrics';
import { recentInsights } from '../data/mocks/mockInsights';
import { initialMacroNutrients } from '../data/mocks/mockMetrics';
import MacroNutrientsCard from '../components/MacroNutrientsCard';
import XPBar from '../components/gamification/XPBar';
import StreakCounter from '../components/gamification/StreakCounter';
import PetWidget from '../components/gamification/PetWidget';
import DailyChallenges from '../components/gamification/DailyChallenges';
import { getExamHistory } from '../services/aiService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [macroNutrients] = useState(initialMacroNutrients);
    const [dailyCalories] = useState(2000);
    const [consumedCalories] = useState(850);
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [isLoadingHealth, setIsLoadingHealth] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    React.useEffect(() => {
        const fetchHealthData = async () => {
            try {
                const history = await getExamHistory();
                if (history && history.length > 0) {
                    // Pegar o exame mais recente
                    const latestExam = history[0];
                    const biomarkers = latestExam.analysis?.biomarkers || [];

                    const mappedMetrics = biomarkers
                        .map(b => ({
                            name: b.name,
                            value: `${b.value} ${b.unit}`,
                            status: b.status === 'low' ? 'Abaixo do normal' :
                                b.status === 'high' ? 'Acima do normal' : 'Normal',
                            emoji: b.name.toLowerCase().includes('vitamina') ? '💊' :
                                b.name.toLowerCase().includes('ferro') ? '🩸' :
                                    b.name.toLowerCase().includes('colesterol') ? '⚠️' : '🧪',
                            isAlert: b.status === 'low' || b.status === 'high'
                        }));

                    setHealthMetrics(mappedMetrics);
                }
            } catch (error) {
                console.error("Erro ao carregar dados de saúde:", error);
            } finally {
                setIsLoadingHealth(false);
            }
        };

        fetchHealthData();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
                {/* XP Bar */}
                <XPBar />

                {/* Health Overview */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-text-primary whitespace-nowrap">
                            🧬 Saúde ({healthMetrics.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length})
                        </h2>
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar exame..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-bg-secondary border border-zinc-200 dark:border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            />
                            <TrendingUp className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingHealth ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="text-zinc-500 dark:text-text-muted text-sm">Atualizando seus dados...</p>
                            </div>
                        ) : healthMetrics.length > 0 ? (
                            healthMetrics
                                .filter(metric => metric.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .sort((a, b) => {
                                    // Prioridade 1: Alertas (fora do normal)
                                    if (a.isAlert && !b.isAlert) return -1;
                                    if (!a.isAlert && b.isAlert) return 1;
                                    // Prioridade 2: Ordem Alfabética
                                    return a.name.localeCompare(b.name);
                                })
                                .map((metric, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-bg-secondary rounded-xl border border-zinc-200 dark:border-border-subtle hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">{metric.emoji}</span>
                                            <div>
                                                <h3 className="font-bold text-base text-zinc-900 dark:text-text-primary">{metric.name}</h3>
                                                <p className="text-zinc-500 dark:text-text-muted text-sm">{metric.value}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${metric.isAlert ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                            }`}>
                                            {metric.status}
                                        </div>
                                    </motion.div>
                                ))
                        ) : (
                            <div className="text-center py-10 bg-zinc-50 dark:bg-bg-secondary rounded-xl border border-dashed border-zinc-200 dark:border-border-subtle">
                                <HeartPulse className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 dark:text-text-muted text-sm mb-4">Nenhum exame importado ainda</p>
                                <button
                                    onClick={() => navigate('/labs')}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Importar Primeiro Exame
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Macro Nutrients Overview */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-text-primary">📊 Nutrientes Diários</h2>
                        <ChevronDown className="w-5 h-5 text-zinc-500 dark:text-text-muted" />
                    </div>
                    <MacroNutrientsCard
                        calories={{ consumed: consumedCalories, goal: dailyCalories }}
                        macroNutrients={macroNutrients}
                    />
                </motion.div>

                {/* Daily Challenges */}
                <DailyChallenges />

                {/* Recent Insights */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-text-primary">
                            💡 Insights Recentes
                        </h2>
                        <Info className="w-5 h-5 text-zinc-500 dark:text-text-muted" />
                    </div>
                    <p className="text-zinc-600 dark:text-text-secondary text-sm mb-4">Recomendações baseadas em seus dados</p>

                    <div className="space-y-3">
                        {recentInsights.map((insight, index) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl border ${insight.type === 'positive'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                                    : insight.type === 'tip'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {insight.type === 'positive' && (
                                        <HeartPulse className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    )}
                                    {insight.type === 'tip' && (
                                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    )}
                                    {insight.type === 'warning' && (
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-text-primary">{insight.title}</h3>
                                        <p className="text-zinc-600 dark:text-text-secondary text-sm">{insight.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Pet Widget */}
                <PetWidget />

                {/* Streak Counter */}
                <StreakCounter />

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
                >
                    <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-text-primary">⚡ Ações Rápidas</h2>
                    <div className="space-y-3">
                        <motion.button
                            onClick={() => navigate('/labs')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all duration-300"
                        >
                            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Upload className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold block text-zinc-900 dark:text-text-primary text-sm">📂 Upload de Exames</span>
                                <span className="text-zinc-600 dark:text-text-muted text-xs">+50 XP • IA analisará seus resultados</span>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/food')}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300"
                        >
                            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold block text-gray-900 dark:text-slate-100 text-sm">📸 Foto da Refeição</span>
                                <span className="text-gray-600 dark:text-slate-400 text-xs">+15 XP • Estimativa automática</span>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300"
                        >
                            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold block text-gray-900 dark:text-slate-100 text-sm">🤖 Chat com IA</span>
                                <span className="text-gray-600 dark:text-slate-400 text-xs">Assistente de saúde 24/7</span>
                            </div>
                        </motion.button>

                        <motion.button
                            onClick={() => navigate('/nutrition-plan')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all duration-300"
                        >
                            <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold block text-gray-900 dark:text-slate-100 text-sm">📋 Upload Plano Alimentar</span>
                                <span className="text-gray-600 dark:text-slate-400 text-xs">+40 XP • Importe seu plano</span>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-bg-elevated rounded-2xl border border-zinc-200 dark:border-border-subtle p-5 shadow-sm"
                >
                    <div className="flex items-center space-x-2 mb-3">
                        <Shield className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-text-primary">🔒 Privacidade Garantida</h3>
                    </div>
                    <p className="text-zinc-700 dark:text-text-secondary text-xs">
                        Seus dados são criptografados com tecnologia de ponta 🔐
                    </p>
                    <div className="flex items-center space-x-1 mt-3 text-[10px] text-zinc-600 dark:text-text-muted">
                        <Lock className="w-3 h-3" />
                        <span>Privacy by Design • GDPR Compliant</span>
                    </div>
                    <div className="mt-2 flex space-x-1">
                        <span className="bg-zinc-200 dark:bg-bg-tertiary px-1.5 py-0.5 rounded text-[10px] text-zinc-700 dark:text-text-secondary">AES-256</span>
                        <span className="bg-zinc-200 dark:bg-bg-tertiary px-1.5 py-0.5 rounded text-[10px] text-zinc-700 dark:text-text-secondary">TLS 1.3</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
