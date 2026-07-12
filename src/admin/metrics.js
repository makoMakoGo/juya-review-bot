const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_REPOSITORY_LIMIT = 10;
const MAX_REPOSITORY_LIMIT = 100;

export const DEFAULT_METRICS_WINDOW = '7d';
export const DEFAULT_METRICS_TREND = 'chart';

export const METRICS_WINDOWS = Object.freeze([
  Object.freeze({ id: '24h', label: '24h', widthMs: DAY_MS }),
  Object.freeze({ id: '7d', label: '7d', widthMs: 7 * DAY_MS }),
  Object.freeze({ id: '30d', label: '30d', widthMs: 30 * DAY_MS }),
  Object.freeze({ id: 'all', label: 'All', widthMs: null }),
]);

export const METRICS_TRENDS = Object.freeze([
  Object.freeze({ id: 'chart', label: 'Chart' }),
  Object.freeze({ id: 'data', label: 'Data' }),
]);

const METRICS_WINDOW_BY_ID = new Map(METRICS_WINDOWS.map(item => [item.id, item]));
const METRICS_TREND_IDS = new Set(METRICS_TRENDS.map(item => item.id));

export function normalizeMetricsWindow(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === '') return DEFAULT_METRICS_WINDOW;
  if (!METRICS_WINDOW_BY_ID.has(normalized)) {
    throw new RangeError(`window must be one of: ${METRICS_WINDOWS.map(item => item.id).join(', ')}`);
  }
  return normalized;
}

export function normalizeMetricsTrend(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === '') return DEFAULT_METRICS_TREND;
  if (!METRICS_TREND_IDS.has(normalized)) {
    throw new RangeError(`trend must be one of: ${METRICS_TRENDS.map(item => item.id).join(', ')}`);
  }
  return normalized;
}

export function buildMetricsView(stats = {}, requestedWindow = '', options = {}) {
  const normalizedStats = objectValue(stats);
  const selectedWindow = normalizeMetricsWindow(requestedWindow);
  const metricsWindow = METRICS_WINDOW_BY_ID.get(selectedWindow);
  const total = objectValue(normalizedStats.total);
  const windows = objectValue(normalizedStats.windows);
  const bucket = selectedWindow === 'all' ? total : objectValue(windows[selectedWindow]);
  const repositoryLimit = normalizeRepositoryLimit(options.repositoryLimit ?? DEFAULT_REPOSITORY_LIMIT);

  const repositories = Object.entries(objectValue(bucket.repositories))
    .map(([name, value]) => {
      const repository = objectValue(value);
      return {
        name,
        ...repository,
        jobs: metricNumber(repository.jobs, `repository ${name} jobs`),
      };
    })
    .sort((left, right) => right.jobs - left.jobs || left.name.localeCompare(right.name))
    .slice(0, repositoryLimit);

  const failureKinds = Object.entries(objectValue(bucket.failureKinds))
    .map(([kind, count]) => ({ kind, count: metricNumber(count, `failure count for ${kind}`) }))
    .filter(item => item.count > 0)
    .sort((left, right) => right.count - left.count || left.kind.localeCompare(right.kind));

  const dailyTrend = selectDailyTrend(normalizedStats.dailyTrend, metricsWindow, options.now);
  const windowRows = METRICS_WINDOWS.map(item => ({
    ...item,
    bucket: item.id === 'all' ? total : objectValue(windows[item.id]),
  }));

  return {
    selectedWindow,
    metricsWindow,
    bucket,
    repositories,
    failureKinds,
    dailyTrend,
    windowRows,
  };
}

function selectDailyTrend(rows, metricsWindow, nowValue) {
  const sorted = Array.isArray(rows)
    ? rows.filter(row => row && typeof row === 'object' && typeof row.day === 'string')
      .slice()
      .sort((left, right) => left.day.localeCompare(right.day))
    : [];
  if (metricsWindow.widthMs == null) return sorted;

  const now = nowValue == null ? Date.now() : new Date(nowValue).getTime();
  if (!Number.isFinite(now)) throw new TypeError('now must be a valid timestamp');
  const cutoff = new Date(now - metricsWindow.widthMs).toISOString().slice(0, 10);
  return sorted.filter(row => row.day >= cutoff);
}

function normalizeRepositoryLimit(value) {
  if (!Number.isSafeInteger(value) || value < 1) throw new TypeError('repositoryLimit must be a positive integer');
  return Math.min(value, MAX_REPOSITORY_LIMIT);
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function metricNumber(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
  return value;
}
