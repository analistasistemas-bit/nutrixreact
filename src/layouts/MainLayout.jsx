import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Chatbot from '../components/Chatbot';
import AchievementToast from '../components/gamification/AchievementToast';
import LevelUpModal from '../components/gamification/LevelUpModal';
import { useNotifications } from '../hooks/useNotifications';
import { GamificationProvider } from '../contexts/GamificationContext';

const MainLayout = ({ user, onLogout }) => {
    const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();

    return (
        <GamificationProvider>
            <div className="min-h-screen bg-white text-gray-900 relative">
                <Header
                    user={user}
                    onLogout={onLogout}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkRead={markNotificationAsRead}
                    onMarkAllRead={markAllNotificationsAsRead}
                />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 pt-4">
                    <Outlet />
                </div>

                <BottomNav />
                <Chatbot />

                {/* Gamification overlays */}
                <AchievementToast />
                <LevelUpModal />
            </div>
        </GamificationProvider>
    );
};

export default MainLayout;
