# Changelog - NutixoApp

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.2.0] - 2026-02-20

### Adicionado
- **`src/lib/animations.js`**: Constantes de animação centralizadas (SPRING_DEFAULT, FADE_UP, STAGGER_CONTAINER, HOVER_CARD, etc.) eliminando springs/durations inline.
- **Tokens CSS light mode** em `src/index.css`: paleta formal para modo claro (`--color-bg-light-primary`, `--color-bg-light-card`, etc.).
- **Hierarquia de z-index** em `src/index.css` como variáveis CSS (`--z-nav: 50` até `--z-confetti: 100`).
- **`src/components/common/LoadingSpinner.jsx`**: spinner padronizado com tamanhos sm/md/lg e acessibilidade.
- **`src/components/common/EmptyState.jsx`**: empty state padronizado com ícone, título, descrição e CTA opcional.
- **`src/components/common/Badge.jsx`**: badge/pill unificado com variantes success/warning/error/info/neutral/new.
- **`src/components/common/SectionHeader.jsx`**: cabeçalho de seção padronizado com ícone + título + subtítulo + ação.
- **Dashboard**: widget "Resumo do Dia" com 3 pills de status (Exames, Dieta, Alertas) linkando às seções relevantes.
- **Labs**: timeline visual agrupando exames por data (Hoje / Ontem / Esta semana / Este mês / Anteriores).
- **Labs**: badge "Novo" em exames registrados há menos de 7 dias.
- **Labs**: delta (▲▼) entre o último e o penúltimo resultado de cada biomarcador.
- **Progress**: seletor de período com 4 opções (7D / 30D / 3M / 1A) — filtragem real dos dados de exames e medidas.
- **Food**: barra de macros do dia (Kcal / Proteína / Carboidratos / Gorduras) com progresso animado vs. meta diária.
- **`docs/DESIGN_SYSTEM.md`**: reescrito com tokens completos, hierarquia de border radius, z-index, animações e checklist de revisão.

### Corrigido
- Dark mode tokens em `AccountProfile.jsx` e `AccountSettings.jsx` (removidos `dark:bg-slate-900/95`, `dark:border-slate-700/60`).
- Dark mode tokens em `GamerProfile.jsx` (removidos `dark:bg-zinc-900`, `dark:bg-zinc-800`, etc.).
- Chatbot FAB no mobile: posição calculada com `env(safe-area-inset-bottom)` para não sobrepor o BottomNav.
- `AccountProfile.jsx` e `AccountSettings.jsx`: adicionadas animações Framer Motion (STAGGER_CONTAINER + STAGGER_ITEM).

---

## [1.1.0] - 2026-02-16
### Adicionado
- Documentação técnica completa na pasta `/docs`.
- Novo arquivo `docs/ARCHITECTURE.md` detalhando a stack e fluxos.
- Novo arquivo `docs/DESIGN_SYSTEM.md` com tokens de cores e UI.
- Novo arquivo `docs/CONTRIBUTING.md` com padrões de desenvolvimento.
- Novo componente modular `AIAnalysisPage` para padronização de importação.
- Pasta `src/data/mocks` para melhor organização de dados simulados.

### Limpeza & Organização
- Movimentação de scripts utilitários para a pasta `/scripts`.
- Organização de arquivos de teste em `docs/test-exams`.
- Remoção de arquivos temporários da raiz (`package-lock 2.json`, `lint_output.txt`).

### Corrigido
- Erro de chave duplicada ("bmi") no dicionário de traduções do componente `Progress.jsx`.

## [1.0.0] - 2026-02-15
### Adicionado
- Versão estável inicial do Nutrixo.
- Dashboard de saúde com integração de biomarcadores.
- Sistema de Gamificação (XP, Pets, Conquistas).
- Suporte a Dark Mode profissional em toda a interface.
