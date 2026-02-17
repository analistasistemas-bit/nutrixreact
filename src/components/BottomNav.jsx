import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { tabs } from '../data/tabs';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'dashboard';

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div
                className="flex items-center p-1 overflow-x-auto scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => {
                            if (!tab.comingSoon) {
                                navigate(tab.path);
                            }
                        }}
                        whileTap={{ scale: 0.9 }}
                        title={tab.comingSoon ? `${tab.label} em breve.` : tab.label}
                        aria-disabled={tab.comingSoon ? 'true' : 'false'}
                        className={`flex flex-col items-center p-1 rounded-lg flex-shrink-0 min-w-[56px] ${activeTab === tab.id
                            ? 'text-cyan-800 bg-cyan-100 dark:bg-cyan-900/40 dark:text-cyan-200 font-bold'
                            : tab.comingSoon
                                ? 'text-gray-400 dark:text-text-disabled opacity-60 cursor-not-allowed'
                            : 'text-gray-400 dark:text-text-disabled'
                            }`}
                    >
                        <span className="text-xl mb-1">{tab.emoji}</span>
                        <span className="text-[10px] font-medium whitespace-nowrap">{tab.label}</span>
                        {tab.comingSoon && (
                            <span className="text-[8px] font-bold uppercase leading-none mt-0.5 px-1 py-[1px] rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300">
                                Em breve
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
