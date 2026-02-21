/**
 * LoadingSpinner — componente padronizado de carregamento.
 * Substitui os múltiplos spinners inline espalhados pelo app.
 *
 * @param {string} size   - 'sm' | 'md' (padrão) | 'lg'
 * @param {string} label  - texto acessível (opcional)
 * @param {string} className - classes extras para o container
 */
export default function LoadingSpinner({ size = 'md', label = 'Carregando...', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <div
        className={`${sizes[size]} border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <p className="text-sm text-zinc-500 dark:text-text-muted">{label}</p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
