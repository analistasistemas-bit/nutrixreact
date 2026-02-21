# Guia de Deploy — NutrixoApp

O NutixoApp usa uma arquitetura split:

```
Frontend (React/Vite)  →  Vercel
Backend (FastAPI/Python)  →  VPS Linux (nginx + systemd)
Banco de Dados  →  Supabase (cloud)
```

> **Para o guia completo e detalhado** (pré-requisitos, configuração de nginx, HTTPS, systemd), veja:
> 👉 [`docs/deploy_vercel_vps.md`](./deploy_vercel_vps.md)

---

## Quick Start — Frontend (Vercel)

### 1. Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Projeto conectado ao repositório GitHub

### 2. Variáveis de Ambiente no Vercel

Configure em **Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_NVIDIA_API_KEY=nvapi-...
VITE_GEMINI_API_KEY=...
VITE_IMPORT_USE_BACKEND=true
VITE_IMPORT_BACKEND_URL=https://seu-backend.com/py-api
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_AI_LOGGING=false
VITE_DEBUG_MODE=false
```

Veja referência completa em [`docs/ENV_VARS.md`](./ENV_VARS.md).

### 3. Build Settings no Vercel

| Campo | Valor |
| :--- | :--- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4. SPA Routing (`vercel.json`)

O arquivo `vercel.json` na raiz já está configurado:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Isso garante que rotas como `/dashboard`, `/labs`, `/progress` funcionem corretamente.

---

## Quick Start — Backend Python (VPS)

### 1. Configurar ambiente

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Variáveis de Ambiente

```bash
cp .env.backend.example .env.backend
# Edite .env.backend com suas chaves
```

Variáveis necessárias:
```
BACKEND_PY_HOST=0.0.0.0
BACKEND_PY_PORT=8001
BACKEND_PY_CORS_ORIGINS=https://seu-app.vercel.app
BACKEND_DOCLING_OCR=true
BACKEND_IMPORT_LLM_MODEL=meta/llama-3.2-11b-vision-instruct
VITE_NVIDIA_API_KEY=nvapi-...
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_STORAGE_BUCKET=uploads
```

### 3. Rodar em desenvolvimento

```bash
uvicorn app.main:app --reload --port 8001
```

### 4. Verificar saúde

```bash
curl http://localhost:8001/health
# → {"status": "ok"}
```

---

## Desenvolvimento Local Completo

Para rodar frontend + backend simultaneamente:

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend Python
npm run dev:py-backend
```

O Vite proxia `/py-api/*` para `http://localhost:8001` automaticamente (configurado em `vite.config.js`).

---

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `VITE_IMPORT_BACKEND_URL` aponta para o VPS correto
- [ ] Backend Python rodando com systemd (`sudo systemctl status nutrixo-backend`)
- [ ] nginx configurado com HTTPS e proxy para porta 8001
- [ ] Supabase Storage bucket `uploads` existe e tem política de acesso
- [ ] RLS ativo em todas as tabelas do Supabase
- [ ] `VITE_DEBUG_MODE=false` em produção
- [ ] `VITE_ENABLE_AI_LOGGING=false` em produção (evita custos extras)

---

*Para troubleshooting, consulte [`docs/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)*
*Atualizado em: 20 de Fevereiro de 2026*
