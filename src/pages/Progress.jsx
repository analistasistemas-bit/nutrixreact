import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
    ChartLine,
    Database,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    Activity,
    Scale,
    FlaskConical,
    ArrowUpRight,
    Calendar,
    Target,
    Info,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Ruler,
    Search,
    Sparkles,
    Zap,
    BrainCircuit,
    Dna,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getExamHistory, getMeasurementHistory } from '../services/aiService';
import BiomarkerDetailDrawer from '../components/BiomarkerDetailDrawer';
import { useGamification } from '../hooks/useGamification';

// --- Sub-componente: InsightDrawer (Painel Lateral Contextual) ---
const InsightDrawer = ({ isOpen, onClose }) => {
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
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-bg-elevated shadow-2xl z-[70] border-l border-zinc-200 dark:border-border-subtle p-8 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-xl">
                                    <Target className="w-5 h-5 text-cyan-500" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white">Detalhes do Plano</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
                            >
                                <span className="sr-only">Fechar</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-zinc-50 dark:bg-bg-secondary rounded-3xl border border-zinc-100 dark:border-border-subtle">
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-500 rounded-md text-[8px] font-black uppercase tracking-widest mb-2 inline-block">Ajuste Sugerido</span>
                                <h4 className="text-lg font-bold dark:text-white mb-2">Ajuste Proteico Estratégico</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    Baseado na sua redução de gordura, o plano foi otimizado para preservar massa magra.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Refeições com Ajuste</h5>
                                {[
                                    { meal: 'Almoço', change: '+20g Proteína', icon: '🍗' },
                                    { meal: 'Jantar', change: '+20g Proteína', icon: '🍳' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-bg-elevated border border-zinc-100 dark:border-border-subtle rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-bold dark:text-white text-sm">{item.meal}</span>
                                        </div>
                                        <span className="text-cyan-500 font-mono font-bold text-xs">{item.change}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-cyan-500/20">
                                Abrir Plano Completo
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- Sub-componente: CorrelationInsights (Motor de Inteligência) ---
const CorrelationInsights = ({ insights }) => {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {insights.map((insight, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
                    }}
                    transition={{
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 300
                    }}
                    className={`p-6 rounded-[2.5rem] border backdrop-blur-md shadow-lg flex flex-col justify-between group h-full cursor-default ${insight.theme === 'success'
                        ? 'bg-cyan-50/40 dark:bg-cyan-500/5 border-cyan-100/50 dark:border-cyan-500/10'
                        : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/10'
                        }`}
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-2xl ${insight.theme === 'success' ? 'bg-cyan-500/10' : 'bg-amber-500/10'}`}>
                                <insight.icon className={`w-5 h-5 ${insight.theme === 'success' ? 'text-cyan-500' : 'text-amber-500'}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Insight Prioritário</span>
                        </div>
                        <div>
                            <h4 className="font-bold dark:text-white text-lg mb-2">{insight.title}</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{insight.description}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// --- Sub-componente: AIScanCore (HUD Central) ---
const AIScanCore = ({ status = 'normal' }) => {
    const colorClass = status === 'normal' ? 'text-cyan-500' : 'text-amber-500';
    const bgClass = status === 'normal' ? 'bg-cyan-500/20' : 'bg-amber-500/20';

    return (
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Anéis Externos */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-zinc-700/30 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-zinc-500/20 rounded-full"
            />

            {/* Pulso Central */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`absolute inset-12 rounded-full blur-2xl ${bgClass}`}
            />

            {/* Núcleo Visual */}
            <div className={`relative z-10 p-6 rounded-full bg-bg-elevated border-2 shadow-[0_0_30px_rgba(6,182,212,0.1)] ${colorClass} border-current`}>
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Zap className="w-10 h-10 md:w-12 md:h-12" />
                    </motion.div>
                </div>
                {/* Linha de Scan Circular */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-10px] border-t-2 border-current rounded-full"
                />
            </div>
        </div>
    );
};

// --- Sub-componente: AILogTerminal (Pensamentos da IA) ---
const AILogTerminal = () => {
    const logs = [
        "Sincronizando últimos exames laboratoriais...",
        "Calculando correlação entre peso e massa muscular...",
        "Analisando flexibilidade metabólica (Glicose / Insulina)...",
        "Monitorando níveis de Vitamina D e Imunidade...",
        "Rastreando eficiência do Plano Alimentar...",
        "Otimizando recomendações de micronutrientes...",
        "Monitoramento Ativo: STATUS SAUDÁVEL",
        "AI Nutrixo: Sistema em prontidão."
    ];

    const [currentLog, setCurrentLog] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLog((prev) => (prev + 1) % logs.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [logs.length]);

    return (
        <div className="h-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentLog}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
                        {logs[currentLog]}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// --- Sub-componente: SentinelCard (Card KPI Premium) ---
const SentinelCard = ({ label, value, unit, trend, status, color, icon: Icon, delay = 0, date, onClick }) => {
    // Formata a data para DD/MM/YYYY
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr; // Fallback se já for formatada ou inválida
            return d.toLocaleDateString('pt-BR');
        } catch {
            return dateStr;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            onClick={onClick}
            className="flex-shrink-0 w-[calc(25%-18px)] min-w-[220px] group relative p-5 bg-white dark:bg-bg-elevated border border-zinc-100 dark:border-border-subtle rounded-[2rem] hover:ring-2 hover:ring-cyan-500/20 transition-all cursor-pointer shadow-sm hover:shadow-xl snap-start"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-2xl bg-opacity-10 bg-current`} style={{ color }}>
                    {React.createElement(Icon, { className: "w-5 h-5" })}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status === 'success' ? 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:border-cyan-500/20' :
                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                    }`}>
                    {trend}
                </div>
            </div>

            <div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-2xl font-bold dark:text-white tabular-nums tracking-tight">
                    {formatDisplayValue(value)}
                    <span className="text-xs font-normal text-zinc-400 ml-1">{unit}</span>
                </h3>
            </div>

            <div className="mt-5 pt-5 border-t border-zinc-50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">
                    {date ? `Atualizado ${formatDate(date)}` : 'Sincronizado'}
                </span>
                <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-cyan-500 transition-colors" />
            </div>
        </motion.div>
    );
};

// --- Sub-componente: ScannerLine (Efeito de Revelação) ---
const ScannerLine = () => (
    <motion.div
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent z-[100] pointer-events-none opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
    />
);


// --- Helper: Análise Dinâmica Sentinela ---
const getSentinelAnalysis = (marker) => {
    if (!marker || !marker.history || marker.history.length < 2) {
        return "A IA Nutrixo iniciou o monitoramento deste marcador. Continue registrando seus exames para desbloquear insights detalhados de tendência.";
    }

    const current = parseFloat(marker.value);
    const previous = parseFloat(marker.history[marker.history.length - 2].value);
    const diff = current - previous;
    const absDiff = Math.abs(diff);
    const percentChange = ((diff / previous) * 100).toFixed(1);

    // Identificar contexto do marcador
    const lowerIsBetter = ['weight', 'bodyFat', 'visceralFat', 'imc', 'cholesterol', 'triglycerides', 'glucose', 'intrep'].some(key =>
        marker.label?.toLowerCase().includes(key) || marker.technical?.toLowerCase().includes(key)
    );

    const higherIsBetter = ['muscleMass', 'leanMass', 'water', 'testosterone', 'vitamin'].some(key =>
        marker.label?.toLowerCase().includes(key) || marker.technical?.toLowerCase().includes(key)
    );

    // Lógica de Tendência
    let trendText = "";
    if (Math.abs(percentChange) < 1.5) {
        trendText = "Estabilidade detectada. A manutenção destes níveis indica consistência metabólica.";
    } else if (diff > 0) {
        // Subiu
        if (lowerIsBetter) {
            trendText = `Alerta de Elevação. Houve um aumento de ${absDiff.toFixed(1)}${marker.unit} (${percentChange}%) desde o último registro. Recomendamos revisão de hábitos recentes.`;
        } else if (higherIsBetter) {
            trendText = `Progresso Confirmado! O aumento de ${absDiff.toFixed(1)}${marker.unit} (${percentChange}%) reflete uma adaptação positiva do seu organismo.`;
        } else {
            trendText = `Observamos uma elevação de ${percentChange}%. A IA continuará monitorando para estabelecer se é uma flutuação pontual ou tendência.`;
        }
    } else {
        // Desceu
        if (lowerIsBetter) {
            trendText = `Excelente! Redução de ${absDiff.toFixed(1)}${marker.unit} (${Math.abs(percentChange)}%) detectada. Você está na direção certa.`;
        } else if (higherIsBetter) {
            trendText = `Atenção à Queda. Houve uma redução de ${absDiff.toFixed(1)}${marker.unit}. Verifique nutrição e recuperação para reverter este quadro.`;
        } else {
            trendText = `Registramos uma redução de ${Math.abs(percentChange)}%. Monitoramento contínuo ativo.`;
        }
    }

    // Contexto de Status (se houver targets/status definidos)
    let statusText = "";
    if (marker.status === 'danger' || marker.calculatedStatus === 'high' || marker.calculatedStatus === 'low') {
        statusText = " Atualmente, este marcador encontra-se fora da zona ideal de referência.";
    } else if (marker.status === 'success' || marker.calculatedStatus === 'normal') {
        statusText = " Seus níveis atuais estão dentro da zona de otimização esperada.";
    }

    return `${trendText}${statusText}`;
};

// --- Sub-componente: BiomarkerDetailOverlay (Modal de Histórico) ---
const BiomarkerDetailOverlay = ({ isOpen, onClose, marker }) => {
    if (!marker) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-bg-primary z-[101] shadow-2xl p-8 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5">
                                    <Activity className="w-6 h-6 text-cyan-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold dark:text-white">{translateLabel(marker.label)}</h2>
                                    <p className="text-sm text-zinc-500 uppercase tracking-widest font-black">Histórico de Performance</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        <div className="space-y-12">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Valor Atual</p>
                                    <div className="text-4xl font-black dark:text-white">
                                        {formatDisplayValue(marker.value)} <span className="text-lg font-normal text-zinc-400">{marker.unit}</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Referência IA</p>
                                    <div className="text-xl font-bold text-cyan-500 mt-2">
                                        Zona de Otimização
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] w-full bg-zinc-50 dark:bg-white/5 rounded-[2.5rem] p-6">
                                <EnhancedAreaChart
                                    data={marker.history}
                                    color="#06b6d4"
                                    label={marker.label}
                                />
                            </div>

                            <div className="p-8 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] space-y-4">
                                <div className="flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-cyan-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Análise Sentinela</span>
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {getSentinelAnalysis(marker)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};


// Helper para parsear valores numéricos de referência (PT-BR)
const parseNumberVal = (str) => {
    if (!str) return null;
    if (typeof str === 'number') return str;

    // Remove tudo que não for dígito, ponto, vírgula ou traço
    const clean = str.replace(/[^\d.,-]/g, '').trim();
    if (!clean) return null;

    // Tenta detectar formato PT-BR (1.000,00) vs EN (1,000.00)
    // Se tem vírgula, assume PT-BR (vírgula = decimal)
    if (clean.includes(',')) {
        // Remove pontos de milhar e troca vírgula por ponto
        return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    }

    // Se não tem vírgula, pode ser formato EN (1.5) ou PT-BR milhar (4.000)
    // CRÍTICO: Se tiver EXATAMENTE 3 dígitos após o ÚLTIMO ponto, assume milhar (ex: 4.000, 150.000)
    // A menos que seja algo pequeno como 1.500 (pode ser 1,5 ou 1500, mas no contexto de exames, 1.500 geralmente é 1500)
    if (clean.match(/^\d{1,3}\.\d{3}$/) || clean.match(/^\d{1,3}\.\d{3}\.\d{3}$/)) {
        return parseFloat(clean.replace(/\./g, ''));
    }

    // Se tiver apenas um ponto e não for no final, e não casou com o padrão de milhar acima, assume decimal
    if ((clean.match(/\./g) || []).length === 1 && clean.indexOf('.') !== clean.length - 1) {
        return parseFloat(clean); // Assume EN decimal
    }

    return parseFloat(clean.replace(/\./g, '')); // Fallback: remove pontos
};

// Helper para traduzir labels vindos da IA (Inglês -> Português)
const translateLabel = (label) => {
    if (!label) return '';
    const dict = {
        'weight': 'Peso',
        'bodyfat': 'Gordura Corporal',
        'musclemass': 'Massa Magra',
        'leanbodymass': 'Massa Magra',
        'imc': 'IMC',
        'bmi': 'IMC',
        'waist': 'Cintura',
        'height': 'Altura',
        'neck': 'Pescoço',
        'chest': 'Peito',
        'belly': 'Abdômen',
        'abdomen': 'Abdômen',
        'hips': 'Quadril',
        'gripstrength': 'Força de Preensão',
        'metabolicage': 'Idade Metabólica',
        'bloodpressure': 'Pressão Arterial',
        'visceralfat': 'Gordura Visceral',
        'bodywater': 'Água Corporal',
        'water': 'Água',
        'bonemass': 'Massa Óssea',
        'basalmetabolicrate': 'Taxa Metabólica Basal',
        'bmr': 'Taxa Metabólica Basal',
        'fatpercentage': 'Gordura %',
        'skeletalmuscle': 'Músculo Esquelético',
        'subcutaneousfat': 'Gordura Subcutânea',
        'circumferenceabdomen': 'Circunferência Abdominal',
        'estimatedmaxheartrate': 'Freq. Cardíaca Máx. Est.',
        'fatmass': 'Massa Gorda',
        'fatfreemass': 'Massa Livre de Gordura',
        'protein': 'Proteína',
        'minerals': 'Minerais',
        'physique': 'Físico',
        'healthscore': 'Score de Saúde',
        'totalbodywater': 'Água Corporal Total',
        'dryleanmass': 'Massa Magra Seca',
        'bodyfatmass': 'Massa de Gordura Corporal',
        'smm': 'Músculo Esquelético',
        'pbf': 'Percentual de Gordura',
        'whr': 'Relação Cintura-Quadril',
        'obesitydegree': 'Grau de Obesidade',
        'restingheartrate': 'FC Repouso',
        'heartrate': 'Batimento Cardíaco',
        'vo2max': 'VO2 Máx',
        'waisthipratio': 'Rel. Cintura-Quadril',
        'visceralfatrating': 'Nível de Gordura Visceral',
        'bodyage': 'Idade Corporal',
        'vfl': 'Nível de Gordura Visceral',
    };

    // Normalização agressiva: minúsculas e remove tudo que não for letra/número
    const normalizedKey = label.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (dict[normalizedKey]) return dict[normalizedKey];

    console.warn(`[Sentinel Translator] Missing translation for key: "${label}" (normalized: "${normalizedKey}")`);

    // Fallback melhorado: 
    // 1. Se for tudo maiúsculo (ex: FAT MASS), converte para Title Case
    if (label === label.toUpperCase()) {
        return label.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    // 2. Se for camelCase, separa e capitaliza
    return label
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

const translateStatus = (status) => {
    if (!status) return 'Detectado';
    const s = status.toLowerCase();
    if (s === 'high') return 'Alto';
    if (s === 'low') return 'Baixo';
    if (s === 'normal') return 'Normal';
    if (s === 'detected') return 'Detectado';
    return status;
};

// Start of formatDisplayValue
const formatDisplayValue = (val) => {
    if (val === null || val === undefined || val === '') return '--';
    const num = typeof val === 'string' ? parseNumberVal(val) : val;
    if (num === null || isNaN(num)) return val; // Retorna original se não for número
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(num);
};

const parseReferenceRange = (refString) => {
    if (!refString) return null;

    // Limpar unidades e espaços extras antes de quebrar
    const cleanRef = refString.replace(/\/mm³|\/mm3|g\/dL|mg\/dL|%|ng\/mL|pg\/mL/gi, '').trim();

    // Tenta quebrar por " - " ou "-" ou " a " ou travessão/meia-risca
    const parts = cleanRef.split(/[-–—]| a /);

    if (parts.length < 2) {
        // Handle cases like "até 99" or "acima de 70"
        if (refString.toLowerCase().includes('até') || refString.includes('<')) {
            const valPart = refString.toLowerCase().split('até')[1] || refString.split('<')[1];
            const val = parseNumberVal(valPart);
            return val !== null ? [null, val] : null;
        }
        if (refString.toLowerCase().includes('acima de') || refString.includes('>')) {
            const valPart = refString.toLowerCase().split('acima de')[1] || refString.split('>')[1];
            const val = parseNumberVal(valPart);
            return val !== null ? [val, null] : null;
        }
        return null;
    }

    const min = parseNumberVal(parts[0]);
    const max = parseNumberVal(parts[1]);

    // If both are null, it's not a valid range
    if (min === null && max === null) return null;

    // If one is null, it's an open-ended range
    if (min === null) return [null, max];
    if (max === null) return [min, null];

    // Ensure min is less than or equal to max
    return [Math.min(min, max), Math.max(min, max)];
};




// --- Sub-componente: EnhancedAreaChart (Estética Opção B - Storytelling) ---
const EnhancedAreaChart = ({ data, color = "#06b6d4", height = 120, targetRange = null, showBaseline = true }) => {
    if (!data || data.length === 0) return (
        <div className="h-[120px] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest text-center px-4">Dados insuficientes</p>
        </div>
    );

    // Se tiver apenas 1 ponto, duplicamos para criar uma linha "flat"
    // Isso permite visualizar o ponto em relação ao range de referência
    const chartData = data.length === 1 ? [data[0], data[0]] : data;

    const values = chartData.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
    if (values.length === 0) return null;

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const baseline = parseFloat(chartData[0].value) || minVal;

    let displayMin = minVal;
    let displayMax = maxVal;

    // Validação robusta do targetRange
    let validTarget = null;
    if (targetRange && Array.isArray(targetRange) && targetRange.length === 2) {
        const tMin = targetRange[0] !== null && !isNaN(targetRange[0]) ? targetRange[0] : null;
        const tMax = targetRange[1] !== null && !isNaN(targetRange[1]) ? targetRange[1] : null;

        if (tMin !== null || tMax !== null) {
            validTarget = [tMin, tMax];
            if (tMin !== null) displayMin = Math.min(displayMin, tMin);
            if (tMax !== null) displayMax = Math.max(displayMax, tMax);
        }
    }

    // Aumentar o range um pouco para as curvas não baterem no teto/chão
    const rangePadding = (displayMax - displayMin) * 0.2 || (displayMin * 0.1) || 1;
    displayMin -= rangePadding / 2;
    displayMax += rangePadding / 2;

    const range = (displayMax - displayMin) || 1;
    const paddingX = 5;
    const chartWidth = 100 - (paddingX * 2);

    const getX = (i) => paddingX + (i / (chartData.length - 1)) * chartWidth;
    // Proteção contra Infinity/NaN no Y
    const getY = (val) => {
        if (isNaN(val) || range === 0) return 100; // If range is 0, all values are the same, place at bottom
        // Se min e max são iguais (ex: range 0 efetivo), centraliza
        if (displayMin === displayMax) return 50;

        const y = 100 - ((val - displayMin) / range) * 100;
        return Math.max(0, Math.min(100, y)); // Clamp visual
    };

    const points = chartData.map((d, i) => {
        const val = parseFloat(d.value);
        return {
            x: getX(i),
            y: getY(val),
            value: val
        };
    });

    // Curva suave (Bezier)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cx = (curr.x + next.x) / 2;
        pathD += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
    const baselineY = getY(baseline);

    const targetYStart = validTarget && validTarget[1] !== null ? getY(validTarget[1]) : 0;
    const targetYEnd = validTarget && validTarget[0] !== null ? getY(validTarget[0]) : 0;

    return (
        <div className="relative w-full overflow-hidden rounded-xl" style={{ height: `${height}px` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Baseline Inicial */}
                {showBaseline && (
                    <line
                        x1="0" y1={baselineY} x2="100" y2={baselineY}
                        stroke="currentColor" strokeDasharray="2 2"
                        className="text-zinc-200 dark:text-zinc-800" strokeWidth="0.5"
                    />
                )}

                {/* Target Range Band */}
                {validTarget && (validTarget[0] !== null || validTarget[1] !== null) && (
                    <rect
                        x="0" y={Math.min(targetYStart, targetYEnd)} width="100" height={Math.abs(targetYEnd - targetYStart)}
                        fill={color} fillOpacity="0.1"
                    />
                )}

                {/* Área Preenchida */}
                <motion.path
                    d={areaD}
                    fill={`url(#grad-${color.replace('#', '')})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Linha de Tendência */}
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                />

                {/* Pontos de Destaque (Início e Fim) */}
                <circle cx={points[0].x} cy={points[0].y} r="1.5" fill="white" stroke={color} strokeWidth="0.8" />
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
            </svg>
        </div>
    );
};

const Progress = () => {
    const [activeTab, setActiveTab] = useState('overview');
    useGamification();

    const [timeFilter, setTimeFilter] = useState('30d');
    const [sortBy, setSortBy] = useState('alphabetical'); // 'alphabetical' | 'problems'
    const [searchTerm, setSearchTerm] = useState('');
    const [exams, setExams] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBiomarker, setSelectedBiomarker] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const compRef = React.useRef(null);
    const bioRef = React.useRef(null);

    const scroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // --- Helpers de Dados (Definidos no topo para evitar Reference Errors) ---
    const getBiomarkerTrend = useCallback((name) => {
        const trend = [];
        [...exams].reverse().forEach(exam => {
            const b = exam.analysis?.biomarkers?.find(x => x.name === name);
            if (b) trend.push({ value: b.value, date: new Date(exam.created_at).toLocaleDateString(), unit: b.unit });
        });
        return trend;
    }, [exams]);

    const getMeasurementTrend = useCallback((key) => {
        const trend = [];
        const findValue = (obj, targetKey) => {
            if (!obj || typeof obj !== 'object') return undefined;
            let item = obj[targetKey];
            if (typeof item === 'string') {
                const match = item.match(/([\d.,]+)\s*(.*)/);
                if (match) return { value: parseFloat(match[1].replace(',', '.')), unit: match[2].trim() || '' };
            }
            if (item !== undefined && item !== null) {
                if (typeof item === 'object' && item.value !== undefined) return item;
                if (typeof item === 'number') return { value: item, unit: '' };
            }
            for (const k in obj) {
                if (typeof obj[k] === 'object' && obj[k] !== null) {
                    const found = findValue(obj[k], targetKey);
                    if (found) return found;
                }
            }
            return undefined;
        };
        [...measurements].reverse().forEach(m => {
            const valData = findValue(m.analysis?.measurements || m.analysis, key);
            if (valData && valData.value !== null && valData.value !== undefined) {
                const numericVal = parseFloat(valData.value);
                if (!isNaN(numericVal)) {
                    trend.push({
                        value: numericVal,
                        date: new Date(m.created_at).toLocaleDateString(),
                        unit: valData.unit || ''
                    });
                }
            }
        });
        return trend;
    }, [measurements]);


    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                const [examData, measureData] = await Promise.all([
                    getExamHistory(),
                    getMeasurementHistory()
                ]);
                setExams(examData);
                setMeasurements(measureData);
            } catch (err) {
                console.error('Erro ao carregar dados de progresso:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, []);


    const biomarkerCards = React.useMemo(() => {
        if (activeTab !== 'labs' || !exams.length) return null;

        const uniqueBiomarkers = new Set();
        exams.forEach(exam => {
            exam.analysis?.biomarkers?.forEach(b => uniqueBiomarkers.add(b.name));
        });

        const metadata = {
            'Vitamina D': {
                technical: '25-OH Vitamina D',
                description: 'Essencial para saúde óssea e imunidade.',
                icon: FlaskConical,
                color: '#f59e0b', // Amber
                target: [30, 100],
                action: 'Ver Suplementação'
            },
            'Glicose': {
                technical: 'Glicose em Jejum',
                description: 'Monitoramento do metabolismo de açúcar.',
                icon: Activity,
                color: '#3b82f6', // Blue
                target: [70, 99],
                action: 'Diário Glicêmico'
            },
            'Colesterol Total': {
                technical: 'Lipidograma',
                description: 'Indicador de saúde cardiovascular.',
                icon: Activity,
                color: '#ef4444', // Red
                target: [null, 190],
                action: 'Dicas Cardíacas'
            },
            'Hemoglobina': {
                technical: 'Hemograma',
                description: 'Capacidade de transporte de oxigênio.',
                icon: FlaskConical,
                color: '#06b6d4', // Emerald
                target: [12, 16],
                action: 'Nutrição Ferro'
            },
        };

        const getCategory = (name) => {
            const n = name.toLowerCase();
            if (n.includes('glicose') || n.includes('insulina') || n.includes('hba1c') || n.includes('glicada') || n.includes('homa')) return 'Metabólico 🩸';
            if (n.includes('colesterol') || n.includes('ldl') || n.includes('hdl') || n.includes('triglicer') || n.includes('vldl')) return 'Cardiovascular ❤️';
            if (n.includes('tsh') || n.includes('t4') || n.includes('testosterona') || n.includes('estradiol') || n.includes('cortisol') || n.includes('horm')) return 'Hormonal 🧬';
            if (n.includes('pcr') || n.includes('vitamina d') || n.includes('hemoglobina') || n.includes('leucócitos') || n.includes('ferritina') || n.includes('proteína c')) return 'Imunidade & Inflamação 🛡️';
            if (n.includes('creatinina') || n.includes('ureia') || n.includes('tgo') || n.includes('tgp') || n.includes('gama gt') || n.includes('bilirrubina')) return 'Função Renal & Hepática 🧪';
            return 'Geral ✨';
        };

        const cardsData = Array.from(uniqueBiomarkers)
            .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(name => {
                const trend = getBiomarkerTrend(name);
                const lastValue = trend[trend.length - 1];

                if (!lastValue) return null;

                const meta = metadata[name] || {
                    technical: 'Biomarcador',
                    description: 'Acompanhamento da evolução clínica.',
                    icon: FlaskConical,
                    color: '#8b5cf6',
                    target: null,
                    action: 'Ver Detalhes'
                };

                const latestExam = exams.find(e => e.analysis?.biomarkers?.some(b => b.name === name));
                const latestBiomarkerData = latestExam?.analysis?.biomarkers?.find(b => b.name === name);

                let parsedTarget = null;
                if (latestBiomarkerData?.reference) {
                    parsedTarget = parseReferenceRange(latestBiomarkerData.reference);
                }
                if (!parsedTarget && meta.target) {
                    parsedTarget = meta.target;
                }

                let calculatedStatus = latestBiomarkerData?.status || 'unknown';
                const val = parseFloat(lastValue.value);

                if (parsedTarget && !isNaN(val)) {
                    const [min, max] = parsedTarget;
                    if (min !== null && max !== null) {
                        if (val >= min && val <= max) calculatedStatus = 'normal';
                        else if (val < min) calculatedStatus = 'low';
                        else calculatedStatus = 'high';
                    }
                    else if (min !== null && max === null) {
                        if (val >= min) calculatedStatus = 'normal';
                        else calculatedStatus = 'low';
                    }
                    else if (min === null && max !== null) {
                        if (val <= max) calculatedStatus = 'normal';
                        else calculatedStatus = 'high';
                    }
                }

                const statusMap = {
                    normal: { label: 'IDEAL', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400', icon: CheckCircle2, priority: 3 },
                    high: { label: 'ALTO', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: AlertCircle, priority: 1 },
                    low: { label: 'BAIXO', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: AlertCircle, priority: 1 },
                    unknown: { label: 'ANÁLISE', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400', icon: Info, priority: 2 }
                };

                const statusConfig = statusMap[calculatedStatus] || statusMap.unknown;
                const cardColor = (calculatedStatus === 'normal') ? '#06b6d4' : (calculatedStatus === 'high' || calculatedStatus === 'low') ? '#ef4444' : meta.color;

                const biomarkerData = {
                    label: name,
                    technical: meta.technical,
                    value: lastValue.value,
                    unit: lastValue.unit,
                    color: cardColor,
                    icon: meta.icon,
                    status: calculatedStatus === 'normal' ? 'success' : 'danger',
                    trend: trend,
                    target: parsedTarget,
                    calculatedStatus,
                    statusConfig,
                    lastValue,
                    priority: statusConfig.priority,
                    category: getCategory(name)
                };

                return biomarkerData;
            }).filter(Boolean);

        // Sorting logic
        const sortedCards = [...cardsData].sort((a, b) => {
            if (sortBy === 'problems') {
                if (a.priority !== b.priority) return a.priority - b.priority;
            }
            return a.label.localeCompare(b.label);
        });

        // Group by category
        const groups = sortedCards.reduce((acc, card) => {
            if (!acc[card.category]) acc[card.category] = [];
            acc[card.category].push(card);
            return acc;
        }, {});

        if (Object.keys(groups).length === 0 && searchTerm) {
            return (
                <div className="col-span-full py-20 text-center">
                    <Search className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Nenhum indicador encontrado para "{searchTerm}"</p>
                </div>
            );
        }

        return Object.entries(groups).map(([category, cards]) => (
            <div key={category} className="col-span-full space-y-4 mb-8">
                <div className="flex items-center gap-2 px-2">
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-border-subtle" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{category}</h4>
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-border-subtle" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map(data => {
                        const { label, icon: Icon, statusConfig, trend, target, lastValue, technical, color } = data;

                        return (
                            <div
                                key={label}
                                onClick={() => setSelectedBiomarker(data)}
                                className="p-6 bg-white dark:bg-bg-elevated border border-zinc-200 dark:border-border-subtle rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${statusConfig.color.split(' ')[0]} bg-opacity-50`}>
                                            <Icon className={`w-6 h-6 ${statusConfig.color.split(' ')[1]}`} style={{ color: color }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                                {label}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </h3>
                                            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{technical}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-cyan-500">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="h-32 -mx-2 mb-4">
                                    <EnhancedAreaChart
                                        data={trend}
                                        color={color}
                                        targetRange={target}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-border-subtle">
                                    <div>
                                        <div className="flex items-baseline">
                                            <span className="text-2xl font-bold dark:text-white">{formatDisplayValue(lastValue.value)}</span>
                                            <span className="text-sm text-zinc-400 ml-1">{lastValue.unit}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Em {lastValue.date}</p>
                                    </div>
                                    {target && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Referência</p>
                                            <p className="text-xs font-medium dark:text-zinc-300">
                                                {target[0] === null ? '< ' : ''}
                                                {target[0] !== null ? formatDisplayValue(target[0]) : ''}
                                                {target[0] !== null && target[1] !== null ? ' - ' : ''}
                                                {target[1] === null ? ' > ' : ''}
                                                {target[1] !== null ? formatDisplayValue(target[1]) : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ));
    }, [exams, activeTab, sortBy, searchTerm, getBiomarkerTrend]);


    const physicalCards = React.useMemo(() => {
        if (!measurements.length) return null;

        const uniqueMeasurementKeys = new Set();
        measurements.forEach(m => {
            const data = m.analysis?.measurements || m.analysis;
            if (data && typeof data === 'object') {
                Object.keys(data).forEach(key => {
                    // Filtrar chaves que não são medidas
                    if (!['summary', 'recommendations', 'bmi', 'goal', 'previousInjuries', 'trainingDuration', 'trainingFrequency', 'sportsHistory', 'performanceIndicators'].includes(key)) {
                        uniqueMeasurementKeys.add(key);
                    }
                });
            }
        });

        const metadata = {
            weight: { label: 'Peso', icon: Scale, color: '#8b5cf6', defaultStatus: 'ESTÁVEL' },
            bodyFat: { label: 'Gordura Corporal', icon: Activity, color: '#ec4899', defaultStatus: 'EVOLUINDO' },
            bodyFatPercentage: { label: 'Gordura Corporal', icon: Activity, color: '#ec4899', defaultStatus: 'EVOLUINDO' },
            waist: { label: 'Cintura', icon: Target, color: '#06b6d4', defaultStatus: 'REDUZINDO' },
            waistCircumference: { label: 'Cintura', icon: Target, color: '#06b6d4', defaultStatus: 'REDUZINDO' },
            hip: { label: 'Quadril', icon: Activity, color: '#3b82f6', defaultStatus: 'NORMAL' },
            height: { label: 'Altura', icon: Ruler, color: '#6366f1', defaultStatus: 'FIXO' },
            chest: { label: 'Tórax', icon: Activity, color: '#f59e0b', defaultStatus: 'NORMAL' },
            abdomen: { label: 'Abdominal', icon: Target, color: '#06b6d4', defaultStatus: 'MONITORANDO' },
            imc: { label: 'IMC', icon: Scale, color: '#ef4444', defaultStatus: 'MONITORANDO' },
            muscleMass: { label: 'Massa Muscular', icon: Activity, color: '#06b6d4', defaultStatus: 'EVOLUINDO' },
            fatMass: { label: 'Massa Gorda', icon: Activity, color: '#ec4899', defaultStatus: 'REDUZINDO' },
            leanMass: { label: 'Massa Magra', icon: Activity, color: '#6366f1', defaultStatus: 'AUMENTANDO' },
            visceralFat: { label: 'Gordura Visceral', icon: AlertCircle, color: '#ef4444', defaultStatus: 'ATENÇÃO' },
            water: { label: 'Água Corporal', icon: Activity, color: '#3b82f6', defaultStatus: 'NORMAL' },
            totalBodyWater: { label: 'Água Corporal', icon: Activity, color: '#3b82f6', defaultStatus: 'NORMAL' },
            boneMass: { label: 'Massa Óssea', icon: Activity, color: '#6366f1', defaultStatus: 'FIXO' },
            metabolicAge: { label: 'Idade Metabólica', icon: Activity, color: '#f59e0b', defaultStatus: 'ESTÁVEL' },
            gripStrength: { label: 'Força de Preensão', icon: Activity, color: '#06b6d4', defaultStatus: 'AUMENTANDO' },
            flexibility: { label: 'Flexibilidade', icon: Ruler, color: '#3b82f6', defaultStatus: 'MELHORANDO' }
        };

        const getFriendlyLabel = (key) => {
            const entry = metadata[key];
            if (entry) return entry.label;

            // Tradução dinâmica e tratamento de camelCase
            let label = key
                .replace(/([A-Z])/g, ' $1')
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
                .replace('Basal Metabolic Rate', 'Taxa Metabólica Basal')
                .replace('Bmr', 'TMB')
                .trim();

            // Ajuste de gênero para Coxa e Panturrilha
            if (label.includes('Coxa') || label.includes('Panturrilha')) {
                label = label.replace('Direito', 'Direita').replace('Esquerdo', 'Esquerda');
            }

            return label;
        };

        const cards = Array.from(uniqueMeasurementKeys)
            .filter(key => {
                const label = getFriendlyLabel(key);
                return label.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map(key => {
                const trend = getMeasurementTrend(key);
                const lastData = trend[trend.length - 1];
                if (!lastData) return null;

                const meta = metadata[key] || {
                    label: getFriendlyLabel(key),
                    icon: Activity,
                    color: '#6366f1',
                    defaultStatus: 'REGISTRADO'
                };

                let status = meta.defaultStatus || 'REGISTRADO';
                if (trend.length >= 2) {
                    const prevValue = parseFloat(trend[trend.length - 2].value);
                    const currValue = parseFloat(lastData.value);
                    if (key === 'weight' || key === 'bodyFat' || key === 'waist') {
                        if (currValue < prevValue) status = 'EXCELENTE';
                        else if (currValue > prevValue) status = 'ATENÇÃO';
                    } else if (key === 'arm' || key === 'thigh') {
                        if (currValue > prevValue) status = 'CRESCENDO';
                    }
                }

                // Preparar dados para o Drawer
                const biomarkerData = {
                    label: meta.label,
                    technical: meta.label.toUpperCase(),
                    icon: meta.icon,
                    color: meta.color,
                    value: lastData.value,
                    unit: lastData.unit,
                    trend: trend,
                    status: status === 'EXCELENTE' || status === 'NORMAL' ? 'success' :
                        status === 'ATENÇÃO' ? 'danger' : 'warning'
                };

                const displayValue = formatDisplayValue(lastData.value);

                return {
                    key,
                    label: meta.label,
                    meta,
                    biomarkerData,
                    displayValue,
                    lastData,
                    status,
                    trend
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (sortBy === 'problems') {
                    // status 'ATENÇÃO' tem prioridade 1, outros prioridade 2
                    const aPrio = a.status === 'ATENÇÃO' ? 1 : 2;
                    const bPrio = b.status === 'ATENÇÃO' ? 1 : 2;
                    if (aPrio !== bPrio) return aPrio - bPrio;
                }
                return a.label.localeCompare(b.label);
            });

        return cards.map(({ key, label, meta, biomarkerData, displayValue, lastData, status }) => (
            <div key={key} className="p-8 bg-zinc-50/50 dark:bg-bg-secondary rounded-[3rem] border border-zinc-200 dark:border-border-subtle space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-bg-elevated rounded-2xl shadow-sm">
                            <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{label}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${status === 'EXCELENTE' || status === 'NORMAL' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' :
                            status === 'ATENÇÃO' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400'
                            }`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold dark:text-white">{displayValue}</span>
                            <span className="text-sm text-zinc-400 font-medium">{lastData.unit}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Última atualização em {lastData.date}</p>
                    </div>
                    <button
                        onClick={() => setSelectedBiomarker(biomarkerData)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        Ver Histórico Completo
                    </button>
                </div>
            </div>
        ));
    }, [measurements, sortBy, searchTerm, getMeasurementTrend]);

    const detectedInsights = React.useMemo(() => {
        if (!exams.length || !measurements.length) return [];

        const insights = [];

        // 1. Correlação: Peso vs Glicose
        const wTrend = getMeasurementTrend('weight');
        const gTrend = getBiomarkerTrend('Glicose');

        if (wTrend.length >= 2 && gTrend.length >= 2) {
            const wDiff = wTrend[wTrend.length - 1].value - wTrend[wTrend.length - 2].value;
            const gDiff = parseFloat(gTrend[gTrend.length - 1].value) - parseFloat(gTrend[gTrend.length - 2].value);

            if (wDiff < 0 && gDiff < 0) {
                insights.push({
                    title: 'Melhora Metabólica',
                    description: 'A redução de peso está correlacionada com a queda na sua glicemia. Ótimo sinal de sensibilidade insulínica!',
                    icon: Zap,
                    theme: 'success'
                });
            }
        }

        // 2. Correlação: Recomposição (Gordura vs Massa Muscular)
        const fTrend = getMeasurementTrend('bodyFat');
        const mTrend = getMeasurementTrend('muscleMass');

        if (fTrend.length >= 2 && mTrend.length >= 2) {
            const fDiff = fTrend[fTrend.length - 1].value - fTrend[fTrend.length - 2].value;
            const mDiff = mTrend[mTrend.length - 1].value - mTrend[mTrend.length - 2].value;

            if (fDiff < 0 && mDiff > 0) {
                insights.push({
                    title: 'Recomposição Ativa',
                    description: 'Você está perdendo gordura e ganhando massa muscular simultaneamente. Excelente qualidade de treino e dieta!',
                    icon: Sparkles,
                    theme: 'success'
                });
            }
        }

        // 3. Alerta: Colesterol total subindo
        const cTrend = getBiomarkerTrend('Colesterol Total');
        if (cTrend.length >= 2) {
            const cDiff = parseFloat(cTrend[cTrend.length - 1].value) - parseFloat(cTrend[cTrend.length - 2].value);
            if (cDiff > 10) {
                insights.push({
                    title: 'Atenção Lipídica',
                    description: 'Houve um aumento recente no seu colesterol. Vale revisar a ingestão de gorduras saturadas.',
                    icon: BrainCircuit,
                    theme: 'warning'
                });
            }
        }

        // 4. Nova: Deficiência de Vitamina D
        const vTrend = getBiomarkerTrend('Vitamina D');
        if (vTrend.length > 0) {
            const lastV = parseFloat(vTrend[vTrend.length - 1].value);
            if (lastV < 30) {
                insights.push({
                    title: 'Vitamina D em Alerta',
                    description: 'Seu nível atual está abaixo do ideal. Isso pode impactar sua imunidade e absorção de cálcio.',
                    icon: AlertCircle,
                    theme: 'warning',
                    priority: 1
                });
            }
        }

        // 5. Nova: Estabilidade Glicêmica
        const glucTrend = getBiomarkerTrend('Glicose');
        if (glucTrend.length >= 3) {
            const values = glucTrend.slice(-3).map(v => parseFloat(v.value));
            const variance = Math.max(...values) - Math.min(...values);
            if (variance < 5) {
                insights.push({
                    title: 'Controle Glicêmico Nota 10',
                    description: 'Sua glicose tem se mantido extremamente estável nos últimos exames. Excelente sinal de saúde metabólica.',
                    icon: CheckCircle2,
                    theme: 'success',
                    priority: 3
                });
            }
        }

        // 6. Nova: Hidratação Celular (Baseado em Água)
        const waterTrend = getMeasurementTrend('water');
        if (waterTrend.length > 0) {
            const lastW = waterTrend[waterTrend.length - 1]?.value;
            if (lastW > 50) { // Ex: acima de 50% de água
                insights.push({
                    title: 'Hidratação Otimizada',
                    description: 'Sua composição de água corporal está excelente, favorecendo a recuperação muscular e transporte de nutrientes.',
                    icon: Zap,
                    theme: 'success',
                    priority: 3
                });
            }
        }

        // --- Lógica de Fallback: Garantir pelo menos 3 cards ---
        if (insights.length < 3) {
            insights.push({
                title: 'Monitoramento Contínuo',
                description: 'A IA Nutrixo está processando seu histórico. Mantenha a frequência de registros para análises mais profundas.',
                icon: Activity,
                theme: 'success',
                priority: 4
            });
        }

        if (insights.length < 3) {
            insights.push({
                title: 'Consistência Nutricional',
                description: 'Aguardando mais dados de exames para analisar tendências de biomarcadores.',
                icon: CheckCircle2,
                theme: 'success',
                priority: 5
            });
        }

        // Adiciona prioridade básica aos anteriores se não tiverem e força o tema 'success' para consistência visual
        insights.forEach(insight => {
            if (!insight.priority) insight.priority = insight.theme === 'warning' ? 1 : 2;
            insight.theme = 'success'; // Padroniza para o visual Emerald solicitado
        });

        // Ordenar por prioridade (1 é maior prioridade) e limitar ou garantir os 3
        const sorted = insights.sort((a, b) => a.priority - b.priority);
        return sorted.slice(0, Math.max(3, sorted.length));
    }, [exams, measurements, getBiomarkerTrend, getMeasurementTrend]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Sincronizando sua evolução...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">

            {/* Header com Filtro de Período */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <Activity className="text-cyan-500" /> Hub de Progresso
                    </h1>
                    <p className="text-zinc-500 text-sm">Entenda como sua saúde evoluiu nos últimos {timeFilter === '30d' ? '30 dias' : timeFilter === '90d' ? '90 dias' : '365 dias'}.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {activeTab !== 'overview' && (
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar indicador..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-bg-secondary border border-zinc-200 dark:border-border-subtle rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all w-full md:w-48 dark:text-white"
                            />
                        </div>
                    )}

                    {activeTab !== 'overview' && (
                        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-bg-secondary rounded-2xl border border-zinc-200 dark:border-border-subtle shadow-inner">
                            {[
                                { id: 'alphabetical', label: 'AZ' },
                                { id: 'problems', label: 'Problemas' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortBy(opt.id)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === opt.id
                                        ? 'bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm border border-zinc-100 dark:border-zinc-600'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-bg-secondary rounded-2xl border border-zinc-200 dark:border-border-subtle shadow-inner">
                        {['30d', '90d', '1y'].map(period => (
                            <button
                                key={period}
                                onClick={() => setTimeFilter(period)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === period
                                    ? 'bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm border border-zinc-100 dark:border-zinc-600'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs Principal Navigation */}
            <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-border-subtle">
                {[
                    { id: 'overview', label: 'Dashboard Resumo', icon: Target },
                    { id: 'labs', label: 'Evolução Clínica', icon: FlaskConical },
                    { id: 'physical', label: 'Evolução Física', icon: Scale }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group px-6 py-4 flex items-center gap-2 text-sm font-medium transition-all relative ${activeTab === tab.id
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-cyan-500' : ''}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12 relative"
                    >
                        <ScannerLine />

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <AILogTerminal />
                            </div>

                            {/* Main Analysis Card (Sentinela Briefing) */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-10 bg-zinc-900 border border-zinc-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full -mr-64 -mt-64 blur-[120px]" />

                                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                                    <div className="flex-1 space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3.5 bg-cyan-500/20 rounded-[1.5rem]">
                                                <BrainCircuit className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/80 mb-1">Briefing Executivo de Saúde</h2>
                                                <p className="text-zinc-500 text-[10px] font-mono">Consistência de dados: 100% | Último processamento: Hoje</p>
                                            </div>
                                        </div>

                                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                                            {measurements.length > 0 || exams.length > 0 ? (
                                                <>Sua meta de saúde está <span className="text-cyan-400">em evolução</span>.</>
                                            ) : (
                                                <>Bem-vindo à sua <span className="text-cyan-400">Jornada de Saúde</span>.</>
                                            )}
                                        </h1>

                                        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
                                            {measurements.length > 0 || exams.length > 0 ? (
                                                "Nossa IA está analisando seus últimos registros para identificar padrões e otimizar seu plano. Continue mantendo a consistência para resultados exponenciais."
                                            ) : (
                                                "Para começar a receber insights personalizados do seu Briefing Executivo, realize o upload do seu primeiro exame laboratorial ou registre suas medidas físicas."
                                            )}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                                            <button className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                                                Visualizar Plano Otimizado
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                            {(exams.length > 0 || measurements.length > 0) && (
                                                <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
                                                    <CheckCircle2 className="w-4 h-4 text-cyan-500/50" />
                                                    Sincronizado com {exams.length + measurements.length} fontes de dados
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:pr-8">
                                        <AIScanCore />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Clusters de Saúde (Visão 360) */}
                            <div className="space-y-16">
                                {/* Grupo 1: Físico & Composição */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Scale className="w-5 h-5 text-zinc-400" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Composição Corporal</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg">Rolagem Horizontal</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => scroll(compRef, 'left')}
                                                    className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-zinc-500" />
                                                </button>
                                                <button
                                                    onClick={() => scroll(compRef, 'right')}
                                                    className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        ref={compRef}
                                        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
                                    >
                                        {(() => {
                                            if (!measurements.length) return null;
                                            const latest = measurements[0];
                                            const data = latest.analysis?.measurements || latest.analysis;
                                            if (!data) return null;

                                            const keys = Object.keys(data).filter(k =>
                                                !['summary', 'recommendations', 'bmi', 'goal', 'previousInjuries', 'trainingDuration', 'trainingFrequency', 'sportsHistory', 'performanceIndicators'].includes(k)
                                            );

                                            const mappedItems = keys.map(key => {
                                                const trendData = getMeasurementTrend(key);
                                                const lastVal = trendData[trendData.length - 1];
                                                const meta = {
                                                    weight: { label: 'Peso', icon: Scale, color: '#06b6d4' },
                                                    bodyFat: { label: 'Gordura corporal', icon: Activity, color: '#8b5cf6' },
                                                    muscleMass: { label: 'Massa Magra', icon: Zap, color: '#3b82f6' },
                                                    imc: { label: 'IMC', icon: Target, color: '#6366f1' },
                                                    waist: { label: 'Cintura', icon: Ruler, color: '#06b6d4' },
                                                    height: { label: 'Altura', icon: Ruler, color: '#3b82f6' },
                                                    neck: { label: 'Pescoço', icon: Ruler, color: '#8b5cf6' },
                                                    chest: { label: 'Peito', icon: Ruler, color: '#6366f1' },
                                                    belly: { label: 'Abdômen', icon: Ruler, color: '#f59e0b' },
                                                    hips: { label: 'Quadril', icon: Ruler, color: '#0ea5e9' },
                                                };

                                                const entry = meta[key] || {
                                                    label: translateLabel(key),
                                                    icon: Activity,
                                                    color: '#94a3b8'
                                                };

                                                return { key, entry, lastVal, trendData };
                                            });

                                            // Ordenação Alfabética por Rótulo Traduzido
                                            mappedItems.sort((a, b) => a.entry.label.localeCompare(b.entry.label, 'pt-BR'));

                                            // Deduplicação por Label Traduzido
                                            const uniqueMap = new Map();
                                            mappedItems.forEach(item => {
                                                const label = item.entry.label;
                                                // Se já existe, mantemos o que tem valor definido, ou o mais recente, ou simplesmente ignoramos o duplicado
                                                // Aqui vamos assumir que se já existe, não sobrescrevemos, a menos que o novo tenha dados e o antigo não (embora filtering acima já garanta dados)
                                                if (!uniqueMap.has(label)) {
                                                    uniqueMap.set(label, item);
                                                }
                                            });

                                            return Array.from(uniqueMap.values()).map((item, i) => (
                                                <SentinelCard
                                                    key={item.key}
                                                    label={item.entry.label}
                                                    value={item.lastVal?.value}
                                                    unit={item.lastVal?.unit || ''}
                                                    trend={item.lastVal ? 'Detectado' : 'Estável'}
                                                    status="success"
                                                    color={item.entry.color}
                                                    icon={item.entry.icon}
                                                    date={latest.created_at}
                                                    history={item.trendData}
                                                    delay={0.1 * i}
                                                    onClick={() => setSelectedMarker({
                                                        label: item.entry.label,
                                                        value: item.lastVal?.value,
                                                        unit: item.lastVal?.unit || '',
                                                        history: item.trendData,
                                                        date: latest.created_at
                                                    })}
                                                />
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* Grupo 2: Marcadores Vitais (Laboratório) */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <FlaskConical className="w-5 h-5 text-zinc-400" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Bio-Hacking & Vitalidade</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg">Rolagem Horizontal</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => scroll(bioRef, 'left')}
                                                    className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-zinc-500" />
                                                </button>
                                                <button
                                                    onClick={() => scroll(bioRef, 'right')}
                                                    className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        ref={bioRef}
                                        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
                                    >
                                        {(() => {
                                            if (exams.length === 0) return null;
                                            const latest = exams[0];
                                            const latestExams = [...(latest.analysis?.biomarkers || [])];

                                            // Ordenação Alfabética por Label Traduzido
                                            latestExams.sort((a, b) => translateLabel(a.name).localeCompare(translateLabel(b.name), 'pt-BR'));

                                            return Array.from(
                                                latestExams.reduce((map, exam) => {
                                                    const label = translateLabel(exam.name);
                                                    if (!map.has(label)) map.set(label, exam);
                                                    return map;
                                                }, new Map()).values()
                                            ).map((exam, i) => {
                                                const history = getBiomarkerTrend(exam.name);
                                                return (
                                                    <SentinelCard
                                                        key={i}
                                                        label={translateLabel(exam.name)}
                                                        value={exam.value}
                                                        unit={exam.unit}
                                                        trend={translateStatus(exam.status)}
                                                        status={exam.status === 'normal' || !exam.status ? 'success' : 'warning'}
                                                        color={i % 2 === 0 ? '#3b82f6' : '#f59e0b'}
                                                        icon={FlaskConical}
                                                        date={latest.created_at}
                                                        history={history}
                                                        delay={0.4 + (0.1 * i)}
                                                        onClick={() => setSelectedMarker({
                                                            label: translateLabel(exam.name),
                                                            value: exam.value,
                                                            unit: exam.unit,
                                                            history,
                                                            date: latest.created_at
                                                        })}
                                                    />
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* IA Footer: Insights Prioritários (v3) */}
                            <div className="space-y-8 pt-8">
                                <div className="flex items-center gap-4">
                                    <BrainCircuit className="w-5 h-5 text-cyan-500" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Insights Estratégicos da Sentinela</h3>
                                    <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
                                </div>
                                <CorrelationInsights insights={detectedInsights} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'labs' && (
                    <motion.div
                        key="labs"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {biomarkerCards}
                    </motion.div >
                )}

                {
                    activeTab === 'physical' && (
                        <motion.div
                            key="physical"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {physicalCards}
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >


            {/* Floating Action Hint if data is low */}
            {
                exams.length === 0 && measurements.length === 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-12 text-center bg-white dark:bg-bg-elevated rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 mt-6"
                    >
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Database className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white mb-2">Sua jornada começa aqui</h2>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                            Importe seu primeiro exame ou avaliação física para começar a rastrear sua evolução automaticamente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/20">
                                Importar Exame
                            </button>
                            <button className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:text-white rounded-2xl font-bold transition-all">
                                Adicionar Medidas
                            </button>
                        </div>
                    </motion.div>
                )
            }
            <BiomarkerDetailDrawer
                isOpen={!!selectedBiomarker}
                onClose={() => setSelectedBiomarker(null)}
                biomarker={selectedBiomarker}
            />

            {/* Modal de Detalhes do Biomarcador (v4) */}
            <BiomarkerDetailOverlay
                isOpen={!!selectedMarker}
                onClose={() => setSelectedMarker(null)}
                marker={selectedMarker}
            />
        </div>
    );
};

export default Progress;
