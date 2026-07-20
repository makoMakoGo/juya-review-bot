import { compactDiagnosticId, compactJobId, durationBetween, escapeAttribute, escapeHtml, formatDate, formatDisplayValue, formatDuration, formatRepository, isSecretKey, numberOrDash, objectValue, redactConfigValue, safeDisplay } from './helpers.js';
import { jobStatusPill, renderAlert, renderDiagnosticsList } from './partials.js';
import { renderLayout } from './layout.js';
import { I18N } from './i18n.js';

// Page-specific styles for the jobs list and job detail pages (Linear/Vercel look).
const pageStyles = `
/* Jobs list: issue-list style table inside a bordered list container. */
.jobs-page > .page-desc { margin: 0 0 16px; max-width: 68ch; }
.tablewrap { border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default); overflow: hidden; margin-bottom: 16px; }
.tablewrap .bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 16px; background: var(--canvas-subtle); border-bottom: 1px solid var(--border-muted); }
.tablewrap .bar .count { margin-left: auto; font-size: 12px; color: var(--fg-muted); }
.tablewrap .bar.bar-foot { border-top: 1px solid var(--border-muted); border-bottom: 0; }
.job-filters { margin: 0; }
.job-filters .chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.jobs-page .chip { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 18px; padding: 3px 10px; border-radius: 2em; border: 1px solid var(--border-default); color: var(--fg-muted); background: var(--canvas-default); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; appearance: none; -webkit-appearance: none; }
.jobs-page .chip:hover { color: var(--fg-default); background: var(--canvas-subtle); text-decoration: none; }
.jobs-page .chip.on { color: var(--accent-fg); background: var(--accent-subtle); border-color: var(--accent-border); font-weight: 600; }
/* Advanced filters: subtle search/filter row with Primer inputs. */
.adv-filters > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; color: var(--fg-muted); border-top: 1px solid var(--border-muted); background: var(--canvas-default); }
.adv-filters > summary::-webkit-details-marker { display: none; }
.adv-filters > summary::before { content: ''; width: 0; height: 0; border-left: 4px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
.adv-filters[open] > summary::before { transform: rotate(90deg); }
.adv-filters > summary:hover { color: var(--fg-default); }
.adv-grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; padding: 12px 16px; background: var(--canvas-subtle); border-bottom: 1px solid var(--border-muted); }
.adv-grid > label, .adv-grid .adv-field-group > label { display: grid; gap: 4px; font-size: 12px; font-weight: 400; color: var(--fg-muted); }
.adv-grid input, .adv-grid select { min-width: 140px; min-height: 32px; padding: 5px 12px; font-size: 14px; font-family: inherit; color: var(--fg-default); background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius); }
.adv-grid input:focus, .adv-grid select:focus { outline: 2px solid var(--accent); outline-offset: 2px; border-color: var(--accent-fg); }
.adv-grid .adv-field-group { display: flex; flex-wrap: nowrap; gap: 12px; align-items: flex-end; }
.adv-grid .adv-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex: 1 1 100%; }
.adv-flag { pointer-events: none; padding: 1px 7px; font-size: 10px; }
/* Borderless clean table with hairline row borders. */
.gh-table-wrap { overflow-x: auto; }
.gh-table { width: 100%; table-layout: auto; border-collapse: collapse; font-size: 14px; }
.gh-table th, .gh-table td { padding: 8px 16px; border-bottom: 1px solid var(--border-muted); text-align: left; vertical-align: middle; white-space: nowrap; }
.gh-table thead th { font-size: 12px; font-weight: 600; color: var(--fg-muted); background: var(--canvas-default); }
.gh-table tbody tr:hover { background: var(--canvas-subtle); }
.gh-table tbody tr:last-child td { border-bottom: 0; }
.gh-table .subtle, code.subtle { color: var(--fg-muted); }
/* Jobs list: short columns hug content; repository absorbs leftover and ellipsizes. */
.jobs-table .col-repo { width: 100%; }
.jobs-table td.repo { width: 100%; max-width: 0; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-mono); font-size: 12px; }
.mono-link code { color: var(--accent-fg); background: transparent; border: 0; padding: 0; }
.mono-link:hover code { text-decoration: underline; }
.empty-state { padding: 32px 16px; text-align: center; color: var(--fg-muted); }
/* GitHub-style pager. */
.tablewrap nav.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0; padding: 0; border: 0; }
.tablewrap nav.pagination a, .tablewrap nav.pagination span[aria-disabled=true] { display: inline-flex; align-items: center; min-height: 32px; padding: 5px 12px; font-size: 14px; font-weight: 500; color: var(--accent-fg); background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius); text-decoration: none; }
.tablewrap nav.pagination a:hover { background: var(--canvas-subtle); text-decoration: none; }
.tablewrap nav.pagination span[aria-disabled=true] { color: var(--fg-muted); }
.tablewrap nav.pagination > span:not([aria-disabled]) { font-size: 12px; color: var(--fg-muted); }
/* Job detail: issue-detail feel. */
.job-detail { display: grid; gap: 16px; }
.job-detail .back { margin: 0; }
.back-link { color: var(--fg-muted); font-size: 14px; font-weight: 400; text-decoration: none; }
.back-link:hover { color: var(--accent-fg); text-decoration: none; }
.job-detail .card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.job-detail .card-body > :first-child { margin-top: 0; }
.job-detail .card-body > :last-child { margin-bottom: 0; }
.job-detail details.card summary { cursor: pointer; }
/* Description-list metadata grid. */
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; }
.detail-grid.compact { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.detail-item { padding: 8px 0; border-bottom: 1px solid var(--border-muted); display: grid; gap: 2px; align-content: start; }
.detail-item .k { font-size: 12px; color: var(--fg-muted); font-weight: 400; }
.detail-item .v { font-size: 14px; color: var(--fg-default); word-break: break-word; }
.detail-item:nth-last-child(-n+2) { border-bottom: 0; }
.detail-grid.compact .detail-item { border-bottom: 0; }
.job-detail code { font-family: var(--font-mono); font-size: 12px; background: var(--canvas-subtle); border-radius: var(--radius); padding: 2px 6px; }
@media (max-width: 900px) {
  .detail-grid, .detail-grid.compact { grid-template-columns: 1fr; }
  .detail-item:nth-last-child(-n+2) { border-bottom: 1px solid var(--border-muted); }
  .detail-item:last-child { border-bottom: 0; }
}
/* Tables inside detail cards (phase timeline, runtime settings, logs). */
.job-detail .table-scroll { overflow-x: auto; margin: 0; }
.job-detail .table-scroll table { width: 100%; border-collapse: collapse; font-size: 14px; }
.job-detail .table-scroll th, .job-detail .table-scroll td { padding: 6px 16px 6px 0; border-bottom: 1px solid var(--border-muted); text-align: left; vertical-align: top; }
.job-detail .table-scroll th:last-child, .job-detail .table-scroll td:last-child { padding-right: 0; }
.job-detail .table-scroll thead th { font-size: 12px; font-weight: 600; color: var(--fg-muted); white-space: nowrap; }
.job-detail .table-scroll tbody tr:last-child td { border-bottom: 0; }
.job-detail .table-scroll th[scope="row"] { font-weight: 500; white-space: nowrap; }
.job-detail .table-scroll td:first-child { white-space: nowrap; }
.phase-table td:first-child { font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted); }
/* Retained logs: canvas-inset mono block. */
.logs-block { background: var(--canvas-inset); border: 1px solid var(--border-muted); border-radius: var(--radius); padding: 8px 12px; }
.logs-block table { font-family: var(--font-mono); font-size: 12px; }
.logs-block td { color: var(--fg-default); }
.logs-block td:first-child, .logs-block td:nth-child(2) { color: var(--fg-muted); }
.job-detail pre { margin: 0; padding: 12px; background: var(--canvas-inset); border: 1px solid var(--border-muted); border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
.job-detail .card-body ul { margin: 0; padding-left: 20px; }
.job-detail .card-body li { margin: 4px 0; }
.job-detail .empty { color: var(--fg-muted); margin: 0; }
`;

export function renderJobsPage({ csrfToken, jobs = [], filters = {}, pagination = null, validationMessages = [], filter = '', cspNonce = '' } = {}) {
  const normalizedFilters = { ...filters };
  if (filter && !normalizedFilters.diagnosticId) normalizedFilters.diagnosticId = filter;
  const alerts = validationMessages.length > 0
    ? renderAlert(validationMessages.map(message => `<li>${safeDisplay(message)}</li>`).join(''), { list: true })
    : '';
  const paginationBar = pagination ? `<div class="bar bar-foot">${renderPagination(normalizedFilters, pagination)}</div>` : '';
  const body = `<div class="jobs-page">
${alerts}
<p class="page-desc muted" data-i18n="jobs_page_desc">Review queue history, filter failures, and open job detail logs.</p>
<div class="tablewrap">
  ${renderJobsFilterBar(normalizedFilters, pagination)}
  ${renderJobsTable(jobs)}
  ${paginationBar}
</div>
</div>`;
  return renderLayout({ title: 'Jobs', active: 'jobs', csrfToken, body, titleKey: 'page_jobs', cspNonce, pageStyles });
}

export function renderJobDetailPage({ csrfToken, job, cspNonce = '' }) {
  const id = job?.id ?? job?.jobId ?? '';
  const repository = formatRepository(job?.repo ?? job?.repository);
  const result = objectValue(job?.result ?? job?.rawResult);
  const progress = objectValue(job?.progress);
  const counts = normalizeCounts(job, result);
  const failure = job?.failure ?? result.failure ?? (job?.errorKind || job?.errorMessage ? { kind: job.errorKind, reason: job.errorMessage } : null);
  const reportingError = job?.reportingError ?? result.reportingError ?? null;
  const cleanupWarning = job?.cleanupWarning ?? result.cleanupWarning ?? '';
  const logs = job?.retainedLogs ?? job?.logs ?? null;
  const configRevision = job?.configRevision ?? result.configRevision ?? result.config?.revision;
  const status = job?.status ?? progress.phase ?? job?.phase ?? '';
  const phaseLabel = `${job?.phase ?? progress.phase ?? job?.status ?? ''}${job?.status ? ` / ${job.status}` : ''}`;

  const summaryBox = `<div class="card">
  <div class="card-header"><strong data-i18n="h2_job_detail">Job detail</strong>${jobStatusPill(status)}</div>
  <div class="card-body">
    <div class="detail-grid">
      <div class="detail-item"><span class="k" data-i18n="jd_repo_pr">Repository / PR</span><span class="v">${renderRepoPullLink(job, repository)}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_actor">Actor</span><span class="v">${safeDisplay(job?.actor || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_job_id">Job ID</span><span class="v"><code>${safeDisplay(id)}</code></span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_diag_id">Diagnostic ID</span><span class="v"><code>${safeDisplay(job?.diagnosticId || '—')}</code></span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_queued">Queued</span><span class="v">${safeDisplay(formatDate(job?.queuedAt ?? job?.createdAt) || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_started">Started</span><span class="v">${safeDisplay(formatDate(job?.startedAt) || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_finished">Finished</span><span class="v">${safeDisplay(formatDate(job?.finishedAt) || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_queue_wait">Queue wait</span><span class="v">${safeDisplay(formatDuration(job?.queueWaitMs ?? durationBetween(job?.queuedAt ?? job?.createdAt, job?.startedAt)) || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_duration">Duration</span><span class="v">${safeDisplay(formatDuration(job?.durationMs ?? durationBetween(job?.startedAt, job?.finishedAt)) || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_phase_status">Phase / status</span><span class="v">${safeDisplay(phaseLabel || '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_head_sha">Head SHA</span><span class="v"><code>${safeDisplay(job?.headSha ?? result.headSha ?? '—')}</code></span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_base_sha">Base SHA</span><span class="v"><code>${safeDisplay(job?.baseSha ?? result.baseSha ?? '—')}</code></span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_config_revision">Config revision</span><span class="v">${safeDisplay(configRevision ?? '—')}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_ocr_status">OCR status</span><span class="v">${safeDisplay(job?.ocrStatus ?? result.ocrStatus ?? '—')}</span></div>
    </div>
  </div>
</div>`;

  const countsBox = `<div class="card">
  <div class="card-header"><strong data-i18n="jd_review_counts">Review counts</strong></div>
  <div class="card-body">
    <div class="detail-grid compact">
      <div class="detail-item"><span class="k" data-i18n="jd_generated">Generated</span><span class="v">${safeDisplay(numberOrDash(counts.generated))}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_selected">Selected</span><span class="v">${safeDisplay(numberOrDash(counts.selected))}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_posted">Posted</span><span class="v">${safeDisplay(numberOrDash(counts.posted))}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_omitted">Omitted</span><span class="v">${safeDisplay(numberOrDash(counts.omitted))}</span></div>
      <div class="detail-item"><span class="k" data-i18n="jd_warnings_count">Warnings</span><span class="v">${safeDisplay(numberOrDash(counts.warnings))}</span></div>
    </div>
  </div>
</div>`;

  const body = `<div class="job-detail">
<p class="back"><a class="back-link" href="/admin/jobs" data-i18n="back_jobs">← jobs</a></p>
${summaryBox}
<div class="card">
  <div class="card-header"><strong data-i18n="jd_phase_timeline">Phase timeline</strong></div>
  <div class="card-body">${renderPhaseTimeline(job?.phaseTimeline ?? [])}</div>
</div>
${countsBox}
<div class="card">
  <div class="card-header"><strong data-i18n="jd_warnings_section">Warnings</strong></div>
  <div class="card-body">${renderObjectList(collectJobWarnings(job, result))}</div>
</div>
<div class="card">
  <div class="card-header"><strong data-i18n="jd_failure">Failure</strong></div>
  <div class="card-body">${renderObjectBlock(failure)}</div>
</div>
<details class="card"${reportingError ? ' open' : ''}><summary><h2 data-i18n="jd_reporting_error">Reporting error</h2></summary>${renderObjectBlock(reportingError)}</details>
<details class="card"${cleanupWarning ? ' open' : ''}><summary><h2 data-i18n="jd_cleanup_warning">Cleanup warning</h2></summary>${cleanupWarning ? `<p>${safeDisplay(cleanupWarning)}</p>` : '<p class="empty" data-i18n="empty_none">None.</p>'}</details>
<details class="card"><summary><h2 data-i18n="jd_runtime">Runtime settings</h2></summary>${renderKeyValueTable(job?.runtimeSettings ?? result.runtimeSettings ?? {})}</details>
<div class="card">
  <div class="card-header"><strong data-i18n="jd_retained_logs">Retained logs</strong></div>
  <div class="card-body">${renderLogs(logs)}</div>
</div>
${job?.diagnostics ? `<div class="card"><div class="card-header"><strong data-i18n="jd_job_diagnostics">Job diagnostics</strong></div><div class="card-body">${renderDiagnosticsList(job.diagnostics)}</div></div>` : ''}
</div>`;
  return renderLayout({ title: `Job ${id}`, active: 'jobs', csrfToken, body, cspNonce, pageStyles });
}

export function renderJobsTable(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return '<div class="empty-state" data-i18n="empty_jobs">No jobs found.</div>';
  const rows = jobs.map((job) => {
    const id = job?.id ?? job?.jobId;
    const status = job?.status;
    const repo = formatRepository(job?.repo ?? job?.repository);
    const actor = job?.actor ?? '';
    const diagnosticId = job?.diagnosticId ?? '';
    const queuedAt = job?.queuedAt ?? job?.createdAt ?? job?.startedAt;
    const idLabel = id ? compactJobId(id) : '';
    const diagLabel = diagnosticId ? compactDiagnosticId(diagnosticId) : '';
    const idCell = id
      ? `<a class="mono-link" href="/admin/jobs/${escapeAttribute(id)}" title="${escapeAttribute(id)}"><code>${safeDisplay(idLabel)}</code></a>`
      : '';
    const pr = job?.pullNumber != null && job?.pullNumber !== '' ? `#${safeDisplay(job.pullNumber)}` : '—';
    const diagCell = diagnosticId
      ? `<code class="subtle" title="${escapeAttribute(diagnosticId)}">${safeDisplay(diagLabel)}</code>`
      : '—';
    return `<tr>
      <td>${idCell}</td>
      <td>${jobStatusPill(status)}</td>
      <td class="repo" title="${escapeAttribute(repo)}">${safeDisplay(repo)}</td>
      <td>${pr}</td>
      <td title="${escapeAttribute(actor || '—')}">${safeDisplay(actor || '—')}</td>
      <td title="${escapeAttribute(diagnosticId || '—')}">${diagCell}</td>
      <td class="subtle">${safeDisplay(formatDate(queuedAt) || '—')}</td>
    </tr>`;
  }).join('');
  return `<div class="gh-table-wrap"><table class="gh-table jobs-table"><colgroup><col class="col-job-id"><col class="col-status"><col class="col-repo"><col class="col-pr"><col class="col-actor"><col class="col-diag"><col class="col-queued"></colgroup><thead><tr><th data-i18n="th_job_id">Job ID</th><th data-i18n="th_status">Status</th><th data-i18n="th_repository">Repository</th><th data-i18n="th_pr">PR</th><th data-i18n="th_actor">Actor</th><th data-i18n="th_diag_id">Diagnostic ID</th><th data-i18n="th_queued">Queued</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// Canonical job states: chips + advanced select share this definition.
const JOB_STATES = Object.freeze([
  { value: 'running', key: 'st_running', quick: true },
  { value: 'queued', key: 'st_queued', quick: true },
  { value: 'succeeded', key: 'st_succeeded', quick: true },
  { value: 'succeeded_with_warnings', key: 'st_succeeded_with_warnings', quick: false },
  { value: 'failed', key: 'st_failed', quick: true },
  { value: 'interrupted', key: 'st_interrupted', quick: false },
  { value: 'stale', key: 'st_stale', quick: false },
  { value: 'skipped', key: 'st_skipped', quick: false },
]);
const STATE_CHIPS = Object.freeze([
  { value: '', key: 'f_all' },
  ...JOB_STATES.filter((s) => s.quick).map(({ value, key }) => ({ value, key })),
]);
const STATE_OPTIONS = Object.freeze(JOB_STATES.map(({ value, key }) => [value, key]));
const FAILURE_KIND_OPTIONS = [
  ['job_timeout', 'fk_job_timeout'],
  ['ocr_config_error', 'fk_ocr_config_error'],
  ['provider_rate_limited', 'fk_provider_rate_limited'],
  ['provider_auth_failed', 'fk_provider_auth_failed'],
  ['provider_unavailable', 'fk_provider_unavailable'],
  ['ocr_runtime_error', 'fk_ocr_runtime_error'],
  ['git_error', 'fk_git_error'],
  ['github_rate_limited', 'fk_github_rate_limited'],
  ['github_api_error', 'fk_github_api_error'],
  ['bot_runtime_error', 'fk_bot_runtime_error'],
  ['invalid_ocr_output', 'fk_invalid_ocr_output'],
];

function renderFilterSelect(name, value, options, allKey) {
  const current = String(value ?? '').trim().toLowerCase();
  const all = `<option value="" data-i18n="${allKey}">${escapeHtml(I18N.en[allKey] ?? 'all')}</option>`;
  const rest = options.map(([v, key]) => `<option value="${escapeAttribute(v)}" data-i18n="${key}"${v.toLowerCase() === current ? ' selected' : ''}>${escapeHtml(I18N.en[key] ?? v)}</option>`).join('');
  return `<select name="${name}">${all}${rest}</select>`;
}

function renderJobsFilterBar(filters, pagination) {
  const state = String(filters.state ?? filters.status ?? filters.outcome ?? '').toLowerCase();
  const size = pagination?.pageSize ?? filters.pageSize ?? 50;
  const total = pagination?.total ?? 0;
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const countAttrs = `data-i18n-template="pagination_summary" data-page="${safeDisplay(page)}" data-total-pages="${safeDisplay(totalPages)}" data-total="${safeDisplay(total)}"`;
  const countText = `page ${safeDisplay(page)} / ${safeDisplay(totalPages)} · ${safeDisplay(total)} ${total === 1 ? 'job' : 'jobs'}`;

  const chips = STATE_CHIPS.map((c) => {
    const on = c.value === state ? ' on' : '';
    return `<button type="submit" name="state" value="${escapeAttribute(c.value)}" class="chip${on}" data-i18n="${c.key}">${escapeHtml(I18N.en[c.key] ?? (c.value || 'all'))}</button>`;
  }).join('');

  const advanced = {
    owner: String(filters.owner ?? ''),
    repository: String(filters.repository ?? filters.repo ?? ''),
    failureKind: String(filters.failureKind ?? ''),
    diagnosticId: String(filters.diagnosticId ?? ''),
    from: String(filters.from ?? ''),
    to: String(filters.to ?? ''),
  };
  const advActive = Object.values(advanced).some((v) => v !== '') || Boolean(state);
  // Apply re-submits current state via the select; chips also submit state directly.
  const applyState = `<button type="submit" class="btn btn-primary" data-i18n="btn_apply">apply</button>`;
  const advFields = `<label><span data-i18n="f_owner">Owner</span><input name="owner" value="${escapeAttribute(advanced.owner)}" placeholder="owner"></label>`
    + `<label><span data-i18n="f_repository">Repository</span><input name="repository" value="${escapeAttribute(advanced.repository)}" placeholder="name or owner/name"></label>`
    + `<label><span data-i18n="f_state">State/outcome</span>${renderFilterSelect('state', state, STATE_OPTIONS, 'f_all')}</label>`
    + `<label><span data-i18n="f_failure_kind">Failure kind</span>${renderFilterSelect('failureKind', advanced.failureKind, FAILURE_KIND_OPTIONS, 'f_all')}</label>`
    + `<label><span data-i18n="f_diag_id">Diagnostic ID</span><input name="diagnosticId" value="${escapeAttribute(advanced.diagnosticId)}" placeholder="repo#12@commentId"></label>`
    + `<div class="adv-field-group" role="group" aria-label="Date range" data-i18n-aria-label="aria_date_range">`
    + `<label><span data-i18n="f_from">From</span><input name="from" type="date" value="${escapeAttribute(advanced.from)}"></label>`
    + `<label><span data-i18n="f_to">To</span><input name="to" type="date" value="${escapeAttribute(advanced.to)}"></label>`
    + `</div>`;

  return `<form class="job-filters" method="get" action="/admin/jobs">
  <input type="hidden" name="size" value="${escapeAttribute(size)}">
  <div class="bar bar-filters">
    <div class="chips" role="group" aria-label="State">${chips}</div>
    <span class="count" ${countAttrs}>${escapeHtml(countText)}</span>
  </div>
  <details class="adv-filters"${advActive ? ' open' : ''}>
    <summary><span data-i18n="f_advanced">Advanced filters</span>${advActive ? '<span class="chip on adv-flag" aria-hidden="true">on</span>' : ''}</summary>
    <div class="adv-grid">${advFields}<div class="adv-actions">${applyState}<a class="chip" href="/admin/jobs" data-i18n="btn_reset">reset</a></div></div>
  </details>
</form>`;
}

function renderPagination(filters, pagination) {
  if (!pagination) return '';
  const total = Number.isFinite(pagination.total) ? pagination.total : 0;
  const page = pagination.page ?? 1;
  const totalPages = pagination.totalPages ?? 1;
  const prev = pagination.hasPrev ? `<a href="${escapeAttribute(jobsPageUrl(filters, pagination.prevPage, pagination.pageSize))}" data-i18n="btn_prev">prev</a>` : '<span class="empty" aria-disabled="true" data-i18n="btn_prev">prev</span>';
  const next = pagination.hasNext ? `<a href="${escapeAttribute(jobsPageUrl(filters, pagination.nextPage, pagination.pageSize))}" data-i18n="btn_next">next</a>` : '<span class="empty" aria-disabled="true" data-i18n="btn_next">next</span>';
  return `<nav class="pagination" aria-label="Jobs pages" data-i18n-aria-label="aria_jobs_pages">${prev}<span data-i18n-template="pagination_summary" data-page="${safeDisplay(page)}" data-total-pages="${safeDisplay(totalPages)}" data-total="${safeDisplay(total)}">page ${safeDisplay(page)} / ${safeDisplay(totalPages)} · ${safeDisplay(total)} jobs</span>${next}</nav>`;
}

function jobsPageUrl(filters, page, size) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({
    owner: filters.owner,
    repository: filters.repository ?? filters.repo,
    state: filters.state ?? filters.status ?? filters.outcome,
    failureKind: filters.failureKind,
    diagnosticId: filters.diagnosticId,
    from: filters.from,
    to: filters.to,
    size,
    page,
  })) {
    if (value != null && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/admin/jobs?${query}` : '/admin/jobs';
}

function renderPhaseTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) return '<p class="empty" data-i18n="empty_phase_timeline">No phase timeline.</p>';
  const rows = timeline.map(item => `<tr><td>${safeDisplay(formatDate(item.timestamp))}</td><td>${safeDisplay(item.label ?? item.phase ?? '')}</td><td>${safeDisplay(item.phase ?? '')}</td><td>${safeDisplay(item.message ?? '')}</td><td>${safeDisplay(item.source ?? '')}</td></tr>`).join('');
  return `<div class="table-scroll phase-table"><table><thead><tr><th data-i18n="th_time">Time</th><th data-i18n="th_event">Event</th><th data-i18n="th_phase">Phase</th><th data-i18n="th_message">Message</th><th data-i18n="th_source">Source</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderRepoPullLink(job, repository) {
  const pullNumber = job?.pullNumber;
  if (!repository) return safeDisplay(pullNumber ? `#${pullNumber}` : '');
  const label = pullNumber ? `${repository}#${pullNumber}` : repository;
  return pullNumber ? `<a href="https://github.com/${escapeAttribute(repository)}/pull/${escapeAttribute(pullNumber)}" rel="noreferrer">${safeDisplay(label)}</a>` : safeDisplay(label);
}

function renderKeyValueTable(values) {
  const entries = Object.entries(objectValue(values)).filter(([key]) => !isSecretKey(key));
  if (entries.length === 0) return '<p class="empty" data-i18n="empty_runtime">No runtime settings.</p>';
  const rows = entries.sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `<tr><th scope="row">${safeDisplay(key)}</th><td>${safeDisplay(formatDisplayValue(redactConfigValue(key, value)))}</td></tr>`).join('');
  return `<div class="table-scroll"><table><tbody>${rows}</tbody></table></div>`;
}

function renderObjectList(items) {
  if (!Array.isArray(items) || items.length === 0) return '<p class="empty" data-i18n="empty_none">None.</p>';
  return `<ul>${items.map(item => `<li>${safeDisplay(formatDisplayValue(item))}</li>`).join('')}</ul>`;
}

function renderObjectBlock(value) {
  if (value == null || value === '') return '<p class="empty" data-i18n="empty_none">None.</p>';
  return `<pre>${safeDisplay(formatDisplayValue(value))}</pre>`;
}

function renderLogs(logs) {
  if (!logs || !Array.isArray(logs.entries) || logs.entries.length === 0) return '<p class="empty" data-i18n="empty_logs">No retained logs.</p>';
  const rows = logs.entries.map(entry => `<tr><td>${safeDisplay(formatDate(entry.timestamp))}</td><td>${safeDisplay(entry.level)}</td><td>${safeDisplay(entry.message)}</td><td>${safeDisplay(formatDisplayValue(entry.fields ?? {}))}</td></tr>`).join('');
  const note = logs.degraded ? renderAlert('<span data-i18n="logs_degraded">Log history is degraded.</span>', { tone: 'warning' }) : '';
  return `${note}<div class="table-scroll logs-block"><table><thead><tr><th data-i18n="th_time">Time</th><th data-i18n="th_level">Level</th><th data-i18n="th_message">Message</th><th data-i18n="th_fields">Fields</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function collectJobWarnings(job, result) {
  const warnings = [];
  if (Array.isArray(job?.warnings)) warnings.push(...job.warnings);
  if (Array.isArray(result.warnings)) warnings.push(...result.warnings);
  if (Array.isArray(result.publishWarnings)) warnings.push(...result.publishWarnings);
  if (Number.isFinite(result.warningsCount) && warnings.length === 0) warnings.push(`${result.warningsCount} warning(s)`);
  return warnings;
}

function normalizeCounts(job, result) {
  const counts = objectValue(job?.counts);
  return {
    generated: counts.generated ?? result.commentsGenerated,
    selected: counts.selected ?? result.commentsSelected,
    posted: counts.posted ?? result.commentsPosted,
    omitted: counts.omitted ?? result.commentsOmitted,
    warnings: counts.warnings ?? result.warningsCount,
  };
}
