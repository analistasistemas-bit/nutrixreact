# 🧠 Cérebro do Projeto: NutixoApp

Este arquivo contém as instruções mestre e o contexto vital para qualquer IA que trabalhe neste repositório. **LEIA ESTE ARQUIVO ANTES DE QUALQUER AÇÃO.**

---

## 🇧🇷 Diretrizes de Comunicação
- **Idioma Principal**: Fale SEMPRE em **Português do Brasil**.
- **Tom de Voz**: Engenheiro de software colaborativo, técnico e direto ao ponto.

## 🏛️ Regras Operacionais Críticas
1.  **Deploy**: NÃO utilize o MCP insforge para fazer deploy automático a cada alteração. Aguarde o comando explícito do usuário.
2.  **Upload Git**: Sempre que o usuário disser `uploadgit` (ou variações como `uploadguit`), execute rigorosamente:
    ```bash
    git status
    git add .
    git commit -m "Atualizacao projeto Nutrixo"
    git push
    git status
    ```

---

## 🗺️ Mapa de Conhecimento (Docs Internos)
Consulte estes arquivos para entender as fundações do projeto:
- 🏗️ **[Arquitetura](./docs/ARCHITECTURE.md)**: Stack tecnológica e fluxos de dados.
- 🎨 **[Design System](./docs/DESIGN_SYSTEM.md)**: Paleta de cores (Dark Mode) e tokens de UI.
- 🌿 **[Contribuição](./docs/CONTRIBUTING.md)**: Padrões de commit e workflow de código.
- 🛡️ **[Segurança](./docs/SECURITY_AUDIT.md)**: Relatório de auditoria e proteções implementadas.

---

## 🎨 Padrões Inegociáveis de UI/UX
- **Aesthetic**: Visual premium, moderno e dinâmico.
- **Dark Mode**: Fundo oficial `#0F172A`.
- **Cards**: Devem possuir `rounded-[2rem]` para consistência com o estilo "Sentinel".
- **Animações**: Utilize `framer-motion` para micro-interações suaves.

---

## 🧪 Comandos Úteis
- **Dev Server**: `npm run dev`
- **Linting**: `npm run lint`
- **Build**: `npm run build`

---
*Este arquivo deve ser atualizado sempre que uma nova regra global ou mudança arquitetural for implementada.*
