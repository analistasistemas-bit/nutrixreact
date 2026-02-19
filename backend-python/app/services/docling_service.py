from __future__ import annotations

from pathlib import Path
import re
import os

from docling.document_converter import DocumentConverter, PdfFormatOption, ImageFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    TableStructureOptions,
    TableFormerMode,
)
from app.config import settings


class DoclingService:
    def __init__(self) -> None:
        cache_dir = Path('backend-python/.cache/easyocr')
        cache_dir.mkdir(parents=True, exist_ok=True)
        os.environ.setdefault('EASYOCR_MODULE_PATH', str(cache_dir.resolve()))

        pipeline_options = PdfPipelineOptions(
            do_ocr=settings.docling_do_ocr,
            do_table_structure=True,
            table_structure_options=TableStructureOptions(
                do_cell_matching=True,
                mode=TableFormerMode.ACCURATE,
            ),
            generate_page_images=False,
            images_scale=1.0,
        )

        self.converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
                InputFormat.IMAGE: ImageFormatOption(),
            }
        )

    def extract_to_markdown(self, input_path: str | Path) -> str:
        result = self.converter.convert(str(input_path))
        markdown = result.document.export_to_markdown()
        return self.clean_markdown(markdown)

    def extract_to_dict(self, input_path: str | Path) -> dict:
        result = self.converter.convert(str(input_path))
        return result.document.export_to_dict()

    @staticmethod
    def clean_markdown(markdown: str) -> str:
        cleaned = markdown or ''
        cleaned = re.sub(r'P[aá]gina\s+\d+\s+de\s+\d+', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'Impresso em:.*?\n', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'Este documento [^\n]*confidencial[^\n]*\n', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        return cleaned.strip()
