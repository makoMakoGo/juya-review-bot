import { compactDiagnosticId, compactJobId, escapeAttribute, escapeHtml, redactInlineSecrets, safeDisplay } from './helpers.js';

export function renderAlert(messageHtml, { tone = 'error', list = false } = {}) {
  const tones = {
    error: { className: 'error', labelKey: 'alert_error', labelText: 'Error', role: 'alert' },
    warning: { className: 'warning', labelKey: 'alert_warning', labelText: 'Warning', role: 'alert' },
    success: { className: 'success', labelKey: 'alert_success', labelText: 'Success', role: 'status' },
  };
  if (!Object.hasOwn(tones, tone)) {
    throw new Error(`unsupported alert tone: ${tone}`);
  }
  const meta = tones[tone];
  const body = list
    ? `<ul>${messageHtml}</ul>`
    : `<div class="alert-body">${messageHtml}</div>`;
  return `<div class="alert ${meta.className}" role="${meta.role}"><strong class="alert-label" data-i18n="${meta.labelKey}">${meta.labelText}</strong>${body}</div>`;
}

export function renderDiagnosticsList(diagnostics) {
  if (!Array.isArray(diagnostics) || diagnostics.length === 0) return '<p class="empty" data-i18n="empty_diagnostics">No diagnostics.</p>';
  const items = diagnostics.map((item) => {
    const id = item?.displayId ?? item?.id ?? '';
    const level = String(item?.level ?? 'info').toLowerCase();
    const message = item?.message ?? '';
    let levelTone = '';
    if (level === 'error') levelTone = 'pill--err';
    else if (level === 'warn') levelTone = 'pill--warn';
    return `<li><strong>${escapeHtml(redactInlineSecrets(id))}</strong> <span class="pill ${levelTone}">${escapeHtml(redactInlineSecrets(level))}</span> <span class="diag-msg">${escapeHtml(redactInlineSecrets(message))}</span></li>`;
  }).join('');
  return `<ul class="diagnostics">${items}</ul>`;
}

export function mapServiceHealth(level) {
  const normalized = String(level ?? '').toLowerCase();
  if (normalized === 'healthy') return { labelKey: 'health_healthy', label: 'Healthy', dot: 'ok' };
  if (normalized === 'degraded') return { labelKey: 'health_degraded', label: 'Degraded', dot: 'warn' };
  return { labelKey: 'health_unavailable', label: 'Unavailable', dot: 'err' };
}

function jobIdOf(job) {
  const id = job?.jobId ?? job?.id;
  return id == null || id === '' ? '' : String(id);
}

export function jobIdCodeLink(job) {
  const id = jobIdOf(job);
  if (!id) return '<code>—</code>';
  return `<a class="mono-link" href="/admin/jobs/${escapeAttribute(id)}" title="${escapeAttribute(id)}"><code>${safeDisplay(compactJobId(id))}</code></a>`;
}

export function diagnosticCode(diagnosticId) {
  const value = diagnosticId == null || diagnosticId === '' ? '' : String(diagnosticId);
  if (!value) return '<code>—</code>';
  return `<code class="subtle" title="${escapeAttribute(value)}">${safeDisplay(compactDiagnosticId(value))}</code>`;
}

export function jobIdRow(job) {
  const id = jobIdOf(job);
  if (!id) return '';
  return `<div class="kv"><span class="k" data-i18n="th_job">Job</span><span class="v">${jobIdCodeLink(job)}</span></div>`;
}

function jobStatusTone(status) {
  const s = String(status ?? '').toLowerCase();
  if (s === 'succeeded') return { tone: 'ok', dot: 'ok', labelKey: 'pill_success', label: 'success' };
  if (s === 'succeeded_with_warnings') return { tone: 'warn', dot: 'warn', labelKey: 'pill_warnings', label: 'warnings' };
  if (s === 'running') return { tone: 'run', dot: 'run', labelKey: 'pill_running', label: 'running' };
  if (s === 'failed') return { tone: 'fail', dot: 'err', labelKey: 'pill_failed', label: 'failed' };
  if (s === 'queued') return { tone: 'queued', dot: 'idle', labelKey: 'pill_queued', label: 'queued' };
  if (s === 'interrupted') return { tone: 'skip', dot: 'idle', labelKey: 'pill_interrupted', label: 'interrupted' };
  if (s === 'stale') return { tone: 'skip', dot: 'idle', labelKey: 'pill_stale', label: 'stale' };
  if (s === 'skipped') return { tone: 'skip', dot: 'idle', labelKey: 'pill_skipped', label: 'skipped' };
  return { tone: 'queued', dot: 'idle', labelKey: '', label: String(status ?? '—') };
}
export function jobStatusPill(status) {
  const { tone, dot, label, labelKey } = jobStatusTone(status);
  const text = labelKey
    ? `<span data-i18n="${labelKey}">${escapeHtml(label)}</span>`
    : escapeHtml(label);
  return `<span class="dpill ${tone}"><i class="dot ${dot}" aria-hidden="true"></i>${text}</span>`;
}
