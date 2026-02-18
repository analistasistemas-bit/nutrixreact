export function parsePtBrNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const clean = String(value).replace(/[^\d.,-]/g, '').trim();
    if (!clean) return null;

    const hasComma = clean.includes(',');
    const hasDot = clean.includes('.');

    if (hasComma && hasDot) {
        const lastComma = clean.lastIndexOf(',');
        const lastDot = clean.lastIndexOf('.');
        if (lastComma > lastDot) {
            return Number.parseFloat(clean.replace(/\./g, '').replace(',', '.'));
        }
        return Number.parseFloat(clean.replace(/,/g, ''));
    }

    if (hasComma) {
        const commaCount = (clean.match(/,/g) || []).length;
        if (commaCount > 1) return Number.parseFloat(clean.replace(/,/g, ''));

        const [intPart, decPart = ''] = clean.split(',');
        if (decPart.length === 3 && intPart.length <= 3) {
            return Number.parseFloat(clean.replace(/,/g, ''));
        }
        return Number.parseFloat(clean.replace(',', '.'));
    }

    if (hasDot) {
        const dotCount = (clean.match(/\./g) || []).length;
        if (dotCount > 1) return Number.parseFloat(clean.replace(/\./g, ''));

        const [intPart, decPart = ''] = clean.split('.');
        if (decPart.length === 3 && intPart.length <= 3) {
            return Number.parseFloat(clean.replace(/\./g, ''));
        }
        return Number.parseFloat(clean);
    }

    return Number.parseFloat(clean);
}

export function formatPtBrNumber(value, options = { maximumFractionDigits: 2 }) {
    const num = parsePtBrNumber(value);
    if (num === null || Number.isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', options).format(num);
}

export function parsePtBrReferenceRange(referenceText) {
    if (!referenceText) return null;

    const text = String(referenceText).trim();
    const parts = text.split(/[-–—]| a /i);

    if (parts.length >= 2) {
        const min = parsePtBrNumber(parts[0]);
        const max = parsePtBrNumber(parts[1]);
        if (min === null && max === null) return null;
        if (min === null) return [null, max];
        if (max === null) return [min, null];
        return [Math.min(min, max), Math.max(min, max)];
    }

    const lower = text.toLowerCase();
    if (lower.includes('até') || text.includes('<')) {
        const valPart = lower.split('até')[1] || text.split('<')[1];
        const max = parsePtBrNumber(valPart);
        return max === null ? null : [null, max];
    }
    if (lower.includes('acima de') || text.includes('>')) {
        const valPart = lower.split('acima de')[1] || text.split('>')[1];
        const min = parsePtBrNumber(valPart);
        return min === null ? null : [min, null];
    }

    return null;
}
