from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import ImportJobResponse, ImportJobStatusResponse, ImportKind
from app.services.jobs import JobManager


ALLOWED_TYPES = {'application/pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024

TEMP_DIR = Path('backend-python/temp')
TEMP_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title='Nutrixo Import Backend', version='1.0.0')
job_manager = JobManager()

origins = [o.strip() for o in settings.cors_origins.split(',') if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/import/{kind}', response_model=ImportJobResponse)
async def create_import_job(
    kind: ImportKind,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_email: str = Form(...),
) -> ImportJobResponse:
    # Reuso de job ativo para evitar duplicidade por clique/refresh rápido.
    reusable = job_manager.find_reusable_job(kind=kind, user_email=user_email, file_name=file.filename or 'upload')
    if reusable:
        return ImportJobResponse(job_id=reusable.job_id, kind=kind, status=reusable.status)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail='Formato não suportado. Use apenas PDF.')

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail='Arquivo acima de 10MB.')

    ext = os.path.splitext(file.filename or '')[-1] or '.bin'
    temp_path = TEMP_DIR / f'{uuid.uuid4()}{ext}'
    temp_path.write_bytes(content)

    state = job_manager.create_job(
        kind=kind,
        user_email=user_email,
        file_name=file.filename or 'upload',
        mime_type=file.content_type or 'application/octet-stream',
        temp_path=str(temp_path),
    )

    background_tasks.add_task(job_manager.run_job, state.job_id)
    return ImportJobResponse(job_id=state.job_id, kind=kind, status='queued')


@app.get('/api/import/{kind}/{job_id}', response_model=ImportJobStatusResponse)
def get_import_job(kind: ImportKind, job_id: str):
    state = job_manager.get_job_with_persistence(job_id)
    if not state or state.kind != kind:
        raise HTTPException(status_code=404, detail='Job não encontrado.')

    payload = ImportJobStatusResponse(
        job_id=state.job_id,
        kind=state.kind,
        status=state.status,
        progress=state.progress,
        result=state.result,
        error=state.error,
    )
    response = JSONResponse(
        content=payload.model_dump(),
        headers={
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    )
    return response
