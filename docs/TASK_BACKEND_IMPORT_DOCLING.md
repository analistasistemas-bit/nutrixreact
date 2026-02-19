# TASK - Migração da Importação para Backend Python (Docling)

## Fase 0 - Foundation
- [x] Criar `backend-python/`
- [x] Criar FastAPI com `/health`
- [x] Criar config/env do backend

## Fase 1 - Docling
- [x] Implementar `DoclingService` com extração para markdown
- [x] Implementar limpeza leve de markdown
- [ ] Validar com PDFs reais (digital + escaneado)

## Fase 2 - LLM extractor
- [x] Implementar `LLMService` para markdown -> JSON estruturado
- [x] Prompt rígido anti-alucinação
- [ ] Ajustar chunking por tamanho para reduzir tokens

## Fase 3 - Jobs assíncronos + status
- [x] Criar fluxo `POST /api/import/{kind}`
- [x] Criar polling `GET /api/import/{kind}/{job_id}`
- [x] Status por etapa (`extract`, `clean`, `llm`, `save`)

## Fase 4 - Integração frontend (3 menus)
- [x] Exames usando backend Python
- [x] Medidas usando backend Python
- [x] Plano usando backend Python
- [x] Exibir progresso por etapa no loading

## Fase 5 - Persistência Supabase
- [x] Upload de arquivo no storage via backend
- [x] Inserir registro `analyzing` e atualizar para `completed|failed`
- [x] Persistir `raw_markdown` + `extraction_meta` no `analysis`
- [ ] Definir política de retenção de markdown

## Fase 6 - Hardening de custo
- [ ] Chunk adaptativo e compactação de contexto
- [ ] Cache por hash de arquivo
- [ ] Retry/backoff para 429
- [ ] Métricas de custo por job
