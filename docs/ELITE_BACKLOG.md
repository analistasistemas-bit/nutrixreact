# Backlog Elite — NutixoApp 🛠️

Backlog técnico detalhado com todas as tarefas de evolução do projeto. Baseado no `PRODUCT_AUDIT.md`.

---

## 📦 Épico 1: PWA & Mobilidade ✅ CONCLUÍDO

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-101 | Instalar e configurar `vite-plugin-pwa` | P0 | ✅ |
| ELT-102 | Criar `manifest.webmanifest` com ícones e cores da marca | P0 | ✅ |
| ELT-103 | Implementar `ReloadPrompt.jsx` para atualização de Service Worker | P1 | ✅ |
| ELT-104 | Aplicar `env(safe-area-inset-*)` em Header e BottomNav | P1 | ✅ |

---

## 🏗️ Épico 2: Infraestrutura & Backend ✅ CONCLUÍDO

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-201 | Criar tabelas Supabase com RLS (exams, meals, measurements, profiles) | P0 | ✅ |
| ELT-202 | Sincronizar XP local com `nutrixo_profiles` no banco | P0 | ✅ |
| ELT-203 | Implementar Login real com Supabase Auth (JWT) | P0 | ✅ |
| ELT-204 | Backend Python (FastAPI + Docling) para importação de PDFs | P0 | ✅ |
| ELT-205 | Jobs assíncronos com status polling no frontend | P1 | ✅ |
| ELT-206 | CRUD completo de refeições (criar, editar, excluir, duplicar, reanalisar) | P1 | ✅ |
| ELT-207 | Push Notifications (FCM/Web Push API) | P2 | 🔘 |

---

## 🎨 Épico 3: Refinamento de Interface (Elite UX) ✅ CONCLUÍDO

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-301 | Fontes Google `Fira Sans` (corpo) e `Fira Code` (dados) | P1 | ✅ |
| ELT-302 | Skeleton screens no `AIAnalysisPage` | P1 | ✅ |
| ELT-303 | `aria-labels` em ícones interativos | P1 | ✅ |
| ELT-304 | Constantes de animação em `src/lib/animations.js` | P1 | ✅ |
| ELT-305 | Tokens CSS completos (dark mode + light mode) em `index.css` | P1 | ✅ |
| ELT-306 | Hierarquia de z-index como variáveis CSS | P1 | ✅ |
| ELT-307 | Componentes comuns: LoadingSpinner, EmptyState, Badge, SectionHeader | P1 | ✅ |
| ELT-308 | Dark mode unificado (AccountProfile, AccountSettings, GamerProfile) | P1 | ✅ |
| ELT-309 | FAB do Chatbot corrigido no mobile | P0 | ✅ |
| ELT-310 | Animações Framer Motion em AccountProfile e AccountSettings | P2 | ✅ |
| ELT-311 | Modo OLED (tema Total Black #000000) | P2 | 🔘 |

---

## 📈 Épico 4: Hub de Progresso ✅ CONCLUÍDO (v1.2.0)

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-401 | Dashboard: widget "Resumo do Dia" (Exames, Dieta, Alertas) | P1 | ✅ |
| ELT-402 | Labs: timeline de exames agrupados por data | P1 | ✅ |
| ELT-403 | Labs: badge "Novo" para exames recentes (< 7 dias) | P2 | ✅ |
| ELT-404 | Labs: delta (▲▼) entre último e penúltimo resultado | P1 | ✅ |
| ELT-405 | Progress: seletor de período (7D / 30D / 3M / 1A) | P1 | ✅ |
| ELT-406 | Progress: filtragem real de dados por período | P1 | ✅ |
| ELT-407 | Food: barra de macros diária com progresso vs meta | P1 | ✅ |

---

## 🚀 Épico 5: Novas Experiências (Planejado)

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-501 | Módulo de Treinos — registro de séries/exercícios | P1 | 🔘 |
| ELT-502 | Integração de Treinos com Progress (gráficos de performance) | P2 | 🔘 |
| ELT-503 | Análise preditiva de tendência de biomarcadores via IA | P2 | 🔘 |
| ELT-504 | Widgets de saúde para home screen (iOS/Android via PWA) | P3 | 🔘 |
| ELT-505 | AR Pet Sentinel (WebAR via AR.js) | P3 | 🔘 |

---

## 🍽️ Épico 6: Refinamento do Diário Alimentar (Pendente)

| Task ID | Descrição | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-601 | Extrair `MealHistoryList` como componente dedicado | P2 | 🔘 |
| ELT-602 | Extrair `MealEditorModal` como componente dedicado | P2 | 🔘 |
| ELT-603 | Separar `mealService` de `aiService` | P2 | 🔘 |
| ELT-604 | Metas de macros configuráveis pelo usuário (hoje são fixas: 2000kcal etc.) | P2 | 🔘 |
| ELT-605 | Paginação/lazy load no histórico de refeições | P3 | 🔘 |
| ELT-606 | Estados vazios e feedback de ação por operação (editar, excluir, duplicar) | P2 | 🔘 |
| ELT-607 | Cobrir edge-cases de token expirado durante CRUD | P2 | 🔘 |

---

### Legenda de Status
| Símbolo | Significado |
| :--- | :--- |
| 🔘 | Pendente |
| 🏗️ | Em execução |
| ✅ | Concluído |
| ⏸️ | Pausado |

---

*Atualizado em: 20 de Fevereiro de 2026*
