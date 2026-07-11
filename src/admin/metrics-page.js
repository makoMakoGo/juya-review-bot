import { buildMetricsView, METRICS_WINDOWS } from './metrics.js';
import { escapeAttribute, escapeHtml, renderLayout } from './templates.js';

export function renderMetricsPage({ csrfToken, stats = null, metrics = null, window = '', cspNonce = '' } = {}) {
  const view = buildMetricsView(stats || metrics || {}, window);
  const bucket = view.bucket;
  const overview = [
    { label: 'Jobs', key: 'th_jobs', value: numberOrDash(bucket.jobs) },
    { label: 'Success rate', key: 'th_success_rate', value: formatPercent(bucket.successRate) },
    { label: 'Duration p50', key: 'm_dur_p50', value: formatDuration(bucket.durationP50Ms) },
    { label: 'Duration p95', key: 'm_dur_p95', value: formatDuration(bucket.durationP95Ms) },
    { label: 'Queue wait p50', key: 'm_qw_p50', value: formatDuration(bucket.queueWaitP50Ms) },
    { label: 'Queue wait p95', key: 'm_qw_p95', value: formatDuration(bucket.queueWaitP95Ms) },
    { label: 'Avg comments generated', key: 'm_avg_gen', value: formatNumber(bucket.averageCommentsGenerated) },
    { label: 'Avg comments posted', key: 'm_avg_post', value: formatNumber(bucket.averageCommentsPosted) },
  ];

  const metricTiles = overview.map(metric => `<div class="dmetric"><div class="k" data-i18n="${escapeAttribute(metric.key)}">${escapeHtml(metric.label)}</div><div class="v">${escapeHtml(metric.value)}</div></div>`).join('');
  const scopeNav = METRICS_WINDOWS.map(item => {
    const selected = item.id === view.selectedWindow;
    const current = selected ? ' aria-current="page"' : '';
    return `<a class="chip${selected ? ' on' : ''}" href="/admin/metrics?window=${encodeURIComponent(item.id)}"${current}>${windowLabelHtml(item)}</a>`;
  }).join('');
  const selectedWindowLabel = windowLabelHtml(view.window);

  const failureHtml = view.failureKinds.length > 0
    ? `<div class="table-scroll"><table class="gh-table metrics-table metrics-table--compact"><caption class="vh">Failure classifications for ${escapeHtml(view.window.label)}</caption><thead><tr><th data-i18n="m_fail_class">Failure classification</th><th data-i18n="th_jobs">Jobs</th></tr></thead><tbody>${view.failureKinds.map(item => `<tr><th scope="row">${escapeHtml(item.kind)}</th><td>${escapeHtml(String(item.count))}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="empty" data-i18n="empty_none">None.</p>';

  const repositoryHtml = view.repositories.length > 0
    ? `<div class="table-scroll"><table class="gh-table metrics-table metrics-table--compact"><caption class="vh">Top repositories for ${escapeHtml(view.window.label)}</caption><thead><tr><th data-i18n="th_repository">Repository</th><th data-i18n="th_jobs">Jobs</th><th data-i18n="th_success_rate">Success rate</th><th data-i18n="st_failed">Failed</th></tr></thead><tbody>${view.repositories.map(repo => `<tr><th scope="row" title="${escapeAttribute(repo.name)}">${escapeHtml(repo.name)}</th><td>${escapeHtml(numberOrDash(repo.jobs))}</td><td>${escapeHtml(formatPercent(repo.successRate))}</td><td>${escapeHtml(numberOrDash(repo.failed))}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="empty" data-i18n="empty_none">None.</p>';

  const comparisonHtml = `<div class="table-scroll"><table class="gh-table metrics-table"><caption class="vh">Metrics window comparison</caption><thead><tr><th data-i18n="th_window">Window</th><th data-i18n="th_jobs">Jobs</th><th data-i18n="th_success_rate">Success rate</th><th data-i18n="m_dur_p50">Duration p50</th><th data-i18n="m_dur_p95">Duration p95</th><th data-i18n="m_qw_p95">Queue wait p95</th><th data-i18n="m_avg_post">Avg comments posted</th><th data-i18n="st_failed">Failed</th><th data-i18n="m_stale">Stale</th><th data-i18n="m_skipped">Skipped</th><th data-i18n="m_interrupted">Interrupted</th></tr></thead><tbody>${view.windowRows.map(row => `<tr${row.id === view.selectedWindow ? ' aria-current="true"' : ''}><th scope="row">${windowLabelHtml(row)}</th><td>${escapeHtml(numberOrDash(row.bucket.jobs))}</td><td>${escapeHtml(formatPercent(row.bucket.successRate))}</td><td>${escapeHtml(formatDuration(row.bucket.durationP50Ms))}</td><td>${escapeHtml(formatDuration(row.bucket.durationP95Ms))}</td><td>${escapeHtml(formatDuration(row.bucket.queueWaitP95Ms))}</td><td>${escapeHtml(formatNumber(row.bucket.averageCommentsPosted))}</td><td>${escapeHtml(numberOrDash(row.bucket.failed))}</td><td>${escapeHtml(numberOrDash(row.bucket.stale))}</td><td>${escapeHtml(numberOrDash(row.bucket.skipped))}</td><td>${escapeHtml(numberOrDash(row.bucket.interrupted))}</td></tr>`).join('')}</tbody></table></div>`;

  const dailyHtml = view.dailyTrend.length > 0
    ? `<div class="table-scroll"><table class="gh-table metrics-table"><caption class="vh">Daily metrics for ${escapeHtml(view.window.label)}</caption><thead><tr><th data-i18n="th_day">Day</th><th data-i18n="th_jobs">Jobs</th><th data-i18n="th_success_rate">Success rate</th><th data-i18n="m_avg_gen">Avg comments generated</th><th data-i18n="m_avg_post">Avg comments posted</th><th data-i18n="st_failed">Failed</th><th data-i18n="m_stale">Stale</th><th data-i18n="m_skipped">Skipped</th><th data-i18n="m_interrupted">Interrupted</th></tr></thead><tbody>${view.dailyTrend.map(day => `<tr><th scope="row">${escapeHtml(day.day)}</th><td>${escapeHtml(numberOrDash(day.jobs))}</td><td>${escapeHtml(formatPercent(day.successRate))}</td><td>${escapeHtml(formatNumber(day.averageCommentsGenerated))}</td><td>${escapeHtml(formatNumber(day.averageCommentsPosted))}</td><td>${escapeHtml(numberOrDash(day.failed))}</td><td>${escapeHtml(numberOrDash(day.stale))}</td><td>${escapeHtml(numberOrDash(day.skipped))}</td><td>${escapeHtml(numberOrDash(day.interrupted))}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="empty" data-i18n="empty_daily">No daily trend data.</p>';

  const body = `<div class="metrics-page">
<div class="page-header">
  <p class="page-desc muted" data-i18n="metrics_page_desc">Latency, comment volume, failure classification, and repository success trends.</p>
</div>
<section class="box" aria-labelledby="metrics-overview-title">
  <div class="box-header">
    <div><strong id="metrics-overview-title" data-i18n="h2_metrics">Metrics and trends</strong><div class="box-header-meta muted"><code>${selectedWindowLabel}</code></div></div>
    <nav class="gh-filter" aria-label="Date range" data-i18n-aria-label="aria_date_range">${scopeNav}</nav>
  </div>
  <div class="box-body"><div class="metric-row">${metricTiles}</div></div>
</section>
<div class="box-grid twocol">
  <section class="box" aria-labelledby="metrics-failures-title"><div class="box-header"><strong id="metrics-failures-title" data-i18n="m_fail_class">Failure classification</strong><span class="box-header-meta muted">${escapeHtml(numberOrDash(bucket.failed))}</span></div><div class="box-body">${failureHtml}</div></section>
  <section class="box" aria-labelledby="metrics-repositories-title"><div class="box-header"><strong id="metrics-repositories-title" data-i18n="th_repository">Repository</strong><span class="box-header-meta muted">${escapeHtml(String(view.repositories.length))}</span></div><div class="box-body">${repositoryHtml}</div></section>
</div>
<section class="box" aria-labelledby="metrics-daily-title"><div class="box-header"><strong id="metrics-daily-title" data-i18n="m_daily_trend">Daily trend</strong><span class="box-header-meta muted"><code>${selectedWindowLabel}</code></span></div><div class="box-body">${dailyHtml}</div></section>
<section class="box" aria-labelledby="metrics-comparison-title"><div class="box-header"><strong id="metrics-comparison-title" data-i18n="th_window">Window</strong></div><div class="box-body">${comparisonHtml}</div></section>
</div>`;

  return renderLayout({ title: 'Metrics', active: 'metrics', csrfToken, body, titleKey: 'page_metrics', cspNonce });
}

function windowLabelHtml(window) {
  return window.id === 'all' ? '<span data-i18n="f_all">all</span>' : escapeHtml(window.label);
}

function numberOrDash(value) {
  return Number.isFinite(value) ? String(value) : '—';
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, '');
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
}

function formatDuration(ms) {
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainder}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
