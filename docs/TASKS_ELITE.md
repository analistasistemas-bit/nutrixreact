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

## 🏗️ [Épico 2] Infraestrutura & Dados Reais (Integrado) [/]
- [x] **Setup do Insforge DB**
  - [x] Criar tabela `profiles` com colunas `xp`, `level` e `avatar_id`
  - [x] Criar tabela `health_history` para armazenar resultados de exames
- [x] **Camada de Sincronização (Sync Layer)**
  - [x] Implementar Hook `useSync` no `GamificationContext`
  - [x] Criar lógica para persistir dados locais -> banco quando online
- [/] **Segurança de Dados** [/]
  - [x] Implementar fluxo de login real com o SDK do Insforge
  - [ ] Adicionar validação JWT nas chamadas de dados de saúde

---

## 🎨 [Épico 3] Refinamento UI/UX "Elite"
- [ ] **Excelência Tipográfica**
  - [ ] Importar fontes Fira Sans e Fira Code no `index.html`
  - [ ] Atualizar variáveis de font-family no CSS global
- [ ] **Feedback de Performance (IA)**
  - [ ] Implementar Skeleton Screens no componente `AIAnalysisPage`
- [ ] **Inclusão Digital (Acessibilidade)**
  - [ ] Revisar navegação por teclado (foco visual)
  - [ ] Adicionar `aria-labels` em ícones e ações críticas

---

## 🚀 [Épico 4] Diferenciais Sentinel
- [ ] **Integrações Push**
  - [ ] Pedir permissão ao usuário para notificações
  - [ ] Enviar notificação de boas-vindas/tutorial
- [ ] **Modo OLED**
  - [ ] Implementar toggle visual para tema "Total Black" (#000000)

---
*Próxima Tarefa Sugerida: Iniciar Épico 1 (Instalação do Vite PWA).*
