# Deploy Vercel + VPS (Nutrixo)

Este guia cobre o deploy do:
- Frontend React/Vite na **Vercel**
- Backend Python (FastAPI + Docling) em **VPS**

## 1) Arquitetura final

- `Frontend (Vercel)` chama API HTTPS do backend.
- `Backend (VPS)` processa importações (`/api/import/*`) e grava no Supabase.
- Comunicação via REST com CORS liberado para o domínio do frontend.

Fluxo:
1. usuário faz upload no frontend
2. frontend chama backend (`POST /api/import/{kind}`)
3. backend processa e salva no Supabase
4. frontend faz polling (`GET /api/import/{kind}/{job_id}`)

---

## 2) Pré-requisitos

- Projeto frontend conectado à Vercel.
- VPS Linux com acesso root/sudo.
- Domínio para API (ex.: `api.seudominio.com`) apontando para IP da VPS.
- Chaves:
  - `VITE_NVIDIA_API_KEY`
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## 3) Deploy do Frontend na Vercel

### 3.1 Variáveis na Vercel (Project Settings -> Environment Variables)

Defina no ambiente de produção:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY` (se usado no app)
- `VITE_NVIDIA_API_KEY` (se usado no frontend também)
- `VITE_IMPORT_USE_BACKEND=true`
- `VITE_IMPORT_BACKEND_URL=https://api.seudominio.com`

### 3.2 Deploy

- Faça push no branch principal
- Vercel build/deploy automático
- Verifique se o app abre normalmente

---

## 4) Deploy do Backend Python na VPS

## 4.1 Instalar dependências do sistema (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx certbot python3-certbot-nginx
```

Opcional OCR adicional:
```bash
sudo apt install -y tesseract-ocr poppler-utils
```

## 4.2 Subir código

```bash
cd /opt
sudo git clone <seu-repo> nutrixo
sudo chown -R $USER:$USER /opt/nutrixo
cd /opt/nutrixo/backend-python
```

## 4.3 Criar venv e instalar pacotes

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4.4 Configurar `.env.backend`

Crie `/opt/nutrixo/backend-python/.env.backend`:

```env
BACKEND_PY_HOST=0.0.0.0
BACKEND_PY_PORT=8001
BACKEND_PY_CORS_ORIGINS=https://seuapp.vercel.app
BACKEND_DOCLING_OCR=true

BACKEND_IMPORT_LLM_MODEL=meta/llama-3.2-11b-vision-instruct
VITE_NVIDIA_API_KEY=...

VITE_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=uploads
```

## 4.5 Testar localmente na VPS

```bash
cd /opt/nutrixo/backend-python
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Em outro terminal:
```bash
curl http://127.0.0.1:8001/health
```

Esperado:
```json
{"status":"ok"}
```

## 4.6 Rodar com systemd (produção)

Crie `/etc/systemd/system/nutrixo-backend.service`:

```ini
[Unit]
Description=Nutrixo Backend Python
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/nutrixo/backend-python
Environment=PYTHONUNBUFFERED=1
ExecStart=/opt/nutrixo/backend-python/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nutrixo-backend
sudo systemctl start nutrixo-backend
sudo systemctl status nutrixo-backend
```

Logs:
```bash
journalctl -u nutrixo-backend -f
```

---

## 5) Nginx + HTTPS

## 5.1 Configuração Nginx

Crie `/etc/nginx/sites-available/nutrixo-api`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative e teste:
```bash
sudo ln -s /etc/nginx/sites-available/nutrixo-api /etc/nginx/sites-enabled/nutrixo-api
sudo nginx -t
sudo systemctl reload nginx
```

## 5.2 Certificado SSL (Let’s Encrypt)

```bash
sudo certbot --nginx -d api.seudominio.com
```

Teste:
```bash
curl https://api.seudominio.com/health
```

---

## 6) Checklist final de integração

1. Backend responde:
- `GET https://api.seudominio.com/health` -> `200`

2. CORS:
- `BACKEND_PY_CORS_ORIGINS` contém seu domínio Vercel

3. Frontend aponta para backend correto:
- `VITE_IMPORT_BACKEND_URL=https://api.seudominio.com`

4. Upload real em produção:
- Exames: cria job, avança etapas, finaliza
- Medidas: idem
- Plano: idem

5. Persistência no Supabase:
- linhas inseridas/atualizadas em `nutrixo_exams`, `nutrixo_measurements`, `nutrixo_plans`

---

## 7) Troubleshooting rápido

- `Address already in use`:
```bash
lsof -i :8001
kill -9 <PID>
```

- `Import backend error` no frontend:
  - verificar URL `VITE_IMPORT_BACKEND_URL`
  - verificar logs do `journalctl -u nutrixo-backend -f`

- Erro de permissão Supabase:
  - confirmar `SUPABASE_SERVICE_ROLE_KEY` correto no `.env.backend`

- Primeiro processamento lento:
  - normal na primeira execução (download inicial de modelos Docling/OCR)

---

## 8) Segurança (obrigatório)

- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Manter `.env.backend` fora do git.
- Usar apenas HTTPS no domínio da API.
- Restringir CORS para domínios exatos (sem `*` em produção).
