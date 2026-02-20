# Checklist de Implementação: Fase Elite 🛠️

Este arquivo serve como o controle de execução para as melhorias do NutixoApp. Marque os itens conforme avançarmos.

---

## 📦 [Épico 1] PWA & Portabilidade [CONCLUÍDO] ✅
- [x] **Instalação do Core PWA**
  - [x] Rodar `npm install -D vite-plugin-pwa`
  - [x] Configurar `vite.config.js` with the plugin PWA
- [x] **Identidade do App (Manifest)**
  - [x] Gerar ícones 192x192 e 512x512 com a logo Nutixo
  - [x] Criar/Configurar arquivo `manifest.webmanifest`
- [x] **Resiliência e Cache**
  - [x] Configurar estratégia de cache Service Worker (Stale-While-Revalidate)
  - [x] Adicionar aviso de "Nova versão disponível" (Prompt de atualização)

---

## 🏗️ [Épico 2] Infraestrutura & Dados Reais (Integrado) [CONCLUÍDO] ✅
- [x] **Setup do Insforge DB**
  - [x] Criar tabela `profiles` com colunas `xp`, `level` e `avatar_id`
  - [x] Criar tabela `health_history` para armazenar resultados de exames
- [x] **Camada de Sincronização (Sync Layer)**
  - [x] Implementar Hook `useSync` no `GamificationContext`
  - [x] Criar lógica para persistir dados locais -> banco quando online
- [x] **Segurança de Dados** ✅
  - [x] Implementar fluxo de login real com o SDK do Insforge
  - [x] Adicionar validação JWT nas chamadas de dados de saúde

---

## 🎨 [Épico 3] Refinamento UI/UX "Elite"
- [x] **Excelência Tipográfica**
  - [x] Importar fontes Fira Sans e Fira Code no `index.html`
  - [x] Atualizar variáveis de font-family no CSS global
- [x] **Feedback de Performance (IA)**
  - [x] Implementar Skeleton Screens no componente `AIAnalysisPage`
- [x] **Inclusão Digital (Acessibilidade)**
  - [x] Revisar navegação por teclado (foco visual)
  - [x] Adicionar `aria-labels` em ícones e ações críticas

---

## 🚀 [Épico 4] Diferenciais Sentinel
- [ ] **Integrações Push**
  - [ ] Pedir permissão ao usuário para notificações
  - [ ] Enviar notificação de boas-vindas/tutorial
- [ ] **Modo OLED**
  - [ ] Implementar toggle visual para tema "Total Black" (#000000)

---

## 🍽️ [Épico 5] Diário Persistente (Histórico de Refeições)
- [ ] **Opção 1 (Atual) - Implementação incremental no `Food.jsx` + `aiService`**
  - [x] Persistir refeições no banco e recarregar histórico no Diário
  - [x] Adicionar histórico com filtro de data (Hoje, 7 dias, 30 dias, customizado)
  - [x] Criar fluxo híbrido: lista com ações rápidas + detalhe ao clicar
  - [x] Implementar editar refeição (manual) com salvamento
  - [x] Implementar reanálise IA sobrescrevendo refeição atual
  - [x] Implementar excluir refeição com confirmação simples
  - [x] Implementar duplicar refeição no histórico
  - [ ] Refinar UX (estados vazios, mensagens, feedback de sucesso por ação)
  - [ ] Cobrir edge-cases (token expirado durante edição/duplicação/exclusão)
- [ ] **Opção 2 (Evolução) - Refatoração em componentes dedicados**
  - [ ] Extrair `MealHistoryFilters` (filtros rápidos + período customizado)
  - [ ] Extrair `MealHistoryList` (cards e ações rápidas)
  - [ ] Extrair `MealEditorModal` (edição, reanálise, exclusão)
  - [ ] Padronizar serviços em `mealService` separado de `aiService`
  - [ ] Adicionar testes de fluxo (histórico, edição, exclusão, duplicação)
  - [ ] Melhorar performance com paginação/lazy load no histórico

---
*Próxima Tarefa Sugerida: Iniciar Épico 1 (Instalação do Vite PWA).*
