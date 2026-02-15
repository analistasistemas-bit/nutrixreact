import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ChevronRight,
    ArrowUpRight,
    Calendar,
    Target,
    Info,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    History,
    Ruler
} from 'lucide-react';
import { getExamHistory, getMeasurementHistory } from '../services/aiService';
import BiomarkerDetailDrawer from '../components/BiomarkerDetailDrawer';

// --- Sub-componente: InsightDrawer (Painel Lateral Contextual) ---
const InsightDrawer = ({ isOpen, onClose, insightData }) => {
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
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <Target className="w-5 h-5 text-emerald-500" />
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
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-widest mb-2 inline-block">Ajuste Sugerido</span>
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
                                        <span className="text-emerald-500 font-mono font-bold text-xs">{item.change}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/20">
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

// Start of formatDisplayValue
const formatDisplayValue = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '--';
    return val.toLocaleString('pt-BR');
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

// ... (EnhancedAreaChart stays same)

// ... inside Progress component ...


// --- Sub-componente: EnhancedAreaChart (Estética Opção B - Storytelling) ---
const EnhancedAreaChart = ({ data, color = "#10b981", height = 120, targetRange = null, showBaseline = true }) => {
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
    const [timeFilter, setTimeFilter] = useState('30d');
    const [exams, setExams] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBiomarker, setSelectedBiomarker] = useState(null);
    const [isInsightDrawerOpen, setIsInsightDrawerOpen] = useState(false);
    const [isTimelineHighlighted, setIsTimelineHighlighted] = useState(false);

    // Referência para a Timeline
    const timelineRef = React.useRef(null);

    const scrollToTimeline = () => {
        timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsTimelineHighlighted(true);
        setTimeout(() => setIsTimelineHighlighted(false), 2000);
    };

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

    // Helpers para dados
    const getBiomarkerTrend = (name) => {
        const trend = [];
        [...exams].reverse().forEach(exam => {
            const b = exam.analysis?.biomarkers?.find(x => x.name === name);
            if (b) trend.push({ value: b.value, date: new Date(exam.created_at).toLocaleDateString(), unit: b.unit });
        });
        return trend;
    };

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
                color: '#10b981', // Emerald
                target: [12, 16],
                action: 'Nutrição Ferro'
            },
        };

        return Array.from(uniqueBiomarkers).map(name => {
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

            // CORREÇÃO: Usar 'exams' do escopo (que agora está garantido pelo useMemo depender de [exams])
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
                normal: { label: 'IDEAL', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle2 },
                high: { label: 'ALTO', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: AlertCircle },
                low: { label: 'BAIXO', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: AlertCircle },
                unknown: { label: 'ANÁLISE', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400', icon: Info }
            };

            const statusConfig = statusMap[calculatedStatus] || statusMap.unknown;
            const cardColor = (calculatedStatus === 'normal') ? '#10b981' : (calculatedStatus === 'high' || calculatedStatus === 'low') ? '#ef4444' : meta.color;

            const biomarkerData = {
                label: name,
                technical: meta.technical,
                value: lastValue.value,
                unit: lastValue.unit,
                color: cardColor,
                icon: meta.icon,
                status: calculatedStatus === 'normal' ? 'success' : 'danger',
                trend: trend,
                target: parsedTarget
            };

            return (
                <div
                    key={name}
                    onClick={() => setSelectedBiomarker(biomarkerData)}
                    className="p-6 bg-white dark:bg-bg-elevated border border-zinc-200 dark:border-border-subtle rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${statusConfig.color.split(' ')[0]} bg-opacity-50`}>
                                <meta.icon className={`w-6 h-6 ${statusConfig.color.split(' ')[1]}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                    {name}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </h3>
                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{meta.technical}</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-emerald-500">
                            <ArrowUpRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-32 -mx-2 mb-4">
                        <EnhancedAreaChart
                            data={trend}
                            color={cardColor}
                            targetRange={parsedTarget}
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
                        {parsedTarget && (
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Referência</p>
                                <p className="text-xs font-medium dark:text-zinc-300">
                                    {parsedTarget[0] === null ? '< ' : ''}{formatDisplayValue(parsedTarget[0])}
                                    {parsedTarget[0] !== null && parsedTarget[1] !== null ? ' - ' : ''}
                                    {parsedTarget[1] === null ? ' > ' : ''}{formatDisplayValue(parsedTarget[1])}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    }, [exams, activeTab]);

    const getMeasurementTrend = (key) => {
        const trend = [];
        [...measurements].reverse().forEach(m => {
            const val = m.analysis?.measurements?.[key];
            if (val && typeof val === 'object' && val.value !== undefined) {
                trend.push({
                    value: val.value,
                    date: new Date(m.created_at).toLocaleDateString(),
                    unit: val.unit
                });
            }
        });
        return trend;
    };

    const physicalCards = React.useMemo(() => {
        if (!measurements.length) return null;

        const uniqueMeasurementKeys = new Set();
        measurements.forEach(m => {
            if (m.analysis?.measurements) {
                Object.keys(m.analysis.measurements).forEach(key => uniqueMeasurementKeys.add(key));
            }
        });

        const metadata = {
            weight: { label: 'Peso', icon: Scale, color: '#8b5cf6', defaultStatus: 'ESTÁVEL' },
            bodyFat: { label: 'Gordura Corporal', icon: Activity, color: '#ec4899', defaultStatus: 'EVOLUINDO' },
            waist: { label: 'Cintura', icon: Target, color: '#10b981', defaultStatus: 'REDUZINDO' },
            hip: { label: 'Quadril', icon: Activity, color: '#3b82f6', defaultStatus: 'NORMAL' },
            height: { label: 'Altura', icon: Ruler, color: '#6366f1', defaultStatus: 'FIXO' },
            chest: { label: 'Tórax', icon: Activity, color: '#f59e0b', defaultStatus: 'NORMAL' },
            abdomen: { label: 'Abdominal', icon: Target, color: '#10b981', defaultStatus: 'MONITORANDO' },
            imc: { label: 'IMC', icon: Scale, color: '#ef4444', defaultStatus: 'MONITORANDO' },
            muscleMass: { label: 'Massa Muscular', icon: Activity, color: '#10b981', defaultStatus: 'EVOLUINDO' },
            visceralFat: { label: 'Gordura Visceral', icon: AlertCircle, color: '#ef4444', defaultStatus: 'ATENÇÃO' },
            water: { label: 'Água Corporal', icon: Activity, color: '#3b82f6', defaultStatus: 'NORMAL' },
            boneMass: { label: 'Massa Óssea', icon: Activity, color: '#6366f1', defaultStatus: 'FIXO' }
        };

        const getFriendlyLabel = (key) => {
            const entry = metadata[key];
            if (entry) return entry.label;

            // Tradução dinâmica melhorada
            let label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace('Arm', 'Braço')
                .replace('Thigh', 'Coxa')
                .replace('Calf', 'Panturrilha')
                .replace('Forearm', 'Antebraço')
                .replace('Right', 'Direito')
                .replace('Left', 'Esquerdo')
                .replace('Mass', 'Massa')
                .replace('Fat', 'Gordura')
                .replace('Torax', 'Tórax')
                .replace('BasalMetabolicRate', 'Taxa Metabólica Basal')
                .trim();

            // Ajuste de gênero para Coxa
            if (label.includes('Coxa')) {
                label = label.replace('Direito', 'Direita').replace('Esquerdo', 'Esquerda');
            }

            return label;
        };

        const cards = Array.from(uniqueMeasurementKeys).map(key => {
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
            .sort((a, b) => a.label.localeCompare(b.label));

        return cards.map(({ key, label, meta, biomarkerData, displayValue, lastData, status, trend }) => (
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${status === 'EXCELENTE' || status === 'NORMAL' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
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
    }, [measurements, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Sincronizando sua evolução...</p>
            </div>
        );
    }

    const weightTrend = getMeasurementTrend('weight');
    const fatTrend = getMeasurementTrend('bodyFat');
    const vitDTrend = getBiomarkerTrend('Vitamina D');
    const glucoseTrend = getBiomarkerTrend('Glicose');

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header com Filtro de Período */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <Activity className="text-emerald-500" /> Hub de Progresso
                    </h1>
                    <p className="text-zinc-500 text-sm">Entenda como sua saúde evoluiu nos últimos {timeFilter === '30d' ? '30 dias' : timeFilter === '90d' ? '90 dias' : '365 dias'}.</p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-bg-secondary rounded-2xl border border-zinc-200 dark:border-border-subtle shadow-inner">
                    {['30d', '90d', '1y'].map(period => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === period
                                ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-100 dark:border-zinc-600'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
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
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-emerald-500' : ''}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-6"
                    >
                        {/* Seção de Insights IA (Storytelling) */}
                        <div className="p-8 bg-zinc-900 dark:bg-bg-elevated rounded-[2.5rem] border border-zinc-800 dark:border-border-subtle shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="p-4 bg-emerald-500/20 rounded-2xl">
                                    <Target className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Insight da Nutrixo</span>
                                        <span className="text-zinc-500 text-[10px] font-mono">Há 2 minutos</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white leading-tight">Você está no caminho certo para sua meta de gordura corporal.</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                                        Identificamos uma redução consistente de 1.2% na gordura corporal este mês. Isso reflete o ajuste proteico recente no seu plano. A Glicose em jejum também acompanhou essa queda, o que é um sinal excelente de flexibilidade metabólica.
                                    </p>
                                    <div className="pt-4 flex items-center gap-6">
                                        <button
                                            onClick={() => setIsInsightDrawerOpen(true)}
                                            className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Dica Plano Alimentar <ArrowRight className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={scrollToTimeline}
                                            className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Histórico Completo <History className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <InsightDrawer
                            isOpen={isInsightDrawerOpen}
                            onClose={() => setIsInsightDrawerOpen(false)}
                        />

                        {/* KPI Grid - Compacto e Semântico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Peso Atual', value: weightTrend[weightTrend.length - 1]?.value, unit: 'kg', trend: '-2.4kg', status: 'success', color: '#10b981', icon: Scale, trendLine: weightTrend },
                                { label: 'Gordura %', value: fatTrend[fatTrend.length - 1]?.value, unit: '%', trend: '-1.5%', status: 'success', color: '#8b5cf6', icon: Activity, trendLine: fatTrend },
                                { label: 'Vitamina D', value: vitDTrend[vitDTrend.length - 1]?.value, unit: 'ng/mL', trend: '+12%', status: 'warning', color: '#f59e0b', icon: FlaskConical, trendLine: vitDTrend },
                                { label: 'Glicose', value: glucoseTrend[glucoseTrend.length - 1]?.value, unit: 'mg/dL', trend: 'Estável', status: 'success', color: '#3b82f6', icon: Activity, trendLine: glucoseTrend }
                            ].map((card, i) => (
                                <div key={i} className="p-6 bg-white dark:bg-bg-elevated border border-zinc-200 dark:border-border-subtle rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-xl bg-opacity-10 bg-current`} style={{ color: card.color }}>
                                            <card.icon className="w-5 h-5" />
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${card.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                            'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20'
                                            }`}>
                                            {card.trend}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{card.label}</p>
                                    <h3 className="text-2xl font-mono font-bold dark:text-white mt-1">
                                        {card.value || '--'}
                                        <span className="text-sm font-normal text-zinc-400 ml-1">{card.unit}</span>
                                    </h3>
                                    <div className="mt-4 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <EnhancedAreaChart data={card.trendLine} color={card.color} height={24} showBaseline={false} />
                                    </div>
                                </div>
                            ))}
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

            {/* Timeline de Saúde - Global fora das tabs */}
            < div ref={timelineRef} className="pt-4" >
                <div className={`p-8 bg-white dark:bg-bg-elevated border border-zinc-200 dark:border-border-subtle rounded-[3rem] shadow-sm transition-all duration-700 ${isTimelineHighlighted ? 'ring-4 ring-emerald-500/30 bg-emerald-50/5' : ''}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                <History className="w-6 h-6 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">Timeline de Saúde</h3>
                                <p className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest">{exams.length} REGISTROS</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            ...exams.map(e => ({ ...e, type: 'exam' })),
                            ...measurements.map(m => ({ ...m, type: 'measurement' }))
                        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((event, i) => {
                            const isExam = event.type === 'exam';
                            const date = new Date(event.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                            const mainLabel = isExam ? 'Exame Laboratorial' : 'Avaliação Física';
                            const Icon = isExam ? FlaskConical : Scale;

                            // Extrair marcador principal para exibição clara
                            let highlightTitle = "";
                            let highlightValue = "";
                            let unit = "";

                            if (isExam) {
                                const biomarker = event.analysis?.biomarkers?.[0];
                                highlightTitle = biomarker?.name || "Check-up";
                                highlightValue = biomarker?.value || "--";
                                unit = biomarker?.unit || "";
                            } else {
                                const weight = event.analysis?.measurements?.weight;
                                highlightTitle = "Peso Corporal";
                                highlightValue = weight?.value || "--";
                                unit = weight?.unit || "kg";
                            }

                            return (
                                <div key={i} className="flex items-center gap-6 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all group">
                                    <div className={`p-3 rounded-xl ${isExam ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{date}</p>
                                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isExam ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {mainLabel}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold dark:text-white flex items-center gap-2">
                                            {highlightTitle}
                                            {isExam && event.analysis?.biomarkers?.length > 1 && (
                                                <span className="text-[9px] font-medium text-zinc-400">+{event.analysis.biomarkers.length - 1} outros marcadores</span>
                                            )}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-mono font-bold dark:text-white">{highlightValue}<span className="text-[10px] font-normal text-zinc-400 ml-1">{unit}</span></span>
                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Registrado</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div >

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
                            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20">
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
        </div>
    );
};

export default Progress;
