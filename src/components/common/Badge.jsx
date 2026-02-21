/**
 * Badge — pill/badge de status padronizado para todo o app.
 *
 * @param {'success'|'warning'|'error'|'info'|'neutral'|'new'} variant
 * @param {string} children  - texto do badge
 * @param {string} className - classes extras
 */
export default function Badge({ variant = 'neutral', children, className = '' }) {
  const variants = {
    success: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-300  border-green-200  dark:border-green-800/50',
    warning: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800/50',
    error:   'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-300    border-red-200    dark:border-red-800/50',
    info:    'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-300   border-blue-200   dark:border-blue-800/50',
    neutral: 'bg-zinc-100   dark:bg-bg-tertiary   text-zinc-600   dark:text-text-muted  border-zinc-200   dark:border-border-subtle',
    new:     'bg-cyan-100   dark:bg-cyan-900/30   text-cyan-700   dark:text-cyan-300   border-cyan-200   dark:border-cyan-800/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5
        text-[10px] font-bold uppercase tracking-wider
        rounded-full border
        ${variants[variant] ?? variants.neutral}
        ${className}`}
    >
      {children}
    </span>
  );
}
