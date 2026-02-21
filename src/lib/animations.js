/**
 * Nutixo Animation Constants
 * Fonte única de verdade para todas as animações do app.
 * Usar estas constantes garante consistência visual em todo o projeto.
 */

// ─── Springs ────────────────────────────────────────────────────────────────
export const SPRING_DEFAULT = { type: 'spring', damping: 25, stiffness: 200 };
export const SPRING_SNAPPY  = { type: 'spring', damping: 30, stiffness: 300 };
export const SPRING_GENTLE  = { type: 'spring', damping: 20, stiffness: 150 };

// ─── Durations ───────────────────────────────────────────────────────────────
export const DURATION_FAST = 0.15;   // hover, tap feedback
export const DURATION_BASE = 0.20;   // dropdowns, badges
export const DURATION_SLOW = 0.35;   // modais, drawers, page transitions

// ─── Variants reutilizáveis ──────────────────────────────────────────────────

/** Fade + slide para cima (entrada de seções e cards) */
export const FADE_UP = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING_DEFAULT } },
};

/** Fade simples */
export const FADE_IN = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION_BASE } },
};

/** Fade + escala (modais, popovers) */
export const SCALE_IN = {
  hidden:  { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { ...SPRING_DEFAULT } },
};

/** Slide da direita (drawers) */
export const SLIDE_RIGHT = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0,      opacity: 1, transition: { ...SPRING_DEFAULT } },
};

/** Slide de baixo para cima (bottom sheets) */
export const SLIDE_UP = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0,      opacity: 1, transition: { ...SPRING_DEFAULT } },
};

/** Stagger container — use com children que tenham FADE_UP */
export const STAGGER_CONTAINER = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Item de lista staggerado */
export const STAGGER_ITEM = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { ...SPRING_DEFAULT } },
};

// ─── Hover / Tap helpers ─────────────────────────────────────────────────────

/** Hover suave para cards */
export const HOVER_CARD = {
  whileHover: { y: -2, scale: 1.01 },
  transition:  { duration: DURATION_FAST },
};

/** Hover + tap para botões */
export const HOVER_BUTTON = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.97 },
  transition:  { duration: DURATION_FAST },
};

/** Tap leve (ícones, badges) */
export const TAP_LIGHT = {
  whileTap:  { scale: 0.95 },
  transition: { duration: DURATION_FAST },
};
