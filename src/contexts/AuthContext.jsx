import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import insforge from '../lib/insforge';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const sessionChecked = useRef(false);

    // Restaurar sessão ao carregar o app
    useEffect(() => {
        if (sessionChecked.current) return;
        sessionChecked.current = true;

        const restoreSession = async () => {
            try {
                const { data } = await insforge.auth.getCurrentSession();
                if (data?.session) {
                    setUser(data.session.user);
                    setAccessToken(data.session.accessToken);
                }
            } catch (err) {
                console.error('Erro ao restaurar sessão:', err);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login
    const login = useCallback((userData, token) => {
        setUser(userData);
        setAccessToken(token || null);
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await insforge.auth.signOut();
        } catch (err) {
            console.error('Erro no logout:', err);
        }
        setUser(null);
        setAccessToken(null);
    }, []);

    /**
     * 🛡️ requireAuth — Verifica se a sessão está ativa.
     * Deve ser chamada antes de qualquer operação sensível.
     * Retorna o email do usuário autenticado.
     * Lança erro se não há sessão ou se o JWT expirou.
     */
    const requireAuth = useCallback(async () => {
        const { data, error } = await insforge.auth.getCurrentSession();

        if (error || !data?.session) {
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Verificar se o token expirou
        if (data.session.expiresAt && new Date() > new Date(data.session.expiresAt)) {
            setUser(null);
            setAccessToken(null);
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Atualizar token se mudou
        if (data.session.accessToken !== accessToken) {
            setAccessToken(data.session.accessToken);
        }

        return {
            email: data.session.user.email,
            userId: data.session.user.id,
            token: data.session.accessToken,
        };
    }, [accessToken]);

    const isAuthenticated = !!user;

    const value = {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        requireAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    }
    return ctx;
};

export default AuthContext;
