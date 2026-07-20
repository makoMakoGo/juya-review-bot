// HTML-escaping, secret redaction, and shared formatting helpers.
const SECRET_KEY_PATTERN = /(SECRET|TOKEN|PASSWORD|PRIVATE|AUTH|KEY|WEBHOOK|LLM_PROXY|OCR_LLM)/i;

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case "'": return '&#39;';
      case '"': return '&quot;';
      default: return char;
    }
  });
}

export function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

export function safeText(value) {
  if (value == null) return '';
  return escapeHtml(value);
}

export function redactSecretValue(key, value) {
  if (isSecretKey(key)) return '••••••••';
  return redactInlineSecrets(value);
}

export function redactInlineSecrets(value) {
  if (value == null) return '';
  return String(value)
    .replace(/\b(Bearer)\s+[A-Za-z0-9._~+/=-]{8,}/gi, '$1 ••••••••')
    .replace(/\b([A-Za-z0-9_.-]*(?:SECRET|TOKEN|PASSWORD|PRIVATE[_-]?KEY|AUTHORIZATION|API[_-]?KEY)[A-Za-z0-9_.-]*)\s*[:=]\s*([^,\s<]+)/gi, '$1=••••••••');
}

export function isSecretKey(key) {
  return typeof key === 'string' && SECRET_KEY_PATTERN.test(key);
}

export function formatRepository(repository) {
  if (repository == null || repository === '') return '';
  if (typeof repository === 'string') return repository;
  if (typeof repository !== 'object' || Array.isArray(repository)) return String(repository);
  if (typeof repository.fullName === 'string' && repository.fullName !== '') return repository.fullName;
  if (typeof repository.full_name === 'string' && repository.full_name !== '') return repository.full_name;
  const owner = typeof repository.owner === 'string' ? repository.owner : '';
  const name = typeof repository.name === 'string' ? repository.name : '';
  return owner && name ? `${owner}/${name}` : '';
}

export function formatConfigValue(key, value) {
  const redacted = redactConfigValue(key, value);
  if (Array.isArray(redacted)) return redacted.map(formatScalarValue).join(', ');
  if (typeof redacted === 'boolean') return redacted ? 'enabled' : 'disabled';
  if (redacted == null) return '';
  if (typeof redacted === 'object') return JSON.stringify(redacted);
  return String(redacted);
}

export function redactConfigValue(key, value) {
  if (isSecretKey(key)) return '••••••••';
  if (value instanceof Set) return [...value].map((item) => redactConfigValue('', item));
  if (Array.isArray(value)) return value.map((item) => redactConfigValue('', item));
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      clean[nestedKey] = redactConfigValue(nestedKey, nestedValue);
    }
    return clean;
  }
  if (typeof value === 'string') return redactInlineSecrets(value);
  return value;
}

function formatScalarValue(value) {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function formatDisplayValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return redactInlineSecrets(value);
  if (typeof value === 'object') return redactInlineSecrets(JSON.stringify(redactConfigValue('', value), null, 2));
  return String(value);
}

export function safeDisplay(value) {
  return escapeHtml(redactInlineSecrets(value ?? ''));
}

export function compactJobId(id) {
  const value = String(id ?? '');
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export function compactDiagnosticId(id) {
  const value = String(id ?? '');
  if (!value) return '';
  const hash = value.lastIndexOf('#');
  if (hash >= 0) return value.slice(hash);
  const at = value.lastIndexOf('@');
  if (at >= 0) return value.slice(at);
  if (value.length <= 24) return value;
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

export function durationBetween(start, end) {
  if (!start || !end) return null;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
  return Math.max(0, endMs - startMs);
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms)) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainder}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function formatBytes(value) {
  if (!Number.isFinite(value)) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KiB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`;
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '';
}

export function formatDate(value) {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

export function numberOrDash(value) {
  return Number.isFinite(value) ? String(value) : '—';
}
