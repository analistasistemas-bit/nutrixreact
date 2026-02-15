import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Upload, Sparkles, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * AIAnalysisPage - Compound Component Pattern
 * Provides a consistent UI for uploading and analyzing documents with AI.
 */
const AIAnalysisPage = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`max-w-4xl mx-auto w-full ${className}`}
        >
            <div className="bg-white dark:bg-bg-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-sm">
                {children}
            </div>
        </motion.div>
    );
};

// 1. Header Component
AIAnalysisPage.Header = ({ icon: Icon, title, description, gradient = "from-blue-500 to-cyan-500" }) => (
    <div className="text-center mb-6">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>
            {Icon && <Icon className="w-7 h-7 text-white" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
            {title}
        </h2>
        <p className="text-gray-600 dark:text-text-secondary text-sm">
            {description}
        </p>
    </div>
);

// 2. UploadZone Component
AIAnalysisPage.UploadZone = ({ onUpload, accept = ".pdf", label = "Selecionar Arquivo PDF", uploadedFile }) => {
    if (uploadedFile) return null;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-gray-300 dark:border-border-subtle rounded-2xl p-8 text-center hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 cursor-pointer"
        >
            <input
                type="file"
                accept={accept}
                onChange={onUpload}
                className="hidden"
                id="ai-file-upload"
            />
            <label htmlFor="ai-file-upload" className="cursor-pointer">
                <Upload className="w-14 h-14 text-gray-400 dark:text-text-muted mx-auto mb-3" />
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 inline-flex items-center space-x-1.5 shadow-sm">
                    <span className="text-sm">{label}</span>
                    <Sparkles className="w-3 h-3" />
                </div>
                <p className="text-gray-500 dark:text-text-muted text-xs mt-3">
                    {accept.replace(/\./g, '').toUpperCase()} • Análise por IA
                </p>
            </label>
        </motion.div>
    );
};

// 3. Loading Component
AIAnalysisPage.Loading = ({ isAnalyzing, message = "IA Analisando...", subMessage = "Processando informações ⚡", gradient = "bg-cyan-500" }) => (
    <AnimatePresence>
        {isAnalyzing && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-50 dark:bg-bg-secondary border border-gray-100 dark:border-border-subtle rounded-xl p-5 text-center my-4"
            >
                <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 mx-auto mb-3 animate-spin" />
                <h3 className="font-bold text-gray-800 dark:text-text-primary text-lg">🤖 {message}</h3>
                <p className="text-gray-600 dark:text-text-secondary text-sm mt-1">{subMessage}</p>
                <div className="mt-3 w-full bg-gray-200 dark:bg-bg-tertiary rounded-full h-2">
                    <motion.div
                        className={`${gradient} h-2 rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 10, ease: 'easeOut' }}
                    />
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// 4. Error Component
AIAnalysisPage.Error = ({ error, onReset }) => (
    <AnimatePresence>
        {error && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4 my-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-400 text-sm">Erro na Análise</h3>
                            <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
                        </div>
                    </div>
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span>Tentar novamente</span>
                        </button>
                    )}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// 5. Results Component
AIAnalysisPage.Results = ({ show, children }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 my-4"
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

// 6. Disclaimer Component
AIAnalysisPage.Disclaimer = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-zinc-50 dark:bg-bg-secondary border border-gray-100 dark:border-border-subtle rounded-xl"
    >
        <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-gray-800 dark:text-text-primary flex items-center text-sm">
                    ⚠️ Aviso Importante
                </h3>
                <p className="text-gray-600 dark:text-text-secondary text-[11px] leading-relaxed">
                    A análise da IA é uma ferramenta de apoio educacional e não substitui o aconselhamento
                    de um profissional de saúde qualificado. Consulte sempre seu médico ou nutricionista para interpretação
                    clínica dos seus resultados. 🩺
                </p>
            </div>
        </div>
    </motion.div>
);

// Export individual components for flexibility
export const AIAnalysisHeader = AIAnalysisPage.Header;
export const AIAnalysisUploadZone = AIAnalysisPage.UploadZone;
export const AIAnalysisLoading = AIAnalysisPage.Loading;
export const AIAnalysisError = AIAnalysisPage.Error;
export const AIAnalysisResults = AIAnalysisPage.Results;
export const AIAnalysisDisclaimer = AIAnalysisPage.Disclaimer;

export default AIAnalysisPage;
