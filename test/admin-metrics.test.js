import test from 'node:test';
import assert from 'node:assert/strict';

import { AdminRouter } from '../src/admin/router.js';
import { buildMetricsView, DEFAULT_METRICS_WINDOW, normalizeMetricsWindow } from '../src/admin/metrics.js';
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
    { day: '2026-07-01', jobs: 1, successRate: 1 },
    { day: '2026-07-05', jobs: 2, successRate: 0.5 },
    { day: '2026-07-11', jobs: 3, successRate: 1 },
  ],
};

test('metrics window normalization is explicit and stable', () => {
  assert.equal(DEFAULT_METRICS_WINDOW, '7d');
  assert.equal(normalizeMetricsWindow('24H'), '24h');
  assert.equal(normalizeMetricsWindow('all'), 'all');
  assert.throws(() => normalizeMetricsWindow('unknown'), /window must be one of/);
});

test('metrics view selects one bucket and sorts high-signal tables', () => {
  const view = buildMetricsView(stats, '7d', { now: '2026-07-11T12:00:00.000Z' });
  assert.equal(view.bucket.jobs, 7);
  assert.deepEqual(view.repositories.map(repo => repo.name), ['alpha/repo', 'zeta/repo']);
  assert.deepEqual(view.failureKinds, [{ kind: 'git_error', count: 1 }]);
  assert.deepEqual(view.dailyTrend.map(day => day.day), ['2026-07-05', '2026-07-11']);
  assert.deepEqual(view.windowRows.map(row => row.id), ['24h', '7d', '30d', 'all']);
});

test('metrics page renders a shareable selected scope and escapes repository names', () => {
  const unsafe = structuredClone(stats);
  unsafe.windows['7d'].repositories['<script>alert(1)</script>'] = { jobs: 99, successRate: 0, failed: 99 };
  const html = renderMetricsPage({ stats: unsafe, window: '7d' });

  assert.match(html, /href="\/admin\/metrics\?window=7d" aria-current="page"/);
  assert.match(html, /<div class="v">7<\/div>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /id="metrics-comparison-title" data-i18n="th_window"/);
});

test('metrics route preserves the selected window and rejects unknown values', async () => {
  const sessions = createSessionStore();
  const session = sessions.create();
  const router = new AdminRouter({
    adminPassword: 'correct horse battery staple',
    secureCookies: false,
    sessions,
    loadDashboard: async () => ({ stats }),
  });
  const cookie = createSessionCookie(session.id, { secure: false }).split(';', 1)[0];
  const request = url => ({ method: 'GET', url, headers: { host: 'localhost', cookie }, remoteAddress: '127.0.0.1' });

  const selected = await router.route(request('/admin/metrics?window=30d'));
  assert.equal(selected.status, 200);
  assert.match(selected.body, /href="\/admin\/metrics\?window=30d" aria-current="page"/);
  assert.match(selected.body, /<div class="v">30<\/div>/);

  const invalid = await router.route(request('/admin/metrics?window=year'));
  assert.equal(invalid.status, 400);
  assert.match(invalid.body, /window must be one of/);
});
