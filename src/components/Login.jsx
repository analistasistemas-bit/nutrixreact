import React, { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import NutrixoIcon from '../assets/nutrixo-icon-v2.png';
import { z } from 'zod';
import insforge from '../lib/insforge';

const loginSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const Login = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [isDev] = useState(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const handleLoginSuccess = (userData, token) => {
        setIsSuccess(true);
        setTimeout(() => {
            onLogin(userData, token);
        }, 800);
    };

    const checkValidity = () => {
        const result = loginSchema.safeParse({ email, password });
        if (isSignUp && name.length < 2) return false;
        return result.success;
    };

    const isValid = checkValidity();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });
            setFieldErrors(errors);
            return;
        }

        if (isSignUp && name.trim().length < 2) {
            setFieldErrors({ ...fieldErrors, name: 'Nome deve ter pelo menos 2 caracteres.' });
            return;
        }

        setIsLoading(true);

        const attemptAuth = async () => {
            try {
                if (isSignUp) {
                    // Sign Up Flow
                    const { data, error } = await insforge.auth.signUp({
                        email,
                        password,
                        name,
                    });

                    if (error) {
                        setError(error.message || 'Erro ao criar conta.');
                        setIsLoading(false);
                        return;
                    }

                    if (data?.requireEmailVerification) {
                        setVerificationSent(true);
                        setIsLoading(false);
                        return;
                    }

                    if (data?.accessToken) {
                        handleLoginSuccess(data.user, data.accessToken);
                    } else {
                        // Caso onde o signUp não retorna sessão imediata mas não requer verificação (raro)
                        // Tentamos login automático
                        await attemptLoginOnly();
                    }

                } else {
                    // Sign In Flow
                    await attemptLoginOnly();
                }
            } catch (err) {
                setError('Falha na conexão com o servidor.');
                setIsLoading(false);
            }
        };

        const attemptLoginOnly = async () => {
            const { data, error } = await insforge.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.error === 'INVALID_CREDENTIALS' && isDev) {
                    console.warn('DEV: Bypass login simulado');
                    handleLoginSuccess({ email, name: 'Diego (Dev)' }, null);
                    return;
                }
                setError(error.message || 'E-mail ou senha incorretos.');
                setIsLoading(false);
                return;
            }

            if (data) {
                handleLoginSuccess(data.user, data.accessToken);
            }
        };

        attemptAuth();
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setFieldErrors({});
        setVerificationSent(false);
    };

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEmail = params.get('email');
        const urlPass = params.get('pass');

        if (urlEmail) setEmail(urlEmail);
        if (urlPass) setPassword(urlPass);

        if (urlEmail && urlPass && !isSignUp) {
            const result = loginSchema.safeParse({ email: urlEmail, password: urlPass });
            if (result.success) {
                setTimeout(() => {
                    document.getElementById('login-submit')?.click();
                }, 500);
            }
        }
    }, [isSignUp]);



    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setVerifying(true);
        setError('');

        try {
            const { data, error } = await insforge.auth.verifyEmail({
                email,
                otp: otp,
            });

            if (error) throw error;

            if (data?.accessToken) {
                handleLoginSuccess(data.user, data.accessToken);
            }
        } catch (err) {
            setError(err.message || 'Código inválido ou expirado.');
            setVerifying(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="min-h-screen w-full bg-black flex items-center justify-center font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-800 p-10 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h2>
                    <p className="text-zinc-400 mb-6 text-sm">
                        Enviamos um código de confirmação para <strong className="text-white">{email}</strong>.
                        Digite o código abaixo para ativar sua conta.
                    </p>

                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="block w-full text-center py-4 bg-black/40 border border-zinc-700 rounded-xl text-white text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none placeholder:tracking-normal placeholder:text-zinc-700"
                            autoFocus
                            required
                        />

                        {error && (
                            <p className="text-red-400 text-xs">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={otp.length < 6 || verifying}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${otp.length === 6 && !verifying
                                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/20'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {verifying ? 'Verificando...' : 'Verificar Código'}
                        </button>
                    </form>

                    <button
                        onClick={() => {
                            setVerificationSent(false);
                            setOtp('');
                            setError('');
                        }}
                        className="mt-6 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                    >
                        Voltar e corrigir e-mail
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center font-sans">

            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-zinc-800/50 p-8 md:p-10">

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 bg-transparent flex items-center justify-center mx-auto mb-4"
                        >
                            <img src={NutrixoIcon} alt="Nutrixo" className="w-full h-full object-contain rounded-[1.5rem] shadow-lg shadow-cyan-500/20" />
                        </motion.div>

                        <motion.h1
                            key={isSignUp ? 'signup' : 'signin'}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
                        </motion.h1>
                        <p className="text-zinc-400 text-sm">
                            {isSignUp ? 'Comece sua jornada de saúde hoje' : 'Acompanhe sua saúde de forma inteligente'}
                        </p>
                    </div>

                    <form id="login-form" onSubmit={handleSubmit} className="space-y-5">

                        {isSignUp && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                overflow="hidden"
                                className="space-y-2"
                            >
                                <label className="text-sm font-semibold text-zinc-300 ml-1">Nome</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Activity className="h-5 w-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none sm:text-sm"
                                        placeholder="Seu nome"
                                        required={isSignUp}
                                    />
                                </div>
                                {fieldErrors.name && (
                                    <p className="text-red-400 text-[10px] mt-1 ml-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none sm:text-sm"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-red-400 text-[10px] mt-1 ml-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-semibold text-zinc-300">Senha</label>
                                {!isSignUp && (
                                    <a href="#" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Esqueceu a senha?
                                    </a>
                                )}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-red-400 text-[10px] mt-1 ml-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center space-x-2 text-red-400 text-xs font-medium"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <motion.button
                            id="login-submit"
                            whileHover={{ scale: isValid && !isLoading ? 1.02 : 1 }}
                            whileTap={{ scale: isValid && !isLoading ? 0.98 : 1 }}
                            type="submit"
                            disabled={!isValid || isLoading || isSuccess}
                            className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold text-base transition-all duration-300 shadow-lg shadow-cyan-900/20 ${isValid && !isLoading && !isSuccess
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 hover:shadow-cyan-500/30 cursor-pointer border border-transparent'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-700'
                                }`}
                        >
                            {isLoading ? (
                                isSuccess ? (
                                    <CheckCircle className="w-6 h-6 animate-bounce text-cyan-400" />
                                ) : (
                                    <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                )
                            ) : (
                                <span className="flex items-center space-x-2">
                                    <span>{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </motion.button>

                        <div className="text-center pt-2 space-y-4">
                            <p className="text-sm text-zinc-500">
                                {isSignUp ? 'Já tem uma conta? ' : 'Ainda não tem uma conta? '}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    {isSignUp ? 'Fazer Login' : 'Criar conta'}
                                </button>
                            </p>
                        </div>

                    </form>
                </div>

                <div className="mt-8 flex justify-center space-x-6">
                    <div className="flex items-center space-x-1.5 text-zinc-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Dados Seguros</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-zinc-600">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Health Compliant</span>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default Login;
