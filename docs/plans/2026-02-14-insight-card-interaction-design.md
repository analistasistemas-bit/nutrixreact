# Design Doc: Comportamento Contextual do Card de Insight (Nutrixo)

**Data:** 2026-02-14
**Status:** Aprovado
**Autor:** Antigravity

## Objetivo
Transformar o Card de Insight da Nutrixo em uma ferramenta interativa e contextual, permitindo que o usuário explore os detalhes das recomendações da IA sem perder o foco na análise de progresso atual.

## Funcionalidades Solicitadas

### 1. Botão "Ver Plano Alimentar" (Insight Drawer)
- **Interface:** Um painel lateral (*Side Drawer*) que desliza da direita.
- **Conteúdo:** 
  - Nome do ajuste (ex: "Ajuste Proteico").
  - Refeições afetadas.
  - Link de atalho para a página completa de Alimentação (caso o usuário queira navegar totalmente).
- **UX:** O fundo da página de progresso será levemente escurecido e desfocado para dar foco ao painel.

### 2. Botão "Histórico Completo" (Smart Scroll)
- **Interface:** Navegação interna na página de Progresso.
- **Comportamento:** Scroll suave até a seção `Timeline de Saúde`.
- **Feedback Visual:** Um efeito de "flash" ou "pulse" na Timeline ao final do scroll para guiar o olhar do usuário.

## Especificação Técnica

### Componentes
- `InsightDrawer`: Sub-componente em `Progress.jsx` usando `AnimatePresence` do Framer Motion.
- `HealthTimelineRef`: React Ref anexada ao container da timeline para cálculo do scroll.

### Estado (State Management)
- `isDrawerOpen` (boolean): Controla a visibilidade do painel.
- `highlightTimeline` (boolean): Dispara o efeito visual na timeline.

## Verificação
1. Validar que o Drawer abre e fecha corretamente.
2. Validar que o scroll suave funciona em desktop e mobile.
3. Garantir que o modo escuro do Drawer seja consistente com os cards de Insight.
