export function metricsStyles() {
  return `
.metrics-page { display: grid; gap: 16px; min-width: 0; }
.metrics-page * { box-sizing: border-box; }
.metrics-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.metrics-toolbar .page-desc { margin: 0; }
.metrics-segmented { display: inline-flex; align-items: center; max-width: 100%; gap: 2px; padding: 2px; border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-subtle); }
.metrics-segmented a { display: inline-flex; align-items: center; justify-content: center; min-width: 0; min-height: 26px; padding: 2px 10px; border-radius: 4px; color: var(--fg-muted); font-size: 12px; font-weight: 500; line-height: 18px; text-decoration: none; white-space: nowrap; }
.metrics-segmented a:hover { color: var(--fg-default); text-decoration: none; }
.metrics-segmented a[aria-current="page"] { color: var(--fg-default); background: var(--canvas-default); font-weight: 600; }
.metrics-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 1px; overflow: hidden; border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--border-muted); }
.metrics-summary-item { min-width: 0; padding: 16px; background: var(--canvas-default); }
.metrics-summary-label { color: var(--fg-muted); font-size: 12px; }
.metrics-summary-value { margin-top: 4px; color: var(--fg-default); font-size: 26px; font-weight: 500; line-height: 1.2; font-variant-numeric: tabular-nums; }
.metrics-summary-pair { display: flex; gap: 16px; margin-top: 6px; }
.metrics-summary-pair span { display: grid; gap: 1px; min-width: 0; }
.metrics-summary-pair small { color: var(--fg-muted); font-size: 12px; }
.metrics-summary-pair strong { color: var(--fg-default); font-size: 18px; font-weight: 500; font-variant-numeric: tabular-nums; }
.metrics-section-heading { display: grid; gap: 1px; min-width: 0; }
.metrics-section-heading small { color: var(--fg-muted); font-size: 12px; font-weight: 400; }
.metrics-trend-body { min-width: 0; padding: 16px; }
.metrics-chart-wrap { min-width: 0; max-width: 100%; }
.metrics-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 16px; min-width: 0; }
.metrics-list { list-style: none; margin: 0; padding: 0; }
.metrics-list-item { display: grid; gap: 8px; min-width: 0; padding: 12px 16px; border-top: 1px solid var(--border-muted); }
.metrics-list-item:first-child { border-top: 0; }
.metrics-list-line { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, auto); align-items: baseline; gap: 12px; min-width: 0; }
.metrics-list-name { min-width: 0; overflow: hidden; color: var(--fg-default); font-size: 14px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.metrics-list-meta { min-width: 0; color: var(--fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; text-align: right; }
.metrics-bar { height: 6px; overflow: hidden; border-radius: 999px; background: var(--canvas-subtle); }
.metrics-bar-fill { display: block; height: 100%; border-radius: inherit; background: var(--accent-fg); }
.metrics-failure-list .metrics-bar-fill { background: var(--attention-fg); }
.metrics-day-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.metrics-day { min-width: 0; overflow: hidden; border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default); }
.metrics-day time { display: block; padding: 6px 12px; border-bottom: 1px solid var(--border-muted); background: var(--canvas-subtle); color: var(--fg-default); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-day-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.metrics-day-value { display: grid; gap: 1px; min-width: 0; padding: 8px 12px; border-right: 1px solid var(--border-muted); border-bottom: 1px solid var(--border-muted); }
.metrics-day-value:nth-child(2n) { border-right: 0; }
.metrics-day-value:nth-last-child(-n + 2) { border-bottom: 0; }
.metrics-day-value small { overflow: hidden; color: var(--fg-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.metrics-day-value strong { color: var(--fg-default); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 1px; background: var(--border-muted); }
.metrics-comparison-item { min-width: 0; padding: 14px 16px; background: var(--canvas-default); }
.metrics-comparison-item[aria-current="true"] { background: var(--canvas-subtle); }
.metrics-comparison-title { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; min-width: 0; margin-bottom: 10px; }
.metrics-comparison-title strong { min-width: 0; color: var(--fg-default); font-size: 14px; font-weight: 600; }
.metrics-comparison-title span { color: var(--fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.metrics-comparison-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; }
.metrics-comparison-value { display: grid; gap: 1px; min-width: 0; }
.metrics-comparison-value small { overflow: hidden; color: var(--fg-muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.metrics-comparison-value strong { color: var(--fg-default); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-empty { margin: 0; padding: 32px 16px; color: var(--fg-muted); font-size: 14px; text-align: center; }
@media (max-width: 640px) {
  .metrics-toolbar { align-items: stretch; }
  .metrics-toolbar .metrics-segmented { width: 100%; }
  .metrics-toolbar .metrics-segmented a { flex: 1 1 0; }
  .metrics-trend-body { padding: 12px; }
  .metrics-day-grid { grid-template-columns: 1fr; }
  .metrics-section-heading small { display: none; }
  .metrics-list-line { grid-template-columns: 1fr; gap: 2px; }
  .metrics-list-meta { text-align: left; }
}
`;
}
