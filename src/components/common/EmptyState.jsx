import { motion } from 'framer-motion';
import { FADE_UP } from '../../lib/animations';

/**
 * EmptyState — estado vazio padronizado para todas as seções do app.
 *
 * @param {React.ElementType} icon     - ícone Lucide (componente)
 * @param {string}  title              - título principal
 * @param {string}  description        - descrição secundária (opcional)
 * @param {React.ReactNode} action     - botão ou elemento de ação (opcional)
 * @param {string}  className          - classes extras
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      variants={FADE_UP}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center text-center py-10 px-6
        bg-zinc-50 dark:bg-bg-secondary
        rounded-2xl border border-dashed
        border-zinc-200 dark:border-border-subtle
        ${className}`}
    >
      {Icon && (
        <div className="mb-3 p-3 rounded-2xl bg-zinc-100 dark:bg-bg-tertiary">
          <Icon className="w-8 h-8 text-zinc-400 dark:text-text-muted" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-semibold text-zinc-700 dark:text-text-secondary mb-1">
        {title}
      </p>
      {description && (
        <p className="text-xs text-zinc-500 dark:text-text-muted mb-4 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}
