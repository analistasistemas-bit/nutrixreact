# Referência de Variáveis de Ambiente — NutixoApp

Este documento descreve todas as variáveis de ambiente do projeto. Copie o arquivo de exemplo correspondente antes de rodar o projeto.

---

## Frontend (`/.env`)

Copie de `.env.example`:
```bash
cp .env.example .env
```

| Variável | Obrigatória | Exemplo | Descrição |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | ✅ | `https://xyz.supabase.co` | URL do projeto Supabase. Disponível em Dashboard → Settings → API. |
| `VITE_SUPABASE_ANON_KEY` | ✅ | `eyJhbGci...` | Chave pública anon do Supabase (segura no frontend; protegida por RLS). |
| `VITE_NVIDIA_API_KEY` | ✅ | `nvapi-...` | API Key da NVIDIA (usada para análise de texto e visão via Llama). |
| `VITE_AI_MODEL` | ✅ | `meta/llama-3.2-11b-vision-instruct` | Modelo de IA padrão para análise de exames e alimentos. |
| `VITE_GEMINI_API_KEY` | ✅ | `AIzaSy...` | API Key do Google Gemini (usada para análise de fotos de refeições). |
| `VITE_IMPORT_USE_BACKEND` | ✅ | `true` | Se `true`, o upload de PDFs passa pelo backend Python. Se `false`, usa IA direto do frontend (modo legado). |
| `VITE_IMPORT_BACKEND_URL` | ✅ | `/py-api` | URL base do backend Python. Em dev: `/py-api` (proxy Vite). Em produção: `https://seu-backend.com/py-api`. |
| `VITE_APP_NAME` | ❌ | `NutixoApp` | Nome do app (exibido em alguns lugares da UI). |
| `VITE_API_TIMEOUT` | ❌ | `30000` | Timeout em ms para chamadas de IA. Padrão: 30000 (30s). |
| `VITE_ENABLE_GAMIFICATION` | ❌ | `true` | Ativa/desativa o sistema de gamificação completo. |
| `VITE_DEBUG_MODE` | ❌ | `false` | Em `true`, ativa logs extras no console. **Nunca use `true` em produção.** |
| `VITE_ENABLE_AI_LOGGING` | ❌ | `false` | Em `true`, salva logs de uso de IA no Supabase (para monitoramento). Gera custo extra. |

### Onde obter as chaves

| Serviço | Onde encontrar |
| :--- | :--- |
| Supabase URL + Anon Key | [app.supabase.com](https://app.supabase.com) → Seu projeto → Settings → API |
| NVIDIA API Key | [build.nvidia.com](https://build.nvidia.com) → API Keys |
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

---

## Backend Python (`/backend-python/.env.backend`)

Copie de `backend-python/.env.backend.example`:
```bash
cp backend-python/.env.backend.example backend-python/.env.backend
```

| Variável | Obrigatória | Exemplo | Descrição |
| :--- | :---: | :--- | :--- |
| `BACKEND_PY_HOST` | ✅ | `0.0.0.0` | Host em que o servidor FastAPI escuta. |
| `BACKEND_PY_PORT` | ✅ | `8001` | Porta do servidor FastAPI. |
| `BACKEND_PY_CORS_ORIGINS` | ✅ | `http://localhost:5173,https://nutrixo.vercel.app` | Origens CORS permitidas (separadas por vírgula). |
| `BACKEND_DOCLING_OCR` | ❌ | `true` | Ativa OCR no Docling para PDFs escaneados (mais lento, mais preciso). |
| `BACKEND_IMPORT_LLM_MODEL` | ✅ | `meta/llama-3.2-11b-vision-instruct` | Modelo LLM para extração estruturada de dados clínicos do Markdown. |
| `VITE_NVIDIA_API_KEY` | ✅ | `nvapi-...` | Mesma chave NVIDIA do frontend (o backend também faz chamadas ao LLM). |
| `VITE_SUPABASE_URL` | ✅ | `https://xyz.supabase.co` | URL do Supabase para persistência no backend. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `eyJhbGci...` | **CHAVE SECRETA** — Service role key do Supabase. Tem acesso total ao banco. **Nunca exponha no frontend.** |
| `SUPABASE_STORAGE_BUCKET` | ✅ | `uploads` | Nome do bucket no Supabase Storage onde os PDFs são armazenados. |

---

## Diferença entre `anon_key` e `service_role_key`

| Chave | Onde usar | Permissões |
| :--- | :--- | :--- |
| `VITE_SUPABASE_ANON_KEY` | Frontend (público) | Limitada — respeitando RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend Python apenas | Total — bypassa RLS |

> **Regra de ouro**: A `service_role_key` nunca deve aparecer em código frontend, git commits, ou logs.

---

## Proxy Vite (Desenvolvimento Local)

Em desenvolvimento, `VITE_IMPORT_BACKEND_URL=/py-api` e o Vite proxia automaticamente:

```
/py-api/* → http://localhost:8001/*
```

Configurado em `vite.config.js`. Sem necessidade de CORS em desenvolvimento local.

---

*Atualizado em: 20 de Fevereiro de 2026*
