import { BarChart3, Activity, Ruler, TrendingUp, FileText, Camera, Gamepad2 } from 'lucide-react';

export const tabs = [
    { id: 'dashboard', path: '/', name: 'Dashboard', icon: BarChart3, emoji: '📊', label: 'Dashboard' },
    { id: 'labs', path: '/labs', name: 'Exames', icon: Activity, emoji: '🧪', label: 'Exames' },
    { id: 'measurements', path: '/measurements', name: 'Medidas', icon: Ruler, emoji: '📏', label: 'Medidas' },
    { id: 'progress', path: '/progress', name: 'Progresso', icon: TrendingUp, emoji: '📈', label: 'Progresso' },
    { id: 'nutrition-plan', path: '/nutrition-plan', name: 'Plano Alimentar', icon: FileText, emoji: '🍽️', label: 'Plano' },
    { id: 'food', path: '/food', name: 'Alimentação', icon: Camera, emoji: '🥗', label: 'Diário' },
    { id: 'gamer-profile', path: '/gamer-profile', name: 'Perfil', icon: Gamepad2, emoji: '🎮', label: 'Perfil' }
];
