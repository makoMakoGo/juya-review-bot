// Skin: terminal — scoped overrides over the primer base.
// Terminal/CLI reskin: monospace everywhere, phosphor green #4ade80 on #0c0c0c,
// square corners, bracketed [ OK ] pills via ::before/::after, $ prompt buttons,
// ASCII-rule card titles. Defaults to its dark palette; a light variant exists
// under [data-theme="light"].
export const terminalSkin = `
/* ── baseStyles (layout.js) ── */
:root[data-skin="terminal"] { color-scheme: dark;

  --canvas-default: #0c0c0c;
  --canvas-subtle: #111311;
  --canvas-inset: #060906;
  --border-default: #2e4030;
  --border-muted: rgba(46, 64, 48, 0.7);
  --fg-default: #d3e8d4;
  --fg-muted: #7c9a80;
  --accent-fg: #4ade80;
  --success-fg: #4ade80;
  --danger-fg: #f87171;
  --attention-fg: #fbbf24;
  --radius: 2px;
  --font-sans: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

  --accent-subtle: rgba(74, 222, 128, 0.10);
  --success-subtle: rgba(74, 222, 128, 0.12);
  --danger-subtle: rgba(248, 113, 113, 0.10);
  --attention-subtle: rgba(251, 191, 36, 0.12);
  --neutral-subtle: rgba(124, 154, 128, 0.14);
  --done: #c084fc;
  --done-subtle: rgba(192, 132, 252, 0.12);
  --accent-border: rgba(74, 222, 128, 0.35);
  --success-border: rgba(74, 222, 128, 0.35);
  --danger-border: rgba(248, 113, 113, 0.35);
  --attention-border: rgba(251, 191, 36, 0.35);
  --done-border: rgba(192, 132, 252, 0.35);
  --btn-border: #2e4030;
  --primary-bg: #4ade80;
  --primary-bg-hover: #86efac;
  --primary-fg: #06130a;

  --bg: var(--canvas-default);
  --surface: var(--canvas-subtle);
  --surface-2: #18201a;
  --surface-3: #22301f;
  --surface-bar: var(--canvas-default);
  --surface-panel: var(--canvas-default);
  --border: var(--border-default);
  --border-bright: #4a6b4d;
  --text: var(--fg-default);
  --muted: var(--fg-muted);
  --faint: #55705a;
  --fg: var(--fg-default);
  --fg-subtle: #55705a;
  --cyan: var(--accent-fg); --cyan-soft: rgba(74, 222, 128, 0.16);
  --green: var(--success-fg); --green-soft: rgba(74, 222, 128, 0.12);
  --amber: var(--attention-fg); --amber-soft: rgba(251, 191, 36, 0.12);
  --red: var(--danger-fg); --red-soft: rgba(248, 113, 113, 0.10);
  --ok: var(--success-fg); --warn: var(--attention-fg); --fail: var(--danger-fg); --run: var(--accent-fg); --queued: var(--fg-subtle);
  --accent: var(--accent-fg);
  --link: var(--accent-fg); --link-hover: #86efac; --link-shadow: none;
  --success: var(--success-fg);
  --attention: var(--attention-fg);
  --danger: var(--danger-fg);
  --neutral-fg: var(--fg-muted);
  --bg-subtle: var(--canvas-subtle);
  --bg-inset: var(--canvas-inset);
  --bg-over: #22301f;
  --radius-sm: 2px;
  --radius-pill: 2px;
  --r: var(--radius-sm);
  --r-lg: var(--radius);

  --shadow-card: none;
  --shadow-flat: none; }
[data-skin="terminal"]::-webkit-scrollbar-thumb, [data-skin="terminal"] ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 0; border: 2px solid transparent; background-clip: padding-box; }
[data-skin="terminal"] body { margin: 0;
  background-color: var(--canvas-default);
  color: var(--fg-default);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased; }
[data-skin="terminal"] code { font-family: var(--font-mono); background: var(--canvas-subtle); padding: 0.1em 0.35em; border-radius: 0; color: var(--fg-default); font-size: 0.95em; border: 1px solid var(--border-muted); }
[data-skin="terminal"] pre { margin: 0.8rem 0; padding: 1rem; white-space: pre-wrap; word-break: break-word; color: var(--fg-default); background: var(--canvas-inset); border: 1px solid var(--border-default); border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; }
[data-skin="terminal"] h1, [data-skin="terminal"] h2, [data-skin="terminal"] h3, [data-skin="terminal"] h4 { font-weight: 600; letter-spacing: 0.01em; }
[data-skin="terminal"] :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 0; }
[data-skin="terminal"] .brand-icon { object-fit: cover; border: 1px solid var(--border-default); border-radius: 2px; flex: none; }
[data-skin="terminal"] .nav a.active::before { content: ""; position: absolute; left: -10px; top: 50%; transform: translateY(-50%);
  width: 3px; height: 16px; border-radius: 0; background: var(--accent-fg); }
[data-skin="terminal"] .card > h2, [data-skin="terminal"] .card > h3, [data-skin="terminal"] .card > summary > h2 { font-size: 13px; font-weight: 600; color: var(--fg-default); margin: 0 0 1rem;
  padding: 0; background: transparent; border: 0; border-radius: 0;
  display: flex; align-items: center; gap: 0.6rem; }
[data-skin="terminal"] .card > h2::before, [data-skin="terminal"] .card > summary > h2::before { content: ""; flex: none; width: 14px; border-top: 1px solid var(--accent-fg); }
[data-skin="terminal"] .card > h2::after { content: ""; flex: 1 1 auto; border-top: 1px solid var(--border-muted); }
[data-skin="terminal"] .btn-primary { background: var(--primary-bg); border-color: var(--primary-bg); color: var(--primary-fg); font-weight: 600; }
[data-skin="terminal"] .btn-primary::before { content: "$"; opacity: 0.7; }
[data-skin="terminal"] .btn-primary:hover { background: var(--primary-bg-hover); border-color: var(--primary-bg-hover); color: var(--primary-fg); }
[data-skin="terminal"] .label { display: inline-flex; align-items: center; gap: 0; padding: 0 2px;
  font-size: 12px; font-weight: 500; line-height: 18px; border-radius: 0;
  border: 0; background: transparent; color: var(--fg-muted);
  white-space: nowrap; }
[data-skin="terminal"] .label::before { content: "["; opacity: 0.55; }
[data-skin="terminal"] .label::after { content: "]"; opacity: 0.55; }
[data-skin="terminal"] .label-success { background: transparent; border-color: transparent; color: var(--success-fg); }
[data-skin="terminal"] .label-danger { background: transparent; border-color: transparent; color: var(--danger-fg); }
[data-skin="terminal"] .label-attention { background: transparent; border-color: transparent; color: var(--attention-fg); }
[data-skin="terminal"] .label-accent { background: transparent; border-color: transparent; color: var(--accent-fg); }
[data-skin="terminal"] .label-muted { background: transparent; border-color: transparent; color: var(--fg-muted); }
[data-skin="terminal"] button.primary { background: var(--primary-bg); color: var(--primary-fg); border: 1px solid var(--primary-bg); font-weight: 600; padding: 0.45rem 0.95rem; text-transform: none; letter-spacing: 0; min-height: 32px; }
[data-skin="terminal"] button.primary::before { content: "$"; opacity: 0.7; }
[data-skin="terminal"] button.primary:hover { background: var(--primary-bg-hover); border-color: var(--primary-bg-hover); opacity: 1; }
[data-skin="terminal"] .pill { display: inline-flex; align-items: center; background: transparent; border: 0; border-radius: 0; padding: 0 2px; font-size: 12px; font-weight: 500; text-transform: none; letter-spacing: 0; color: var(--fg-muted); margin: 0 4px 4px 0; }
[data-skin="terminal"] .pill::before { content: "["; opacity: 0.55; }
[data-skin="terminal"] .pill::after { content: "]"; opacity: 0.55; }
[data-skin="terminal"] .pill--ok { color: var(--success-fg); border-color: transparent; background: transparent; }
[data-skin="terminal"] .pill--warn { color: var(--attention-fg); border-color: transparent; background: transparent; }
[data-skin="terminal"] .pill--err { color: var(--danger-fg); border-color: transparent; background: transparent; }
[data-skin="terminal"] .dot { width: 8px; height: 8px; border-radius: 0; flex: none; display: inline-block; background: var(--fg-subtle); }
[data-skin="terminal"] .dpill { display: inline-flex; align-items: center; gap: 0; font-size: 12px; font-weight: 500; line-height: 1; padding: 2px 2px; border-radius: 0; border: 0; white-space: nowrap; }
[data-skin="terminal"] .dpill::before { content: "["; opacity: 0.55; }
[data-skin="terminal"] .dpill::after { content: "]"; opacity: 0.55; }
[data-skin="terminal"] .dpill .dot { display: none; }
[data-skin="terminal"] .dpill.ok { background: transparent; color: var(--success-fg); border-color: var(--success-border); }
[data-skin="terminal"] .dpill.run { background: transparent; color: var(--accent-fg); border-color: var(--accent-border); }
[data-skin="terminal"] .dpill.queued { background: transparent; color: var(--neutral-fg); border-color: var(--border-default); }
[data-skin="terminal"] .dpill.warn { background: transparent; color: var(--attention-fg); border-color: var(--attention-border); }
[data-skin="terminal"] .dpill.fail { background: transparent; color: var(--danger-fg); border-color: var(--danger-border); }
[data-skin="terminal"] .dpill.skip { background: transparent; color: var(--done); border-color: var(--done-border); }
[data-skin="terminal"] .login-title { margin: 0 0 4px; font-size: 22px; font-weight: 600; letter-spacing: 0; text-align: center; color: var(--fg-default); }
[data-skin="terminal"] .login-form label { font-size: 13px; font-weight: 400; color: var(--fg-muted); }
[data-skin="terminal"] .login-form label::before { content: "$ "; color: var(--accent-fg); }
[data-skin="terminal"] details.card > summary > h2::after { content: "[+]"; margin-left: auto; flex: none; border-top: 0; color: var(--fg-muted); font-size: 12px; font-weight: 400; font-family: inherit; }
[data-skin="terminal"] details.card[open] > summary > h2::after { content: "[-]"; transform: none; }
:root[data-skin="terminal"][data-theme="dark"] { color-scheme: dark;
  --canvas-default: #0c0c0c;
  --canvas-subtle: #111311;
  --canvas-inset: #060906;
  --border-default: #2e4030;
  --border-muted: rgba(46, 64, 48, 0.7);
  --fg-default: #d3e8d4;
  --fg-muted: #7c9a80;
  --accent-fg: #4ade80;
  --success-fg: #4ade80;
  --danger-fg: #f87171;
  --attention-fg: #fbbf24;
  --accent-subtle: rgba(74, 222, 128, 0.10);
  --success-subtle: rgba(74, 222, 128, 0.12);
  --danger-subtle: rgba(248, 113, 113, 0.10);
  --attention-subtle: rgba(251, 191, 36, 0.12);
  --neutral-subtle: rgba(124, 154, 128, 0.14);
  --done: #c084fc;
  --done-subtle: rgba(192, 132, 252, 0.12);
  --accent-border: rgba(74, 222, 128, 0.35);
  --success-border: rgba(74, 222, 128, 0.35);
  --danger-border: rgba(248, 113, 113, 0.35);
  --attention-border: rgba(251, 191, 36, 0.35);
  --done-border: rgba(192, 132, 252, 0.35);
  --btn-border: #2e4030;
  --primary-bg: #4ade80;
  --primary-bg-hover: #86efac;
  --primary-fg: #06130a;
  --surface-2: #18201a;
  --surface-3: #22301f;
  --border-bright: #4a6b4d;
  --faint: #55705a;
  --fg-subtle: #55705a;
  --bg-over: #22301f;
  --cyan: var(--accent-fg); --cyan-soft: rgba(74, 222, 128, 0.16);
  --green: var(--success-fg); --green-soft: rgba(74, 222, 128, 0.12);
  --amber: var(--attention-fg); --amber-soft: rgba(251, 191, 36, 0.12);
  --red: var(--danger-fg); --red-soft: rgba(248, 113, 113, 0.10);
  --link: var(--accent-fg); --link-hover: #86efac;
  --shadow-card: none;
  --shadow-flat: none; }
:root[data-skin="terminal"][data-theme="light"] { color-scheme: light;
  --canvas-default: #f7f7f2;
  --canvas-subtle: #efefe4;
  --canvas-inset: #e7e7da;
  --border-default: #c6c9b4;
  --border-muted: rgba(150, 155, 130, 0.55);
  --fg-default: #1c241c;
  --fg-muted: #5a6b5a;
  --accent-fg: #15803d;
  --success-fg: #15803d;
  --danger-fg: #b91c1c;
  --attention-fg: #b45309;
  --accent-subtle: rgba(21, 128, 61, 0.10);
  --success-subtle: rgba(21, 128, 61, 0.12);
  --danger-subtle: rgba(185, 28, 28, 0.08);
  --attention-subtle: rgba(180, 83, 9, 0.10);
  --neutral-subtle: rgba(90, 107, 90, 0.12);
  --done: #7c3aed;
  --done-subtle: rgba(124, 58, 237, 0.10);
  --accent-border: rgba(21, 128, 61, 0.40);
  --success-border: rgba(21, 128, 61, 0.40);
  --danger-border: rgba(185, 28, 28, 0.40);
  --attention-border: rgba(180, 83, 9, 0.40);
  --done-border: rgba(124, 58, 237, 0.40);
  --btn-border: #c6c9b4;
  --primary-bg: #15803d;
  --primary-bg-hover: #166534;
  --primary-fg: #f7f7f2;
  --surface-2: #e4e4d6;
  --surface-3: #d8d9c6;
  --border-bright: #9aa284;
  --faint: #77856f;
  --fg-subtle: #77856f;
  --bg-over: #d8d9c6;
  --cyan: var(--accent-fg); --cyan-soft: rgba(21, 128, 61, 0.12);
  --green: var(--success-fg); --green-soft: rgba(21, 128, 61, 0.10);
  --amber: var(--attention-fg); --amber-soft: rgba(180, 83, 9, 0.10);
  --red: var(--danger-fg); --red-soft: rgba(185, 28, 28, 0.08);
  --link: var(--accent-fg); --link-hover: #166534;
  --shadow-card: none;
  --shadow-flat: none; }
[data-skin="terminal"] .dashboard .dot { width: 8px; height: 8px; border-radius: 0; flex: none; display: inline-block; }
[data-skin="terminal"] .dashboard .dpill { display: inline-flex; align-items: center; gap: 0; font-size: 12px; font-weight: 500; line-height: 1; padding: 2px 2px; border-radius: 0; border: 0; white-space: nowrap; }
[data-skin="terminal"] .dashboard .dpill .dot { display: none; }
[data-skin="terminal"] .dashboard .dpill.ok { background: transparent; color: var(--success-fg); border-color: var(--success-border); }
[data-skin="terminal"] .dashboard .dpill.run { background: transparent; color: var(--accent-fg); border-color: var(--accent-border); }
[data-skin="terminal"] .dashboard .dpill.queued { background: transparent; color: var(--neutral-fg); border-color: var(--border-default); }
[data-skin="terminal"] .dashboard .dpill.warn { background: transparent; color: var(--attention-fg); border-color: var(--attention-border); }
[data-skin="terminal"] .dashboard .dpill.fail { background: transparent; color: var(--danger-fg); border-color: var(--danger-border); }
[data-skin="terminal"] .dashboard .dpill.skip { background: transparent; color: var(--done); border-color: var(--done-border); }
[data-skin="terminal"] .dashboard .phase span { flex: 1; height: 6px; border-radius: 0; background: var(--bg-inset); }
[data-skin="terminal"] .dashboard .tbar i { display: block; width: 100%; max-width: 26px; border-radius: 0; background: var(--accent-fg); opacity: 0.85; }

/* ── dashboard pageStyles (ui/dashboard.js) ── */
:root[data-skin="terminal"] { --dashboard-success-subtle: rgba(74, 222, 128, 0.12);
  --dashboard-success-border: rgba(74, 222, 128, 0.35);
  --dashboard-accent-subtle: rgba(74, 222, 128, 0.10);
  --dashboard-accent-border: rgba(74, 222, 128, 0.35);
  --dashboard-attention-subtle: rgba(251, 191, 36, 0.12);
  --dashboard-attention-border: rgba(251, 191, 36, 0.35);
  --dashboard-danger-subtle: rgba(248, 113, 113, 0.10);
  --dashboard-danger-border: rgba(248, 113, 113, 0.35);
  --dashboard-neutral-subtle: rgba(124, 154, 128, 0.14); }
:root[data-skin="terminal"][data-theme="light"] { --dashboard-success-subtle: rgba(21, 128, 61, 0.12);
  --dashboard-success-border: rgba(21, 128, 61, 0.40);
  --dashboard-accent-subtle: rgba(21, 128, 61, 0.10);
  --dashboard-accent-border: rgba(21, 128, 61, 0.40);
  --dashboard-attention-subtle: rgba(180, 83, 9, 0.10);
  --dashboard-attention-border: rgba(180, 83, 9, 0.40);
  --dashboard-danger-subtle: rgba(185, 28, 28, 0.08);
  --dashboard-danger-border: rgba(185, 28, 28, 0.40);
  --dashboard-neutral-subtle: rgba(90, 107, 90, 0.12); }
[data-skin="terminal"] .dashboard .dot { width: 8px; height: 8px; border-radius: 0; flex: none; display: inline-block; }
[data-skin="terminal"] .dashboard .dpill { display: inline-flex; align-items: center; gap: 0; font-size: 12px; font-weight: 500; line-height: 18px; padding: 0 2px; border-radius: 0; border: 0; white-space: nowrap; }
[data-skin="terminal"] .dashboard .dpill::before { content: "["; opacity: 0.55; }
[data-skin="terminal"] .dashboard .dpill::after { content: "]"; opacity: 0.55; }
[data-skin="terminal"] .dashboard .dpill .dot { display: none; }
[data-skin="terminal"] .dashboard .dpill.ok { background: transparent; color: var(--success-fg); border-color: var(--dashboard-success-border); }
[data-skin="terminal"] .dashboard .dpill.run { background: transparent; color: var(--accent-fg); border-color: var(--dashboard-accent-border); }
[data-skin="terminal"] .dashboard .dpill.queued { background: transparent; color: var(--fg-muted); border-color: var(--border-default); }
[data-skin="terminal"] .dashboard .dpill.warn { background: transparent; color: var(--attention-fg); border-color: var(--dashboard-attention-border); }
[data-skin="terminal"] .dashboard .dpill.fail { background: transparent; color: var(--danger-fg); border-color: var(--dashboard-danger-border); }
[data-skin="terminal"] .dashboard .dpill.skip { background: transparent; color: var(--fg-muted); border-color: var(--border-default); }
[data-skin="terminal"] .dashboard .pill { display: inline-block; font-size: 12px; font-weight: 500; line-height: 18px; padding: 0 2px; border-radius: 0; border: 0; color: var(--fg-muted); background: transparent; }
[data-skin="terminal"] .dashboard .pill::before { content: "["; opacity: 0.55; }
[data-skin="terminal"] .dashboard .pill::after { content: "]"; opacity: 0.55; }
[data-skin="terminal"] .dashboard .pill.pill--err { background: transparent; color: var(--danger-fg); border-color: transparent; }
[data-skin="terminal"] .dashboard .pill.pill--warn { background: transparent; color: var(--attention-fg); border-color: transparent; }

/* ── jobs pageStyles (ui/jobs.js) ── */
[data-skin="terminal"] .jobs-page .chip { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 18px; padding: 3px 10px; border-radius: 2px; border: 1px solid var(--border-default); color: var(--fg-muted); background: var(--canvas-default); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; appearance: none; -webkit-appearance: none; }

/* ── config pageStyles (ui/config.js) ── */
[data-skin="terminal"] .settings .page-desc { margin: 0 0 12px; font-size: 13px; color: var(--fg-muted); }
[data-skin="terminal"] .settings-subnav-link { display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 10px; border-radius: var(--radius);
  font-size: 13px; font-weight: 400; color: var(--fg-default); text-decoration: none; }
[data-skin="terminal"] .settings-subnav-link.is-active { background: var(--canvas-subtle); color: var(--accent-fg); font-weight: 600; box-shadow: inset 2px 0 0 var(--accent-fg); }
[data-skin="terminal"] .settings-count { display: inline-block; min-width: 20px; padding: 0 6px;
  font-size: 12px; font-weight: 500; line-height: 18px; text-align: center;
  color: var(--fg-muted);
  background: color-mix(in srgb, var(--fg-muted) 14%, transparent);
  border: 0; border-radius: 2px; }

/* ── metrics pageStyles (metrics-styles.js) ── */
[data-skin="terminal"] .metrics-segmented a { display: inline-flex; align-items: center; justify-content: center; min-width: 0; min-height: 26px; padding: 2px 10px; border-radius: 2px; color: var(--fg-muted); font-size: 12px; font-weight: 500; line-height: 18px; text-decoration: none; white-space: nowrap; }
[data-skin="terminal"] .metrics-segmented a[aria-current="page"] { color: var(--primary-fg); background: var(--accent-fg); font-weight: 600; }
[data-skin="terminal"] .metrics-bar { height: 6px; overflow: hidden; border-radius: 0; background: var(--canvas-subtle); border: 1px solid var(--border-muted); }
[data-skin="terminal"] .metrics-bar-fill { display: block; height: 100%; border-radius: 0; background: var(--accent-fg); }
`;
