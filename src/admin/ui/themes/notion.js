// Skin: notion — Notion warm-paper reskin, scoped overrides over the primer base.
// Extracted from branch preview/notion. Only rules that differ from the base are
// included; the base stylesheet remains the shared skeleton. Every selector is
// scoped under [data-skin="notion"] so the higher specificity wins over the base.
export const notionSkin = `
/* ── Notion warm-paper design tokens (light) ── */
:root[data-skin="notion"] {
  --canvas-subtle: #f7f6f3;
  --canvas-inset: #f1f0ec;
  --border-default: #e9e9e7;
  --border-muted: #efeeea;
  --fg-default: #37352f;
  --fg-muted: #73716c;
  --accent-fg: #d9730d;
  --success-fg: #448361;
  --danger-fg: #d44c47;
  --attention-fg: #a07400;
  --radius: 8px;
  --font-sans: ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  /* soft pastel fills for Notion-style tags, pills and flashes */
  --accent-subtle: #faebdd;
  --success-subtle: #edf3ec;
  --danger-subtle: #fdebec;
  --attention-subtle: #fbf3db;
  --neutral-subtle: #f1f1ef;
  --done: #9065b0;
  --done-subtle: #f6f3f9;
  --accent-border: rgba(217, 115, 13, 0.35);
  --success-border: rgba(68, 131, 97, 0.35);
  --danger-border: rgba(212, 76, 71, 0.35);
  --attention-border: rgba(160, 116, 0, 0.35);
  --done-border: rgba(144, 101, 176, 0.35);
  --btn-border: rgba(55, 53, 47, 0.16);
  --primary-bg: #d9730d;
  --primary-bg-hover: #c16207;
  /* hover washes — Notion's signature soft gray rinse */
  --wash: rgba(55, 53, 47, 0.055);
  --wash-strong: rgba(55, 53, 47, 0.10);
  --surface-2: #f1f0ec;
  --surface-3: #e9e8e4;
  --border-bright: #d3d1cb;
  --faint: #9b9a97;
  --fg-subtle: #9b9a97;
  --cyan-soft: rgba(217, 115, 13, 0.14);
  --green-soft: rgba(68, 131, 97, 0.10);
  --amber-soft: rgba(160, 116, 0, 0.10);
  --red-soft: rgba(212, 76, 71, 0.08);
  --link-hover: #b85f06;
  --bg-over: #e9e8e4;
}

/* ── Warm dark theme — Notion dark brown-gray canvas, calm pastel tags ── */
:root[data-skin="notion"][data-theme="dark"] {
  --canvas-default: #242423;
  --canvas-subtle: #191919;
  --canvas-inset: #2f2f2e;
  --border-default: #383734;
  --border-muted: #2e2d2b;
  --fg-default: #d6d3cd;
  --fg-muted: #9b9992;
  --accent-fg: #e8914a;
  --success-fg: #56b877;
  --danger-fg: #f07a72;
  --attention-fg: #cfa43f;
  --accent-subtle: rgba(232, 145, 74, 0.14);
  --success-subtle: rgba(86, 184, 119, 0.13);
  --danger-subtle: rgba(240, 122, 114, 0.12);
  --attention-subtle: rgba(207, 164, 63, 0.14);
  --neutral-subtle: rgba(255, 255, 255, 0.055);
  --done: #b695d6;
  --done-subtle: rgba(182, 149, 214, 0.13);
  --accent-border: rgba(232, 145, 74, 0.40);
  --success-border: rgba(86, 184, 119, 0.40);
  --danger-border: rgba(240, 122, 114, 0.40);
  --attention-border: rgba(207, 164, 63, 0.40);
  --done-border: rgba(182, 149, 214, 0.40);
  --btn-border: rgba(255, 255, 255, 0.12);
  --primary-bg: #d9730d;
  --primary-bg-hover: #e07f1a;
  --wash: rgba(255, 255, 255, 0.055);
  --wash-strong: rgba(255, 255, 255, 0.10);
  --surface-2: #2e2d2b;
  --surface-3: #383734;
  --border-bright: #55524c;
  --faint: #6e6c66;
  --fg-subtle: #7f7d77;
  --bg-over: #383734;
  --cyan-soft: rgba(232, 145, 74, 0.16);
  --green-soft: rgba(86, 184, 119, 0.12);
  --amber-soft: rgba(207, 164, 63, 0.12);
  --red-soft: rgba(240, 122, 114, 0.10);
  --link-hover: #f2ab6b;
}

/* ── Dashboard status-pill tokens (dashboard pageStyles) ── */
:root[data-skin="notion"] {
  --dashboard-success-subtle: #edf3ec;
  --dashboard-success-border: rgba(68, 131, 97, 0.3);
  --dashboard-accent-subtle: #faebdd;
  --dashboard-accent-border: rgba(217, 115, 13, 0.3);
  --dashboard-attention-subtle: #fbf3db;
  --dashboard-attention-border: rgba(160, 116, 0, 0.3);
  --dashboard-danger-subtle: #fdebec;
  --dashboard-danger-border: rgba(212, 76, 71, 0.3);
  --dashboard-neutral-subtle: var(--neutral-subtle);
}
:root[data-skin="notion"][data-theme="dark"] {
  --dashboard-success-subtle: rgba(86, 184, 119, 0.13);
  --dashboard-success-border: rgba(86, 184, 119, 0.4);
  --dashboard-accent-subtle: rgba(232, 145, 74, 0.14);
  --dashboard-accent-border: rgba(232, 145, 74, 0.4);
  --dashboard-attention-subtle: rgba(207, 164, 63, 0.14);
  --dashboard-attention-border: rgba(207, 164, 63, 0.4);
  --dashboard-danger-subtle: rgba(240, 122, 114, 0.12);
  --dashboard-danger-border: rgba(240, 122, 114, 0.4);
  --dashboard-neutral-subtle: rgba(255, 255, 255, 0.055);
}

/* ── Base typography & elements (layout baseStyles) ── */
[data-skin="notion"] body { background-color: var(--canvas-subtle); line-height: 1.6; }
[data-skin="notion"] code { background: var(--neutral-subtle); }
[data-skin="notion"] h1, [data-skin="notion"] h2, [data-skin="notion"] h3, [data-skin="notion"] h4 { letter-spacing: -0.01em; }
[data-skin="notion"] th, [data-skin="notion"] td { padding: 0.7rem 1rem; }
[data-skin="notion"] thead th { font-weight: 500; padding: 10px 16px; }
[data-skin="notion"] button, [data-skin="notion"] input, [data-skin="notion"] select { background: var(--canvas-default); }

/* ── App shell: borderless sidebar on the warm page canvas ── */
[data-skin="notion"] .side { background: var(--canvas-subtle); border-right: 0; padding: 20px 14px; }
[data-skin="notion"] .nav a { padding: 5px 8px; border-radius: var(--radius-sm); }
[data-skin="notion"] .nav a:hover { background: var(--wash); }
[data-skin="notion"] .nav a.active { background: var(--wash-strong); font-weight: 500; }
[data-skin="notion"] .nav a.active::before { content: none; }
[data-skin="notion"] .nav a .ic { opacity: 0.62; }
[data-skin="notion"] header.topbar { background: var(--canvas-subtle); border-bottom: 1px solid var(--border-muted); }
[data-skin="notion"] h1.page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }
[data-skin="notion"] .content { padding: 28px 40px 72px; }
@media (max-width: 860px) {
  [data-skin="notion"] .side { border-bottom: 1px solid var(--border-muted); }
}

/* ── Pills, labels, stat strip ── */
[data-skin="notion"] .label { border-radius: 4px; }
[data-skin="notion"] .pill { border-radius: 4px; }
[data-skin="notion"] .dpill { border-radius: var(--radius-sm); }
[data-skin="notion"] .dashboard .dpill { border-radius: var(--radius-sm); }
[data-skin="notion"] .dashboard .pill { border-radius: 4px; }
[data-skin="notion"] .strip .cell { background: var(--canvas-default); }
[data-skin="notion"] .strip .num { font-weight: 700; letter-spacing: -0.02em; }

/* ── Settings subnav & misc ── */
[data-skin="notion"] .settings-subnav-link:hover { background: var(--wash); }
[data-skin="notion"] .settings-subnav-link.is-active { background: var(--wash-strong); font-weight: 500; }
[data-skin="notion"] .settings-meta { background: var(--neutral-subtle); }
[data-skin="notion"] .login-title { font-weight: 600; letter-spacing: -0.02em; }

/* ── Metrics page (metricsStyles) ── */
[data-skin="notion"] .metrics-segmented { background: var(--neutral-subtle); }

/* ── Jobs page (jobs pageStyles) ── */
[data-skin="notion"] .jobs-page .chip:hover { background: var(--wash); }
[data-skin="notion"] .jobs-page .chip.on { background: var(--accent-subtle); border-color: var(--accent-border); }

/* ── Metrics trend chart (inline SVG style overrides) ── */
[data-skin="notion"] .metrics-trend-chart .metric-chart-success-line { stroke: var(--fg-muted); }
[data-skin="notion"] .metrics-trend-chart .metric-chart-point-success { stroke: var(--fg-muted); }
`;
