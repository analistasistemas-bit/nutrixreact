# Design Doc: Dashboard Resumo - Estilo Sentinela (Hub de Progresso)

**Data:** 15 de Fevereiro de 2026
**Status:** Aprovado
**Conceito:** IA Sentinela / Centro de Comando

## 1. Visão Geral
Transformar o sub-menu "Dashboard Resumo" em uma experiência visual de alto impacto que simula um centro de comando de saúde futurista, onde a **IA Nutrixo** atua como uma sentinela vigilante.

## 2. Elementos de Interface

### 2.1 AIScanCore (O Núcleo)
*   **Componente:** HUD circular central animado.
*   **Visual:** Múltiplas camadas de SVG rotativos, scan lines circulares e um ícone de pulso central (Logotipo Nutrixo ou ícone de atividade).
*   **Comportamento:** Pulsa suavemente; muda de cor conforme o status dominante dos marcadores de saúde (Verde = Normal, Amarelo/Vermelho = Atenção).

### 2.2 AILogTerminal
*   **Componente:** Terminal de log de texto mono-espaçado.
*   **Visual:** "Floating log" acima do HUD.
*   **Conteúdo:** Frases dinâmicas que simulam processamento: *"Scanning biomarkers..."*, *"Correlating lipids & glucose..."*, *"Active Monitoring: STATUS OK"*.

### 2.3 CommandCenterGrid
*   **Layout:** Grade assimétrica `grid-cols-4`.
    *   `InsightCard`: Span de 2x2, destaque principal.
    *   `MetricOrbitCard`: Cards menores que orbitam o núcleo.
*   **Estética:** Glassmorphism ultra-fino (`backdrop-blur-xl`), bordas neon sutis e sombras projetadas esmeraldas.

## 3. Experiência e Interação

### 3.1 Flow de Inicialização
1.  **Montagem:** Todos os cards iniciam com `opacity: 0`.
2.  **Scan:** Uma `ScannerLine` transparente com brilho percorre a página verticalmente.
3.  **Revelação:** Os cards aparecem conforme a linha de scan os atinge (`staggerChildren` no Framer Motion).

### 3.2 Feedback Tátil/Visual
*   **Hover:** O card foca e "puxa" os detalhes técnicos (IDs de referência de dados, timestamp de processamento).
*   **Conexões:** Linhas dinâmicas conectam o card focado ao `AIScanCore`.

## 4. Tecnologia
*   **Framework:** React + Tailwind CSS (Vanilla CSS para efeitos HUD complexos).
*   **Animação:** Framer Motion para orquestração e transições de estado.
*   **Gráficos:** SVG inline para o HUD central para máxima performance e controle de animação via CSS keyframes.
