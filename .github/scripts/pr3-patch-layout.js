import fs from 'node:fs';

function write(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next);
}

function replaceFirst(source, before, after, label) {
  if (source.includes(after)) return source;
  const index = source.indexOf(before);
  if (index < 0) throw new Error(`${label} not found`);
  return source.slice(0, index) + after + source.slice(index + before.length);
}

write('src/admin/templates.js', source => {
  let next = replaceFirst(
    source,
    "export function renderLayout({ title, active = 'dashboard', csrfToken = '', body, titleKey = '', cspNonce = '' }) {",
    "export function renderLayout({ title, active = 'dashboard', csrfToken = '', body, titleKey = '', cspNonce = '', pageStyles = '' }) {",
    'renderLayout signature',
  );
  next = replaceFirst(
    next,
    '${fontLinks()}${themeInitScript(cspNonce)}<style>${baseStyles()}</style>',
    '${fontLinks()}${themeInitScript(cspNonce)}<style>${baseStyles()}${pageStyles}</style>',
    'renderLayout style slot',
  );
  next = replaceFirst(
    next,
    "    m_fail_class: 'Failure classification', m_daily_trend: 'Daily trend', empty_daily: 'No daily trend data.',",
    "    m_fail_class: 'Failure classification', m_daily_trend: 'Daily trend', empty_daily: 'No daily trend data.',\n    metrics_trend_chart: 'Chart', metrics_trend_data: 'Data', metrics_trend_view: 'Trend view', metrics_summary: 'Metrics summary', metrics_duration: 'Duration', metrics_queue_wait: 'Queue wait', metrics_comments: 'Comments', metrics_window_comparison: 'Window comparison',",
    'English Metrics translations',
  );
  return replaceFirst(
    next,
    "    m_fail_class: '失败分类', m_daily_trend: '每日趋势', empty_daily: '暂无每日趋势数据。',",
    "    m_fail_class: '失败分类', m_daily_trend: '每日趋势', empty_daily: '暂无每日趋势数据。',\n    metrics_trend_chart: '图表', metrics_trend_data: '数据', metrics_trend_view: '趋势视图', metrics_summary: '指标摘要', metrics_duration: '耗时', metrics_queue_wait: '排队等待', metrics_comments: '评论', metrics_window_comparison: '时间窗对比',",
    'Chinese Metrics translations',
  );
});

write('src/admin/router.js', source => {
  let next = replaceFirst(
    source,
    "import { normalizeMetricsWindow } from './metrics.js';",
    "import { normalizeMetricsTrend, normalizeMetricsWindow } from './metrics.js';",
    'Metrics router import',
  );
  return replaceFirst(
    next,
    `    if (normalized.pathname === '/admin/metrics') {
      if (normalized.method !== 'GET') return methodNotAllowed(['GET']);
      let window;
      try {
        window = normalizeMetricsWindow(normalized.query.get('window'));
      } catch (error) {
        return textResponse(error.message, { status: 400 });
      }
      const dashboard = await this.loadDashboard({ request: normalized, session });
      return htmlResponse((nonce) => renderMetricsPage({ csrfToken: session.csrfToken, cspNonce: nonce, stats: dashboard.stats, window }));
    }`,
    `    if (normalized.pathname === '/admin/metrics') {
      if (normalized.method !== 'GET') return methodNotAllowed(['GET']);
      let metricsWindow;
      let trend;
      try {
        metricsWindow = normalizeMetricsWindow(normalized.query.get('window'));
        trend = normalizeMetricsTrend(normalized.query.get('trend'));
      } catch (error) {
        return textResponse(error.message, { status: 400 });
      }
      const dashboard = await this.loadDashboard({ request: normalized, session });
      return htmlResponse((nonce) => renderMetricsPage({ csrfToken: session.csrfToken, cspNonce: nonce, stats: dashboard.stats, window: metricsWindow, trend }));
    }`,
    'Metrics route',
  );
});
