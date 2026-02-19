from __future__ import annotations

import json
import uuid
import re
import unicodedata
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

from app.config import settings
from app.models import ImportKind

TABLE_BY_KIND: dict[ImportKind, str] = {
    'exams': 'nutrixo_exams',
    'measurements': 'nutrixo_measurements',
    'plans': 'nutrixo_plans',
}

FOLDER_BY_KIND: dict[ImportKind, str] = {
    'exams': 'exams',
    'measurements': 'measurements',
    'plans': 'plans',
}


class SupabaseService:
    def __init__(self) -> None:
        self.url = settings.supabase_url.rstrip('/')
        self.service_role_key = settings.supabase_service_role_key
        self.bucket = settings.supabase_storage_bucket

    @property
    def enabled(self) -> bool:
        return bool(self.url and self.service_role_key)

    def _headers(self) -> dict[str, str]:
        return {
            'apikey': self.service_role_key,
            'Authorization': f'Bearer {self.service_role_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        }

    def _base_rest_url(self, table: str) -> str:
        return f'{self.url}/rest/v1/{table}'

    def _sanitize_storage_filename(self, file_name: str) -> str:
        raw = (file_name or 'upload.bin').strip()
        normalized = unicodedata.normalize('NFKD', raw).encode('ascii', 'ignore').decode('ascii')
        normalized = normalized.replace('/', '_').replace('\\', '_')
        normalized = re.sub(r'\s+', '-', normalized)
        normalized = re.sub(r'[^a-zA-Z0-9._-]', '', normalized)
        normalized = re.sub(r'-{2,}', '-', normalized).strip('-.')
        return normalized or 'upload.bin'

    def upload_file(self, kind: ImportKind, file_name: str, content_type: str, content: bytes) -> tuple[str | None, str | None]:
        if not self.enabled:
            return None, None

        safe_name = self._sanitize_storage_filename(file_name)
        key = f"{FOLDER_BY_KIND[kind]}/{uuid.uuid4()}-{safe_name}"
        upload_url = f'{self.url}/storage/v1/object/{self.bucket}/{key}'

        response = requests.post(
            upload_url,
            headers={
                'apikey': self.service_role_key,
                'Authorization': f'Bearer {self.service_role_key}',
                'Content-Type': content_type or 'application/octet-stream',
                'x-upsert': 'false',
            },
            data=content,
            timeout=60,
        )

        if not response.ok:
            raise RuntimeError(f'Falha upload storage ({response.status_code}): {response.text}')

        public_url = f'{self.url}/storage/v1/object/public/{self.bucket}/{key}'
        return public_url, key

    # ============================================================
    # Import jobs persistence (robust status across restarts)
    # ============================================================

    def create_import_job(self, job_id: str, kind: ImportKind, user_email: str, file_name: str) -> dict[str, Any] | None:
        if not self.enabled:
            return None

        payload = {
            'id': job_id,
            'kind': kind,
            'user_email': user_email.strip().lower(),
            'file_name': file_name,
            'status': 'queued',
            'stage': 'queued',
            'percent': 0,
        }

        response = requests.post(
            self._base_rest_url('nutrixo_import_jobs'),
            headers=self._headers(),
            data=json.dumps(payload),
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha create import job ({response.status_code}): {response.text}')

        rows = response.json()
        return rows[0] if rows else payload

    def find_active_import_job(self, kind: ImportKind, user_email: str, file_name: str, window_minutes: int = 10) -> dict[str, Any] | None:
        if not self.enabled:
            return None

        params = {
            'select': '*',
            'kind': f'eq.{kind}',
            'user_email': f'eq.{user_email.strip().lower()}',
            'file_name': f'eq.{file_name}',
            'status': 'in.(queued,running)',
            'order': 'created_at.desc',
            'limit': '1',
        }
        response = requests.get(
            self._base_rest_url('nutrixo_import_jobs'),
            headers=self._headers(),
            params=params,
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha find active import job ({response.status_code}): {response.text}')

        rows = response.json() or []
        if not rows:
            return None

        row = rows[0]
        created_at_raw = row.get('created_at')
        if not created_at_raw:
            return row

        try:
            created_at = datetime.fromisoformat(created_at_raw.replace('Z', '+00:00'))
            if datetime.now(timezone.utc) - created_at <= timedelta(minutes=window_minutes):
                return row
        except ValueError:
            return row
        return None

    def get_import_job(self, job_id: str) -> dict[str, Any] | None:
        if not self.enabled:
            return None

        params = {
            'select': '*',
            'id': f'eq.{job_id}',
            'limit': '1',
        }
        response = requests.get(
            self._base_rest_url('nutrixo_import_jobs'),
            headers=self._headers(),
            params=params,
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha get import job ({response.status_code}): {response.text}')

        rows = response.json() or []
        return rows[0] if rows else None

    def update_import_job(
        self,
        job_id: str,
        *,
        status: str,
        stage: str,
        percent: int,
        result_json: dict[str, Any] | None = None,
        error_message: str | None = None,
    ) -> None:
        if not self.enabled:
            return

        patch: dict[str, Any] = {
            'status': status,
            'stage': stage,
            'percent': int(percent),
        }
        if result_json is not None:
            patch['result_json'] = result_json
        if error_message:
            patch['error'] = error_message

        response = requests.patch(
            f"{self._base_rest_url('nutrixo_import_jobs')}?id=eq.{job_id}",
            headers=self._headers(),
            data=json.dumps(patch),
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha update import job ({response.status_code}): {response.text}')

    def cleanup_old_import_jobs(self, ttl_days: int = 30) -> None:
        if not self.enabled:
            return

        threshold = (datetime.now(timezone.utc) - timedelta(days=ttl_days)).isoformat()
        params = {
            'created_at': f'lt.{threshold}',
            'status': 'in.(completed,failed)',
        }
        response = requests.delete(
            self._base_rest_url('nutrixo_import_jobs'),
            headers=self._headers(),
            params=params,
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha cleanup import jobs ({response.status_code}): {response.text}')

    def insert_analyzing_record(
        self,
        kind: ImportKind,
        user_email: str,
        file_name: str,
        file_url: str | None,
        file_key: str | None,
    ) -> str | None:
        if not self.enabled:
            return None

        table = TABLE_BY_KIND[kind]
        payload = {
            'user_email': user_email.strip().lower(),
            'file_name': file_name,
            'file_url': file_url,
            'file_key': file_key,
            'status': 'analyzing',
        }

        response = requests.post(
            f'{self.url}/rest/v1/{table}',
            headers=self._headers(),
            data=json.dumps(payload),
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha insert analyzing ({response.status_code}): {response.text}')

        rows = response.json()
        if not rows:
            return None
        return rows[0].get('id')

    def update_record(
        self,
        kind: ImportKind,
        record_id: str,
        status: str,
        analysis: dict[str, Any] | None = None,
        error_message: str | None = None,
    ) -> None:
        if not self.enabled or not record_id:
            return

        table = TABLE_BY_KIND[kind]
        patch: dict[str, Any] = {'status': status}
        if analysis is not None:
            patch['analysis'] = analysis
        if error_message:
            patch['analysis'] = {'error': error_message}

        response = requests.patch(
            f'{self.url}/rest/v1/{table}?id=eq.{record_id}',
            headers=self._headers(),
            data=json.dumps(patch),
            timeout=30,
        )

        if not response.ok:
            raise RuntimeError(f'Falha update record ({response.status_code}): {response.text}')
