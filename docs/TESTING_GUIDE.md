# Guia de Testes — NutixoApp

Este guia descreve os padrões e procedimentos de teste do projeto.

---

## 1. Ferramentas

| Ferramenta | Uso | Comando |
| :--- | :--- | :--- |
| **ESLint** | Análise estática, padrões React | `npm run lint` |
| **Vite Build** | Verificação de build (sem erros de compilação) | `npm run build` |
| **`npm run test`** | Lint + Build (CI completo) | `npm run test` |
| **Playwright** | Testes E2E (planejado para Q3 2026) | — |

---

## 2. Testes Automatizados Atuais

### Lint (ESLint)
```bash
npm run lint
```
Verifica:
- Regras React 19 (`react-hooks/exhaustive-deps`, `no-unused-vars`)
- Importações desnecessárias
- Padrões de código JS/JSX

### Build de Verificação
```bash
npm run build
```
O build do Vite falha se houver:
- Imports quebrados ou módulos não encontrados
- Erros de sintaxe JSX
- Variáveis de ambiente `VITE_*` ausentes (quando obrigatórias)

---

## 3. Testes Manuais — Checklist por Funcionalidade

Execute este checklist antes de qualquer PR para `main`.

### 🔐 Autenticação
- [ ] Login com e-mail/senha válidos redireciona para o Dashboard
- [ ] Login com credenciais inválidas exibe mensagem de erro
- [ ] Logout limpa sessão e redireciona para `/login`
- [ ] Sessão persiste ao recarregar a página

### 📊 Dashboard
- [ ] Widget "Resumo do Dia" exibe estado correto (Exames, Dieta, Alertas)
- [ ] Clicar em "Exames" navega para `/labs`
- [ ] Clicar em "Dieta" navega para `/food`
- [ ] XPBar reflete o XP atual do usuário
- [ ] Biomarcadores mais recentes são exibidos nos cards

### 🧪 Labs (Exames)
- [ ] Upload de PDF processa e exibe os biomarcadores extraídos
- [ ] Histórico agrupa exames por data (Hoje / Esta semana / etc.)
- [ ] Badge "Novo" aparece em exames dos últimos 7 dias
- [ ] Delta (▲▼) é exibido ao expandir exame quando existe exame anterior
- [ ] Ao clicar em biomarcador, abre detalhe com gráfico histórico

### 📏 Medidas (Measurements)
- [ ] Upload de PDF de bioimpedância extrai medidas corretamente
- [ ] Valores exibidos usam separador decimal pt-BR (vírgula)

### 📈 Progress
- [ ] Seletor de período (7D / 30D / 3M / 1A) filtra os dados dos gráficos
- [ ] Aba "Evolução Clínica" exibe biomarcadores com gráficos de tendência
- [ ] Aba "Evolução Física" exibe medidas corporais
- [ ] Busca de indicador filtra a lista corretamente
- [ ] Filtro "Problemas" exibe apenas biomarcadores fora da faixa

### 🍽️ Food
- [ ] Barra de macros do dia exibe totais corretos (Kcal, Proteína, Carbs, Gorduras)
- [ ] Registrar refeição por foto inicia análise e salva resultado
- [ ] Registrar refeição por voz (Chrome/Safari) inicia reconhecimento
- [ ] Registrar refeição manual valida e envia para IA
- [ ] Histórico filtra corretamente por "Hoje", "7 dias", "30 dias", "Personalizado"
- [ ] Editar refeição salva alterações corretamente
- [ ] Excluir refeição remove do histórico após confirmação
- [ ] Duplicar refeição cria cópia no histórico

### 🎮 Gamificação
- [ ] Registrar refeição adiciona XP ao usuário
- [ ] Upload de exame adiciona XP ao usuário
- [ ] Level-up dispara modal de animação e confetti
- [ ] Pet Sentinel muda de estado conforme o humor

### ⚙️ Configurações
- [ ] Alternar tema dark/light persiste ao recarregar
- [ ] Toggles de notificação salvam estado no localStorage
- [ ] Alteração de idioma persiste no localStorage

### 🤖 Chatbot
- [ ] FAB do chatbot aparece acima do BottomNav no mobile (não sobrepõe)
- [ ] Enviar mensagem recebe resposta com streaming
- [ ] Fechar e reabrir o chatbot mantém o histórico da sessão

---

## 4. Testes de Interface — Dark/Light Mode

Para cada tela, verificar em ambos os temas:
- [ ] Texto legível (sem branco sobre branco ou preto sobre preto)
- [ ] Bordas e separadores visíveis
- [ ] Inputs com placeholder visível
- [ ] Cards com contraste adequado de fundo

---

## 5. Testes de Responsividade

| Breakpoint | Dispositivo alvo | O que verificar |
| :--- | :--- | :--- |
| 375px | iPhone SE | FAB chatbot acima do BottomNav, textos não truncados |
| 390px | iPhone 15 | Layout mobile padrão |
| 768px | iPad | Layout de tablet, sidebar ou BottomNav |
| 1280px | Desktop | Sidebar lateral visível, grid de cards expandido |

---

## 6. Testes E2E com Playwright (Planejado — Q3 2026)

Os seguintes fluxos críticos serão automatizados:

```
tests/
├── auth.spec.ts          # Login, logout, sessão
├── labs.spec.ts          # Upload PDF, histórico, delta
├── food.spec.ts          # Registro de refeição, histórico, edição
├── progress.spec.ts      # Seletor de período, filtros de biomarcador
└── gamification.spec.ts  # XP, level-up, conquistas
```

Para rodar quando implementado:
```bash
npx playwright test
npx playwright test --ui       # Modo visual
npx playwright show-report     # Relatório HTML
```

---

## 7. Padrão Numérico — Teste Crítico

O sistema usa pt-BR como padrão numérico. Qualquer bug de parsing pode gerar interpretações incorretas de exames de saúde.

**Função obrigatória**: `parsePtBrNumber()` de `src/lib/numberLocale.js`

Casos críticos a validar manualmente:
- `"278.000"` deve ser interpretado como `278000` (milhares) — **nunca** `278`
- `"5,4"` deve ser interpretado como `5.4`
- `"< 5,0"` e `"5,0 - 10,0"` devem ser parseados pelo `parsePtBrReferenceRange()`

---

*Atualizado em: 20 de Fevereiro de 2026*
