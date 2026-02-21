import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class AnalysisRenderBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[NutritionPlan] Render error in analysis results:', error, errorInfo);
    }

    componentDidUpdate(prevProps) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }

    render() {
        const {
            children,
            fallbackTitle = 'Não foi possível exibir o plano gerado',
            fallbackMessage = 'Ocorreu um erro ao renderizar este resultado. Você pode tentar novamente.',
            onReset
        } = this.props;

        if (this.state.hasError) {
            return (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 my-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-800 dark:text-red-400 text-sm">{fallbackTitle}</h3>
                                <p className="text-red-700 dark:text-red-300 text-xs mt-1">{fallbackMessage}</p>
                            </div>
                        </div>
                        {onReset && (
                            <button
                                onClick={onReset}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Tentar novamente</span>
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default AnalysisRenderBoundary;
