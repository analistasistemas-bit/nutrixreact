import { useEffect, useState } from 'react';

const initialNotifications = [
    { id: 1, title: 'Análise Concluída', description: 'Sua análise de Vitamina D está pronta.', type: 'labs', target: '/labs', time: '2 min', read: false },
    { id: 2, title: 'Hora do Almoço', description: 'Não se esqueça de registrar sua refeição.', type: 'food', target: '/food', time: '1h', read: false },
    { id: 3, title: 'Meta Atingida!', description: 'Parabéns! Você bateu sua meta de água.', type: 'success', target: '/', time: '3h', read: true }
];

const STORAGE_KEY = 'nutrixo_notifications_v1';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState(() => {
        if (typeof window === 'undefined') return initialNotifications;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return initialNotifications;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : initialNotifications;
        } catch {
            return initialNotifications;
        }
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch {
            // ignore storage errors
        }
    }, [notifications]);

    useEffect(() => {
        const handler = (event) => {
            const payload = event?.detail;
            if (!payload) return;
            setNotifications((prev) => [payload, ...prev].slice(0, 100));
        };
        window.addEventListener('nutrixo:add-notification', handler);
        return () => window.removeEventListener('nutrixo:add-notification', handler);
    }, []);

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return {
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead
    };
};
