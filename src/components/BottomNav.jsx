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
                className="flex items-center p-2 overflow-x-auto scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center p-2 rounded-lg flex-shrink-0 min-w-[64px] ${activeTab === tab.id ? 'text-cyan-600 bg-cyan-50' : 'text-gray-400'
                            }`}
                    >
                        <span className="text-xl mb-1">{tab.emoji}</span>
                        <span className="text-[10px] font-medium whitespace-nowrap">{tab.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
