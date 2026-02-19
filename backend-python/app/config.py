from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / '.env', override=False)
load_dotenv(ROOT_DIR / 'backend-python' / '.env.backend', override=False)


@dataclass
class Settings:
    host: str = os.getenv('BACKEND_PY_HOST', '0.0.0.0')
    port: int = int(os.getenv('BACKEND_PY_PORT', '8001'))
    cors_origins: str = os.getenv('BACKEND_PY_CORS_ORIGINS', 'http://localhost:5173,http://localhost:4173')

    nvidia_api_key: str = os.getenv('VITE_NVIDIA_API_KEY', os.getenv('NVIDIA_API_KEY', ''))
    import_llm_model: str = os.getenv('BACKEND_IMPORT_LLM_MODEL', 'meta/llama-3.2-11b-vision-instruct')
    nvidia_api_url: str = os.getenv('BACKEND_NVIDIA_API_URL', 'https://integrate.api.nvidia.com/v1/chat/completions')
    docling_do_ocr: bool = os.getenv('BACKEND_DOCLING_OCR', 'true').lower() == 'true'

    supabase_url: str = os.getenv('VITE_SUPABASE_URL', os.getenv('SUPABASE_URL', ''))
    supabase_service_role_key: str = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    supabase_storage_bucket: str = os.getenv('SUPABASE_STORAGE_BUCKET', 'uploads')


settings = Settings()
