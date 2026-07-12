const CHART_WIDTH = 760;
const CHART_HEIGHT = 304;
const PLOT = Object.freeze({ left: 54, right: 58, top: 52, bottom: 42 });
const MAX_CHART_POINTS = 31;
const JOB_TICK_COUNT = 5;
const SUCCESS_TICKS = Object.freeze([0, 0.25, 0.5, 0.75, 1]);

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
    const isBoundary = index === 0 || index === chart.jobsTicks.length - 1;
    return `<line x1="${chart.plot.left}" y1="${tick.y}" x2="${plotRight}" y2="${tick.y}" stroke="var(--border)" stroke-width="1"${isBoundary ? '' : ' stroke-dasharray="3 5"'} opacity="${isBoundary ? '0.95' : '0.72'}" vector-effect="non-scaling-stroke"/><text x="${chart.plot.left - 10}" y="${tick.y + 4}" text-anchor="end" fill="var(--fg-muted)" font-size="11">${formatCompactNumber(tick.value)}</text>`;
  }).join('');
  const successLabels = chart.successTicks.map(tick => `<text x="${plotRight + 10}" y="${tick.y + 4}" fill="var(--fg-muted)" font-size="11">${Math.round(tick.value * 100)}%</text>`).join('');
  const xLabels = chart.xTicks.map(tick => `<text x="${tick.x}" y="${chart.plotBottom + 25}" text-anchor="middle" fill="var(--fg-muted)" font-size="11">${tick.day.slice(5)}</text>`).join('');
  const jobsPoints = chart.points.map(point => `<circle cx="${point.x}" cy="${point.jobsY}" r="3.25" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"><title>${point.day}: ${point.jobs} jobs</title></circle>`).join('');
  const successPoints = chart.points.filter(point => point.successY != null).map(point => `<circle cx="${point.x}" cy="${point.successY}" r="3.25" fill="var(--bg)" stroke="var(--success)" stroke-width="2" vector-effect="non-scaling-stroke"><title>${point.day}: ${formatPercent(point.successRate)} success</title></circle>`).join('');
  const sampleDescription = chart.sourceCount > chart.points.length
    ? `Showing ${chart.points.length} sampled days from ${chart.sourceCount}; exact values follow in the table.`
    : 'Exact values follow in the table.';
  const successLegend = chart.hasSuccessSeries
    ? `<line x1="${chart.plot.left + 96}" y1="20" x2="${chart.plot.left + 118}" y2="20" stroke="var(--success)" stroke-width="2.25" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/><text x="${chart.plot.left + 126}" y="24" fill="var(--fg-muted)" font-size="12" data-i18n="th_success_rate">Success rate</text>`
    : '';

  return `<svg class="metrics-trend-chart" viewBox="0 0 ${chart.width} ${chart.height}" style="display:block;width:100%;height:auto;min-width:560px" role="img" aria-labelledby="metrics-trend-title metrics-trend-desc" preserveAspectRatio="xMidYMid meet" focusable="false">
<title id="metrics-trend-title">Daily jobs and success rate</title>
<desc id="metrics-trend-desc">${chart.points[0].day} through ${chart.points.at(-1).day}. ${sampleDescription}</desc>
<rect x="${chart.plot.left}" y="${chart.plot.top}" width="${chart.plotWidth}" height="${chart.plotHeight}" rx="6" fill="var(--bg)" stroke="var(--border)" vector-effect="non-scaling-stroke" aria-hidden="true"/>
<g aria-hidden="true" font-family="var(--font-sans)">
  <line x1="${chart.plot.left}" y1="20" x2="${chart.plot.left + 22}" y2="20" stroke="var(--accent)" stroke-width="2.25" vector-effect="non-scaling-stroke"/><text x="${chart.plot.left + 30}" y="24" fill="var(--fg-muted)" font-size="12" data-i18n="th_jobs">Jobs</text>
  ${successLegend}
  ${grid}
  ${successLabels}
  ${xLabels}
</g>
<path d="${chart.jobsAreaPath}" fill="var(--accent-subtle)" stroke="none" aria-hidden="true"/>
<path d="${chart.jobsPath}" fill="none" stroke="var(--accent)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" aria-hidden="true"/>
${chart.successPath ? `<path d="${chart.successPath}" fill="none" stroke="var(--success)" stroke-width="2.25" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" aria-hidden="true"/>` : ''}
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
  const count = Math.min(6, points.length);
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
  const line = linePath(points, selectY);
  if (!line) return '';
  return `M ${points[0].x} ${baseline} L ${points[0].x} ${selectY(points[0])}${line.slice(line.indexOf(' L'))} L ${points.at(-1).x} ${baseline} Z`;
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
