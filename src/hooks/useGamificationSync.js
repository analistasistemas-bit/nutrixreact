import { useEffect, useCallback } from 'react';
import insforge from '../lib/insforge';

export const useGamificationSync = (totalXP, level, setTotalXP, userEmail = 'demo@nutrixo.com') => {
    // Carregar dados iniciais do banco
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data, error } = await insforge.database
                    .from('nutrixo_profiles')
                    .select('*')
                    .eq('user_email', userEmail)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    console.log('Perfil carregado do Insforge:', data);
                    setTotalXP(data.xp);
                } else {
                    // Criar perfil inicial se não existir
                    await insforge.database
                        .from('nutrixo_profiles')
                        .insert({
                            user_email: userEmail,
                            xp: totalXP,
                            level: level
                        });
                    console.log('Novo perfil criado no Insforge para:', userEmail);
                }
            } catch (err) {
                console.error('Erro ao sincronizar com Insforge:', err);
            }
        };

        loadProfile();
    }, [userEmail]); // Só roda no mount ou se o user mudar

    // Salvar sempre que o XP mudar (Debounced opcionalmente, mas aqui faremos direto por enquanto)
    const persistXP = useCallback(async (newXP, newLevel) => {
        try {
            const { error } = await insforge.database
                .from('nutrixo_profiles')
                .update({ xp: newXP, level: newLevel })
                .eq('user_email', userEmail);

            if (error) throw error;
            console.log('XP sincronizado com sucesso:', newXP);
        } catch (err) {
            console.error('Falha ao persistir XP:', err);
        }
    }, [userEmail]);

    return { persistXP };
};
