from __future__ import annotations

from typing import Any, Dict, Optional, Literal
from pydantic import BaseModel, Field

ImportKind = Literal['exams', 'measurements', 'plans']
JobStatus = Literal['queued', 'running', 'completed', 'failed']


class JobProgress(BaseModel):
    stage: Literal['queued', 'extract', 'clean', 'llm', 'save', 'completed', 'failed'] = 'queued'
    percent: int = 0


class ImportJobResponse(BaseModel):
    job_id: str
    kind: ImportKind
    status: JobStatus


class ImportJobStatusResponse(BaseModel):
    job_id: str
    kind: ImportKind
    status: JobStatus
    progress: JobProgress
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ImportJobState(BaseModel):
    job_id: str
    kind: ImportKind
    user_email: str
    file_name: str
    mime_type: str
    temp_path: str
    status: JobStatus = 'queued'
    progress: JobProgress = Field(default_factory=JobProgress)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
