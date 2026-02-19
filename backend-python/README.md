# backend-python

Serviço de importação assíncrona (Docling + Markdown + LLM) para Exames, Medidas e Plano.

## Setup

```bash
cd backend-python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.backend.example .env.backend
```

## Run

```bash
# Recomendado para fluxo estável (evita reinícios por alterações em .venv)
uvicorn app.main:app --port 8001

# Se quiser reload, exclua explicitamente o .venv do watch
uvicorn app.main:app --reload --reload-exclude '.venv/*' --reload-exclude 'backend-python/.venv/*' --port 8001
```

## Endpoints

- `GET /health`
- `POST /api/import/{kind}` (`kind`: `exams|measurements|plans`)
- `GET /api/import/{kind}/{job_id}`

## Observações

- O backend processa PDF/JPG/PNG.
- O frontend deve enviar `multipart/form-data` com `file` e `user_email`.
- Se `SUPABASE_SERVICE_ROLE_KEY` não estiver configurada, o backend ainda processa e devolve resultado no polling, mas não persiste no Supabase.
- Na primeira execução, o Docling/OCR pode baixar modelos locais (Hugging Face/EasyOCR). Esse passo exige internet no backend.
- Para resiliência de status após restart, execute o SQL de criação da tabela `nutrixo_import_jobs` em `docs/sql/2026-02-18_nutrixo_import_jobs.sql`.
