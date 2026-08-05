const CHART_WIDTH = 800;
const CHART_HEIGHT = 320;
const PLOT = Object.freeze({ left: 56, right: 58, top: 58, bottom: 44 });
const MAX_CHART_POINTS = 31;
const JOB_TICK_COUNT = 4;
const SUCCESS_TICKS = Object.freeze([0, 0.5, 1]);

export function buildMetricsTrendChart(rows, options = {}) {
  if (!Array.isArray(rows)) throw new TypeError('daily trend rows must be an array');
  const maxPoints = normalizeMaxPoints(options.maxPoints ?? MAX_CHART_POINTS);
  const normalized = rows.map(normalizeTrendRow);
  assertStrictlyIncreasingDays(normalized);
  const sampled = sampleRows(normalized, maxPoints);
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;

  if (sampled.length < 2) {
    return {
      renderable: false,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      sourceCount: normalized.length,
      points: sampled,
    };
  }

  const firstTime = sampled[0].time;
  const lastTime = sampled.at(-1).time;
  const jobsMax = niceCeiling(Math.max(...sampled.map(row => row.jobs), 0));
  const points = sampled.map(row => {
    const x = PLOT.left + ((row.time - firstTime) / (lastTime - firstTime)) * plotWidth;
    return {
      ...row,
      x: coordinate(x),
      jobsY: coordinate(PLOT.top + plotHeight - (row.jobs / jobsMax) * plotHeight),
      successY: row.successRate == null
        ? null
        : coordinate(PLOT.top + plotHeight - row.successRate * plotHeight),
    };
  });
  const hasSuccessSeries = points.some(point => point.successY != null);
  const plotBottom = PLOT.top + plotHeight;

  return {
    renderable: true,
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    plot: PLOT,
    plotWidth,
    plotHeight,
    plotBottom,
    sourceCount: normalized.length,
    jobsMax,
    jobsTicks: buildJobsTicks(jobsMax, plotHeight),
    successTicks: hasSuccessSeries
      ? SUCCESS_TICKS.map(value => ({
        value,
        y: coordinate(PLOT.top + plotHeight - value * plotHeight),
      }))
      : [],
    xTicks: selectXTicks(points),
    points,
    hasSuccessSeries,
    jobsPath: linePath(points, point => point.jobsY),
    jobsAreaPath: areaPath(points, plotBottom, point => point.jobsY),
    successPath: linePath(points, point => point.successY),
  };
}

export function renderMetricsTrendChart(rows, options = {}) {
  const chart = buildMetricsTrendChart(rows, options);
  if (!chart.renderable) return '';

  const plotRight = chart.plot.left + chart.plotWidth;
  const grid = chart.jobsTicks.map((tick, index) => {
    const edge = index === 0 || index === chart.jobsTicks.length - 1;
    const secondary = edge ? '' : ' metric-chart-secondary';
    return `<g class="metric-chart-grid${secondary}"><line x1="${chart.plot.left}" y1="${tick.y}" x2="${plotRight}" y2="${tick.y}"/><text x="${chart.plot.left - 12}" y="${tick.y + 4}" text-anchor="end">${formatCompactNumber(tick.value)}</text></g>`;
  }).join('');
  const successLabels = chart.successTicks.map((tick, index) => {
    const secondary = index === 1 ? ' metric-chart-secondary' : '';
    return `<text class="metric-chart-success-label${secondary}" x="${plotRight + 12}" y="${tick.y + 4}">${Math.round(tick.value * 100)}%</text>`;
  }).join('');
  const xLabels = chart.xTicks.map((tick, index) => {
    const secondary = index > 0 && index < chart.xTicks.length - 1 ? ' metric-chart-secondary' : '';
    return `<text class="metric-chart-x-label${secondary}" x="${tick.x}" y="${chart.plotBottom + 28}" text-anchor="middle">${tick.day.slice(5)}</text>`;
  }).join('');
  const jobsPoints = chart.points.map(point => `<circle class="metric-chart-point metric-chart-point-jobs" cx="${point.x}" cy="${point.jobsY}" r="3.5"><title>${point.day}: ${point.jobs} jobs</title></circle>`).join('');
  const successPoints = chart.points.filter(point => point.successY != null).map(point => `<circle class="metric-chart-point metric-chart-point-success" cx="${point.x}" cy="${point.successY}" r="3.5"><title>${point.day}: ${formatPercent(point.successRate)} success</title></circle>`).join('');
  const sampleDescription = chart.sourceCount > chart.points.length
    ? `Showing ${chart.points.length} sampled days from ${chart.sourceCount}; exact values are available in Data view.`
    : 'Exact values are available in Data view.';
  const successLegend = chart.hasSuccessSeries
    ? `<g class="metric-chart-legend-item"><line class="metric-chart-success-line" x1="${chart.plot.left + 112}" y1="22" x2="${chart.plot.left + 136}" y2="22"/><text x="${chart.plot.left + 145}" y="26" data-i18n="th_success_rate">Success rate</text></g>`
    : '';

  return `<svg class="metrics-trend-chart" viewBox="0 0 ${chart.width} ${chart.height}" style="display:block;width:100%;height:auto;max-width:100%" role="img" aria-labelledby="metrics-trend-title metrics-trend-desc" preserveAspectRatio="xMidYMid meet" focusable="false">
<style>
.metrics-trend-chart text{fill:var(--fg-muted);font-family:var(--font-sans);font-size:11px}
.metrics-trend-chart .metric-chart-grid line{stroke:var(--border-muted);stroke-width:1;vector-effect:non-scaling-stroke}
.metrics-trend-chart .metric-chart-jobs-area{fill:var(--accent-fg);fill-opacity:.08}
.metrics-trend-chart .metric-chart-jobs-line{fill:none;stroke:var(--accent-fg);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.metrics-trend-chart .metric-chart-success-line{fill:none;stroke:var(--success-fg);stroke-width:1.5;stroke-dasharray:4 4;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.metrics-trend-chart .metric-chart-point{fill:var(--canvas-default);stroke-width:1.5;vector-effect:non-scaling-stroke}
.metrics-trend-chart .metric-chart-point-jobs{stroke:var(--accent-fg)}
.metrics-trend-chart .metric-chart-point-success{stroke:var(--success-fg)}
@media(max-width:640px){.metrics-trend-chart .metric-chart-secondary{display:none}.metrics-trend-chart text{font-size:12px}}
</style>
<title id="metrics-trend-title">Daily jobs and success rate</title>
<desc id="metrics-trend-desc">${chart.points[0].day} through ${chart.points.at(-1).day}. ${sampleDescription}</desc>
<g aria-hidden="true">
  <g class="metric-chart-legend-item"><line class="metric-chart-jobs-line" x1="${chart.plot.left}" y1="22" x2="${chart.plot.left + 24}" y2="22"/><text x="${chart.plot.left + 33}" y="26" data-i18n="th_jobs">Jobs</text></g>
  ${successLegend}
  ${grid}
  ${successLabels}
  ${xLabels}
</g>
<path class="metric-chart-jobs-area" d="${chart.jobsAreaPath}" aria-hidden="true"/>
<path class="metric-chart-jobs-line" d="${chart.jobsPath}" aria-hidden="true"/>
${chart.successPath ? `<path class="metric-chart-success-line" d="${chart.successPath}" aria-hidden="true"/>` : ''}
${jobsPoints}${successPoints}
</svg>`;
}

function normalizeTrendRow(row, index) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new TypeError(`daily trend row ${index} must be an object`);
  if (typeof row.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.day)) throw new TypeError(`daily trend row ${index} day must use YYYY-MM-DD`);
  const time = Date.parse(`${row.day}T00:00:00.000Z`);
  if (!Number.isFinite(time)) throw new TypeError(`daily trend row ${index} day must be valid`);
  if (!Number.isSafeInteger(row.jobs) || row.jobs < 0) throw new TypeError(`daily trend row ${index} jobs must be a non-negative safe integer`);
  if (row.successRate != null && (!Number.isFinite(row.successRate) || row.successRate < 0 || row.successRate > 1)) {
    throw new TypeError(`daily trend row ${index} successRate must be null or a number between 0 and 1`);
  }
  return { day: row.day, time, jobs: row.jobs, successRate: row.successRate ?? null };
}

function assertStrictlyIncreasingDays(rows) {
  for (let index = 1; index < rows.length; index += 1) {
    if (rows[index].time <= rows[index - 1].time) throw new TypeError('daily trend rows must have unique ascending days');
  }
}

function normalizeMaxPoints(value) {
  if (!Number.isSafeInteger(value) || value < 2) throw new TypeError('maxPoints must be an integer >= 2');
  return value;
}

function sampleRows(rows, maxPoints) {
  if (rows.length <= maxPoints) return rows;
  const sampled = [];
  let previousIndex = -1;
  for (let slot = 0; slot < maxPoints; slot += 1) {
    const index = Math.round((slot * (rows.length - 1)) / (maxPoints - 1));
    if (index === previousIndex) continue;
    sampled.push(rows[index]);
    previousIndex = index;
  }
  return sampled;
}

function buildJobsTicks(max, plotHeight) {
  return Array.from({ length: JOB_TICK_COUNT }, (_, index) => {
    const ratio = index / (JOB_TICK_COUNT - 1);
    return {
      value: max * (1 - ratio),
      y: coordinate(PLOT.top + plotHeight * ratio),
    };
  });
}

function selectXTicks(points) {
  const count = Math.min(5, points.length);
  const indexes = new Set();
  for (let slot = 0; slot < count; slot += 1) indexes.add(Math.round((slot * (points.length - 1)) / (count - 1)));
  return [...indexes].map(index => points[index]);
}

function linePath(points, selectY) {
  let path = '';
  let segmentOpen = false;
  for (const point of points) {
    const y = selectY(point);
    if (y == null) {
      segmentOpen = false;
      continue;
    }
    path += `${segmentOpen ? ' L' : path === '' ? 'M' : ' M'} ${point.x} ${y}`;
    segmentOpen = true;
  }
  return path;
}

function areaPath(points, baseline, selectY) {
  if (points.length === 0) return '';
  const path = linePath(points, selectY);
  if (!path) return '';
  return `${path} L ${points.at(-1).x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function niceCeiling(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function coordinate(value) {
  return Number(value.toFixed(2));
}

function formatCompactNumber(value) {
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}m`;
  if (value >= 1_000) return `${trimDecimal(value / 1_000)}k`;
  return trimDecimal(value);
}

function trimDecimal(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}
