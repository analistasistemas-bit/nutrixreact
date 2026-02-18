import supabase from '../lib/supabase';

export const RESET_CONFIRMATION_TEXT = 'EXCLUIR MEUS DADOS';

async function getAuthenticatedSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const email = data.session.user?.email;
    if (!email) {
        throw new Error('Não foi possível identificar o usuário autenticado.');
    }

    return { email, user: data.session.user };
}

async function reauthenticate(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        throw new Error('Senha inválida. Confirme sua senha para continuar.');
    }
}

async function runAtomicResetRpc() {
    const { data, error } = await supabase.rpc('rpc_reset_my_data');

    if (error) {
        throw new Error(
            'Falha no reset transacional no backend. Aplique a função SQL rpc_reset_my_data antes de tentar novamente.'
        );
    }

    return data || {};
}

export async function resetAuthenticatedUserData({ password, confirmationText }) {
    if (confirmationText !== RESET_CONFIRMATION_TEXT) {
        throw new Error('Frase de confirmação inválida.');
    }

    if (!password || password.length < 6) {
        throw new Error('Informe sua senha atual para confirmar.');
    }

    const { email } = await getAuthenticatedSession();
    await reauthenticate(email, password);

    const rpcResult = await runAtomicResetRpc();
    const fileKeys = Array.isArray(rpcResult?.file_keys)
        ? rpcResult.file_keys.filter(Boolean)
        : [];

    if (fileKeys.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('uploads')
            .remove(fileKeys);

        if (storageError) {
            throw new Error(`Dados apagados, mas houve falha ao remover alguns arquivos: ${storageError.message}`);
        }
    }

    return {
        email,
        deletedFiles: fileKeys.length,
        deletedFromDb: rpcResult,
    };
}
