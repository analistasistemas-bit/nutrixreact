import React from 'react';
import { Settings2, Bell, Accessibility, Globe, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ToggleSwitch from '../components/common/ToggleSwitch';

const SETTINGS_KEY = 'nutrixo-user-settings-v1';

const defaultSettings = {
    pushNotifications: true,
    emailNotifications: true,
    reduceAnimations: false,
    largerText: false,
    language: 'pt-BR',
};

const AccountSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = React.useState(defaultSettings);
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                setSettings({ ...defaultSettings, ...JSON.parse(raw) });
            }
        } catch {
            setSettings(defaultSettings);
        }
    }, []);

    const patchSettings = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1500);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-cyan-100/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 p-6 sm:p-8 shadow-xl dark:shadow-2xl shadow-indigo-200/40 dark:shadow-indigo-900/20 mb-6">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl" />
                <h1 className="relative text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-indigo-500 dark:text-indigo-300" /> Configurações
                </h1>
                <p className="relative text-sm text-zinc-600 dark:text-indigo-100/80 mt-1">Gerencie suas preferências de experiência no app.</p>
                {saved && (
                    <p className="relative text-xs text-emerald-600 dark:text-emerald-300 font-bold mt-2">Alterações salvas.</p>
                )}
            </div>

            <div className="bg-white border border-zinc-200/80 dark:bg-slate-900/95 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg dark:shadow-xl mb-6">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cyan-600/80 dark:text-cyan-300/80" /> Notificações
                </h2>
                <ToggleSwitch
                    id="push-notifications-toggle"
                    checked={settings.pushNotifications}
                    onChange={(value) => patchSettings({ pushNotifications: value })}
                    label="Notificações push"
                />
                <ToggleSwitch
                    id="email-notifications-toggle"
                    checked={settings.emailNotifications}
                    onChange={(value) => patchSettings({ emailNotifications: value })}
                    label="Notificações por e-mail"
                />
            </div>

            <div className="bg-white border border-zinc-200/80 dark:bg-slate-900/95 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg dark:shadow-xl mb-6">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Accessibility className="w-5 h-5 text-cyan-600/80 dark:text-cyan-300/80" /> Acessibilidade
                </h2>
                <ToggleSwitch
                    id="reduce-animations-toggle"
                    checked={settings.reduceAnimations}
                    onChange={(value) => patchSettings({ reduceAnimations: value })}
                    label="Reduzir animações"
                />
                <ToggleSwitch
                    id="larger-text-toggle"
                    checked={settings.largerText}
                    onChange={(value) => patchSettings({ largerText: value })}
                    label="Texto maior"
                />
            </div>

            <div className="bg-white border border-zinc-200/80 dark:bg-slate-900/95 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg dark:shadow-xl">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-600/80 dark:text-cyan-300/80" /> App
                </h2>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-800 dark:text-slate-100">Idioma</span>
                    <select
                        value={settings.language}
                        onChange={(e) => patchSettings({ language: e.target.value })}
                        className="rounded-lg border border-zinc-300 bg-white text-zinc-800 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                    >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                    </select>
                </div>

                <button
                    onClick={toggleTheme}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-900/30"
                >
                    <Moon className="w-4 h-4" />
                    Alternar tema ({theme === 'dark' ? 'Escuro' : 'Claro'})
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;
