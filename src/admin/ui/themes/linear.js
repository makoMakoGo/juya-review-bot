// Skin: linear — Linear/Vercel dark-first reskin, scoped overrides over the primer base.
// Extracted from branch preview/linear. Only rules that differ from the base
// (github-prime-style) are included; the base stylesheet remains the skeleton.
export const linearSkin = `
/* ── linear tokens (light variant) ── */
:root[data-skin="linear"] {
  /* from base styles */
  color-scheme: light;
  /* ── Linear/Vercel design tokens (light variant) — shared contract ── */
  --canvas-default: #ffffff;
  --canvas-subtle: #f7f7f8;
  --canvas-inset: #f1f1f3;
  --border-default: rgba(0, 0, 0, 0.08);
  --border-muted: rgba(0, 0, 0, 0.06);
  --fg-default: #23252a;
  --fg-muted: #6e7078;
  --accent-fg: #5e6ad2;
  --success-fg: #2f9461;
  --danger-fg: #dc4c4c;
  --attention-fg: #b07d10;
  --radius: 8px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  /* subtle tinted fills for labels, pills and flashes */
  --accent-subtle: rgba(94, 106, 210, 0.10);
  --success-subtle: rgba(47, 148, 97, 0.10);
  --danger-subtle: rgba(220, 76, 76, 0.08);
  --attention-subtle: rgba(242, 201, 76, 0.22);
  --neutral-subtle: rgba(0, 0, 0, 0.05);
  --done: #8a5cf6;
  --done-subtle: rgba(138, 92, 246, 0.10);
  --accent-border: rgba(94, 106, 210, 0.30);
  --success-border: rgba(47, 148, 97, 0.30);
  --danger-border: rgba(220, 76, 76, 0.30);
  --attention-border: rgba(176, 125, 16, 0.30);
  --done-border: rgba(138, 92, 246, 0.30);
  --btn-border: rgba(0, 0, 0, 0.08);
  --primary-bg: #5e6ad2;
  --primary-bg-hover: #4f5bbf;
  /* legacy aliases — existing components reference these names */
  --bg: var(--canvas-default);
  --surface: var(--canvas-subtle);
  --surface-2: #efeff1;
  --surface-3: #e6e6e9;
  --surface-bar: var(--canvas-default);
  --surface-panel: var(--canvas-default);
  --border: var(--border-default);
  --border-bright: rgba(0, 0, 0, 0.16);
  --text: var(--fg-default);
  --muted: var(--fg-muted);
  --faint: #8a8d94;
  --fg: var(--fg-default);
  --fg-subtle: #8a8d94;
  --cyan: var(--accent-fg);
  --cyan-soft: rgba(94, 106, 210, 0.12);
  --green: var(--success-fg);
  --green-soft: rgba(47, 148, 97, 0.10);
  --amber: var(--attention-fg);
  --amber-soft: rgba(176, 125, 16, 0.12);
  --red: var(--danger-fg);
  --red-soft: rgba(220, 76, 76, 0.08);
  --ok: var(--success-fg);
  --warn: var(--attention-fg);
  --fail: var(--danger-fg);
  --run: var(--accent-fg);
  --queued: var(--fg-subtle);
  --accent: var(--accent-fg);
  --link: var(--accent-fg);
  --link-hover: #4f5bbf;
  --link-shadow: none;
  --success: var(--success-fg);
  --attention: var(--attention-fg);
  --danger: var(--danger-fg);
  --neutral-fg: var(--fg-muted);
  --bg-subtle: var(--canvas-subtle);
  --bg-inset: var(--canvas-inset);
  --bg-over: #e6e6e9;
  --radius-sm: 6px;
  --radius-pill: 999px;
  --r: var(--radius-sm);
  --r-lg: var(--radius);
  /* elevation is intentionally flat — 1px hairline borders instead of shadows */
  --shadow-card: none;
  --shadow-flat: none;
  /* from dashboard styles */
  --dashboard-success-subtle: rgba(47, 148, 97, 0.10);
  --dashboard-success-border: rgba(47, 148, 97, 0.30);
  --dashboard-accent-subtle: rgba(94, 106, 210, 0.10);
  --dashboard-accent-border: rgba(94, 106, 210, 0.30);
  --dashboard-attention-subtle: rgba(242, 201, 76, 0.22);
  --dashboard-attention-border: rgba(176, 125, 16, 0.30);
  --dashboard-danger-subtle: rgba(220, 76, 76, 0.08);
  --dashboard-danger-border: rgba(220, 76, 76, 0.30);
  --dashboard-neutral-subtle: var(--canvas-subtle);
}

/* ── linear tokens (dark variant — the skin's default palette) ── */
:root[data-skin="linear"][data-theme="dark"] {
  /* from base styles */
  color-scheme: dark;
  --canvas-default: #0a0a0a;
  --canvas-subtle: #141416;
  --canvas-inset: #050505;
  --border-default: rgba(255, 255, 255, 0.08);
  --border-muted: rgba(255, 255, 255, 0.06);
  --fg-default: #f7f8f8;
  --fg-muted: #8a8f98;
  --accent-fg: #828fff;
  --success-fg: #4cb782;
  --danger-fg: #f07070;
  --attention-fg: #f2c94c;
  --accent-subtle: rgba(130, 143, 255, 0.14);
  --success-subtle: rgba(76, 183, 130, 0.13);
  --danger-subtle: rgba(240, 112, 112, 0.12);
  --attention-subtle: rgba(242, 201, 76, 0.12);
  --neutral-subtle: rgba(255, 255, 255, 0.07);
  --done: #bb87fc;
  --done-subtle: rgba(187, 135, 252, 0.13);
  --accent-border: rgba(130, 143, 255, 0.30);
  --success-border: rgba(76, 183, 130, 0.32);
  --danger-border: rgba(240, 112, 112, 0.32);
  --attention-border: rgba(242, 201, 76, 0.30);
  --done-border: rgba(187, 135, 252, 0.32);
  --btn-border: rgba(255, 255, 255, 0.08);
  --primary-bg: #5e6ad2;
  --primary-bg-hover: #6a73e0;
  --surface-2: #1a1a1d;
  --surface-3: #232327;
  --border-bright: rgba(255, 255, 255, 0.16);
  --faint: #62666d;
  --fg-subtle: #62666d;
  --bg-over: #232327;
  --cyan: var(--accent-fg);
  --cyan-soft: rgba(130, 143, 255, 0.14);
  --green: var(--success-fg);
  --green-soft: rgba(76, 183, 130, 0.12);
  --amber: var(--attention-fg);
  --amber-soft: rgba(242, 201, 76, 0.12);
  --red: var(--danger-fg);
  --red-soft: rgba(240, 112, 112, 0.10);
  --link: var(--accent-fg);
  --link-hover: #a5abff;
  --shadow-card: none;
  --shadow-flat: none;
  /* from dashboard styles */
  --dashboard-success-subtle: rgba(76, 183, 130, 0.13);
  --dashboard-success-border: rgba(76, 183, 130, 0.32);
  --dashboard-accent-subtle: rgba(130, 143, 255, 0.14);
  --dashboard-accent-border: rgba(130, 143, 255, 0.30);
  --dashboard-attention-subtle: rgba(242, 201, 76, 0.12);
  --dashboard-attention-border: rgba(242, 201, 76, 0.30);
  --dashboard-danger-subtle: rgba(240, 112, 112, 0.12);
  --dashboard-danger-border: rgba(240, 112, 112, 0.32);
  --dashboard-neutral-subtle: rgba(255, 255, 255, 0.07);
}

/* ── base overrides ── */
[data-skin="linear"] body {
  margin: 0;
  background-color: var(--canvas-default);
  color: var(--fg-default);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
[data-skin="linear"] h1, [data-skin="linear"] h2, [data-skin="linear"] h3, [data-skin="linear"] h4 { font-weight: 600; letter-spacing: -0.01em; }
[data-skin="linear"] .app { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
[data-skin="linear"] .side {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  background: var(--canvas-default);
  border-right: 1px solid var(--border-muted);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
[data-skin="linear"] .side .brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--fg-default);
  text-decoration: none;
}
[data-skin="linear"] .brand-icon { object-fit: cover; border: 1px solid var(--border-muted); border-radius: 8px; flex: none; }
[data-skin="linear"] .side .brand-tag {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-muted);
  border: 1px solid var(--border-muted);
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  line-height: 1.4;
}
[data-skin="linear"] .nav a {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-muted);
  text-decoration: none;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 450;
}
[data-skin="linear"] .nav a:hover { background: var(--canvas-subtle); color: var(--fg-default); text-decoration: none; }
[data-skin="linear"] .nav a.active { background: var(--accent-subtle); color: var(--accent-fg); font-weight: 550; }
[data-skin="linear"] header.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 28px;
  background: var(--canvas-default);
  border-bottom: 1px solid var(--border-muted);
}
[data-skin="linear"] .topbar .crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-muted); }
[data-skin="linear"] h1.page-title { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 4px; color: var(--fg-default); line-height: 1.25; }
[data-skin="linear"] .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--fg-default);
  background: var(--canvas-subtle);
  border: 1px solid var(--btn-border);
  padding: 5px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  min-height: 32px;
  text-transform: none;
  letter-spacing: 0;
}
[data-skin="linear"] .btn-primary { background: var(--primary-bg); border-color: var(--btn-border); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16); }
[data-skin="linear"] .strip .num { font-size: 2.5rem; font-weight: 300; letter-spacing: -0.02em; line-height: 1; font-family: var(--font-sans); font-variant-numeric: tabular-nums; }
[data-skin="linear"] button, [data-skin="linear"] input, [data-skin="linear"] select {
  font-family: var(--font-sans);
  color: var(--fg-default);
  background: var(--surface-2);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 13px;
}
[data-skin="linear"] button.primary {
  background: var(--primary-bg);
  color: #fff;
  border: 1px solid var(--btn-border);
  font-weight: 500;
  padding: 0.45rem 0.95rem;
  text-transform: none;
  letter-spacing: 0;
  min-height: 32px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}
[data-skin="linear"] .login-body { min-height: 100vh; background: var(--canvas-default); }
[data-skin="linear"] .login-card {
  background: var(--canvas-subtle);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius);
  padding: 20px;
  font-size: 14px;
}

/* ── dashboard overrides ── */
[data-skin="linear"] .dashboard .st .v { font-size: 20px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.25; color: var(--fg-default); }

/* ── jobs overrides ── */
[data-skin="linear"] .jobs-page .chip.on { color: var(--accent-fg); background: var(--accent-subtle); border-color: var(--accent-border); font-weight: 600; }

/* ── config overrides ── */
[data-skin="linear"] .settings-subnav-link.is-active { background: var(--accent-subtle); color: var(--accent-fg); font-weight: 600; }

/* ── metrics overrides ── */
[data-skin="linear"] .metrics-summary-value { margin-top: 4px; color: var(--fg-default); font-size: 26px; font-weight: 300; letter-spacing: -0.01em; line-height: 1.2; font-variant-numeric: tabular-nums; }
[data-skin="linear"] .metrics-summary-pair strong { color: var(--fg-default); font-size: 18px; font-weight: 500; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
[data-skin="linear"] .metrics-bar { height: 4px; overflow: hidden; border-radius: 999px; background: var(--canvas-subtle); }
[data-skin="linear"] .metrics-day-value strong { color: var(--fg-default); font-size: 14px; font-weight: 500; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
[data-skin="linear"] .metrics-comparison-value strong { color: var(--fg-default); font-size: 14px; font-weight: 500; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

/* ── chart overrides ── */
[data-skin="linear"] .metrics-trend-chart text { fill:var(--fg-muted);font-family:var(--font-mono);font-size:11px }
[data-skin="linear"] .metrics-trend-chart .metric-chart-jobs-area { fill:var(--accent-fg);fill-opacity:.06 }
[data-skin="linear"] .metrics-trend-chart .metric-chart-jobs-line { fill:none;stroke:var(--accent-fg);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke }

/* ── base rules deleted by this skin (neutralized so they do not leak through) ── */
/* linear removes the left accent bar on the active nav item (uses accent fill instead) */
[data-skin="linear"] .nav a.active::before { content: none; }
`;
