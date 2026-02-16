# Design System NutixoApp

Este documento descreve as diretrizes visuais e técnicas do projeto NutixoApp, garantindo consistência em toda a interface.

## 🎨 Paleta de Cores

### Dark Mode (Core)
Estes tokens são definidos via variáveis CSS em `src/index.css`.

| Token | Hex | Uso |
| :--- | :--- | :--- |
| `--color-bg-primary` | `#0F172A` | Background principal da aplicação |
| `--color-bg-secondary` | `#111827` | Background de seções secundárias |
| `--color-bg-tertiary` | `#1F2937` | Background de elementos interativos |
| `--color-bg-elevated` | `#1E293B` | Background de cards e modais destacados |
| `--color-bg-hover` | `#334155` | Estado de hover em componentes |

### Tipografia & Texto
| Token | Hex | Uso |
| :--- | :--- | :--- |
| `--color-text-primary` | `#F9FAFB` | Texto com maior legibilidade (títulos) |
| `--color-text-secondary` | `#D1D5DB` | Texto de corpo principal |
| `--color-text-muted` | `#9CA3AF` | Legendas e descrições sutis |
| `--color-text-disabled` | `#6B7280` | Estados desabilitados |

### Bordas
- **Subtle**: `#334155` (Bordas leves de cards)
- **Strong**: `#475569` (Bordas de foco ou separadores)

---

## 🅰️ Tipografia
- **Família Principal**: Herda do sistema (Sans-serif) via Tailwind.
- **Tamanhos Base**:
  - `text-2xl`: Títulos de cards e páginas.
  - `text-sm`: Texto de corpo principal.
  - `text-xs`: Metadados e legendas.

---

## 🧩 Componentes Core

### 1. Cards (`SentinelCard`)
- **Raio**: `rounded-[2rem]`
- **Estilo**: Borda sutil, fundo elevado (`bg-bg-elevated`).
- **Estados**: Hover com ring azul e sombra expandida.

### 2. Gamificação
- **XPBar**: Cores de progresso dinâmicas.
- **AchievementToast**: Feedback visual imediato.
- **PetWidget**: Integração de animações e estados de humor.

### 3. Navegação
- **MainLayout**: Sidebar persistente com links ativos destacados.
- **MobileMenu**: Bottom bar com cores de seleção otimizadas para leitura.

---

## 🛠️ Tecnologias
- **Framework**: React + Vite
- **Estilização**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Animações**: Framer Motion
