# Mapa de Prompts de IA do Nutrixo

Este documento lista **todos os prompts de IA atualmente usados no sistema**, com localização no código, contexto de uso, variáveis injetadas, formato esperado de resposta e rotas/telas que acionam cada prompt.

## Escopo e Fonte
- Arquivo central de prompts: `src/services/aiService.js`
- Modelo base (quando não sobrescrito): `openai/gpt-4o-mini` em `src/services/aiService.js:8`
- Última varredura: leitura estática do código da branch atual.

---

## 1) Inventário Geral

| ID | Função | Tipo | Local do Prompt | Onde é chamado |
|---|---|---|---|---|
| P1 | `generateFoodAnalysisFromText` | Nutrição por texto/voz | `src/services/aiService.js:249` (system), `src/services/aiService.js:267` (user) | `src/pages/Food.jsx:5`, fluxo manual/voz (`src/pages/Food.jsx:201`, `src/pages/Food.jsx` via `analyzeFoodDescription`) |
| P2 | `analyzeExam` | Extração de biomarcadores de exame (arquivo) | `src/services/aiService.js:320` (system), `src/services/aiService.js:364` (user) | `src/pages/Labs.jsx:5`, upload em `src/pages/Labs.jsx:43` |
| P3 | `analyzeMeasurements` | Extração antropométrica (arquivo) | `src/services/aiService.js:443` (system), `src/services/aiService.js:473` (user) | `src/pages/Measurements.jsx:4`, upload em `src/pages/Measurements.jsx:43` |
| P4 | `analyzeNutritionPlan` | Extração de plano alimentar (arquivo) | `src/services/aiService.js:546` (system), `src/services/aiService.js:573` (user) | `src/pages/NutritionPlan.jsx:4`, upload em `src/pages/NutritionPlan.jsx:25` |
| P5 | `analyzeFoodPhoto` | Nutrição por foto | `src/services/aiService.js:635` (system), `src/services/aiService.js:653` (user) | `src/pages/Food.jsx:5`, captura em `src/pages/Food.jsx:201` |
| P6 | `chatWithAssistant` | Chat assistente Nutrixo (streaming) | `src/services/aiService.js:816` (system dinâmico com contexto) | `src/components/Chatbot.jsx:4`, envio em `src/components/Chatbot.jsx:70` |
| P7 | `generateHealthInsights` | Insights automáticos do dashboard | `src/services/aiService.js:950` (system), `src/services/aiService.js:970` (user) | `src/pages/Dashboard.jsx:10`, chamada em `src/pages/Dashboard.jsx:106` |

---

## 2) Prompts Detalhados

## P1) Nutrição por Texto/Voz
- Função: `generateFoodAnalysisFromText`
- Local: `src/services/aiService.js:244`
- Modelo: `AI_MODEL` (`openai/gpt-4o-mini`)
- Objetivo: converter descrição livre de refeição em JSON nutricional estruturado.

### System Prompt (resumo fiel)
- Persona: "Você é um nutricionista".
- Tarefa: identificar alimentos e estimar macronutrientes.
- Exige JSON com:
  - `foods[]` (`name`, `portion`, `calories`, `protein`, `carbs`, `fats`)
  - totais (`totalCalories`, `totalProtein`, `totalCarbs`, `totalFats`)
  - metadados (`description`, `healthScore`, `tips`)
- Regra forte: "Retorne APENAS o JSON".

### User Prompt
- Template: `Para o ${mealType}, eu comi: ${text}`
- Variáveis:
  - `mealType`: tipo de refeição selecionado no Diário
  - `text`: texto do usuário (manual ou voz)

### Consumidores
- `analyzeFoodDescription` em `src/services/aiService.js:697`
- UI: `src/pages/Food.jsx`

---

## P2) Exames de Sangue (Arquivo)
- Função: `analyzeExam`
- Local: `src/services/aiService.js:284`
- Modelo: `AI_MODEL`
- Objetivo: transcrição/extração conservadora de linhas de exames laboratoriais.

### System Prompt (pontos críticos)
- Persona: "transcritor de exames laboratoriais".
- Restrições rígidas:
  - extrair **somente** linhas visíveis em tabela
  - não inferir nem inventar biomarcadores
  - respeitar notação numérica brasileira (ex.: `7.200` = 7200)
- Saída JSON exigida:
  - `biomarkers[]` com `name`, `value`, `unit`, `reference`, `status`
  - `summary`, `recommendations`, `alerts`
- Regra: "Retorne SOMENTE o JSON".

### User Prompt
- Texto explícito de não invenção:
  - "Transcreva SOMENTE as linhas das tabelas... NÃO invente dados..."
- Inclui bloco `file` com:
  - `filename`
  - `file_data` (base64)

### Fallback de parser
- Primeiro tenta `fileParser: { enabled: true }` em `src/services/aiService.js:207`.
- Se erro de permissão cloud parser, converte bloco `file` para texto inline (`convertFileBlocksToText` em `src/services/aiService.js:191`) e reenvia sem parser explícito (`src/services/aiService.js:220`).

### Consumidores
- UI de upload: `src/pages/Labs.jsx:43`

---

## P3) Medidas Corporais (Arquivo)
- Função: `analyzeMeasurements`
- Local: `src/services/aiService.js:409`
- Modelo: `AI_MODEL`
- Objetivo: extrair medidas antropométricas em estrutura rígida.

### System Prompt (pontos críticos)
- Persona: "robô de extração de dados antropométricos".
- Define schema obrigatório:
  - `bmi`
  - `measurements` (peso, altura, cintura, gordura etc.)
  - `summary`, `recommendations`
- Regras:
  - varrer todos os perímetros
  - camelCase
  - ponto decimal
  - omitir chave ausente
  - retorno JSON válido apenas

### User Prompt
- "Analise estas medidas corporais e retorne os resultados em JSON"
- Anexa `file_data` base64.

### Fallback de parser
- Mesmo mecanismo de P2 (`createCompletionWithFileParserFallback`).

### Consumidores
- UI de upload: `src/pages/Measurements.jsx:43`

---

## P4) Plano Alimentar (Arquivo)
- Função: `analyzeNutritionPlan`
- Local: `src/services/aiService.js:512`
- Modelo: `AI_MODEL`
- Objetivo: extrair macros diários e refeições de plano alimentar.

### System Prompt (pontos críticos)
- Persona: "nutricionista".
- Schema esperado:
  - `dailyMacros` (`calories`, `protein`, `carbs`, `fats`)
  - `meals[]` (`time`, `name`, macros, `ingredients`)
  - `summary`, `suggestions`
- Regra: retornar apenas JSON.

### User Prompt
- "Analise este plano alimentar e extraia as refeições e macros"
- Anexa arquivo em base64.

### Fallback de parser
- Mesmo mecanismo de P2/P3.

### Consumidores
- UI de upload: `src/pages/NutritionPlan.jsx:25`

---

## P5) Refeição por Foto
- Função: `analyzeFoodPhoto`
- Local: `src/services/aiService.js:612`
- Modelo: `AI_MODEL`
- Objetivo: identificar alimentos em imagem e estimar nutrientes.

### System Prompt
- Persona: "nutricionista que analisa fotos de refeições".
- Exige JSON com:
  - `foods[]`
  - totais de macros
  - `description`, `healthScore`, `tips`

### User Prompt
- Template: `Esta é uma foto do meu ${mealType}...`
- Conteúdo multimodal:
  - bloco `text`
  - bloco `image_url` com `base64`

### Consumidores
- UI Diário: upload/câmera em `src/pages/Food.jsx:201`

---

## P6) Chat Assistente Nutrixo (Streaming)
- Função: `chatWithAssistant`
- Local: `src/services/aiService.js:813`
- Modelo: `AI_MODEL`
- Objetivo: conversa contextual de saúde/nutrição.

### System Prompt (dinâmico)
- Define papel do assistente (nutrição, exames, bem-estar, sugestões).
- Injeta contexto do usuário:
  - último exame (`lastExam`)
  - refeições do dia (`todayMeals`)
  - medidas (`measurements`)
- Regras:
  - responder em pt-BR
  - conciso/informativo
  - lembrar que não substitui profissional de saúde

### User Messages
- Vêm do histórico do `Chatbot` (`messageHistory`) em `src/components/Chatbot.jsx:35`.

### Consumidores
- `src/components/Chatbot.jsx:70`

---

## P7) Insights do Dashboard
- Função: `generateHealthInsights`
- Local: `src/services/aiService.js:919`
- Modelo: `AI_MODEL`
- Objetivo: gerar 3 insights curtos com base nos dados do usuário.

### System Prompt
- Persona: "especialista em saúde e longevidade".
- Exige JSON com lista `insights` contendo:
  - `id`, `type` (`positive|warning|tip`), `title`, `description`
- Regras de priorização:
  - alertas em exames alterados
  - elogios para bons indicadores
  - dicas cruzando plano x medidas

### User Prompt
- Template: `Dados atuais: ${JSON.stringify(context)}...`
- `context` agrega:
  - `exam`, `measurement`, `plan`

### Consumidores
- `src/pages/Dashboard.jsx:106`

---

## 3) Mecanismos Transversais que Afetam Prompts

## 3.1) Fallback de parser de arquivo
- Função: `createCompletionWithFileParserFallback` (`src/services/aiService.js:207`)
- Comportamento:
  1. tentativa com parser cloud habilitado (`fileParser: true`)
  2. em erro de permissão cloud parser, converte `file` em texto base64 inline e reenvia

Impacto:
- P2/P3/P4 podem executar em dois modos (parser ou fallback textual), com o mesmo prompt lógico.

## 3.2) Retry de token/sessão
- Funções: `runWithTokenRetry` (`src/services/aiService.js:113`), `sdkCallWithRetry` (`src/services/aiService.js:143`)
- Não altera conteúdo do prompt, mas altera confiabilidade de execução.

## 3.3) Normalização de erro
- `normalizeAnalysisError` (`src/services/aiService.js:165`)
- Mapeia erros técnicos para mensagens amigáveis no front.

---

## 4) Onde cada prompt aparece na interface

- Exames: rota/tela `src/pages/Labs.jsx`
- Medidas: rota/tela `src/pages/Measurements.jsx`
- Plano: rota/tela `src/pages/NutritionPlan.jsx`
- Diário (foto/texto/voz): `src/pages/Food.jsx`
- Chat assistente: `src/components/Chatbot.jsx`
- Insights automáticos: `src/pages/Dashboard.jsx`

---

## 5) Observações de manutenção

- Atualmente os prompts estão concentrados em um único arquivo (`src/services/aiService.js`), o que facilita auditoria.
- Se houver evolução frequente, recomendação futura:
  - extrair prompts para módulo dedicado (`src/services/prompts/*`), versionar por domínio e facilitar testes de regressão de prompt.

