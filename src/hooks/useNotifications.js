import { useState } from 'react';

const initialNotifications = [
    { id: 1, title: 'Análise Concluída', description: 'Sua análise de Vitamina D está pronta.', type: 'labs', target: '/labs', time: '2 min', read: false },
    { id: 2, title: 'Hora do Almoço', description: 'Não se esqueça de registrar sua refeição.', type: 'food', target: '/food', time: '1h', read: false },
    { id: 3, title: 'Meta Atingida!', description: 'Parabéns! Você bateu sua meta de água.', type: 'success', target: '/', time: '3h', read: true }
];

export const useNotifications = () => {
    const [notifications, setNotifications] = useState(initialNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

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
