import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, CheckCircle } from 'lucide-react';
import NutrixoIconNoFrame from '../assets/nutrixo-icon-no-frame.png';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const isValid = email.includes('@') && email.includes('.') && password.length >= 6;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;

        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Mock validation logic
            // For demo purposes, we'll accept any valid email/password combo
            // but let's pretend strictly for a specific one if we wanted, 
            // but better to just let the user in for the UX demo.

            // Let's add a fake error condition just to show the capability if needed
            if (email === 'error@example.com') {
                setError('E-mail ou senha incorretos.');
                setIsLoading(false);
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                onLogin();
            }, 800); // Wait a bit to show success state
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center font-sans">

            {/* Dynamic Background Elements */}
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

                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-32 h-32 bg-transparent flex items-center justify-center mx-auto mb-2"
                        >
                            {/* If real logo is available use it, otherwise use icon */}
                            <img src={NutrixoIconNoFrame} alt="Nutrixo" className="w-full h-full object-contain" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            Bem-vindo de volta
                        </motion.h1>
                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-400 text-sm"
                        >
                            Acompanhe sua saúde de forma inteligente
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 ml-1" htmlFor="email">
                                E-mail
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 outline-none sm:text-sm"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-semibold text-zinc-300" htmlFor="password">
                                    Senha
                                </label>
                                <a href="#" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Esqueceu a senha?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 outline-none sm:text-sm"
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
                        </div>

                        {/* Error Message */}
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

                        {/* Submit Button */}
                        <motion.button
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
                                    <span>Entrar</span>
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </motion.button>

                        {/* Sign Up Link */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-zinc-500">
                                Ainda não tem uma conta?{' '}
                                <a href="#" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Criar conta
                                </a>
                            </p>
                        </div>

                    </form>
                </div>

                {/* Footer / Trust indicators */}
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
