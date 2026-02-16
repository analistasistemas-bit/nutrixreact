# Backlog de Tarefas: Evolução Elite 🛠️

Este documento detalha os passos técnicos (backlog) necessários para implementar as sugestões do `PRODUCT_AUDIT.md`.

---

## 📦 Épico 1: PWA & Mobilidade
| Task ID | Descrição Técnica | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-101 | Instalar e configurar `vite-plugin-pwa` no `vite.config.js`. | P0 | 🔘 |
| ELT-102 | Criar `manifest.webmanifest` com ícones (512x512, 192x192) e cores da marca. | P0 | 🔘 |
| ELT-103 | Implementar lógica de "Refresh App" quando um novo Service Worker for detectado. | P1 | 🔘 |
| ELT-104 | Aplicar variáveis de ambiente CSS para `padding-safe-area-top` e `bottom`. | P1 | 🔘 |

## 🏗️ Épico 2: Infraestrutura & Backend
| Task ID | Descrição Técnica | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-201 | Criar schemas SQL no Insforge DB para `users`, `pet_stats` e `exams_metadata`. | P0 | 🔘 |
| ELT-202 | Criar Hook `useSync` para sincronizar XP local com o banco de dados remoto. | P0 | 🔘 |
| ELT-203 | Implementar fluxo de Login Real usando o SDK do Insforge (Auth). | P0 | 🔘 |
| ELT-204 | Configurar Firebase Cloud Messaging (FCM) para suporte a Push Notifications. | P2 | 🔘 |

## 🎨 Épico 3: Refinamento de Interface (Elite UX)
| Task ID | Descrição Técnica | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-301 | Importar e configurar fontes Google `Fira Sans` (corpo) e `Fira Code` (dados). | P1 | 🔘 |
| ELT-302 | Criar componente de `AIAuditSkeleton` para feedback visual durante análise. | P1 | 🔘 |
| ELT-303 | Adicionar `aria-label` em todos os componentes `LucideIcon` interativos. | P1 | 🔘 |
| ELT-304 | Criar variável de tema `bg-oled` (#000000) e toggle para troca manual. | P2 | 🔘 |

## 🚀 Épico 4: Novas Experiências
| Task ID | Descrição Técnica | Prioridade | Status |
| :--- | :--- | :--- | :--- |
| ELT-401 | Pesquisar biblioteca de WebAR (ex: AR.js) para renderização do Pet Sentinel. | P3 | 🔘 |
| ELT-402 | Desenvolver Endpoint de IA para análise preditiva de tendência (Trend Analysis). | P2 | 🔘 |

---
### 📝 Legenda de Status
- 🔘 Pendente
- 🏗️ Em execução
- ✅ Concluído
- ⏸️ Pausado
