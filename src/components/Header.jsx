import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Bell, ChevronDown, User, Settings, LogOut, Menu, X, Check, Moon, Sun } from 'lucide-react';
import { tabs } from '../data/tabs';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../hooks/useTheme';
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
    const { petStage, level } = useGamification();

    const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'dashboard';

    const handleNotificationClick = (id, target) => {
        onMarkRead(id);
        if (target) navigate(target);
        setTimeout(() => {
            setShowNotifications(false);
            setShowMobileNotifications(false);
        }, 200);
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
                                        onClick={() => navigate(tab.path)}
                                        whileHover={{ y: -1, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className={`relative flex items-center space-x-2 px-5 py-3 h-11 rounded-full font-bold text-sm tracking-tight border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 select-none ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-md shadow-cyan-500/25 ring-1 ring-black/5'
                                            : 'bg-white/80 dark:bg-bg-elevated border-gray-200/60 dark:border-border-subtle text-slate-600 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-hover hover:border-slate-300 dark:hover:border-border-strong hover:text-slate-900 dark:hover:text-text-primary hover:shadow-sm'
                                            }`}
                                    >
                                        <span className={`text-base leading-none filter ${activeTab === tab.id ? 'drop-shadow-sm' : ''} transition-transform duration-200 group-hover:scale-110`}>{tab.emoji}</span>
                                        <span className="hidden xl:inline">{tab.label}</span>
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
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="text-left hidden xl:block">
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white leading-none">{user.name}</p>
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
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-text-primary">{user.name}</p>
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
                                                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group">
                                                        <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-sm transition-all">
                                                            <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                                                        </div>
                                                        <span>Meu Perfil</span>
                                                    </button>
                                                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group">
                                                        <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-sm transition-all">
                                                            <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                                                        </div>
                                                        <span>Configurações</span>
                                                    </button>
                                                    <button
                                                        onClick={toggleTheme}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors group"
                                                    >
                                                        <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-sm transition-all">
                                                            {theme === 'dark' ? (
                                                                <Sun className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500" />
                                                            ) : (
                                                                <Moon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600" />
                                                            )}
                                                        </div>
                                                        <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                                                    </button>
                                                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>
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
                                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
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
                                            navigate(tab.path);
                                            setIsMenuOpen(false);
                                        }}
                                        whileTap={{ scale: 0.96 }}
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-full font-bold transition-all duration-200 border w-full text-sm ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white shadow-md'
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
                                        {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                                        <div className="mt-1 inline-flex items-center bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Membro Pro
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm">
                                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span>Ver Perfil Completo</span>
                                        <ChevronDown className="w-5 h-5 ml-auto -rotate-90 text-zinc-300 dark:text-zinc-600" />
                                    </button>
                                    <button className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl flex items-center space-x-4 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 hover:border-cyan-200 shadow-sm">
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
        </>
    );
};

export default Header;
