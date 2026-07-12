import fs from 'node:fs';

function replaceBlock(path, startMarker, endMarker, replacement, completedMarker) {
  const source = fs.readFileSync(path, 'utf8');
  if (source.includes(completedMarker)) return;
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`${path}: test markers not found`);
  fs.writeFileSync(path, source.slice(0, start) + replacement + '\n\n' + source.slice(end));
}

replaceBlock(
  'test/admin-dashboard-status.test.js',
  "test('metrics page renders latency percentiles comments failure repository and daily metrics'",
  "test('service status renders actual listener port separately from configured port'",
  `test('metrics page renders a compact summary, ranked breakdowns, exact daily cards, and comparison', () => {
  const stats = {
    total: {
      jobs: 2,
      succeeded: 1,
      failed: 1,
      successRate: 0.5,
      durationP50Ms: 10 * 60 * 1000,
      durationP95Ms: 30 * 60 * 1000,
      queueWaitP50Ms: 5 * 60 * 1000,
      queueWaitP95Ms: 10 * 60 * 1000,
      averageCommentsGenerated: 4.5,
      averageCommentsPosted: 2,
      stale: 1,
      skipped: 1,
      interrupted: 1,
      failureKinds: { provider_unavailable: 1 },
      repositories: {
        'alice/repo': { jobs: 2, succeeded: 1, failed: 1, successRate: 0.5 },
      },
    },
    windows: {
      '24h': { jobs: 2, succeeded: 1, failed: 1, stale: 1, skipped: 1, interrupted: 1, successRate: 0.5, durationP50Ms: 10 * 60 * 1000, durationP95Ms: 30 * 60 * 1000, queueWaitP50Ms: 5 * 60 * 1000, queueWaitP95Ms: 10 * 60 * 1000, averageCommentsGenerated: 4.5, averageCommentsPosted: 2, failureKinds: { provider_unavailable: 1 }, repositories: { 'alice/repo': { jobs: 2, succeeded: 1, failed: 1, stale: 1, skipped: 1, interrupted: 1, successRate: 0.5 } } },
      '7d': { jobs: 2, succeeded: 1, failed: 1, successRate: 0.5, durationP50Ms: 10 * 60 * 1000, durationP95Ms: 30 * 60 * 1000, queueWaitP50Ms: 5 * 60 * 1000, queueWaitP95Ms: 10 * 60 * 1000, averageCommentsGenerated: 4.5, averageCommentsPosted: 2 },
      '30d': { jobs: 2, succeeded: 1, failed: 1, successRate: 0.5, durationP50Ms: 10 * 60 * 1000, durationP95Ms: 30 * 60 * 1000, queueWaitP50Ms: 5 * 60 * 1000, queueWaitP95Ms: 10 * 60 * 1000, averageCommentsGenerated: 4.5, averageCommentsPosted: 2 },
    },
    dailyTrend: [
      { day: '2026-06-01', jobs: 2, succeeded: 1, failed: 1, stale: 1, skipped: 1, interrupted: 1, successRate: 0.5, averageCommentsGenerated: 4.5, averageCommentsPosted: 2 },
    ],
  };

  const html = renderMetricsPage({ csrfToken: 'csrf', stats, window: 'all', trend: 'data' });
  assert.match(html, /class="metrics-summary"/);
  assert.match(html, /data-i18n="metrics_duration">Duration/);
  assert.match(html, /10m 0s/);
  assert.match(html, /30m 0s/);
  assert.match(html, /class="metrics-list metrics-failure-list"/);
  assert.match(html, /provider_unavailable/);
  assert.match(html, /alice\/repo/);
  assert.match(html, /class="metrics-day-grid"/);
  assert.match(html, /2026-06-01/);
  assert.match(html, /class="metrics-comparison-grid"/);
  assert.doesNotMatch(html, /<table|class="table-scroll"/);
});`,
  "test('metrics page renders a compact summary, ranked breakdowns, exact daily cards, and comparison'",
);

replaceBlock(
  'test/admin-review-fixes.test.js',
  "test('metrics repository table keeps numeric columns content-sized and right-aligned'",
  "test('Status last-completed cards compact diagnostic and job ids'",
  `test('metrics page uses responsive lists and cards instead of horizontally scrolling tables', () => {
  const repository = 'makoMakoGo/oh-my-pi-coding-agent-with-a-very-long-name';
  const html = renderMetricsPage({
    csrfToken: 'csrf',
    stats: {
      total: {
        jobs: 4,
        failed: 2,
        successRate: 0.5,
        repositories: {
          [repository]: { jobs: 1, successRate: 1 },
          'alice/monorepo': { jobs: 3, successRate: 0.5 },
        },
        failureKinds: { provider_unavailable: 2 },
      },
      windows: {
        '24h': { jobs: 1, successRate: 1, durationP95Ms: 1, queueWaitP95Ms: 1, averageCommentsPosted: 1 },
        '7d': { jobs: 4, successRate: 0.5, durationP95Ms: 2, queueWaitP95Ms: 2, averageCommentsPosted: 2 },
        '30d': { jobs: 4, successRate: 0.5, durationP95Ms: 2, queueWaitP95Ms: 2, averageCommentsPosted: 2 },
      },
      dailyTrend: [
        { day: '2026-07-05', jobs: 2, successRate: 1, averageCommentsGenerated: 3, averageCommentsPosted: 2, failed: 0, stale: 0, skipped: 0, interrupted: 0 },
        { day: '2026-07-06', jobs: 2, successRate: 0.5, averageCommentsGenerated: 2, averageCommentsPosted: 1, failed: 1, stale: 0, skipped: 0, interrupted: 0 },
      ],
    },
    window: 'all',
    trend: 'data',
  });
  const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.match(markup, /class="metrics-summary"/);
  assert.match(markup, /class="metrics-list-name" title="makoMakoGo\/oh-my-pi-coding-agent-with-a-very-long-name"/);
  assert.match(markup, /class="metrics-day-grid"/);
  assert.match(markup, /class="metrics-comparison-grid"/);
  assert.doesNotMatch(markup, /<table|class="table-scroll"|metrics-table/);
  assert.doesNotMatch(markup, /overflow-x:\s*auto|min-width:\s*560px/);
});`,
  "test('metrics page uses responsive lists and cards instead of horizontally scrolling tables'",
);
