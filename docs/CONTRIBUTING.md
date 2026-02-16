# Guia de Contribuição - NutixoApp

Obrigado por se interessar em contribuir para o NutixoApp! Este documento estabelece os padrões e processos para garantir a qualidade e consistência do projeto.

## 🛠️ Workflow de Desenvolvimento

### 1. Preparação
Certifique-se de ter o Node.js instalado.
```bash
npm install
```

### 2. Execução Local
```bash
npm run dev
```

### 3. Verificação de Código
Antes de enviar suas alterações, execute o linter:
```bash
npm run lint
```
*Não serão aceitos PRs com erros de linter ou avisos críticos.*

## 📝 Padrão de Commits

Seguimos a convenção de **[Conventional Commits](https://www.conventionalcommits.org/)**. Isso mantém o histórico do projeto limpo e facilita a integração com geradores de changelog.

### Formato
`<tipo>(escopo): descrição curta`

### Tipos Comuns
- `feat`: Uma nova funcionalidade.
- `fix`: Correção de um bug.
- `docs`: Alterações em documentação.
- `style`: Mudanças de estilo que não afetam a lógica (espaços, formatação).
- `refactor`: Mudança no código que não corrige bug nem adiciona feature.
- `perf`: Melhoria de performance.

**Exemplo:**
`feat(auth): adiciona integração com Google Login`

## 🌿 Branching Policy

- **`main`**: Branch de produção. Nunca faça commits diretos aqui.
- **`develop`**: Branch de integração.
- **Feature Branches**: Crie branches específicas para cada tarefa partindo da `develop`.
  - Padrão: `feature/nome-da-task` ou `bugfix/nome-da-correcao`.

## 🎨 Design System e UI

Todas as contribuições visuais **devem** seguir as diretrizes definidas em:
👉 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

- Use os tokens de cores oficiais.
- Respeite o raio de borda de `2rem` nos cards.
- Priorize componentes reutilizáveis da pasta `src/components/common`.

## 🏗️ Padrões de Código

1.  **React 19**: Utilize as novas APIs e hooks de forma consistente.
2.  **Tailwind CSS 4**: Evite CSS inline; use as variáveis de tema definidas no `index.css`.
3.  **Hooks**: Mantenha a lógica de negócio separada da visual sempre que possível usando custom hooks em `src/hooks`.

---
*Assuntos relacionados à arquitetura podem ser consultados em:*
👉 [ARCHITECTURE.md](./ARCHITECTURE.md)
