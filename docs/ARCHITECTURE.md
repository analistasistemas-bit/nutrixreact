# Arquitetura Técnica - NutixoApp

Este documento descreve a organização técnica, a stack tecnológica e os padrões de implementação do NutixoApp.

## 🚀 Stack Tecnológica
- **Linguagem**: JavaScript (ES6+)
- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Estrutura de Pastas (Organizada)

A estrutura segue um padrão de separação de responsabilidades para facilitar a manutenção:

```
src/
├── components/     # Componentes reutilizáveis (Header, Login, AIAnalysisPage)
├── contexts/       # Gerenciamento de estado global (Gamificação, Temas)
├── data/           # Configurações de dados
│   └── mocks/      # Dados simulados para desenvolvimento (Exames, Métricas)
├── hooks/          # Custom hooks para lógica compartilhada
├── layouts/        # Estruturas de página (MainLayout)
├── lib/            # Clientes e utilitários compartilhados (Supabase, locale numérico)
├── pages/          # Páginas principais da aplicação (Dashboard, Labs, Progress)
├── services/       # Integrações externas e lógica de negócio
└── utils/          # Funções auxiliares e formatação
```

## ⚙️ Fluxos Principais

### 1. Importação de Exames via IA
Utiliza o componente modular `AIAnalysisPage` para padronizar o upload e processamento de PDFs em diferentes áreas (Labs, Measurements, Nutrition). O componente gerencia o estado de análise e exibe os resultados após o processamento.

### 2. Sistema de Gamificação
Gerenciado através de contextos React. Monitora ações do usuário para atualizar:
- **XP e Níveis**: Progresso contínuo baseado em interação.
- **Conquistas**: Gatilhos para desbloqueio de badges.
- **Pet State**: O "mascote" da aplicação reage aos hábitos de saúde do usuário.

### 3. Visualização de Dados (Progress)
O dashboard de progresso utiliza o padrão `SentinelCard` para exibir KPIs biométricos. Dados históricos são visualizados via modais de detalhe (`BiomarkerDetailOverlay`) com suporte a tradução dinâmica de categorias.

## 🔢 Padrão Numérico Oficial (pt-BR)

Para evitar erros clínicos de interpretação (`278.000` virar `278`), o sistema adota **pt-BR como padrão oficial** de leitura/formatação numérica.

- **Separador de milhar**: ponto (`.`)
- **Separador decimal**: vírgula (`,`)
- **Regra obrigatória**: parsing numérico deve usar `src/lib/numberLocale.js`, nunca `parseFloat` direto em valores vindos de IA/OCR.

Funções padrão:
- `parsePtBrNumber(value)`: converte texto/número para numérico respeitando formato brasileiro.
- `formatPtBrNumber(value)`: formata exibição em `pt-BR`.
- `parsePtBrReferenceRange(referenceText)`: interpreta faixas de referência laboratoriais (`min-max`, `<`, `>`, `até`, `acima de`).

Aplicação atual:
- `src/services/aiService.js` (normalização de exames e status clínico)
- `src/pages/Progress.jsx` (cálculos, tendências e filtros)
- `src/pages/Measurements.jsx` (extração e exibição de medidas)
- `src/pages/Labs.jsx` (exibição de resultados laboratoriais)

## 🎨 Design System
As diretrizes de cores, tipografia e componentes visuais estão documentadas em:
👉 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---
*Atualizado em: 16 de Fevereiro de 2026*
