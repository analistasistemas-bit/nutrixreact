import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Shield, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import supabase from '../lib/supabase';
import { FADE_UP, STAGGER_CONTAINER, STAGGER_ITEM } from '../lib/animations';

const AccountProfile = () => {
    const { user, login, accessToken } = useAuth();
    const [displayName, setDisplayName] = React.useState(
        user?.user_metadata?.name || user?.name || user?.email?.split('@')[0] || ''
    );
    const [avatarUrl, setAvatarUrl] = React.useState(
        user?.user_metadata?.avatar_url || user?.user_metadata?.avatar || user?.avatar || ''
    );
    const [isSaving, setIsSaving] = React.useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setMessage('');
        setIsUploadingAvatar(true);

        try {
            const isImage = file.type.startsWith('image/');
            if (!isImage) throw new Error('Selecione uma imagem válida (JPG, PNG ou WEBP).');

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) throw new Error('A imagem deve ter no máximo 5MB.');

            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);

            if (uploadError || !uploadData?.path) {
                throw new Error(uploadError?.message || 'Falha ao enviar imagem.');
            }

            const { data: urlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(uploadData.path);

            setAvatarUrl(urlData.publicUrl);
            setMessage('Imagem enviada com sucesso. Clique em "Salvar Perfil" para confirmar.');
        } catch (err) {
            setError(err?.message || 'Não foi possível enviar a imagem.');
        } finally {
            setIsUploadingAvatar(false);
            event.target.value = '';
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        setError('');

        try {
            const { error: profileError } = await supabase.auth.updateUser({
                data: {
                    name: displayName,
                    avatar_url: avatarUrl || null,
                },
            });

            if (profileError) throw new Error(profileError.message || 'Falha ao salvar perfil.');

            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !data?.session) {
                throw new Error('Perfil salvo, mas não foi possível atualizar sua sessão.');
            }

            login(data.session.user, accessToken || data.session.access_token || null);
            setMessage('Perfil atualizado com sucesso.');
        } catch (err) {
            setError(err?.message || 'Erro ao atualizar perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto pb-20"
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                variants={STAGGER_ITEM}
                className="relative overflow-hidden rounded-3xl border border-cyan-200/70 dark:border-cyan-500/20
                    bg-gradient-to-br from-cyan-50 via-white to-blue-100/80
                    dark:from-bg-secondary dark:via-bg-primary dark:to-cyan-950/40
                    p-6 sm:p-8 shadow-xl shadow-cyan-200/50 dark:shadow-cyan-900/20 mb-6"
            >
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative">
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-text-primary">Meu Perfil</h1>
                    <p className="text-sm text-zinc-600 dark:text-text-muted mt-1">
                        Atualize seus dados de conta e identidade no ecossistema Nutrixo.
                    </p>
                </div>
            </motion.div>

            {/* Formulário principal */}
            <motion.div
                variants={STAGGER_ITEM}
                className="bg-white dark:bg-bg-elevated border border-zinc-200/80 dark:border-border-subtle
                    rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg dark:shadow-xl"
            >
                {/* Nome */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-text-muted">
                        Nome de exibição
                    </label>
                    <div className="mt-2 relative">
                        <User className="w-4 h-4 text-zinc-400 dark:text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full pl-9 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-border-subtle
                                bg-white dark:bg-bg-tertiary
                                text-sm text-zinc-900 dark:text-text-primary
                                placeholder:text-zinc-400 dark:placeholder:text-text-disabled
                                focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                            placeholder="Seu nome"
                        />
                    </div>
                </div>

                {/* Avatar */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-text-muted">
                        Avatar
                    </label>
                    <div className="mt-2 rounded-2xl border border-zinc-200 dark:border-border-subtle
                        bg-zinc-50/70 dark:bg-bg-secondary p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600
                                flex items-center justify-center text-white font-black text-xl overflow-hidden flex-shrink-0">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Prévia do avatar" className="w-full h-full object-cover" />
                                ) : (
                                    displayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                        bg-zinc-900 text-white dark:bg-bg-hover dark:text-text-primary
                                        text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isUploadingAvatar ? 'Enviando...' : 'Enviar imagem'}
                                </button>
                                <p className="text-[11px] text-zinc-500 dark:text-text-muted">
                                    JPG, PNG ou WEBP (máx. 5MB)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* E-mail (readonly) */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-text-muted">
                        E-mail
                    </label>
                    <div className="mt-2 relative">
                        <Mail className="w-4 h-4 text-zinc-400 dark:text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={user?.email || ''}
                            readOnly
                            className="w-full pl-9 pr-3 py-3 rounded-xl border border-zinc-200 dark:border-border-subtle
                                bg-zinc-100/80 dark:bg-bg-secondary
                                text-sm text-zinc-500 dark:text-text-disabled cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Feedback */}
                {message && (
                    <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/40
                        bg-emerald-50 dark:bg-emerald-500/10
                        px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="rounded-xl border border-red-300 dark:border-red-500/40
                        bg-red-50 dark:bg-red-500/10
                        px-3 py-2 text-sm text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={isSaving || !displayName.trim()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                        bg-gradient-to-r from-cyan-600 to-blue-600
                        hover:from-cyan-500 hover:to-blue-500
                        text-white text-sm font-bold disabled:opacity-60
                        shadow-lg shadow-cyan-900/30 transition-all"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                </button>
            </motion.div>

            {/* Segurança */}
            <motion.div
                variants={STAGGER_ITEM}
                className="mt-6 bg-white dark:bg-bg-elevated border border-red-200/70 dark:border-red-900/40
                    rounded-3xl p-6 sm:p-8 space-y-3 shadow-lg dark:shadow-xl"
            >
                <h2 className="text-lg font-black text-zinc-900 dark:text-text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500/80 dark:text-red-400" /> Segurança e Dados
                </h2>
                <p className="text-sm text-zinc-600 dark:text-text-secondary">
                    Para redefinir sua conta, use a opção <span className="font-bold">Excluir meus dados</span> no menu do perfil.
                </p>
                <p className="text-xs text-red-600/90 dark:text-red-400/80 inline-flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> A operação é irreversível.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default AccountProfile;
