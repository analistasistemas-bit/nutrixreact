# Changelog - NutixoApp

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2026-02-16
### Adicionado
- Documentação técnica completa na pasta `/docs`.
- Novo arquivo `docs/ARCHITECTURE.md` detalhando a stack e fluxos.
- Novo arquivo `docs/DESIGN_SYSTEM.md` com tokens de cores e UI.
- Novo arquivo `docs/CONTRIBUTING.md` com padrões de desenvolvimento.
- Novo componente modular `AIAnalysisPage` para padronização de importação.
- Pasta `src/data/mocks` para melhor organização de dados simulados.

### Limpeza & Organização
- Movimentação de scripts utilitários para a pasta `/scripts`.
- Organização de arquivos de teste em `docs/test-exams`.
- Remoção de arquivos temporários da raiz (`package-lock 2.json`, `lint_output.txt`).

### Corrigido
- Erro de chave duplicada ("bmi") no dicionário de traduções do componente `Progress.jsx`.

## [1.0.0] - 2026-02-15
### Adicionado
- Versão estável inicial do Nutrixo.
- Dashboard de saúde com integração de biomarcadores.
- Sistema de Gamificação (XP, Pets, Conquistas).
- Suporte a Dark Mode profissional em toda a interface.
