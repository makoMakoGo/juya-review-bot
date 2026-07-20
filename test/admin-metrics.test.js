import test from 'node:test';
import assert from 'node:assert/strict';

import { AdminRouter } from '../src/admin/router.js';
import {
  buildMetricsView,
  DEFAULT_METRICS_TREND,
  DEFAULT_METRICS_WINDOW,
  normalizeMetricsTrend,
  normalizeMetricsWindow,
} from '../src/admin/metrics.js';
import { renderMetricsPage } from '../src/admin/metrics-page.js';
import { createSessionCookie, createSessionStore } from '../src/admin/session.js';

const stats = {
  total: {
    jobs: 40,
    failed: 8,
    successRate: 0.8,
    durationP50Ms: 10_000,
    durationP95Ms: 60_000,
    queueWaitP50Ms: 500,
    queueWaitP95Ms: 2_000,
    averageCommentsGenerated: 3,
    averageCommentsPosted: 2,
    failureKinds: { provider_unavailable: 5, git_error: 3 },
    repositories: {
      'zeta/repo': { jobs: 10, successRate: 0.7, failed: 3 },
      'alpha/repo': { jobs: 20, successRate: 0.9, failed: 2 },
    },
  },
  windows: {
    '24h': { jobs: 2, failed: 1, successRate: 0.5, failureKinds: { git_error: 1 }, repositories: { 'zeta/repo': { jobs: 2, successRate: 0.5, failed: 1 } } },
    '7d': { jobs: 7, failed: 1, successRate: 0.85, durationP50Ms: 2_000, durationP95Ms: 8_000, queueWaitP50Ms: 100, queueWaitP95Ms: 500, averageCommentsGenerated: 2.5, averageCommentsPosted: 2, failureKinds: { git_error: 1 }, repositories: { 'alpha/repo': { jobs: 5, successRate: 1, failed: 0 }, 'zeta/repo': { jobs: 2, successRate: 0.5, failed: 1 } } },
    '30d': { jobs: 30, failed: 6, successRate: 0.8, failureKinds: { provider_unavailable: 4, git_error: 2 }, repositories: {} },
  },
  dailyTrend: [
    { day: '2026-07-01', jobs: 1, failed: 0, stale: 0, skipped: 0, interrupted: 0, successRate: 1, averageCommentsGenerated: 2, averageCommentsPosted: 2 },
    { day: '2026-07-05', jobs: 2, failed: 1, stale: 0, skipped: 0, interrupted: 0, successRate: 0.5, averageCommentsGenerated: 3, averageCommentsPosted: 1.5 },
    { day: '2026-07-11', jobs: 3, failed: 0, stale: 0, skipped: 0, interrupted: 0, successRate: 1, averageCommentsGenerated: 4, averageCommentsPosted: 3 },
  ],
};

test('metrics window and trend normalization are explicit and stable', () => {
  assert.equal(DEFAULT_METRICS_WINDOW, '7d');
  assert.equal(DEFAULT_METRICS_TREND, 'chart');
  assert.equal(normalizeMetricsWindow('24H'), '24h');
  assert.equal(normalizeMetricsWindow('all'), 'all');
  assert.equal(normalizeMetricsTrend('DATA'), 'data');
  assert.throws(() => normalizeMetricsWindow('unknown'), /window must be one of/);
  assert.throws(() => normalizeMetricsTrend('table'), /trend must be one of/);
});

test('metrics view selects one bucket and sorts high-signal lists', () => {
  const view = buildMetricsView(stats, '7d', { now: '2026-07-11T12:00:00.000Z' });
  assert.equal(view.metricsWindow.id, '7d');
  assert.equal(view.bucket.jobs, 7);
  assert.deepEqual(view.repositories.map(repo => repo.name), ['alpha/repo', 'zeta/repo']);
  assert.deepEqual(view.failureKinds, [{ kind: 'git_error', count: 1 }]);
  assert.deepEqual(view.dailyTrend.map(day => day.day), ['2026-07-05', '2026-07-11']);
  assert.deepEqual(view.windowRows.map(row => row.id), ['24h', '7d', '30d', 'all']);
});

test('metrics view rejects stringly typed internal counters', () => {
  const malformed = structuredClone(stats);
  malformed.windows['7d'].repositories['alpha/repo'].jobs = '5';
  assert.throws(
    () => buildMetricsView(malformed, '7d'),
    /repository alpha\/repo jobs must be a finite number/,
  );
});

test('chart view is full-width, shareable, escaped, and contains no metrics table scroll shell', () => {
  const unsafe = structuredClone(stats);
  // Anchor trend days to the current date: the 7d window filters dailyTrend
  // against Date.now(), so fixed historical dates would age out of the window.
  const day = offsetDays => new Date(Date.now() - offsetDays * 86_400_000).toISOString().slice(0, 10);
  unsafe.dailyTrend = unsafe.dailyTrend.map((row, index) => ({ ...row, day: day(6 - index * 3) }));
  unsafe.windows['7d'].repositories['<script>alert(1)</script>'] = { jobs: 99, successRate: 0, failed: 99 };
  const html = renderMetricsPage({ stats: unsafe, window: '7d', trend: 'chart' });

  assert.match(html, /href="\/admin\/metrics\?window=7d&amp;trend=chart" aria-current="page"/);
  assert.match(html, /href="\/admin\/metrics\?window=7d&amp;trend=data"/);
  assert.match(html, /class="metrics-summary"/);
  assert.match(html, /class="metrics-trend-chart"/);
  assert.match(html, /class="metrics-list metrics-failure-list"/);
  assert.match(html, /class="metrics-comparison-grid"/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /class="table-scroll"/);
  assert.doesNotMatch(html, /<table/);
  assert.doesNotMatch(html, /min-width:560px|overflow-x:auto/);
});

test('data view replaces the chart with responsive exact-value cards', () => {
  const html = renderMetricsPage({ stats, window: 'all', trend: 'data' });
  assert.match(html, /href="\/admin\/metrics\?window=all&amp;trend=data" aria-current="page"/);
  assert.match(html, /class="metrics-day-grid"/);
  assert.match(html, /<time datetime="2026-07-11">2026-07-11<\/time>/);
  assert.match(html, /data-i18n="m_avg_post">Posted<\/small><strong>3<\/strong>/);
  assert.doesNotMatch(html, /class="metrics-trend-chart"/);
  assert.doesNotMatch(html, /<table/);
});

test('metrics route preserves both URL modes and rejects invalid values before loading data', async () => {
  const sessions = createSessionStore();
  const session = sessions.create();
  let loads = 0;
  const router = new AdminRouter({
    adminPassword: 'correct horse battery staple',
    secureCookies: false,
    sessions,
    loadDashboard: async () => {
      loads += 1;
      return { stats };
    },
  });
  const cookie = createSessionCookie(session.id, { secure: false }).split(';', 1)[0];
  const request = url => ({ method: 'GET', url, headers: { host: 'localhost', cookie }, remoteAddress: '127.0.0.1' });

  const selected = await router.route(request('/admin/metrics?window=30d&trend=data'));
  assert.equal(selected.status, 200);
  assert.match(selected.body, /href="\/admin\/metrics\?window=30d&amp;trend=data" aria-current="page"/);
  assert.match(selected.body, /class="metrics-day-grid"/);
  assert.equal(loads, 1);

  const invalidWindow = await router.route(request('/admin/metrics?window=year&trend=chart'));
  assert.equal(invalidWindow.status, 400);
  assert.match(invalidWindow.body, /window must be one of/);

  const invalidTrend = await router.route(request('/admin/metrics?window=7d&trend=table'));
  assert.equal(invalidTrend.status, 400);
  assert.match(invalidTrend.body, /trend must be one of/);
  assert.equal(loads, 1);
});
