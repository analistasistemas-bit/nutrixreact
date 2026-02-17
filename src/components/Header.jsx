import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Bell, ChevronDown, User, Settings, LogOut, Menu, X, Check, Moon, Sun, AlertTriangle, Trash2, Trophy } from 'lucide-react';
import { tabs } from '../data/tabs';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../hooks/useTheme';
import { resetAuthenticatedUserData, RESET_CONFIRMATION_TEXT } from '../services/accountService';
import NutrixoIcon from '../assets/nutrixo-icon-v2.png';

const Header = ({ user, onLogout, notifications, unreadCount, onMarkRead, onMarkAllRead }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showMobileProfile, setShowMobileProfile] = useState(false);
    const [showMobileNotifications, setShowMobileNotifications] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPhrase, setConfirmPhrase] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDeletingData, setIsDeletingData] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const { petStage, level } = useGamification();

    // Extração segura de dados do usuário
    const displayName = user?.user_metadata?.name || user?.name || user?.email?.split('@')[0] || 'Usuário';
    const displayAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || user?.avatar;

    const activeTab = tabs.find(t =>
        location.pathname === t.path ||
        (t.path !== '/' && location.pathname.startsWith(t.path))
    )?.id || 'dashboard';

    const handleNotificationClick = (id, target) => {
        onMarkRead(id);
        if (target) navigate(target);
        setTimeout(() => {
            setShowNotifications(false);
            setShowMobileNotifications(false);
        }, 200);
    };

    const openDeleteModal = () => {
        setShowProfileMenu(false);
        setShowMobileProfile(false);
        setDeleteError('');
        setConfirmPhrase('');
        setConfirmPassword('');
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteError('');
        setConfirmPhrase('');
        setConfirmPassword('');
    };

    const isDeleteConfirmationValid =
        confirmPhrase.trim().toUpperCase() === RESET_CONFIRMATION_TEXT &&
        confirmPassword.trim().length >= 6;

    const handleDeleteData = async () => {
        if (!isDeleteConfirmationValid || isDeletingData) return;

        setIsDeletingData(true);
        setDeleteError('');

        try {
            await resetAuthenticatedUserData({
                password: confirmPassword,
                confirmationText: confirmPhrase.trim().toUpperCase(),
            });

            closeDeleteModal();
            await onLogout();
        } catch (error) {
            setDeleteError(error?.message || 'Falha ao excluir dados. Tente novamente.');
        } finally {
            setIsDeletingData(false);
        }
    };

    return (
        <>
            <header className="bg-white dark:bg-bg-primary border-b border-gray-100 dark:border-border-subtle sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center gap-2">
                                <img src={NutrixoIcon} alt="Nutrixo" className="h-9 w-9 rounded-xl shadow-sm shadow-cyan-500/20" />
                                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                    Nutrixo
                                </span>
                            </div>

                        </div>

                        {/* Desktop Navigation - Centered */}
                        <div className="hidden lg:flex flex-grow justify-center">
                            <div className="flex items-center gap-2">
                                {tabs.map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => {
                                            if (!tab.comingSoon) {
                                                navigate(tab.path);
                                            }
                                        }}
                                        whileHover={{ y: -1, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        title={tab.comingSoon ? `${tab.label} em breve.` : tab.label}
                                        aria-disabled={tab.comingSoon ? 'true' : 'false'}
                                        className={`relative flex items-center space-x-2 px-5 py-3 ${tab.comingSoon ? 'h-14' : 'h-11'} rounded-full font-bold text-sm tracking-tight border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 select-none ${tab.comingSoon
                                            ? 'opacity-60 cursor-not-allowed border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-100/60 dark:bg-zinc-800/40'
                                            : activeTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 border-transparent text-white shadow-md shadow-cyan-500/25 dark:shadow-cyan-500/10 ring-1 ring-black/5 dark:ring-white/10'
                                            : 'bg-white/80 dark:bg-bg-elevated border-gray-200/60 dark:border-border-subtle text-slate-600 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-hover hover:border-slate-300 dark:hover:border-border-strong hover:text-slate-900 dark:hover:text-text-primary hover:shadow-sm'
                                            }`}
                                    >
                                        <span className={`text-base leading-none filter ${activeTab === tab.id ? 'drop-shadow-sm' : ''} transition-transform duration-200 group-hover:scale-110`}>{tab.emoji}</span>
                                        <span className="hidden xl:flex flex-col items-start leading-tight">
                                            <span>{tab.label}</span>
                                            {tab.comingSoon && (
                                                <span className="text-[8px] font-bold uppercase leading-none mt-0.5 px-1 py-[1px] rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300">
                                                    Em breve
                                                </span>
                                            )}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Right Actions (Profile & Notifications) */}


                        <div className="hidden lg:flex items-center space-x-5">


                            <div
                                className="relative"
                                onMouseLeave={() => setShowProfileMenu(false)}
                            >
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/80 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-border-subtle"
                                >
                                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                        {displayAvatar ? (
                                            <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="text-left hidden xl:block">
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white leading-none">{displayName}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 dark:text-zinc-300 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Desktop Dropdown */}
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <div
                                            className="absolute right-0 top-full pt-2 z-[60]"
                                            onMouseLeave={() => setShowProfileMenu(false)}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="w-72 bg-white/80 dark:bg-bg-elevated backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-100 dark:border-border-subtle overflow-hidden origin-top-right"
                                            >
                                                <div className="p-5 border-b border-zinc-50 dark:border-border-subtle bg-gradient-to-br from-zinc-50 to-white dark:from-bg-secondary dark:to-bg-tertiary">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                            {displayName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-text-primary">{displayName}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center space-x-1 bg-white dark:bg-zinc-800 border border-cyan-100 dark:border-cyan-900/50 rounded-full px-1.5 py-0.5">
                                                                    <span className="text-xs">{petStage.emoji}</span>
                                                                    <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400">Lv.{level}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowNotifications(!showNotifications);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group justify-between"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-sm transition-all relative">
                                                                <Bell className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                                                                {unreadCount > 0 && !showNotifications && (
                                                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white"></span>
                                                                )}
                                                            </div>
                                                            <span>Notificações</span>
                                                        </div>
                                                        {unreadCount > 0 && (
                                                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Inline Notifications List within Menu */}
                                                    <AnimatePresence>
                                                        {showNotifications && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl mb-1"
                                                            >
                                                                <div className="px-2 py-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                                    {notifications.length === 0 ? (
                                                                        <div className="p-4 text-center text-xs text-gray-400 dark:text-slate-500">Sem notificações.</div>
                                                                    ) : (
                                                                        notifications.map(n => (
                                                                            <div key={n.id} onClick={() => handleNotificationClick(n.id, n.target)} className="py-2 border-b border-gray-100 last:border-0 cursor-pointer">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className={`text-xs ${!n.read ? 'font-bold text-gray-800 dark:text-slate-200' : 'text-gray-500 dark:text-slate-400'}`}>{n.title}</span>
                                                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{n.time}</span>
                                                                                </div>
                                                                                <p className="text-[10px] text-gray-400 line-clamp-1">{n.description}</p>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                    {unreadCount > 0 && (
                                                                        <button onClick={onMarkAllRead} className="w-full text-center text-[10px] text-cyan-600 dark:text-cyan-400 font-bold py-2 mt-1 border-t border-gray-200 dark:border-slate-700">
                                                                            Marcar todas como lidas
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <button
                                                        onClick={() => {
                                                            navigate('/gamer-profile');
                                                            setShowProfileMenu(false);
                                                        }}
                                                        className="w-full px-3 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
                                                                <Trophy className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Conquistas</p>
                                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Ver nível, badges e desafios</p>
                                                            </div>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigate('/account/profile');
                                                            setShowProfileMenu(false);
                                                        }}
                                                        className="w-full px-3 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30">
                                                                <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Meu Perfil</p>
                                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Ver configurações da conta</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigate('/account/settings');
                                                            setShowProfileMenu(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                                                                <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Configurações</p>
                                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Gerenciar preferências</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={toggleTheme}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
                                                                {theme === 'dark' ? (
                                                                    <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                                ) : (
                                                                    <Moon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Modo de Tema</p>
                                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>
                                                    <button
                                                        onClick={openDeleteModal}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                                                    >
                                                        <div className="p-1.5 bg-red-50 dark:bg-red-900/40 rounded-lg group-hover:bg-white dark:group-hover:bg-red-900/60 group-hover:shadow-sm transition-all">
                                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        </div>
                                                        <span className="flex items-center gap-1.5">
                                                            Excluir meus dados
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={onLogout}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                                                    >
                                                        <div className="p-1.5 bg-red-50 dark:bg-red-900/40 rounded-lg group-hover:bg-white dark:group-hover:bg-red-900/60 group-hover:shadow-sm transition-all">
                                                            <LogOut className="w-4 h-4 text-red-500" />
                                                        </div>
                                                        <span>Sair da Conta</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Mobile Menu & Profile */}
                        <div className="lg:hidden flex items-center space-x-3">

                            <button
                                onClick={() => setShowMobileNotifications(true)}
                                className="relative p-2 text-gray-400 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-50 focus:outline-none"
                                aria-label="Notificações"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold leading-none">{unreadCount}</span>
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setShowMobileProfile(true)}
                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white active:scale-95 transition-transform"
                            >
                                {displayAvatar ? <img src={displayAvatar} className="w-full h-full rounded-full" /> : displayName.charAt(0).toUpperCase()}
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden bg-white border-t border-gray-100 py-4"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-wrap justify-center gap-2">
                                {tabs.map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => {
                                            if (!tab.comingSoon) {
                                                navigate(tab.path);
                                                setIsMenuOpen(false);
                                            }
                                        }}
                                        whileTap={{ scale: 0.96 }}
                                        title={tab.comingSoon ? `${tab.label} em breve.` : tab.label}
                                        aria-disabled={tab.comingSoon ? 'true' : 'false'}
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-full font-bold transition-all duration-200 border w-full text-sm ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-md'
                                            : tab.comingSoon
                                                ? 'bg-zinc-100/70 dark:bg-zinc-800/50 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-60 cursor-not-allowed'
                                                : 'bg-white border-gray-200 text-slate-600'
                                            }`}
                                    >
                                        <span className="text-lg">{tab.emoji}</span>
                                        <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Mobile Notifications Bottom Sheet */}
            <AnimatePresence>
                {showMobileNotifications && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileNotifications(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-t-3xl shadow-2xl z-[70] lg:hidden overflow-hidden h-[80vh] flex flex-col"
                        >
                            <div className="flex justify-center pt-3 pb-1 flex-shrink-0" onClick={() => setShowMobileNotifications(false)}>
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>

                            <div className="p-4 border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center flex-shrink-0">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button onClick={onMarkAllRead} className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 font-bold bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1.5 rounded-full">
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                        <Bell className="w-12 h-12 text-gray-200" />
                                        <p>Tudo limpo por aqui!</p>
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification.id, notification.target)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-4 ${!notification.read
                                                ? 'bg-cyan-50/50 border-cyan-100 shadow-sm'
                                                : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!notification.read ? 'bg-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-900' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-base ${!notification.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-slate-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1 leading-snug">{notification.description}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                                <button onClick={() => setShowMobileNotifications(false)} className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold py-3.5 rounded-xl">
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Profile Bottom Sheet */}
            <AnimatePresence>
                {showMobileProfile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileProfile(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-[70] lg:hidden overflow-hidden"
                        >
                            <div className="flex justify-center pt-3 pb-1" onClick={() => setShowMobileProfile(false)}>
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-8 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
                                        {displayAvatar ? <img src={displayAvatar} className="w-full h-full rounded-full" /> : displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                                        <div className="mt-1 inline-flex items-center bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Membro Pro
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            navigate('/gamer-profile');
                                            setShowMobileProfile(false);
                                        }}
                                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm"
                                    >
                                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <span>Conquistas</span>
                                        <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-zinc-300 dark:text-zinc-600" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/account/profile');
                                            setShowMobileProfile(false);
                                        }}
                                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm"
                                    >
                                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span>Meu Perfil</span>
                                        <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-zinc-300 dark:text-zinc-600" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/account/settings');
                                            setShowMobileProfile(false);
                                        }}
                                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm"
                                    >
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <span>Configurações</span>
                                        <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-zinc-300 dark:text-zinc-600" />
                                    </button>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm"
                                    >
                                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                        </div>
                                        <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                                        <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-zinc-300 dark:text-zinc-600" />
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={openDeleteModal}
                                        className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold p-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-red-100 dark:hover:bg-red-900/30 mb-3"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="flex items-center gap-1.5">
                                            Excluir meus dados
                                            <AlertTriangle className="w-4 h-4" />
                                        </span>
                                    </button>
                                    <button
                                        onClick={onLogout}
                                        className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-red-100"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sair da Conta</span>
                                    </button>
                                    <p className="text-center text-gray-400 text-xs mt-4">Versão 1.0.2</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!isDeletingData) closeDeleteModal();
                            }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed z-[100] inset-0 p-4 sm:p-6 flex items-center justify-center"
                        >
                            <div className="w-full max-w-xl rounded-3xl border border-red-200/70 dark:border-red-900/40 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/30 bg-red-50/70 dark:bg-red-900/10">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-red-700 dark:text-red-400">Excluir todos os meus dados</h3>
                                            <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-1">
                                                Esta ação é irreversível e remove seu histórico no Nutrixo.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-5 space-y-4">
                                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Consequências</p>
                                        <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                                            <li>Exclui exames, medidas, planos, refeições e histórico de chat.</li>
                                            <li>Remove arquivos enviados no storage (bucket uploads).</li>
                                            <li>Reinicia progresso/gamificação para o estado inicial.</li>
                                            <li>Sua conta continua existindo, mas os dados serão perdidos.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                            Digite exatamente: {RESET_CONFIRMATION_TEXT}
                                        </label>
                                        <input
                                            value={confirmPhrase}
                                            onChange={(e) => setConfirmPhrase(e.target.value)}
                                            placeholder={RESET_CONFIRMATION_TEXT}
                                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
                                            disabled={isDeletingData}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                            Confirme sua senha
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Sua senha atual"
                                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
                                            disabled={isDeletingData}
                                        />
                                    </div>

                                    {deleteError && (
                                        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                                            {deleteError}
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                                    <button
                                        onClick={closeDeleteModal}
                                        disabled={isDeletingData}
                                        className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteData}
                                        disabled={!isDeleteConfirmationValid || isDeletingData}
                                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isDeletingData ? 'Apagando dados...' : 'Apagar tudo e recomeçar'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
