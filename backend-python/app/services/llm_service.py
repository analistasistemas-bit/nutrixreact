from __future__ import annotations

import json
import re
import time
from typing import Any

import requests

from app.config import settings
from app.models import ImportKind


class LLMService:
    def __init__(self) -> None:
        self.api_url = settings.nvidia_api_url
        self.api_key = settings.nvidia_api_key
        self.model = settings.import_llm_model

    def enrich_analysis(self, kind: ImportKind, extracted: dict[str, Any]) -> dict[str, Any]:
        if not self.api_key:
            return {
                'analysis': self._fallback_analysis(kind),
                'llm_meta': {
                    'llm_model': self.model,
                    'timings_ms': {'llm': 0},
                    'usage': {},
                    'fallback_reason': 'missing_api_key',
                },
            }

        prompt = self._build_prompt(kind, extracted)
        started = time.time()
        try:
            response = requests.post(
                self.api_url,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.api_key}',
                },
                json={
                    'model': self.model,
                    'messages': [
                        {
                            'role': 'system',
                            'content': (
                                'Você é um assistente de saúde educacional. '
                                'NÃO extraia novos dados. Use apenas o JSON já extraído pelo backend.'
                            ),
                        },
                        {'role': 'user', 'content': prompt},
                    ],
                    'temperature': 0.1,
                    'top_p': 0.7,
                    'max_tokens': 700,
                    'stream': False,
                },
                timeout=90,
            )

            if not response.ok:
                raise RuntimeError(f'NVIDIA API error ({response.status_code}): {response.text}')

            payload = response.json()
            text = payload.get('choices', [{}])[0].get('message', {}).get('content', '')
            parsed = self._parse_json(text)
            parsed = self._postprocess_analysis(kind, parsed, extracted)
            elapsed_ms = int((time.time() - started) * 1000)

            return {
                'analysis': parsed,
                'llm_meta': {
                    'llm_model': self.model,
                    'timings_ms': {'llm': elapsed_ms},
                    'usage': payload.get('usage', {}),
                },
            }
        except Exception as exc:  # noqa: BLE001
            elapsed_ms = int((time.time() - started) * 1000)
            return {
                'analysis': self._fallback_analysis(kind),
                'llm_meta': {
                    'llm_model': self.model,
                    'timings_ms': {'llm': elapsed_ms},
                    'usage': {},
                    'fallback_reason': str(exc),
                },
            }

    def _build_prompt(self, kind: ImportKind, extracted: dict[str, Any]) -> str:
        extracted_json = json.dumps(extracted, ensure_ascii=False)

        if kind == 'exams':
            schema = '''{
  "summary": "Resumo curto",
  "recommendations": ["item"],
  "alerts": ["item"]
}'''
            abnormalities = []
            for b in (extracted.get('biomarkers') or []):
                status = str(b.get('status') or '').lower()
                if status in ('high', 'low'):
                    abnormalities.append({
                        'name': b.get('name'),
                        'value': b.get('value'),
                        'unit': b.get('unit'),
                        'reference': b.get('reference'),
                        'status': status,
                    })
            abnormalities_json = json.dumps(abnormalities[:12], ensure_ascii=False)
        elif kind == 'measurements':
            schema = '''{
  "summary": "Resumo curto",
  "recommendations": ["item"]
}'''
        else:
            schema = '''{
  "summary": "Resumo curto",
  "suggestions": ["item"]
}'''

        preamble = (
            'Você receberá um JSON já extraído de um documento por parser determinístico.\n'
            'Tarefa: devolver APENAS um JSON de enriquecimento textual, sem alterar números, unidades ou chaves.\n'
            'Não invente indicadores. Não adicione dados que não estejam no JSON base.\n'
            'Estilo obrigatório: consultoria prática, clara e acionável.\n'
            'Não use recomendações tautológicas/genéricas como "analisar X para entender X".\n'
            'Cada recomendação deve começar com verbo de ação e dizer o que fazer agora.\n'
            'Priorize segurança clínica e orientação de procura médica quando necessário.\n'
            'Retorne somente JSON válido no schema abaixo.\n\n'
        )
        abnormal_block = (
            f'INDICADORES FORA DA FAIXA (priorizar):\n{abnormalities_json}\n\n'
            if kind == 'exams'
            else ''
        )
        return f'{preamble}{abnormal_block}SCHEMA:\n{schema}\n\nJSON_BASE:\n{extracted_json}'

    @staticmethod
    def _parse_json(text: str) -> dict[str, Any]:
        raw = (text or '').strip()
        if not raw:
            raise RuntimeError('Resposta vazia do modelo.')

        cleaned = raw.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r'\{[\s\S]*\}', cleaned)
            if not match:
                raise RuntimeError(f'Nao foi possivel parsear JSON: {raw[:400]}')
            return json.loads(match.group(0))

    @staticmethod
    def _fallback_analysis(kind: ImportKind) -> dict[str, Any]:
        if kind == 'exams':
            return {
                'summary': 'Resultados extraídos com sucesso. A interpretação detalhada não foi gerada nesta tentativa.',
                'recommendations': [],
                'alerts': [],
            }
        if kind == 'measurements':
            return {
                'summary': 'Medidas extraídas com sucesso. A interpretação detalhada não foi gerada nesta tentativa.',
                'recommendations': [],
            }
        return {
            'summary': 'Plano extraído com sucesso. A interpretação detalhada não foi gerada nesta tentativa.',
            'suggestions': [],
        }

    def _postprocess_analysis(self, kind: ImportKind, parsed: dict[str, Any], extracted: dict[str, Any]) -> dict[str, Any]:
        analysis = parsed if isinstance(parsed, dict) else {}

        def clean_items(items: Any) -> list[str]:
            if not isinstance(items, list):
                return []
            cleaned = []
            seen = set()
            for item in items:
                txt = str(item or '').strip()
                if not txt:
                    continue
                key = txt.lower()
                if key in seen:
                    continue
                seen.add(key)
                cleaned.append(txt)
            return cleaned

        bad_patterns = [
            re.compile(r'analise (?:do|da|de) .+ para determinar a causa', re.IGNORECASE),
            re.compile(r'determinar a causa da (?:alta|baixa)', re.IGNORECASE),
            re.compile(r'investigar .+ para investigar', re.IGNORECASE),
        ]

        def filter_generic(items: list[str]) -> list[str]:
            output = []
            for txt in items:
                if any(p.search(txt) for p in bad_patterns):
                    continue
                output.append(txt)
            return output

        if kind == 'exams':
            recs = filter_generic(clean_items(analysis.get('recommendations')))
            alerts = clean_items(analysis.get('alerts'))
            if not recs:
                recs = self._build_exam_recommendation_fallback(extracted)
            analysis['recommendations'] = recs[:6]
            analysis['alerts'] = alerts[:4]
            if not analysis.get('summary'):
                analysis['summary'] = 'Resumo clínico gerado a partir dos resultados atuais e suas faixas de referência.'
        elif kind == 'measurements':
            recs = filter_generic(clean_items(analysis.get('recommendations')))
            analysis['recommendations'] = recs[:5]
            if not analysis.get('summary'):
                analysis['summary'] = 'Análise das medidas com foco em tendência corporal e próximas ações.'
        else:
            sugs = filter_generic(clean_items(analysis.get('suggestions')))
            analysis['suggestions'] = sugs[:5]
            if not analysis.get('summary'):
                analysis['summary'] = 'Resumo do plano com foco em aderência e execução prática.'

        return analysis

    @staticmethod
    def _build_exam_recommendation_fallback(extracted: dict[str, Any]) -> list[str]:
        biomarkers = extracted.get('biomarkers') or []
        abnormal = [b for b in biomarkers if str(b.get('status') or '').lower() in ('high', 'low')]

        if not abnormal:
            return [
                'Manter rotina atual de alimentação e atividade física e repetir exames no intervalo recomendado pelo seu médico.',
            ]

        names = [str(b.get('name') or '').strip() for b in abnormal[:3] if b.get('name')]
        joined = ', '.join(names)
        return [
            f'Agendar consulta clínica para revisar os marcadores alterados ({joined}) e correlacionar com sintomas e medicações em uso.',
            'Repetir os exames alterados em curto prazo para confirmar se a alteração é persistente e não variação pontual.',
            'Revisar hidratação, padrão alimentar e uso de medicamentos/suplementos que possam impactar esses resultados antes da próxima coleta.',
        ]
