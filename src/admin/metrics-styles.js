export function metricsStyles() {
  return `
.metrics-page { display: grid; gap: 16px; min-width: 0; }
.metrics-page * { box-sizing: border-box; }
.metrics-toolbar { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.metrics-toolbar .page-desc { margin: 0; }
.metrics-segmented { display: inline-flex; align-items: center; max-width: 100%; gap: 2px; padding: 3px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-subtle); }
.metrics-segmented a { display: inline-flex; align-items: center; justify-content: center; min-width: 0; min-height: 28px; padding: 4px 11px; border: 1px solid transparent; border-radius: 6px; color: var(--fg-muted); font-size: 12px; font-weight: 500; line-height: 1; text-decoration: none; white-space: nowrap; }
.metrics-segmented a:hover { color: var(--text); background: var(--bg); text-decoration: none; }
.metrics-segmented a[aria-current="page"] { color: var(--accent); background: var(--bg); border-color: var(--accent-border); box-shadow: var(--shadow-flat); font-weight: 600; }
.metrics-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 154px), 1fr)); gap: 1px; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--border); box-shadow: var(--shadow-flat); }
.metrics-summary-item { min-width: 0; padding: 15px 16px; background: var(--bg); }
.metrics-summary-label { color: var(--fg-muted); font-size: 11px; font-weight: 600; }
.metrics-summary-value { margin-top: 5px; color: var(--text); font-size: 22px; font-weight: 650; line-height: 1.15; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.metrics-summary-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 7px; }
.metrics-summary-pair span { display: grid; gap: 2px; min-width: 0; }
.metrics-summary-pair small { color: var(--fg-subtle); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.metrics-summary-pair strong { color: var(--text); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-section-heading { display: grid; gap: 2px; min-width: 0; }
.metrics-section-heading small { color: var(--fg-subtle); font-size: 11px; font-weight: 500; }
.metrics-trend-body { min-width: 0; padding: 16px; }
.metrics-chart-wrap { min-width: 0; max-width: 100%; }
.metrics-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 16px; min-width: 0; }
.metrics-list { list-style: none; margin: 0; padding: 0; }
.metrics-list-item { display: grid; gap: 8px; min-width: 0; padding: 13px 16px; border-bottom: 1px solid var(--border); }
.metrics-list-item:last-child { border-bottom: 0; }
.metrics-list-line { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, auto); align-items: baseline; gap: 12px; min-width: 0; }
.metrics-list-name { min-width: 0; overflow: hidden; color: var(--text); font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.metrics-list-meta { min-width: 0; color: var(--fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; text-align: right; }
.metrics-bar { height: 4px; overflow: hidden; border-radius: 999px; background: var(--bg-subtle); }
.metrics-bar-fill { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.metrics-failure-list .metrics-bar-fill { background: var(--attention); }
.metrics-day-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 238px), 1fr)); gap: 12px; }
.metrics-day { min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); }
.metrics-day time { display: block; padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-day-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.metrics-day-value { display: grid; gap: 2px; min-width: 0; padding: 9px 12px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.metrics-day-value:nth-child(2n) { border-right: 0; }
.metrics-day-value:nth-last-child(-n + 2) { border-bottom: 0; }
.metrics-day-value small { overflow: hidden; color: var(--fg-subtle); font-size: 10px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.metrics-day-value strong { color: var(--text); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 1px; overflow: hidden; background: var(--border); }
.metrics-comparison-item { min-width: 0; padding: 14px 16px; background: var(--bg); }
.metrics-comparison-item[aria-current="true"] { background: var(--accent-subtle); }
.metrics-comparison-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; margin-bottom: 10px; }
.metrics-comparison-title strong { min-width: 0; color: var(--text); font-size: 13px; }
.metrics-comparison-title span { color: var(--fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.metrics-comparison-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.metrics-comparison-value { display: grid; gap: 2px; min-width: 0; }
.metrics-comparison-value small { overflow: hidden; color: var(--fg-subtle); font-size: 10px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.metrics-comparison-value strong { color: var(--text); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metrics-empty { padding: 28px 16px; color: var(--fg-muted); text-align: center; }
@media (max-width: 640px) {
  .metrics-toolbar { align-items: stretch; }
  .metrics-toolbar .metrics-segmented { width: 100%; }
  .metrics-toolbar .metrics-segmented a { flex: 1 1 0; }
  .metrics-trend-body { padding: 12px; }
  .metrics-day-grid { grid-template-columns: 1fr; }
  .metrics-section-heading small { display: none; }
  .metrics-list-line { grid-template-columns: 1fr; gap: 3px; }
  .metrics-list-meta { text-align: left; }
}
`;
}
