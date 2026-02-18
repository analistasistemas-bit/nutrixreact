import { useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

export const useGamificationSync = (totalXP, level, setTotalXP, userEmail = 'demo@nutrixo.com') => {
    // Carregar dados iniciais do banco
    useEffect(() => {
        const loadProfile = async () => {
            const normalizedEmail = userEmail?.toLowerCase();
            // Evitar chamadas desnecessárias/erros de RLS se não estiver logado
            if (!normalizedEmail || normalizedEmail.includes('demo@nutrixo.com')) return;

            try {
                const { data, error } = await supabase
                    .from('nutrixo_profiles')
                    .select('*')
                    .eq('user_email', normalizedEmail)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    console.log('Perfil carregado do Supabase:', data);
                    setTotalXP(data.xp);
                } else {
                    // Criar perfil inicial se não existir
                    await supabase
                        .from('nutrixo_profiles')
                        .insert({
                            user_email: normalizedEmail,
                            xp: totalXP,
                            level: level
                        });
                    console.log('Novo perfil criado no Supabase para:', normalizedEmail);
                }
            } catch (err) {
                console.error('Erro ao sincronizar com Supabase:', err);
            }
        };

        loadProfile();
    }, [userEmail, level, setTotalXP, totalXP]); // Só roda no mount ou se o user mudar

    // Salvar sempre que o XP mudar
    const persistXP = useCallback(async (newXP, newLevel) => {
        const normalizedEmail = userEmail?.toLowerCase();
        if (!normalizedEmail || normalizedEmail.includes('demo@nutrixo.com')) return;

        try {
            const { error } = await supabase
                .from('nutrixo_profiles')
                .update({ xp: newXP, level: newLevel })
                .eq('user_email', normalizedEmail);

            if (error) throw error;
            console.log('XP sincronizado com sucesso:', newXP);
        } catch (err) {
            console.error('Falha ao persistir XP:', err);
        }
    }, [userEmail]);

    return { persistXP };
};
