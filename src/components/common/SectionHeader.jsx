import { motion } from 'framer-motion';
import { FADE_UP } from '../../lib/animations';

/**
 * SectionHeader — cabeçalho de seção padronizado.
 *
 * @param {React.ElementType} icon  - ícone Lucide
 * @param {string} iconColor        - classe de cor do ícone (ex: 'text-cyan-500')
 * @param {string} iconBg           - classe de bg do ícone (ex: 'bg-cyan-100 dark:bg-cyan-900/30')
 * @param {string} title            - título da seção
 * @param {string} subtitle         - subtítulo opcional
 * @param {React.ReactNode} action  - elemento de ação à direita (ex: botão)
 * @param {string} className        - classes extras
 */
export default function SectionHeader({
  icon: Icon,
  iconColor = 'text-cyan-500',
  iconBg = 'bg-cyan-100 dark:bg-cyan-900/30',
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <motion.div
      variants={FADE_UP}
      initial="hidden"
      animate="visible"
      className={`flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-zinc-900 dark:text-text-primary leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-text-muted leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
