const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_METRICS_WINDOW = '7d';

export const METRICS_WINDOWS = Object.freeze([
  Object.freeze({ id: '24h', label: '24h', widthMs: DAY_MS }),
  Object.freeze({ id: '7d', label: '7d', widthMs: 7 * DAY_MS }),
  Object.freeze({ id: '30d', label: '30d', widthMs: 30 * DAY_MS }),
  Object.freeze({ id: 'all', label: 'All', widthMs: null }),
]);

const METRICS_WINDOW_BY_ID = new Map(METRICS_WINDOWS.map(window => [window.id, window]));

export function normalizeMetricsWindow(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === '') return DEFAULT_METRICS_WINDOW;
  if (!METRICS_WINDOW_BY_ID.has(normalized)) {
    throw new RangeError(`window must be one of: ${METRICS_WINDOWS.map(item => item.id).join(', ')}`);
  }
  return normalized;
}

export function buildMetricsView(stats = {}, requestedWindow = '', options = {}) {
  const normalizedStats = objectValue(stats);
  const selectedWindow = normalizeMetricsWindow(requestedWindow);
  const window = METRICS_WINDOW_BY_ID.get(selectedWindow);
  const total = objectValue(normalizedStats.total);
  const windows = objectValue(normalizedStats.windows);
  const bucket = selectedWindow === 'all' ? total : objectValue(windows[selectedWindow]);
  const repositoryLimit = normalizeRepositoryLimit(options.repositoryLimit ?? 10);

  const repositories = Object.entries(objectValue(bucket.repositories))
    .map(([name, value]) => ({ name, ...objectValue(value) }))
    .sort((left, right) => numeric(right.jobs) - numeric(left.jobs) || left.name.localeCompare(right.name))
    .slice(0, repositoryLimit);

  const failureKinds = Object.entries(objectValue(bucket.failureKinds))
    .map(([kind, count]) => ({ kind, count: numeric(count) }))
    .filter(item => item.count > 0)
    .sort((left, right) => right.count - left.count || left.kind.localeCompare(right.kind));

  const dailyTrend = selectDailyTrend(normalizedStats.dailyTrend, window, options.now);
  const windowRows = METRICS_WINDOWS.map(item => ({
    ...item,
    bucket: item.id === 'all' ? total : objectValue(windows[item.id]),
  }));

  return {
    selectedWindow,
    window,
    bucket,
    repositories,
    failureKinds,
    dailyTrend,
    windowRows,
  };
}

function selectDailyTrend(rows, window, nowValue) {
  const sorted = Array.isArray(rows)
    ? rows.filter(row => row && typeof row === 'object' && typeof row.day === 'string')
      .slice()
      .sort((left, right) => left.day.localeCompare(right.day))
    : [];
  if (window.widthMs == null) return sorted;

  const now = nowValue == null ? Date.now() : new Date(nowValue).getTime();
  if (!Number.isFinite(now)) throw new TypeError('now must be a valid timestamp');
  const cutoff = new Date(now - window.widthMs).toISOString().slice(0, 10);
  return sorted.filter(row => row.day >= cutoff);
}

function normalizeRepositoryLimit(value) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new TypeError('repositoryLimit must be a positive integer');
  return Math.min(parsed, 100);
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function numeric(value) {
  return Number.isFinite(value) ? value : 0;
}
