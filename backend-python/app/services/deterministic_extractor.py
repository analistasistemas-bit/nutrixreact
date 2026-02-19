from __future__ import annotations

import re
import unicodedata
from typing import Any, Dict, List, Optional, Tuple

from app.models import ImportKind


class DeterministicExtractor:
    _NUMBER_TOKEN = r'[-+]?(?:\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)'
    _VALUE_UNIT_RE = re.compile(
        r'([-+]?(?:\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?))\s*(kg/m2|kg/m²|kg|g/dl|mg/dl|ng/ml|ui/ml|u/l|mmol/l|%|mm|cm|m|mcg/dl|ug/dl|pg/ml|fl|g/l|kcal)?',
        re.IGNORECASE,
    )
    _MEASUREMENT_KEY_ALIASES = {
        'peso': 'weight',
        'altura': 'height',
        'imc': 'imc',
        'cintura': 'waist',
        'quadril': 'hip',
        'torax': 'chest',
        'peitoral': 'chest',
        'massa gorda': 'fatMass',
        'massagorda': 'fatMass',
        'massa magra': 'leanMass',
        'massamagra': 'leanMass',
        'razao cintura quadril': 'waistHipRatio',
        'razao cinturaquadril': 'waistHipRatio',
        'soma de dobras': 'sumSkinfolds',
        'area muscular do braco amb': 'armMuscleArea',
        'area de gordura do braco agb': 'armFatArea',
    }
    _KIND_LABELS = {
        'exams': 'Exames de sangue',
        'measurements': 'Medidas corporais',
        'plans': 'Plano alimentar',
    }

    _KIND_KEYWORDS = {
        'exams': [
            'hemograma', 'perfil bioquimico', 'valores de referencia', 'leucocitos', 'plaquetas',
            'glicose', 'colesterol', 'triglicerideos', 'creatinina', 'ureia', 'tgo', 'tgp', 'hdl', 'ldl',
            'mg/dl', '/mm3', '/mm³',
        ],
        'measurements': [
            'avaliacao antropometrica', 'antropometria', 'circunferencias', 'dobras cutaneas',
            'massa magra', 'massa gorda', 'imc', 'quadril', 'coxa', 'triceps', 'subescapular', 'suprailiaca',
            'cintura', 'peitoral', 'braco relaxado', 'panturrilha',
        ],
        'plans': [
            'plano alimentar', 'cardapio', 'refeicoes', 'cafe da manha', 'almoco', 'jantar', 'ceia', 'lanche',
            'kcal', 'calorias', 'proteinas', 'carboidratos', 'gorduras',
        ],
    }

    def extract(self, kind: ImportKind, markdown: str) -> Dict[str, Any]:
        if kind == 'exams':
            return self._extract_exams(markdown)
        if kind == 'measurements':
            return self._extract_measurements(markdown)
        return self._extract_plans(markdown)

    @classmethod
    def detect_document_kind(cls, markdown: str) -> tuple[Optional[ImportKind], Dict[str, int]]:
        normalized_text = cls._normalize_label(markdown or '')
        if not normalized_text:
            return (None, {'exams': 0, 'measurements': 0, 'plans': 0})

        scores: Dict[str, int] = {'exams': 0, 'measurements': 0, 'plans': 0}
        for kind, keywords in cls._KIND_KEYWORDS.items():
            seen = set()
            for keyword in keywords:
                token = cls._normalize_label(keyword)
                if token and token in normalized_text and token not in seen:
                    seen.add(token)
                    scores[kind] += 1

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_kind, top_score = ranked[0]
        second_score = ranked[1][1] if len(ranked) > 1 else 0

        if top_score < 2:
            return (None, scores)
        if top_score - second_score < 2:
            return (None, scores)
        return (top_kind, scores)  # type: ignore[return-value]

    @classmethod
    def validate_import_kind(cls, expected_kind: ImportKind, markdown: str) -> tuple[bool, Optional[str]]:
        detected_kind, scores = cls.detect_document_kind(markdown)
        if detected_kind is None:
            return (True, None)
        if detected_kind == expected_kind:
            return (True, None)

        expected_label = cls._KIND_LABELS.get(expected_kind, expected_kind)
        detected_label = cls._KIND_LABELS.get(detected_kind, detected_kind)
        reason = (
            f'Arquivo incompatível com este menu. Você enviou em "{expected_label}", '
            f'mas o conteúdo parece "{detected_label}". '
            f'(scores: exams={scores["exams"]}, measurements={scores["measurements"]}, plans={scores["plans"]})'
        )
        return (False, reason)

    @staticmethod
    def _normalize_label(label: str) -> str:
        cleaned = unicodedata.normalize('NFKD', (label or '')).encode('ascii', 'ignore').decode('ascii')
        cleaned = re.sub(r'[^a-zA-Z0-9\s/()-]', ' ', cleaned).lower()
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @staticmethod
    def _pt_to_float(value: str) -> Optional[float]:
        raw = (value or '').strip()
        if not raw:
            return None
        if re.search(r'\d+\s*[-–]\s*\d+', raw):
            return None
        raw = re.sub(r'\s+', '', raw)

        if ',' in raw and '.' in raw:
            # Decide separador decimal pelo último símbolo encontrado.
            if raw.rfind(',') > raw.rfind('.'):
                # Ex: 1.234,56
                raw = raw.replace('.', '').replace(',', '.')
            else:
                # Ex: 1,234.56
                raw = raw.replace(',', '')
        elif ',' in raw:
            # Ex: 97,5
            raw = raw.replace(',', '.')
        elif '.' in raw:
            # Ex: 1.234 ou 11.000 (milhar PT-BR sem casas decimais)
            if re.fullmatch(r'\d{1,3}(?:\.\d{3})+', raw):
                raw = raw.replace('.', '')
            # Ex: 107.4 (decimal EN)
            else:
                pass

        try:
            return float(raw)
        except ValueError:
            return None

    @staticmethod
    def _to_camel(label: str) -> str:
        normalized = DeterministicExtractor._normalize_label(label)
        alias_key = normalized.replace('/', ' ').strip()
        if alias_key in DeterministicExtractor._MEASUREMENT_KEY_ALIASES:
            return DeterministicExtractor._MEASUREMENT_KEY_ALIASES[alias_key]
        parts = [p for p in re.split(r'[\s/()-]+', normalized) if p]
        if not parts:
            return 'measurement'
        return parts[0] + ''.join(p.capitalize() for p in parts[1:])

    @staticmethod
    def _extract_unit_from_label(label: str) -> tuple[str, str]:
        text = (label or '').strip()
        # Remove artefatos comuns de markdown/ocr antes de detectar unidade.
        text = re.sub(r'[*_`~]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        if not text:
            return ('', '')
        m = re.search(r'[\[(]\s*(kg/m2|kg/m²|kg|cm|mm|m|%|kcal)\s*[\])]\s*$', text, flags=re.IGNORECASE)
        if not m:
            return (text, '')
        unit = m.group(1).lower().replace('kg/m²', 'kg/m2')
        clean_label = text[:m.start()].strip()
        return (clean_label, unit)

    @staticmethod
    def _beautify_measurement_label(label: str) -> str:
        normalized = DeterministicExtractor._normalize_label(label)
        fixes = {
            'massagorda': 'Massa Gorda',
            'massamagra': 'Massa Magra',
            'razao cintura quadril': 'Razão Cintura/Quadril',
            'area muscular do braco amb': 'Área Muscular do Braço (AMB)',
            'area de gordura do braco agb': 'Área de Gordura do Braço (AGB)',
            'torax': 'Tórax',
        }
        if normalized in fixes:
            return fixes[normalized]
        pretty = re.sub(r'\s+', ' ', (label or '').strip())
        return pretty[:1].upper() + pretty[1:] if pretty else label

    @classmethod
    def _parse_reference(cls, reference: str) -> Tuple[Optional[float], Optional[float]]:
        text = (reference or '').lower()
        if not text:
            return (None, None)

        m = re.search(r'([0-9][0-9.,]*)\s*(?:a|-|ate)\s*([0-9][0-9.,]*)', text)
        if m:
            min_v = cls._pt_to_float(m.group(1))
            max_v = cls._pt_to_float(m.group(2))
            if min_v is None and max_v is None:
                return (None, None)
            return (min_v, max_v)

        m = re.search(r'(?:menor que|<|<=)\s*([0-9][0-9.,]*)', text)
        if m:
            max_v = cls._pt_to_float(m.group(1))
            return (None, max_v)

        m = re.search(r'(?:maior que|>|>=)\s*([0-9][0-9.,]*)', text)
        if m:
            min_v = cls._pt_to_float(m.group(1))
            return (min_v, None)

        return (None, None)

    @staticmethod
    def _status_by_reference(value: Optional[float], reference: str) -> str:
        if value is None:
            return 'unknown'
        min_v, max_v = DeterministicExtractor._parse_reference(reference)
        if min_v is None and max_v is None:
            return 'unknown'
        if min_v is not None and value < min_v:
            return 'low'
        if max_v is not None and value > max_v:
            return 'high'
        return 'normal'

    @staticmethod
    def _split_cells(line: str) -> List[str]:
        clean = (line or '').strip()
        if not clean:
            return []
        if '|' in clean:
            return [c.strip() for c in clean.split('|') if c.strip()]
        parts = [c.strip() for c in re.split(r'\t+|\s{2,}', clean) if c.strip()]
        return parts

    @classmethod
    def _extract_label_value_pairs_from_line(cls, line: str) -> List[Tuple[str, float, str]]:
        pairs: List[Tuple[str, float, str]] = []
        text = (line or '').strip()
        if not text:
            return pairs

        # Padrão repetido em mesma linha: "Ombro 134,00 cm Peitoral 107,70 cm"
        plain_pattern = re.compile(
            rf'([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9()/\s-]{{1,80}}?)\s*[:\-]?\s*({cls._NUMBER_TOKEN})\s*(kg/m2|kg/m²|kg|cm|mm|m|%|kcal)?\b',
            re.IGNORECASE,
        )
        for m in plain_pattern.finditer(text):
            label = re.sub(r'\s+', ' ', m.group(1)).strip(' :-|')
            value = cls._pt_to_float(m.group(2))
            unit = (m.group(3) or '').lower().replace('kg/m²', 'kg/m2')
            if value is not None and label:
                pairs.append((label, value, unit))

        return pairs

    def _extract_exams(self, markdown: str) -> Dict[str, Any]:
        biomarkers: List[Dict[str, Any]] = []
        seen: set[str] = set()
        lines = (markdown or '').splitlines()

        header_tokens = {
            'exame',
            'analito',
            'resultado',
            'referencia',
            'valores de referencia',
            'metodo',
            'unidade',
        }

        for line in lines:
            cells = self._split_cells(line)
            if cells:
                name = cells[0]
                normalized_name = self._normalize_label(name)
                if not normalized_name or normalized_name in header_tokens:
                    continue
                if len(cells) < 2:
                    continue
                value_match = self._VALUE_UNIT_RE.search(cells[1])
                if not value_match:
                    continue

                value = self._pt_to_float(value_match.group(1))
                if value is None:
                    continue
                unit = (value_match.group(2) or '').strip()
                reference = cells[2] if len(cells) > 2 else ''

                if normalized_name in seen:
                    continue
                seen.add(normalized_name)
                biomarkers.append(
                    {
                        'name': name,
                        'value': value,
                        'unit': unit,
                        'reference': reference,
                        'status': self._status_by_reference(value, reference),
                    }
                )
                continue

            fallback_pairs = self._extract_label_value_pairs_from_line(line)
            for label, value, unit in fallback_pairs:
                normalized_name = self._normalize_label(label)
                if not normalized_name or normalized_name in seen:
                    continue
                if any(token in normalized_name for token in ('pagina', 'liberado em', 'responsavel', 'nota')):
                    continue
                seen.add(normalized_name)
                biomarkers.append(
                    {
                        'name': label,
                        'value': value,
                        'unit': unit,
                        'reference': '',
                        'status': 'unknown',
                    }
                )

        return {
            'biomarkers': biomarkers,
            'summary': '',
            'recommendations': [],
            'alerts': [],
        }

    def _extract_measurements(self, markdown: str) -> Dict[str, Any]:
        measurements: Dict[str, Dict[str, Any]] = {}
        measurements_raw: List[Dict[str, Any]] = []
        seen_labels: set[str] = set()

        blocklist_exact = {
            'medidas',
            'circunferencias',
            'dobras cutaneas',
            'atual',
            'recomendacao',
            'situacao',
            'descricao',
            'avaliacao antropometrica',
        }
        blocklist_contains = (
            'pagina',
            'impresso',
            'liberado em',
            'responsavel',
            'normal do dia',
            'crn',
            'nome',
            'data',
        )

        lines = (markdown or '').splitlines()
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            line_pairs: List[Tuple[str, float, str]] = []

            cells = self._split_cells(stripped)
            if len(cells) >= 2:
                i = 0
                while i < len(cells) - 1:
                    label = cells[i]
                    value_cell = cells[i + 1]
                    m = self._VALUE_UNIT_RE.search(value_cell)
                    if m:
                        value = self._pt_to_float(m.group(1))
                        unit = (m.group(2) or '').lower().replace('kg/m²', 'kg/m2')
                        if value is not None and re.search(r'[A-Za-zÀ-ÿ]', label):
                            line_pairs.append((label, value, unit))
                    i += 2

            if not line_pairs:
                line_pairs = self._extract_label_value_pairs_from_line(stripped)

            for label, value, unit in line_pairs:
                clean_label, unit_from_label = self._extract_unit_from_label(label)
                final_unit = (unit or unit_from_label or '').lower().replace('kg/m²', 'kg/m2')
                normalized_label = self._normalize_label(clean_label)
                if not normalized_label or normalized_label in blocklist_exact:
                    continue
                if any(token in normalized_label for token in blocklist_contains):
                    continue
                if re.search(r'(excelente|normal|risco baixo|risco alto|ideal)$', normalized_label):
                    continue
                if re.search(r'^\d{1,2}\s*/\s*\d{1,2}\s*/\s*\d{2,4}$', stripped):
                    continue

                key = self._to_camel(clean_label)
                if key in {'measurement', 'medidas'}:
                    continue

                # Altura em metros para cm.
                if key == 'altura' and final_unit == 'm' and value < 3:
                    value = value * 100
                    final_unit = 'cm'

                # Evita sobrescrever item mais informativo por duplicata igual.
                if key in measurements and measurements[key].get('value') not in (None, ''):
                    existing_unit = (measurements[key].get('unit') or '').lower()
                    if existing_unit and final_unit and existing_unit != final_unit:
                        # Mesmo indicador com unidades diferentes (ex: Coxa cm e Coxa mm)
                        unit_suffix = final_unit.capitalize()
                        key = f'{key}{unit_suffix}'
                        if key in measurements and measurements[key].get('value') not in (None, ''):
                            continue
                    if existing_unit and not final_unit:
                        continue

                display_label = self._beautify_measurement_label(clean_label)
                measurements[key] = {'value': value, 'unit': final_unit, 'label': display_label}
                if normalized_label not in seen_labels:
                    measurements_raw.append({'label': display_label, 'key': key, 'value': value, 'unit': final_unit})
                    seen_labels.add(normalized_label)

        # Garante IMC se existir no mapa.
        bmi_obj: Optional[Dict[str, Any]] = None
        bmi_measure = measurements.get('imc') or measurements.get('bmi')
        bmi_value = bmi_measure.get('value') if isinstance(bmi_measure, dict) else None
        if isinstance(bmi_value, (int, float)):
            if bmi_value < 18.5:
                classification = 'Baixo peso'
            elif bmi_value < 25:
                classification = 'Normal'
            elif bmi_value < 30:
                classification = 'Sobrepeso'
            else:
                classification = 'Obesidade'
            bmi_obj = {'value': bmi_value, 'classification': classification}

        return {
            'bmi': bmi_obj,
            'measurements': measurements,
            'measurements_raw': measurements_raw,
            'summary': '',
            'recommendations': [],
        }

    def _extract_plans(self, markdown: str) -> Dict[str, Any]:
        text = markdown or ''
        daily_macros: Dict[str, Any] = {}
        meals: List[Dict[str, Any]] = []

        def capture_number(pattern: str) -> Optional[float]:
            m = re.search(pattern, text, flags=re.IGNORECASE)
            if not m:
                return None
            return self._pt_to_float(m.group(1))

        calories = capture_number(r'(?:calorias?|kcal)\s*[:\-]?\s*([0-9]{2,5}(?:[.,][0-9]{1,2})?)')
        protein = capture_number(r'prote[ií]nas?\s*[:\-]?\s*([0-9]{1,4}(?:[.,][0-9]{1,2})?)')
        carbs = capture_number(r'carboidratos?\s*[:\-]?\s*([0-9]{1,4}(?:[.,][0-9]{1,2})?)')
        fats = capture_number(r'gorduras?\s*[:\-]?\s*([0-9]{1,4}(?:[.,][0-9]{1,2})?)')

        if calories is not None:
            daily_macros['calories'] = calories
        if protein is not None:
            daily_macros['protein'] = protein
        if carbs is not None:
            daily_macros['carbs'] = carbs
        if fats is not None:
            daily_macros['fats'] = fats

        meal_heads = re.compile(r'^(caf[eé]\s+da\s+manha|desjejum|almoco|almo[cç]o|lanche|jantar|ceia)\b', re.IGNORECASE)
        current_meal: Optional[Dict[str, Any]] = None
        for raw in text.splitlines():
            line = raw.strip()
            if not line:
                continue

            norm = self._normalize_label(line)
            if meal_heads.search(norm):
                if current_meal:
                    meals.append(current_meal)
                current_meal = {
                    'time': line,
                    'name': line,
                    'calories': None,
                    'protein': None,
                    'carbs': None,
                    'fats': None,
                    'ingredients': [],
                }
                continue

            if current_meal:
                if line.startswith(('-', '*', '•')):
                    current_meal['ingredients'].append(line.lstrip('-*• ').strip())
                    continue

                kcal = re.search(r'([0-9]{2,4}(?:[.,][0-9]{1,2})?)\s*kcal', line, flags=re.IGNORECASE)
                if kcal:
                    val = self._pt_to_float(kcal.group(1))
                    if val is not None:
                        current_meal['calories'] = val

                ptn = re.search(r'([0-9]{1,4}(?:[.,][0-9]{1,2})?)\s*g\s*(?:de\s*)?prote', line, flags=re.IGNORECASE)
                if ptn:
                    val = self._pt_to_float(ptn.group(1))
                    if val is not None:
                        current_meal['protein'] = val

                carb = re.search(r'([0-9]{1,4}(?:[.,][0-9]{1,2})?)\s*g\s*(?:de\s*)?carbo', line, flags=re.IGNORECASE)
                if carb:
                    val = self._pt_to_float(carb.group(1))
                    if val is not None:
                        current_meal['carbs'] = val

                fat = re.search(r'([0-9]{1,4}(?:[.,][0-9]{1,2})?)\s*g\s*(?:de\s*)?gord', line, flags=re.IGNORECASE)
                if fat:
                    val = self._pt_to_float(fat.group(1))
                    if val is not None:
                        current_meal['fats'] = val

        if current_meal:
            meals.append(current_meal)

        return {
            'dailyMacros': daily_macros,
            'meals': meals,
            'summary': '',
            'suggestions': [],
        }
