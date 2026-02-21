# API Reference — Backend Python (FastAPI)

O backend Python é responsável exclusivamente pelo processamento de PDFs via Docling + LLM. Todas as outras operações (auth, leitura/escrita de dados do usuário) são feitas diretamente pelo frontend com o SDK do Supabase.

**Base URL em desenvolvimento:** `http://localhost:8001`
**Base URL em produção:** `https://seu-vps.com` (configurado em `VITE_IMPORT_BACKEND_URL`)

---

## Endpoints

### `GET /health`

Verifica se o servidor está no ar.

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /api/import/{kind}`

Inicia o processamento assíncrono de um arquivo (PDF ou imagem).

**Path params:**
| Parâmetro | Valores aceitos | Descrição |
| :--- | :--- | :--- |
| `kind` | `exams` \| `measurements` | Tipo de importação |

**Request:** `multipart/form-data`
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `file` | `File` | ✅ | PDF ou imagem a ser processado |
| `user_email` | `string` | ✅ | E-mail do usuário (para vincular ao Supabase) |

**Response `202 Accepted`:**
```json
{
  "job_id": "uuid-do-job",
  "status": "pending",
  "message": "Processamento iniciado"
}
```

**Erros comuns:**
| Código | Causa |
| :--- | :--- |
| `400` | Arquivo inválido ou `kind` não suportado |
| `413` | Arquivo muito grande (limite: 20MB) |
| `500` | Falha no Docling ou no LLM |

---

### `GET /api/import/{kind}/{job_id}`

Consulta o status de um job de importação (polling).

**Path params:**
| Parâmetro | Descrição |
| :--- | :--- |
| `kind` | `exams` ou `measurements` |
| `job_id` | UUID retornado pelo `POST /api/import/{kind}` |

**Response — Em processamento:**
```json
{
  "job_id": "uuid-do-job",
  "status": "processing",
  "progress": 45
}
```

**Response — Concluído com sucesso:**
```json
{
  "job_id": "uuid-do-job",
  "status": "done",
  "result": {
    "id": "uuid-do-registro-no-supabase",
    "analysis": {
      "biomarkers": [
        {
          "name": "Glicose",
          "value": "95",
          "unit": "mg/dL",
          "reference": "70 - 99",
          "status": "normal"
        }
      ],
      "summary": "Exame dentro dos parâmetros normais..."
    }
  }
}
```

**Response — Erro:**
```json
{
  "job_id": "uuid-do-job",
  "status": "error",
  "error": "Falha ao processar PDF: documento corrompido"
}
```

**Status possíveis:**
| Status | Descrição |
| :--- | :--- |
| `pending` | Job na fila, aguardando processamento |
| `processing` | Docling/LLM em execução |
| `done` | Processamento concluído e salvo no Supabase |
| `error` | Falha no processamento |

---

## Fluxo de Importação (Frontend ↔ Backend)

```
1. Frontend envia POST /api/import/exams com o arquivo PDF
2. Backend retorna { job_id, status: "pending" }
3. Frontend faz polling GET /api/import/exams/{job_id} a cada 2s
4. Quando status === "done", Frontend usa o result para atualizar a UI
5. O result.id aponta para o registro salvo em nutrixo_exams no Supabase
```

Implementado em `src/services/aiService.js` — funções `importExamViaBackend()` e `importMeasurementViaBackend()`.

---

## Pipeline de Processamento Interno

```
PDF recebido
  → Docling extrai texto + estrutura (Markdown)
  → LLM (Llama 3.2 via NVIDIA API) interpreta o Markdown
  → Extração estruturada em JSON (biomarcadores, valores, unidades, referências)
  → Validação e normalização dos dados
  → Salvamento em Supabase (nutrixo_exams + nutrixo_biomarkers)
  → Status do job atualizado para "done"
```

---

## Documentação Interativa

Com o backend rodando, acesse:
- **Swagger UI:** `http://localhost:8001/docs`
- **ReDoc:** `http://localhost:8001/redoc`

---

## Limitações e Comportamentos

- **Timeout de processamento:** PDFs complexos podem levar até 60s.
- **Formatos aceitos:** PDF, JPG, PNG, JPEG.
- **Tamanho máximo:** 20MB por arquivo.
- **OCR:** Ativado por padrão (`BACKEND_DOCLING_OCR=true`). Necessário para PDFs escaneados.
- **Concorrência:** Jobs são processados em fila; múltiplos uploads simultâneos ficam em espera.
- **Persistência:** O backend salva automaticamente no Supabase. O frontend só precisa consultar o status.

---

*Atualizado em: 20 de Fevereiro de 2026*
