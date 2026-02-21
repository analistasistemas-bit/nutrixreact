# Política de Segurança — NutixoApp

## Reporte de Vulnerabilidades

A segurança dos dados de saúde dos usuários é nossa prioridade máxima. Se você descobrir uma vulnerabilidade, **não abra issues públicas**.

**Processo:**
1. Descreva a vulnerabilidade em detalhes (endpoint, vetor de ataque, impacto).
2. Inclua passos para reprodução e Proof of Concept se possível.
3. Nossa equipe responderá em até 48h.

---

## Versões Suportadas

| Versão | Suporte de Segurança |
| :--- | :--- |
| 1.2.x | ✅ Ativo (versão atual) |
| 1.1.x | ⚠️ Somente patches críticos |
| 1.0.x | ❌ Sem suporte |

---

## Modelo de Segurança

### Autenticação e Autorização
- **Auth**: Supabase Auth com JWT (RS256). Tokens expiram em 1h; refresh token em 7 dias.
- **RLS (Row Level Security)**: Todas as tabelas (`nutrixo_exams`, `nutrixo_meals`, `nutrixo_measurements`, `nutrixo_profiles`, `nutrixo_chat`) têm políticas RLS ativas. Um usuário autenticado **nunca acessa dados de outro usuário**.
- **Sessões**: Gerenciadas pelo SDK do Supabase (`@supabase/supabase-js`), sem cookies customizados.

### Proteção de Dados Sensíveis
- **Dados de saúde** são classificados como sensíveis (exames de sangue, medidas corporais, histórico alimentar). Nunca são expostos em URLs, logs ou error messages.
- **Chaves de API** de IA (NVIDIA, Gemini) ficam **exclusivamente no backend Python** ou nas variáveis de ambiente do servidor Vercel. Nunca no código cliente.
- **`.env` não versionado**: O `.gitignore` exclui `.env` e `.env.backend`. Somente `.env.example` e `.env.backend.example` são commitados.

### Segurança das Chamadas de IA
- Todas as chamadas à API de IA passam por validação de input no frontend (Zod) antes de serem enviadas.
- Respostas da IA são exibidas como texto, nunca renderizadas como HTML (sem risco de XSS via resposta de IA).
- O backend Python valida o `Content-Type` das requisições de upload.

### Upload de Arquivos
- Apenas formatos aceitos: PDF, JPG, PNG, JPEG.
- Validação de MIME type no frontend (`accept="application/pdf,image/*"`) e no backend Python.
- Arquivos são processados em memória pelo Docling + armazenados no Supabase Storage (com políticas de acesso por usuário).

### CORS
- O backend Python aceita origens configuradas em `BACKEND_PY_CORS_ORIGINS`.
- Em produção, apenas o domínio do app Vercel é permitido.

### Dependências
- Dependências monitoradas via `npm audit` a cada build.
- Backend Python: `pip-audit` recomendado antes de cada deploy.

---

## Práticas para Desenvolvedores

### O que NUNCA fazer
- Nunca use `dangerouslySetInnerHTML` com dados vindos de APIs externas.
- Nunca faça `console.log` de tokens JWT ou dados de exames em produção.
- Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend — ela tem acesso total ao banco.
- Nunca chame `parseFloat()` direto em valores de exames — use `parsePtBrNumber()` de `src/lib/numberLocale.js`.

### Variáveis de Ambiente
Veja `docs/ENV_VARS.md` para referência completa. Resumo das mais críticas:

| Variável | Onde fica | Risco se exposta |
| :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend VPS apenas | Acesso total ao banco |
| `VITE_NVIDIA_API_KEY` | Vercel + backend | Consumo de créditos |
| `VITE_SUPABASE_ANON_KEY` | Frontend (público) | Baixo — protegida por RLS |

---

## Auditoria de Segurança

O resultado da última auditoria está em `docs/SECURITY_AUDIT.md`.

Próxima auditoria planejada: Q2 2026.

---

*Atualizado em: 20 de Fevereiro de 2026*
