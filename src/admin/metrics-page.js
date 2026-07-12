import { renderMetricsTrendChart } from './metrics-chart.js';
import {
  buildMetricsView,
  METRICS_TRENDS,
  METRICS_WINDOWS,
  normalizeMetricsTrend,
} from './metrics.js';
import { metricsStyles } from './metrics-styles.js';
import { escapeAttribute, escapeHtml, renderLayout } from './templates.js';

export function renderMetricsPage({ csrfToken, stats = {}, window: metricsWindow = '', trend = '', cspNonce = '' } = {}) {
  const view = buildMetricsView(stats, metricsWindow);
  const selectedTrend = normalizeMetricsTrend(trend);
  const bucket = view.bucket;

  const body = `<div class="metrics-page">
${renderToolbar(view, selectedTrend)}
${renderSummary(bucket)}
${renderTrendSection(view, selectedTrend)}
<div class="metrics-breakdown-grid">
  ${renderFailureSection(view)}
  ${renderRepositorySection(view)}
</div>
${renderComparisonSection(view)}
</div>`;

  return renderLayout({
    title: 'Metrics',
    active: 'metrics',
    csrfToken,
    body,
    titleKey: 'page_metrics',
    cspNonce,
    pageStyles: metricsStyles(),
  });
}

function renderToolbar(view, selectedTrend) {
  const rangeLinks = METRICS_WINDOWS.map(item => segmentedLink({
    href: metricsUrl(item.id, selectedTrend),
    labelHtml: windowLabelHtml(item),
    selected: item.id === view.selectedWindow,
  })).join('');

  return `<div class="metrics-toolbar">
  <p class="page-desc muted" data-i18n="metrics_page_desc">Latency, comment volume, failure classification, and repository success trends.</p>
  <nav class="metrics-segmented" aria-label="Date range" data-i18n-aria-label="aria_date_range">${rangeLinks}</nav>
</div>`;
}

function renderSummary(bucket) {
  const items = [
    summarySingle('th_jobs', 'Jobs', numberOrDash(bucket.jobs)),
    summarySingle('th_success_rate', 'Success rate', formatPercent(bucket.successRate)),
    summaryPair('metrics_duration', 'Duration', [
      ['p50', formatDuration(bucket.durationP50Ms)],
      ['p95', formatDuration(bucket.durationP95Ms)],
    ]),
    summaryPair('metrics_queue_wait', 'Queue wait', [
      ['p50', formatDuration(bucket.queueWaitP50Ms)],
      ['p95', formatDuration(bucket.queueWaitP95Ms)],
    ]),
    summaryPair('metrics_comments', 'Comments', [
      ['m_avg_gen', formatNumber(bucket.averageCommentsGenerated), 'Generated'],
      ['m_avg_post', formatNumber(bucket.averageCommentsPosted), 'Posted'],
    ]),
  ].join('');

  return `<section class="metrics-summary" aria-label="Metrics summary" data-i18n-aria-label="metrics_summary">${items}</section>`;
}

function summarySingle(key, label, value) {
  return `<div class="metrics-summary-item"><div class="metrics-summary-label" data-i18n="${escapeAttribute(key)}">${escapeHtml(label)}</div><div class="metrics-summary-value">${escapeHtml(value)}</div></div>`;
}

function summaryPair(key, label, values) {
  const pairs = values.map(([itemKey, value, fallback = itemKey]) => `<span><small${itemKey.startsWith('m_') ? ` data-i18n="${escapeAttribute(itemKey)}"` : ''}>${escapeHtml(fallback)}</small><strong>${escapeHtml(value)}</strong></span>`).join('');
  return `<div class="metrics-summary-item"><div class="metrics-summary-label" data-i18n="${escapeAttribute(key)}">${escapeHtml(label)}</div><div class="metrics-summary-pair">${pairs}</div></div>`;
}

function renderTrendSection(view, selectedTrend) {
  const trendLinks = METRICS_TRENDS.map(item => segmentedLink({
    href: metricsUrl(view.selectedWindow, item.id),
    labelHtml: `<span data-i18n="metrics_trend_${escapeAttribute(item.id)}">${escapeHtml(item.label)}</span>`,
    selected: item.id === selectedTrend,
  })).join('');
  const content = selectedTrend === 'data'
    ? renderDailyData(view.dailyTrend)
    : renderDailyChart(view.dailyTrend);

  return `<section class="box" aria-labelledby="metrics-daily-title">
  <div class="box-header">
    <div class="metrics-section-heading"><strong id="metrics-daily-title" data-i18n="m_daily_trend">Daily trend</strong><small>${escapeHtml(view.metricsWindow.label)}</small></div>
    <nav class="metrics-segmented" aria-label="Trend view" data-i18n-aria-label="metrics_trend_view">${trendLinks}</nav>
  </div>
  <div class="metrics-trend-body">${content}</div>
</section>`;
}

function renderDailyChart(rows) {
  const chart = renderMetricsTrendChart(rows);
  if (!chart) return '<p class="metrics-empty" data-i18n="empty_daily">No daily trend data.</p>';
  return `<div class="metrics-chart-wrap">${chart}</div>`;
}

function renderDailyData(rows) {
  if (rows.length === 0) return '<p class="metrics-empty" data-i18n="empty_daily">No daily trend data.</p>';
  const cards = rows.map(day => {
    const values = [
      ['th_jobs', 'Jobs', numberOrDash(day.jobs)],
      ['th_success_rate', 'Success rate', formatPercent(day.successRate)],
      ['m_avg_gen', 'Generated', formatNumber(day.averageCommentsGenerated)],
      ['m_avg_post', 'Posted', formatNumber(day.averageCommentsPosted)],
      ['st_failed', 'Failed', numberOrDash(day.failed)],
      ['m_stale', 'Stale', numberOrDash(day.stale)],
      ['m_skipped', 'Skipped', numberOrDash(day.skipped)],
      ['m_interrupted', 'Interrupted', numberOrDash(day.interrupted)],
    ].map(([key, label, value]) => `<div class="metrics-day-value"><small data-i18n="${escapeAttribute(key)}">${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');
    return `<article class="metrics-day"><time datetime="${escapeAttribute(day.day)}">${escapeHtml(day.day)}</time><div class="metrics-day-values">${values}</div></article>`;
  }).join('');
  return `<div class="metrics-day-grid">${cards}</div>`;
}

function renderFailureSection(view) {
  const total = view.failureKinds.reduce((sum, item) => sum + item.count, 0);
  const body = view.failureKinds.length === 0
    ? '<p class="metrics-empty" data-i18n="empty_none">None.</p>'
    : `<ol class="metrics-list metrics-failure-list">${view.failureKinds.map(item => {
      const share = total > 0 ? item.count / total : 0;
      return `<li class="metrics-list-item"><div class="metrics-list-line"><span class="metrics-list-name" title="${escapeAttribute(item.kind)}">${escapeHtml(item.kind)}</span><span class="metrics-list-meta">${escapeHtml(item.count)} · ${escapeHtml(formatPercent(share))}</span></div><span class="metrics-bar" aria-hidden="true"><span class="metrics-bar-fill" style="width:${escapeAttribute(barPercent(share))}%"></span></span></li>`;
    }).join('')}</ol>`;

  return `<section class="box" aria-labelledby="metrics-failures-title"><div class="box-header"><strong id="metrics-failures-title" data-i18n="m_fail_class">Failure classification</strong><span class="box-header-meta muted">${escapeHtml(numberOrDash(view.bucket.failed))}</span></div>${body}</section>`;
}

function renderRepositorySection(view) {
  const maxJobs = Math.max(...view.repositories.map(item => item.jobs), 1);
  const body = view.repositories.length === 0
    ? '<p class="metrics-empty" data-i18n="empty_none">None.</p>'
    : `<ol class="metrics-list">${view.repositories.map(repository => {
      const relative = repository.jobs / maxJobs;
      return `<li class="metrics-list-item"><div class="metrics-list-line"><span class="metrics-list-name" title="${escapeAttribute(repository.name)}">${escapeHtml(repository.name)}</span><span class="metrics-list-meta"><span data-i18n="th_jobs">Jobs</span> ${escapeHtml(repository.jobs)} · <span data-i18n="th_success_rate">Success rate</span> ${escapeHtml(formatPercent(repository.successRate))}</span></div><span class="metrics-bar" aria-hidden="true"><span class="metrics-bar-fill" style="width:${escapeAttribute(barPercent(relative))}%"></span></span></li>`;
    }).join('')}</ol>`;

  return `<section class="box" aria-labelledby="metrics-repositories-title"><div class="box-header"><strong id="metrics-repositories-title" data-i18n="th_repository">Repository</strong><span class="box-header-meta muted">${escapeHtml(view.repositories.length)}</span></div>${body}</section>`;
}

function renderComparisonSection(view) {
  const items = view.windowRows.map(row => {
    const values = [
      ['th_jobs', 'Jobs', numberOrDash(row.bucket.jobs)],
      ['m_dur_p95', 'Duration p95', formatDuration(row.bucket.durationP95Ms)],
      ['m_qw_p95', 'Queue wait p95', formatDuration(row.bucket.queueWaitP95Ms)],
      ['m_avg_post', 'Posted', formatNumber(row.bucket.averageCommentsPosted)],
    ].map(([key, label, value]) => `<div class="metrics-comparison-value"><small data-i18n="${escapeAttribute(key)}">${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');
    const current = row.id === view.selectedWindow ? ' aria-current="true"' : '';
    return `<article class="metrics-comparison-item"${current}><div class="metrics-comparison-title"><strong>${windowLabelHtml(row)}</strong><span>${escapeHtml(formatPercent(row.bucket.successRate))}</span></div><div class="metrics-comparison-values">${values}</div></article>`;
  }).join('');

  return `<section class="box" aria-labelledby="metrics-comparison-title"><div class="box-header"><strong id="metrics-comparison-title" data-i18n="metrics_window_comparison">Window comparison</strong></div><div class="metrics-comparison-grid">${items}</div></section>`;
}

function segmentedLink({ href, labelHtml, selected }) {
  return `<a href="${escapeAttribute(href)}"${selected ? ' aria-current="page"' : ''}>${labelHtml}</a>`;
}

function metricsUrl(window, trend) {
  const params = new URLSearchParams({ window, trend });
  return `/admin/metrics?${params.toString()}`;
}

function windowLabelHtml(metricsWindow) {
  return metricsWindow.id === 'all' ? '<span data-i18n="f_all">all</span>' : escapeHtml(metricsWindow.label);
}

function barPercent(value) {
  return Math.max(0, Math.min(100, value * 100)).toFixed(2).replace(/\.00$/, '');
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
