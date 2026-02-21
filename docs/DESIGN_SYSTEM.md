# Design System NutixoApp

Este documento descreve as diretrizes visuais e técnicas do NutixoApp. **Use sempre os tokens definidos aqui** — nunca valores hardcoded como `bg-slate-900` ou `text-zinc-400`.

---

## 🎨 Cores — Tokens CSS

Os tokens são definidos em `src/index.css` via `@theme` (Tailwind CSS v4) e aplicados com as classes `dark:` / sem prefixo.

### Dark Mode

| Classe Tailwind | Variável CSS | Uso |
| :--- | :--- | :--- |
| `dark:bg-bg-primary` | `--color-bg-primary: #0F172A` | Fundo principal da página |
| `dark:bg-bg-secondary` | `--color-bg-secondary: #111827` | Seções internas, painéis |
| `dark:bg-bg-elevated` | `--color-bg-elevated: #1E293B` | Cards, modais, drawers |
| `dark:bg-bg-tertiary` | `--color-bg-tertiary: #1F2937` | Elementos interativos, toggles |
| `dark:bg-bg-hover` | `--color-bg-hover: #334155` | Estado hover de listas |
| `dark:text-text-primary` | `--color-text-primary: #F9FAFB` | Títulos, valores principais |
| `dark:text-text-secondary` | `--color-text-secondary: #D1D5DB` | Texto de corpo |
| `dark:text-text-muted` | `--color-text-muted: #9CA3AF` | Legendas, labels auxiliares |
| `dark:text-text-disabled` | `--color-text-disabled: #6B7280` | Estados desabilitados |
| `dark:border-border-subtle` | `--color-border-subtle: #334155` | Bordas de cards |
| `dark:border-border-strong` | `--color-border-strong: #475569` | Bordas de foco / separadores |

### Light Mode

| Variável CSS | Valor | Uso |
| :--- | :--- | :--- |
| `--color-bg-light-primary` | `#F8FAFC` | Fundo principal da página |
| `--color-bg-light-card` | `#FFFFFF` | Cards e modais |
| `--color-bg-light-section` | `#F1F5F9` | Seções internas |
| `--color-bg-light-hover` | `#E2E8F0` | Estado hover |
| `--color-text-light-primary` | `#0F172A` | Títulos |
| `--color-text-light-secondary` | `#334155` | Corpo |
| `--color-text-light-muted` | `#64748B` | Legendas |
| `--color-border-light-subtle` | `#E2E8F0` | Bordas leves |
| `--color-border-light-strong` | `#CBD5E1` | Bordas de foco |

> **Regra:** Em light mode, use as classes padrão do Tailwind (`bg-white`, `text-zinc-900`, `border-zinc-200`). Os tokens acima servem para documentação e referência de paleta.

---

## 📐 Border Radius — Hierarquia

Use exatamente **3 níveis**. Nunca use `rounded-[2rem]` ou `rounded-[2.5rem]` customizados.

| Classe | px | Uso |
| :--- | :--- | :--- |
| `rounded-xl` | 12px | Inputs, tags, badges, botões pequenos |
| `rounded-2xl` | 16px | Cards internos, itens de lista, tooltips |
| `rounded-3xl` | 24px | Cards principais, modais, painéis, drawers |

---

## 📏 Z-Index — Hierarquia

Definidas como variáveis CSS em `src/index.css`. Use as classes Tailwind correspondentes.

| CSS Var | Valor | Tailwind | Uso |
| :--- | :--- | :--- | :--- |
| `--z-nav` | 50 | `z-[50]` | Header, BottomNav |
| `--z-dropdown` | 60 | `z-[60]` | Dropdowns, FAB do chatbot |
| `--z-overlay` | 70 | `z-[70]` | Overlays de mobile, backdrops |
| `--z-modal` | 80 | `z-[80]` | Modais e drawers |
| `--z-toast` | 90 | `z-[90]` | Toasts de achievement |
| `--z-confetti` | 100 | `z-[100]` | Confetti de level-up |

---

## 🎬 Animações — Constantes Padronizadas

Todas as constantes estão em `src/lib/animations.js`. **Nunca defina springs ou durations inline.**

```js
import {
  SPRING_DEFAULT, SPRING_SNAPPY, SPRING_GENTLE,
  DURATION_FAST, DURATION_BASE, DURATION_SLOW,
  FADE_UP, FADE_IN, SCALE_IN,
  SLIDE_RIGHT, SLIDE_UP,
  STAGGER_CONTAINER, STAGGER_ITEM,
  HOVER_CARD, HOVER_BUTTON, TAP_LIGHT,
} from '../lib/animations';
```

### Quando usar cada um

| Constante | Uso típico |
| :--- | :--- |
| `FADE_UP` | Entrada de seções e headers |
| `STAGGER_CONTAINER` + `STAGGER_ITEM` | Listas de cards (aplica delay em cascata) |
| `SCALE_IN` | Modais e dropdowns |
| `SLIDE_RIGHT` | Drawers laterais |
| `HOVER_CARD` | Hover de cards clicáveis (`whileHover`, `whileTap`) |
| `SPRING_DEFAULT` | `transition` padrão para springs |

---

## 🧩 Componentes Comuns

Todos em `src/components/common/`.

### `<LoadingSpinner size="md" />`
- Props: `size` (`sm` | `md` | `lg`), `className`
- Acessível com `role="status"` e texto sr-only

### `<EmptyState icon={Icon} title="..." description="..." action={<button>} />`
- Props: `icon`, `title`, `description`, `action` (ReactNode opcional)
- Usa `FADE_UP` automaticamente

### `<Badge variant="success">Normal</Badge>`
- Props: `variant` (`success` | `warning` | `error` | `info` | `neutral` | `new`)
- Tamanho e padding padronizados; suporte completo a dark mode

### `<SectionHeader icon={Icon} title="..." subtitle="..." action={<button>} />`
- Props: `icon`, `iconColor`, `iconBg`, `title`, `subtitle`, `action`, `className`
- Usa `FADE_UP` automaticamente

---

## 🔤 Tipografia

| Uso | Classe |
| :--- | :--- |
| Título de página | `text-2xl sm:text-3xl font-black` |
| Título de card | `text-base font-bold` |
| Corpo principal | `text-sm` |
| Label auxiliar | `text-xs text-zinc-500 dark:text-text-muted` |
| Badge / tag | `text-[10px] font-black uppercase tracking-widest` |
| Código / mono | `font-mono text-xs` |

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
| :--- | :--- |
| Framework | React 19 + Vite 7 |
| Estilização | Tailwind CSS v4 (`@theme`) |
| Animações | Framer Motion |
| Icons | Lucide React |
| Auth / DB | Supabase (JWT + RLS) |
| AI | NVIDIA API / Google Gemini / OpenRouter |
| Backend | FastAPI (Python) + Docling (PDF OCR) |
| PWA | `vite-plugin-pwa` |

---

## ✅ Checklist de Revisão

Antes de fazer um PR com alterações de UI, verifique:

- [ ] Nenhum valor hardcoded de cor dark (`dark:bg-slate-*`, `dark:bg-zinc-*`)
- [ ] Border radius segue os 3 níveis definidos
- [ ] Z-index usa a hierarquia da tabela acima
- [ ] Animações importadas de `src/lib/animations.js`
- [ ] Componentes comuns usados para spinners, empty states e badges
- [ ] Testado em dark mode e light mode
- [ ] Testado em mobile 375px (FAB chatbot não sobrepõe BottomNav)
