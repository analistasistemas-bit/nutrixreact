# Guia de Testes - NutixoApp 🧪

Para manter a experiência premium e livre de bugs, seguimos estes padrões de teste.

## 1. Ferramentas Utilizadas
- **Playwright**: Para testes de ponta a ponta (E2E) e visual regression.
- **ESLint**: Garantia de qualidade estática e padrões React.

## 2. Como Rodar os Testes

### Linting
```bash
npm run lint
```

### Testes E2E (Futuro)
Prevemos o uso de scripts Playwright para validar fluxos críticos:
- Fluxo de Login.
- Upload de PDF e processamento de IA.
- Exibição de gráficos no dashboard.

## 3. O que deve ser testado?

### Visual Regression
Como o NutixoApp foca em design premium:
- Verificar se o raio de borda (`2rem`) se mantém consistente.
- Validar as cores do Dark Mode em diferentes navegadores.

### Lógica de Negócio
- Cálculo de XP ao cadastrar refeições.
- Mudança de humor do Pet após 3 dias sem bater metas.
- Tradução correta de Labels estrangeiras no Dashboard de Progresso.

---
*A qualidade não é um ato, é um hábito.*
