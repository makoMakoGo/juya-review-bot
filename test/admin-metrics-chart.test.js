import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMetricsTrendChart, renderMetricsTrendChart } from '../src/admin/metrics-chart.js';

function day(offset) {
  return new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
}

test('metrics trend chart maps jobs and success rate onto independent axes', () => {
  const chart = buildMetricsTrendChart([
    { day: day(0), jobs: 0, successRate: 0.5 },
    { day: day(1), jobs: 5, successRate: null },
    { day: day(2), jobs: 10, successRate: 1 },
  ]);

  assert.equal(chart.renderable, true);
  assert.equal(chart.jobsMax, 10);
  assert.equal(chart.points[0].x, chart.plot.left);
  assert.equal(chart.points.at(-1).x, chart.plot.left + chart.plotWidth);
  assert.equal(chart.points[0].jobsY, chart.plot.top + chart.plotHeight);
  assert.equal(chart.points.at(-1).jobsY, chart.plot.top);
  assert.equal(chart.points[0].successY, chart.plot.top + chart.plotHeight / 2);
  assert.equal(chart.points[1].successY, null);
  assert.equal((chart.successPath.match(/M/g) ?? []).length, 2);
});

test('metrics trend chart samples long histories while preserving endpoints', () => {
  const rows = Array.from({ length: 100 }, (_, index) => ({
    day: day(index),
    jobs: index,
    successRate: index / 100,
  }));
  const chart = buildMetricsTrendChart(rows, { maxPoints: 10 });

  assert.equal(chart.sourceCount, 100);
  assert.equal(chart.points.length, 10);
  assert.equal(chart.points[0].day, rows[0].day);
  assert.equal(chart.points.at(-1).day, rows.at(-1).day);
});

test('metrics trend chart requires canonical daily metric types', () => {
  assert.throws(
    () => buildMetricsTrendChart([{ day: day(0), jobs: '3', successRate: 1 }, { day: day(1), jobs: 4, successRate: 1 }]),
    /jobs must be a non-negative safe integer/,
  );
  assert.throws(
    () => buildMetricsTrendChart([{ day: day(0), jobs: 3, successRate: 1.1 }, { day: day(1), jobs: 4, successRate: 1 }]),
    /successRate must be null or a number between 0 and 1/,
  );
  assert.throws(
    () => buildMetricsTrendChart([{ day: day(1), jobs: 3, successRate: 1 }, { day: day(0), jobs: 4, successRate: 1 }]),
    /unique ascending days/,
  );
});

test('metrics trend chart renders accessible token-based SVG and point titles', () => {
  const html = renderMetricsTrendChart([
    { day: day(0), jobs: 3, successRate: 0.5 },
    { day: day(1), jobs: 7, successRate: 1 },
  ]);

  assert.match(html, /class="metrics-trend-chart"/);
  assert.match(html, /role="img" aria-labelledby="metrics-trend-title metrics-trend-desc"/);
  assert.match(html, /stroke="var\(--accent\)"/);
  assert.match(html, /stroke="var\(--success\)"/);
  assert.match(html, /<title>2026-01-01: 3 jobs<\/title>/);
  assert.match(html, /<title>2026-01-02: 100% success<\/title>/);
  assert.match(html, /Exact values follow in the table\./);
});

test('metrics trend chart omits the visual until two days are available', () => {
  assert.equal(renderMetricsTrendChart([]), '');
  assert.equal(renderMetricsTrendChart([{ day: day(0), jobs: 3, successRate: 1 }]), '');
});
