from __future__ import annotations

import os
import time
import uuid
from pathlib import Path
from threading import Lock
from typing import Any

from app.models import ImportJobState, ImportKind
from app.services.deterministic_extractor import DeterministicExtractor
from app.services.docling_service import DoclingService
from app.services.llm_service import LLMService
from app.services.supabase_service import SupabaseService


class JobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, ImportJobState] = {}
        self._lock = Lock()
        self.docling = DoclingService()
        self.extractor = DeterministicExtractor()
        self.llm = LLMService()
        self.supabase = SupabaseService()

    def create_job(self, kind: ImportKind, user_email: str, file_name: str, mime_type: str, temp_path: str) -> ImportJobState:
        job_id = str(uuid.uuid4())
        user_email = user_email.strip().lower()

        # Idempotência básica: reutiliza job recente em andamento para mesmo usuário/arquivo/tipo.
        existing = self.find_reusable_job(kind, user_email, file_name)
        if existing:
            return existing

        state = ImportJobState(
            job_id=job_id,
            kind=kind,
            user_email=user_email,
            file_name=file_name,
            mime_type=mime_type,
            temp_path=temp_path,
        )

        # Persistência robusta: cria job no banco no momento do enqueue.
        try:
            self.supabase.create_import_job(job_id=job_id, kind=kind, user_email=user_email, file_name=file_name)
        except Exception as exc:  # noqa: BLE001
            print(f'[backend][import-jobs] create_import_job failed job={job_id}: {exc}')

        with self._lock:
            self._jobs[job_id] = state

        print(f'[backend][import-jobs] created job={job_id} kind={kind} user={user_email}')
        return state

    def get_job(self, job_id: str) -> ImportJobState | None:
        with self._lock:
            return self._jobs.get(job_id)

    def get_job_with_persistence(self, job_id: str) -> ImportJobState | None:
        local = self.get_job(job_id)
        if local:
            return local

        try:
            row = self.supabase.get_import_job(job_id)
        except Exception as exc:  # noqa: BLE001
            print(f'[backend][import-jobs] get_import_job failed job={job_id}: {exc}')
            return None
        if not row:
            return None

        progress = {
            'stage': row.get('stage', 'queued'),
            'percent': int(row.get('percent', 0) or 0),
        }
        return ImportJobState(
            job_id=row['id'],
            kind=row['kind'],
            user_email=row.get('user_email', ''),
            file_name=row.get('file_name', ''),
            mime_type='',
            temp_path='',
            status=row.get('status', 'queued'),
            progress=progress,
            result=row.get('result_json'),
            error=row.get('error'),
        )

    def find_reusable_job(self, kind: ImportKind, user_email: str, file_name: str) -> ImportJobState | None:
        # Primeiro tenta memória local (evita round-trip desnecessário)
        with self._lock:
            for state in self._jobs.values():
                if state.kind == kind and state.user_email == user_email and state.file_name == file_name and state.status in ('queued', 'running'):
                    return state

        try:
            row = self.supabase.find_active_import_job(kind=kind, user_email=user_email, file_name=file_name)
        except Exception as exc:  # noqa: BLE001
            print(f'[backend][import-jobs] find_active_import_job failed: {exc}')
            return None
        if not row:
            return None

        return ImportJobState(
            job_id=row['id'],
            kind=row['kind'],
            user_email=row.get('user_email', user_email),
            file_name=row.get('file_name', file_name),
            mime_type='',
            temp_path='',
            status=row.get('status', 'running'),
            progress={'stage': row.get('stage', 'queued'), 'percent': int(row.get('percent', 0) or 0)},
            result=row.get('result_json'),
            error=row.get('error'),
        )

    def _persist_job_stage(
        self,
        job_id: str,
        *,
        status: str,
        stage: str,
        percent: int,
        result_json: dict[str, Any] | None = None,
        error_message: str | None = None,
    ) -> None:
        try:
            self.supabase.update_import_job(
                job_id=job_id,
                status=status,
                stage=stage,
                percent=percent,
                result_json=result_json,
                error_message=error_message,
            )
        except Exception as exc:  # noqa: BLE001
            print(f'[backend][import-jobs] update_import_job failed job={job_id} stage={stage}: {exc}')

    def _update(self, job_id: str, **kwargs: Any) -> None:
        with self._lock:
            state = self._jobs[job_id]
            updated = state.model_copy(update=kwargs)
            self._jobs[job_id] = updated

    def run_job(self, job_id: str) -> None:
        state = self.get_job(job_id)
        if not state:
            return

        t0 = time.time()
        record_id: str | None = None

        try:
            # TTL cleanup best-effort (não bloqueia o fluxo)
            try:
                self.supabase.cleanup_old_import_jobs(ttl_days=30)
            except Exception as cleanup_err:  # noqa: BLE001
                print(f'[backend][import-jobs] cleanup failed: {cleanup_err}')

            print(f'[backend][import-jobs] running job={job_id} kind={state.kind} file={state.file_name}')
            self._update(job_id, status='running', progress={'stage': 'extract', 'percent': 10})
            self._persist_job_stage(job_id, status='running', stage='extract', percent=10)

            file_bytes = Path(state.temp_path).read_bytes()
            file_url, file_key = self.supabase.upload_file(
                kind=state.kind,
                file_name=state.file_name,
                content_type=state.mime_type,
                content=file_bytes,
            )
            record_id = self.supabase.insert_analyzing_record(
                kind=state.kind,
                user_email=state.user_email,
                file_name=state.file_name,
                file_url=file_url,
                file_key=file_key,
            )

            markdown = self.docling.extract_to_markdown(state.temp_path)
            self._update(job_id, progress={'stage': 'clean', 'percent': 45})
            self._persist_job_stage(job_id, status='running', stage='clean', percent=45)

            is_valid_kind, kind_error = self.extractor.validate_import_kind(state.kind, markdown)
            if not is_valid_kind:
                raise RuntimeError(kind_error or 'Arquivo incompatível com o menu selecionado.')

            # Fonte de verdade: parser determinístico no backend para os 3 tipos.
            deterministic_analysis = self.extractor.extract(state.kind, markdown)

            self._update(job_id, progress={'stage': 'llm', 'percent': 70})
            self._persist_job_stage(job_id, status='running', stage='llm', percent=70)
            llm_out = self.llm.enrich_analysis(state.kind, deterministic_analysis)
            llm_analysis = llm_out.get('analysis', {})
            analysis = deterministic_analysis
            if state.kind == 'exams':
                analysis['summary'] = llm_analysis.get('summary', analysis.get('summary', ''))
                analysis['recommendations'] = llm_analysis.get('recommendations', analysis.get('recommendations', []))
                analysis['alerts'] = llm_analysis.get('alerts', analysis.get('alerts', []))
            elif state.kind == 'measurements':
                analysis['summary'] = llm_analysis.get('summary', analysis.get('summary', ''))
                analysis['recommendations'] = llm_analysis.get('recommendations', analysis.get('recommendations', []))
            else:
                analysis['summary'] = llm_analysis.get('summary', analysis.get('summary', ''))
                analysis['suggestions'] = llm_analysis.get('suggestions', analysis.get('suggestions', []))

            item_count = 0
            if state.kind == 'exams':
                item_count = len(analysis.get('biomarkers', []))
            elif state.kind == 'measurements':
                item_count = len(analysis.get('measurements', {}))
            elif state.kind == 'plans':
                item_count = len(analysis.get('meals', []))

            extraction_meta = {
                'llm_model': llm_out.get('llm_meta', {}).get('llm_model'),
                'usage': llm_out.get('llm_meta', {}).get('usage', {}),
                'llm_fallback_reason': llm_out.get('llm_meta', {}).get('fallback_reason'),
                'timings_ms': {
                    **llm_out.get('llm_meta', {}).get('timings_ms', {}),
                    'total': int((time.time() - t0) * 1000),
                },
                'extractor': 'docling-deterministic',
                'deterministic_items_count': item_count,
            }

            if isinstance(analysis, dict):
                analysis['raw_markdown'] = markdown
                analysis['extraction_meta'] = extraction_meta

            self._update(job_id, progress={'stage': 'save', 'percent': 90})
            self._persist_job_stage(job_id, status='running', stage='save', percent=90)
            self.supabase.update_record(state.kind, record_id or '', status='completed', analysis=analysis)

            self._update(
                job_id,
                status='completed',
                progress={'stage': 'completed', 'percent': 100},
                result={'id': record_id, 'analysis': analysis},
            )
            self._persist_job_stage(
                job_id,
                status='completed',
                stage='completed',
                percent=100,
                result_json={'id': record_id, 'analysis': analysis},
            )
            print(f'[backend][import-jobs] completed job={job_id} duration_ms={int((time.time() - t0) * 1000)}')
        except Exception as exc:  # noqa: BLE001
            err = str(exc)
            lowered = err.lower()
            if 'cannot find the appropriate snapshot folder' in lowered or 'urlopen error' in lowered:
                err = (
                    'Falha ao baixar modelos locais do Docling/OCR (primeira execução). '
                    'Verifique conexão de internet do backend e execute novamente.'
                )
            self.supabase.update_record(state.kind, record_id or '', status='failed', error_message=err)
            self._update(
                job_id,
                status='failed',
                progress={'stage': 'failed', 'percent': 100},
                error=err,
            )
            self._persist_job_stage(job_id, status='failed', stage='failed', percent=100, error_message=err)
            print(f'[backend][import-jobs] failed job={job_id} error={err}')
        finally:
            try:
                if state.temp_path:
                    os.remove(state.temp_path)
            except OSError:
                pass
