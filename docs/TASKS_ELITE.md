# Checklist de Implementação: Fase Elite 🛠️

Este arquivo serve como controle de execução para as melhorias do NutixoApp.

---

## 📦 [Épico 1] PWA & Portabilidade ✅ CONCLUÍDO

- [x] Instalar e configurar `vite-plugin-pwa`
- [x] Gerar ícones 192x192 e 512x512 com a logo Nutixo
- [x] Criar/Configurar `manifest.webmanifest`
- [x] Configurar estratégia de cache Service Worker (Stale-While-Revalidate)
- [x] Adicionar aviso de "Nova versão disponível" (`ReloadPrompt.jsx`)
- [x] Aplicar `safe-area-inset` para dispositivos com notch/home bar

---

## 🏗️ [Épico 2] Infraestrutura & Dados Reais ✅ CONCLUÍDO

- [x] Criar tabelas Supabase (`nutrixo_profiles`, `nutrixo_exams`, `nutrixo_meals`, etc.)
- [x] Implementar RLS (Row Level Security) em todas as tabelas
- [x] Implementar fluxo de Login real com Supabase Auth (JWT)
- [x] Sincronização de XP com `nutrixo_profiles` no banco
- [x] Backend Python com FastAPI + Docling para processamento de PDF
- [x] Jobs assíncronos com polling de status (`/api/import/{kind}/{job_id}`)
- [x] Integração com Supabase Storage para armazenamento de arquivos
- [x] Histórico persistente de refeições (`nutrixo_meals`) com CRUD completo

---

## 🎨 [Épico 3] Refinamento UI/UX ✅ CONCLUÍDO

- [x] Fontes Fira Sans e Fira Code no `index.html`
- [x] Skeleton screens no componente `AIAnalysisPage`
- [x] `aria-labels` em ícones e ações críticas
- [x] Constantes de animação centralizadas em `src/lib/animations.js`
- [x] Tokens CSS para light mode e dark mode em `src/index.css`
- [x] Hierarquia de z-index como variáveis CSS
- [x] Componentes comuns: `LoadingSpinner`, `EmptyState`, `Badge`, `SectionHeader`
- [x] Dark mode unificado em `AccountProfile`, `AccountSettings`, `GamerProfile`
- [x] FAB do Chatbot corrigido no mobile (safe-area-inset-bottom)
- [x] Animações Framer Motion em `AccountProfile` e `AccountSettings`
- [x] DESIGN_SYSTEM.md reescrito com todos os padrões atuais

---

## 🚀 [Épico 4] Diferenciais Sentinel — EM PROGRESSO

- [ ] **Push Notifications**
  - [ ] Solicitar permissão ao usuário
  - [ ] Enviar notificação de lembrete de registro de refeição
  - [ ] Notificação quando exame é processado
- [ ] **Modo OLED**
  - [ ] Adicionar toggle para tema "Total Black" (#000000)
  - [ ] Definir variável `bg-oled` no design system

---

## 🍽️ [Épico 5] Diário Persistente (Histórico de Refeições) ✅ QUASE COMPLETO

- [x] Persistir refeições no banco e recarregar histórico
- [x] Filtro de data (Hoje, 7 dias, 30 dias, customizado)
- [x] Barra de macros diária com progresso vs meta (adicionado v1.2.0)
- [x] Fluxo híbrido: lista com ações rápidas + detalhe ao clicar
- [x] Editar refeição (manual)
- [x] Reanálise IA sobrescrevendo refeição atual
- [x] Excluir refeição com confirmação
- [x] Duplicar refeição
- [ ] Refinar UX — estados vazios e feedback por ação
- [ ] Cobrir edge-cases (token expirado durante edição/duplicação)
- [ ] Extrair `MealHistoryList`, `MealEditorModal` em componentes dedicados

---

## 📈 [Épico 6] Progress Hub — ✅ CONCLUÍDO (v1.3.0)

- [x] Seletor de período visual (7D / 30D / 3M / 1A) com filtragem real
- [x] Filtragem de biomarcadores e medidas por período selecionado
- [x] Timeline de exames por data em Labs
- [x] Badge "Novo" para exames recentes (< 7 dias)
- [x] Delta (▲▼) entre último e penúltimo resultado de cada biomarcador
- [x] Reformulação da aba Resumo com Dashboard rico (HealthScore, Constância, Metas ativas)
- [x] Remoção de falsos relatórios da IA focando em relatórios visuais úteis (Heatmap, Comparativos)

---

## 📋 Próximas Tarefas Sugeridas

1. **Épico 4**: Implementar Push Notifications (Modo OLED é mais simples — pode começar por ele)
2. **Épico 5**: Extrair componentes dedicados do Food (MealHistoryList, MealEditorModal)
3. **Épico 7 (novo)**: Módulo de Treinos — registro, histórico, integração com Progress

---

### Legenda
- ✅ Concluído
- 🏗️ Em progresso
- [ ] Pendente
- ⏸️ Pausado

*Atualizado em: 20 de Fevereiro de 2026*
