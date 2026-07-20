import { escapeHtml, formatBytes, formatDate, formatDuration, formatRepository, numberOrDash, safeDisplay } from './helpers.js';
import { diagnosticCode, jobIdCodeLink, jobIdRow, jobStatusPill, mapServiceHealth, renderDiagnosticsList } from './partials.js';
import { renderLayout } from './layout.js';

// Terminal / CLI look for the status dashboard. Everything is scoped under
// .dashboard so baseStyles stays untouched; only the shared custom
// properties (--canvas-*, --fg-*, --border-*, semantic *-fg) are referenced.
// Pill/badge fills need per-theme subtle backgrounds, which are defined as
// page-scoped variables in both themes below.
const pageStyles = `
:root {
  --dashboard-success-subtle: rgba(74, 222, 128, 0.12);
  --dashboard-success-border: rgba(74, 222, 128, 0.35);
  --dashboard-accent-subtle: rgba(74, 222, 128, 0.10);
  --dashboard-accent-border: rgba(74, 222, 128, 0.35);
  --dashboard-attention-subtle: rgba(251, 191, 36, 0.12);
  --dashboard-attention-border: rgba(251, 191, 36, 0.35);
  --dashboard-danger-subtle: rgba(248, 113, 113, 0.10);
  --dashboard-danger-border: rgba(248, 113, 113, 0.35);
  --dashboard-neutral-subtle: rgba(124, 154, 128, 0.14);
}
:root[data-theme="light"] {
  --dashboard-success-subtle: rgba(21, 128, 61, 0.12);
  --dashboard-success-border: rgba(21, 128, 61, 0.40);
  --dashboard-accent-subtle: rgba(21, 128, 61, 0.10);
  --dashboard-accent-border: rgba(21, 128, 61, 0.40);
  --dashboard-attention-subtle: rgba(180, 83, 9, 0.10);
  --dashboard-attention-border: rgba(180, 83, 9, 0.40);
  --dashboard-danger-subtle: rgba(185, 28, 28, 0.08);
  --dashboard-danger-border: rgba(185, 28, 28, 0.40);
  --dashboard-neutral-subtle: rgba(90, 107, 90, 0.12);
}

.dashboard .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin: 0 0 24px; }
.dashboard .page-desc { margin: 0; font-size: 14px; line-height: 1.5; max-width: 62ch; }
.dashboard .page-header-link { flex: none; margin-top: 2px; font-size: 14px; color: var(--accent-fg); text-decoration: none; white-space: nowrap; }
.dashboard .page-header-link:hover { text-decoration: underline; }

.dashboard .sect { margin-top: 32px; }
.dashboard .sect:first-child { margin-top: 0; }

/* status summary tiles — quiet bordered cards, dot + muted key, strong value */
.dashboard .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.dashboard .st { display: flex; flex-direction: column; gap: 6px; padding: 16px; border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default); }
.dashboard .st .k { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-muted); }
.dashboard .st .v { font-size: 20px; font-weight: 600; line-height: 1.25; color: var(--fg-default); }
.dashboard .st .v .dpill { font-size: 12px; font-weight: 500; }

/* status dot — square console markers */
.dashboard .dot { width: 8px; height: 8px; border-radius: 0; flex: none; display: inline-block; }
.dashboard .dot.ok { background: var(--success-fg); }
.dashboard .dot.run { background: var(--accent-fg); }
.dashboard .dot.warn { background: var(--attention-fg); }
.dashboard .dot.err { background: var(--danger-fg); }
.dashboard .dot.idle { background: var(--fg-muted); }

/* status pills — bracketed console status: [ success ] / [ failed ] */
.dashboard .dpill { display: inline-flex; align-items: center; gap: 0; font-size: 12px; font-weight: 500; line-height: 18px; padding: 0 2px; border-radius: 0; border: 0; white-space: nowrap; }
.dashboard .dpill::before { content: "["; opacity: 0.55; }
.dashboard .dpill::after { content: "]"; opacity: 0.55; }
.dashboard .dpill .dot { display: none; }
.dashboard .dpill.ok { background: transparent; color: var(--success-fg); border-color: var(--dashboard-success-border); }
.dashboard .dpill.run { background: transparent; color: var(--accent-fg); border-color: var(--dashboard-accent-border); }
.dashboard .dpill.queued { background: transparent; color: var(--fg-muted); border-color: var(--border-default); }
.dashboard .dpill.warn { background: transparent; color: var(--attention-fg); border-color: var(--dashboard-attention-border); }
.dashboard .dpill.fail { background: transparent; color: var(--danger-fg); border-color: var(--dashboard-danger-border); }
.dashboard .dpill.skip { background: transparent; color: var(--fg-muted); border-color: var(--border-default); }

/* description-list groups — repo 'About' box: muted key left, value right, hairline rows */
.dashboard .status-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
.dashboard .status-group { border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default); overflow: hidden; }
.dashboard .status-group-label { padding: 8px 16px; border-bottom: 1px solid var(--border-muted); background: var(--canvas-subtle); font-size: 13px; font-weight: 600; color: var(--fg-default); }
.dashboard .kv { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; border-bottom: 1px solid var(--border-muted); font-size: 14px; }
.dashboard .kv:last-child { border-bottom: 0; }
.dashboard .kv .k { flex: none; color: var(--fg-muted); }
.dashboard .kv .v { min-width: 0; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--fg-default); }
.dashboard .status-group .kv { padding: 8px 16px; }
.dashboard .kv-list .kv { padding: 8px 0; }

/* activity cards built on the shared .card component */
.dashboard .box-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
.dashboard .box-grid .card, .dashboard .sect > .card { margin: 0; }
.dashboard .card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dashboard .card-header strong { font-size: 14px; font-weight: 600; }

/* queued list rows */
.dashboard .qlist { display: flex; flex-direction: column; }
.dashboard .qrow { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-muted); font-size: 14px; }
.dashboard .qrow:last-child { border-bottom: 0; }
.dashboard .qrow .repo { font-weight: 500; }
.dashboard .mono-link { color: var(--accent-fg); text-decoration: none; }
.dashboard .mono-link:hover { text-decoration: underline; }
.dashboard .subtle { color: var(--fg-muted); }
.dashboard code { font-family: var(--font-mono); font-size: 12px; }

/* diagnostics list + level pills */
.dashboard .diagnostics { list-style: none; margin: 0; padding: 0; font-size: 14px; }
.dashboard .diagnostics li { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; padding: 8px 0; border-bottom: 1px solid var(--border-muted); }
.dashboard .diagnostics li:last-child { border-bottom: 0; }
.dashboard .diagnostics .diag-msg { color: var(--fg-muted); }
.dashboard .pill { display: inline-block; font-size: 12px; font-weight: 500; line-height: 18px; padding: 0 2px; border-radius: 0; border: 0; color: var(--fg-muted); background: transparent; }
.dashboard .pill::before { content: "["; opacity: 0.55; }
.dashboard .pill::after { content: "]"; opacity: 0.55; }
.dashboard .pill.pill--err { background: transparent; color: var(--danger-fg); border-color: transparent; }
.dashboard .pill.pill--warn { background: transparent; color: var(--attention-fg); border-color: transparent; }

/* empty states sit inside the shared .blankslate */
.dashboard .blankslate .empty { margin: 0; color: var(--fg-muted); }
`;

export function renderDashboardPage({ csrfToken, summary = {}, diagnostics = [], serviceStatus = null, retention = null, cspNonce = '' } = {}) {
  const dash = (n) => escapeHtml(numberOrDash(n));
  const svc = serviceStatus && typeof serviceStatus === 'object' ? serviceStatus : null;
  const storage = svc?.storage && typeof svc.storage === 'object' ? svc.storage : {};
  const health = mapServiceHealth(svc?.health);

  const word = (key, fallback) => `<span data-i18n="${key}">${escapeHtml(fallback)}</span>`;
  const healthPillTone = { ok: 'ok', warn: 'warn', err: 'fail' }[health.dot] ?? 'queued';
  const tiles = [
    {
      k: 'Health',
      kKey: 'tile_health',
      vHtml: `<span class="dpill ${healthPillTone}"><i class="dot ${health.dot}" aria-hidden="true"></i>${word(health.labelKey, health.label)}</span>`,
    },
    {
      dot: Number(summary.running) > 0 ? 'run' : 'idle',
      k: 'Queue depth',
      kKey: 'tile_queue',
      vHtml: `${dash(summary.queued)} ${word('pill_queued', 'queued')} · ${dash(summary.running)} ${word('pill_running', 'running')}`,
    },
    {
      dot: Number(summary.failed) > 0 ? 'err' : 'ok',
      k: 'Reviewed',
      kKey: 'tile_reviewed',
      vHtml: `${dash(summary.succeeded)} ${word('word_ok', 'ok')} · ${dash(summary.failed)} ${word('pill_failed', 'failed')}`,
    },
    { dot: Number(summary.succeeded_with_warnings) > 0 ? 'warn' : 'idle', k: 'Warnings', kKey: 'tile_warnings', vHtml: dash(summary.succeeded_with_warnings) },
  ].map((t) => `<div class="st"><span class="k">${t.dot ? `<i class="dot ${t.dot}" aria-hidden="true"></i>` : ''}<span data-i18n="${t.kKey}">${escapeHtml(t.k)}</span></span><span class="v">${t.vHtml}</span></div>`).join('');

  const actualPort = svc?.actualListeningPort ?? svc?.listeningPort;
  const configuredPort = svc?.configuredPort ?? svc?.port;
  const pendingPort = svc?.desiredPendingPort ?? svc?.pendingPort;
  const portValue = (() => {
    const p = actualPort == null || actualPort === '' ? null : String(actualPort);
    if (p == null) return { value: '—', raw: false };
    if (pendingPort != null && pendingPort !== '') {
      return { value: `${escapeHtml(p)} → ${safeDisplay(pendingPort)}`, raw: true };
    }
    if (configuredPort != null && String(configuredPort) !== p) {
      return { value: `${escapeHtml(p)} (${word('word_configured', 'configured')} ${safeDisplay(configuredPort)})`, raw: true };
    }
    return { value: p, raw: false };
  })();
  const writableHtml = storage.writable === false
    ? word('storage_not_writable', 'not writable')
    : storage.writable === true
      ? word('storage_writable', 'writable')
      : word('storage_unknown', 'unknown');
  const storageHealthHtml = storage.degraded === true
    ? word('storage_degraded', 'degraded')
    : storage.degraded === false
      ? word('storage_healthy', 'healthy')
      : word('storage_unknown', 'unknown');
  const statusDiagnostics = svc?.diagnostics && typeof svc.diagnostics === 'object' ? svc.diagnostics : {};
  const statusGroups = [
    { label: 'Runtime', key: 'ssg_runtime', rows: [
      ['Uptime', formatDuration(svc?.uptimeMs), 'ss_uptime'],
      ['Started', formatDate(svc?.startedAt), 'ss_started'],
      ['Version', svc?.version, 'ss_version'],
      ['Config revision', svc?.configRevision, 'ss_config_revision'],
      ['Port', portValue.value, 'ss_port', portValue.raw],
    ] },
    { label: 'Storage', key: 'ssg_storage', rows: [
      ['State', `${writableHtml} / ${storageHealthHtml}`, 'ss_storage_health', true],
      ['Usage', `${formatBytes(storage.sizeBytes ?? storage.dirSizeBytes)} / ${formatBytes(storage.budgetBytes)}`, 'ss_storage_size'],
      ['Last retention', formatDate(svc?.lastRetention?.finishedAt ?? svc?.lastRetention?.startedAt ?? retention?.lastRun?.finishedAt), 'ss_last_retention'],
    ] },
    { label: 'Diagnostics', key: 'ssg_diagnostics', rows: [
      ['Corrupt', safeDisplay(statusDiagnostics.corruptEvents ?? 0), 'diag_corrupt'],
      ['Invalid', safeDisplay(statusDiagnostics.invalidEvents ?? 0), 'diag_invalid'],
      ['Truncated', word(statusDiagnostics.truncatedTail ? 'word_yes' : 'word_no', statusDiagnostics.truncatedTail ? 'yes' : 'no'), 'diag_truncated', true],
      ['Runtime warnings', safeDisplay(statusDiagnostics.runtimeWarnings ?? 0), 'diag_runtime_warnings'],
    ] },
  ];
  const statusDetails = statusGroups.map((g) => {
    const rows = g.rows.map(([label, value, key, raw = false]) => `<div class="kv"><span class="k" data-i18n="${key}">${escapeHtml(label)}</span><span class="v">${raw ? value : safeDisplay(value)}</span></div>`).join('');
    return `<div class="status-group"><div class="status-group-label" data-i18n="${g.key}">${escapeHtml(g.label)}</div>${rows}</div>`;
  }).join('');

  const running = svc?.runningJob || svc?.running || null;
  const runningBody = running
    ? `<div class="kv-list">
<div class="kv"><span class="k" data-i18n="th_repository">Repository</span><span class="v">${escapeHtml(formatRepository(running.repo ?? running.repository))}</span></div>
<div class="kv"><span class="k" data-i18n="th_pr">Pull request</span><span class="v">#${escapeHtml(String(running.pullNumber ?? running.pullRequest ?? '—'))}</span></div>
<div class="kv"><span class="k" data-i18n="th_actor">Actor</span><span class="v">${escapeHtml(running.actor ?? '—')}</span></div>
<div class="kv"><span class="k" data-i18n="th_status">Status</span><span class="v">${jobStatusPill('running')}</span></div>
<div class="kv"><span class="k" data-i18n="th_phase">Phase</span><span class="v"><code>${safeDisplay(running.phase ?? '—')}</code></span></div>
${jobIdRow(running)}
</div>`
    : `<div class="blankslate"><p class="empty" data-i18n="empty_running">No running job.</p></div>`;

  const qitems = svc?.queued?.items ?? [];
  const queuedBody = qitems.length
    ? `<div class="qlist">${qitems.map((it) => `<div class="qrow">${jobStatusPill('queued')}<span class="repo">${escapeHtml(formatRepository(it.repository ?? it.repo))}</span>${jobIdCodeLink(it)}</div>`).join('')}</div>`
    : `<div class="blankslate"><p class="empty">${dash(svc?.queued?.count ?? summary.queued)} ${word('pill_queued', 'queued')}.</p></div>`;

  const activityBox = (titleKey, title, body) => `<div class="card">
  <div class="card-header"><strong data-i18n="${titleKey}">${escapeHtml(title)}</strong></div>
  <div class="card-body">${body}</div>
</div>`;

  const sfBox = (job, titleKey, title) => job
    ? `<div class="card">
  <div class="card-header">
    <strong data-i18n="${titleKey}">${escapeHtml(title)}</strong>
    ${jobStatusPill(job.status)}
  </div>
  <div class="card-body">
    <div class="kv-list">
      <div class="kv"><span class="k" data-i18n="th_repository">Repository</span><span class="v">${escapeHtml(formatRepository(job.repo ?? job.repository))}</span></div>
      <div class="kv"><span class="k" data-i18n="th_pr">Pull request</span><span class="v">#${escapeHtml(String(job.pullNumber ?? '—'))}</span></div>
      <div class="kv"><span class="k" data-i18n="th_actor">Actor</span><span class="v">${escapeHtml(job.actor ?? '—')}</span></div>
      <div class="kv"><span class="k" data-i18n="th_diag">Diagnostic</span><span class="v">${diagnosticCode(job.diagnosticId)}</span></div>
      ${jobIdRow(job)}
    </div>
  </div>
</div>`
    : '';
  const lastSuccessHtml = sfBox(svc?.lastSuccess, 'ss_last_completed', 'Last completed');
  const lastFailureHtml = sfBox(svc?.lastFailure, 'ss_last_failure', 'Last failure');
  const sflHtml = `${lastSuccessHtml}${lastFailureHtml}`;

  const body = `<div class="dashboard">
<div class="page-header">
  <p class="page-desc muted" data-i18n="overview_page_desc">Service health, queue, and current activity.</p>
  <a class="page-header-link" href="/admin/metrics" data-i18n="btn_view_metrics">Open metrics →</a>
</div>
<div class="sect">
  <h2 class="vh" data-i18n="h2_overview">Service status</h2>
  <div class="status-grid">${tiles}</div>
  <div class="status-details">${statusDetails}</div>
</div>
<div class="sect">
  <div class="box-grid twocol">
    ${activityBox('ss_running_job', 'Current running job', runningBody)}
    ${activityBox('ss_queued', 'Queued', queuedBody)}
  </div>
</div>
${sflHtml ? `<div class="sect"><div class="box-grid sfl">${sflHtml}</div></div>` : ''}
${Array.isArray(diagnostics) && diagnostics.length ? `<div class="sect"><div class="card"><div class="card-header"><strong data-i18n="h2_diagnostics">Diagnostics</strong></div><div class="card-body">${renderDiagnosticsList(diagnostics)}</div></div></div>` : ''}
</div>`;
  return renderLayout({ title: 'Status', active: 'dashboard', csrfToken, body, titleKey: 'page_dashboard', cspNonce, pageStyles });
}
