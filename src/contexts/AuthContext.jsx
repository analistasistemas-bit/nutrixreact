import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../lib/supabase';

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
                const { data } = await supabase.auth.getSession();
                if (data?.session) {
                    const userData = {
                        ...data.session.user,
                        email: data.session.user.email?.toLowerCase()
                    };
                    setUser(userData);
                    setAccessToken(data.session.access_token);
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
            await supabase.auth.signOut();
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
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Verificar se o token expirou
        if (data.session.expires_at && new Date() > new Date(data.session.expires_at * 1000)) {
            setUser(null);
            setAccessToken(null);
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Atualizar token se mudou
        if (data.session.access_token !== accessToken) {
            setAccessToken(data.session.access_token);
        }

        return {
            email: data.session.user.email?.toLowerCase(),
            userId: data.session.user.id,
            token: data.session.access_token,
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

export default AuthContext;
