import { scriptTag } from '../security.js';
import { ENGINE, PRODUCT } from '../../brand.js';
import { escapeAttribute, escapeHtml } from './helpers.js';
import { I18N } from './i18n.js';

const SIDEBAR_NAME = PRODUCT.shortName[0].toUpperCase() + PRODUCT.shortName.slice(1);

const NAV_ICONS = {
  dashboard: '<svg class="ic" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"/></svg>',
  jobs: '<svg class="ic" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 1.75C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v12.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm2.5 3.5a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 0 1.5Zm0 3a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 0 1.5Zm0 3a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 0 1.5Z"/></svg>',
  metrics: '<svg class="ic" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.75.75 0 0 1 1.06 1.06Z"/></svg>',
  config: '<svg class="ic" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0a1.5 1.5 0 0 1 1.478 1.227l.115.433a5.47 5.47 0 0 1 1.018.55l.4-.23a1.5 1.5 0 0 1 2.05.547l.5.866a1.5 1.5 0 0 1-.547 2.05l-.4.23c.09.336.148.686.17 1.046l.433.115a1.5 1.5 0 0 1 1.227 1.478v1a1.5 1.5 0 0 1-1.227 1.478l-.433.115a5.52 5.52 0 0 1-.55 1.018l.23.4a1.5 1.5 0 0 1-.547 2.05l-.866.5a1.5 1.5 0 0 1-2.05-.547l-.23-.4a5.47 5.47 0 0 1-1.018.17l-.115.433A1.5 1.5 0 0 1 8 16h-1a1.5 1.5 0 0 1-1.478-1.227l-.115-.433a5.47 5.47 0 0 1-1.018-.55l-.4.23a1.5 1.5 0 0 1-2.05-.547l-.5-.866a1.5 1.5 0 0 1 .547-2.05l.4-.23a5.52 5.52 0 0 1-.17-1.018l-.433-.115A1.5 1.5 0 0 1 0 8.5v-1a1.5 1.5 0 0 1 1.227-1.478l.433-.115c.022-.36.08-.71.17-1.046l-.4-.23a1.5 1.5 0 0 1 .547-2.05l.866-.5a1.5 1.5 0 0 1 2.05.547l.23.4c.332-.09.682-.148 1.042-.17l.115-.433A1.5 1.5 0 0 1 7 0ZM6.5 8a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"/></svg>',
};
// Keep nav 1:1 with real routes only.
const NAV_ITEMS = [
  ['dashboard', '/admin/', 'Status', NAV_ICONS.dashboard],
  ['jobs', '/admin/jobs', 'Jobs', NAV_ICONS.jobs],
  ['metrics', '/admin/metrics', 'Metrics', NAV_ICONS.metrics],
  ['config', '/admin/config', 'Settings', NAV_ICONS.config],
];

export function renderLayout({ title, active = 'dashboard', csrfToken = '', body, titleKey = '', cspNonce = '', pageStyles = '' }) {
  if (typeof title !== 'string' || title.trim() === '') throw new Error('title is required');
  if (typeof body !== 'string') throw new Error('body must be a string');
  const navItems = NAV_ITEMS.map(([key, href, label, icon]) => {
    const current = key === active;
    return `<a class="${current ? 'active' : ''}"${current ? ' aria-current="page"' : ''} href="${href}">${icon}<span class="nav-text" data-i18n="nav_${key}">${escapeHtml(label)}</span></a>`;
  }).join('');
  const logoutForm = csrfToken
    ? `<form class="signout" method="post" action="/admin/logout"><input type="hidden" name="_csrf" value="${escapeAttribute(csrfToken)}"><button type="submit" data-i18n="signout">sign out</button></form>`
    : '';
  const titleAttr = titleKey ? ` data-i18n="${escapeAttribute(titleKey)}"` : '';

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${escapeHtml(PRODUCT.consoleName)}</title>
<link rel="icon" type="image/jpeg" href="${escapeAttribute(PRODUCT.iconPath)}">
${fontLinks()}${themeInitScript(cspNonce)}<style>${baseStyles()}${pageStyles}</style>
</head>
<body>
<a class="skip-link" href="#main" data-i18n="skip_to_main">Skip to main</a>
<div class="app">
  <aside class="side">
    <a class="brand" href="/admin/"><img class="brand-icon" src="${escapeAttribute(PRODUCT.iconPath)}" width="28" height="28" alt=""><span class="brand-name">${escapeHtml(SIDEBAR_NAME)}</span></a>
    <nav class="nav" aria-label="Sections" data-i18n-aria-label="aria_sections">${navItems}</nav>
    <div class="side-foot" data-i18n="nav_side_foot">Powered by ${escapeHtml(ENGINE.name)}</div>
  </aside>
  <div class="main">
    <header class="topbar">
      <div class="crumb"><span class="muted">${escapeHtml(PRODUCT.shortName)}</span><span class="sep" aria-hidden="true">/</span><span class="crumb-current"${titleAttr}>${escapeHtml(title)}</span></div>
      <div class="topbar-actions">${togglesHtml()}${logoutForm}</div>
    </header>
    <main id="main" class="content" tabindex="-1"><h1 class="page-title"${titleAttr}>${escapeHtml(title)}</h1>${body}</main>
  </div>
</div>
${bodyScript(cspNonce)}
</body>
</html>`;
}

export function themeInitScript(nonce) {
  return scriptTag(`(function(){try{var t=localStorage.getItem('${PRODUCT.shortName}-theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.dataset.theme=t;var l=localStorage.getItem('${PRODUCT.shortName}-lang');if(l!=='en'&&l!=='zh'){l=((navigator.language||'en').toLowerCase().indexOf('zh')===0)?'zh':'en';}document.documentElement.lang=l;}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.lang='en';}})();`, nonce);
}

export function togglesHtml() {
  return `<div class="toggles"><button type="button" class="toggle-btn" data-act="toggle-theme" data-theme-target aria-label="Toggle theme"><svg class="ic theme-moon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z"/></svg><svg class="ic theme-sun" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.061l-1.061 1.06a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.06-1.06a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13Zm3.536-1.464a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM2.343 2.343a.75.75 0 0 1 1.061 0l1.06 1.061a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-1.06-1.06a.75.75 0 0 1 0-1.06Z"/></svg></button><button type="button" class="toggle-btn" data-act="toggle-lang" data-lang-target>中文</button></div>`;
}

export function safeScriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
export function bodyScript(nonce) {
  return scriptTag(`(function(){var I18N=${safeScriptJson(I18N)};function dict(){return I18N[document.documentElement.lang]||I18N.en;}function applyLang(){var d=dict();document.querySelectorAll('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n');if(d[k]!==undefined)el.textContent=d[k];});document.querySelectorAll('[data-i18n-aria-label]').forEach(function(el){var k=el.getAttribute('data-i18n-aria-label');if(d[k]!==undefined)el.setAttribute('aria-label',d[k]);});document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){var k=el.getAttribute('data-i18n-placeholder');if(d[k]!==undefined)el.setAttribute('placeholder',d[k]);});document.querySelectorAll('[data-i18n-template]').forEach(function(el){var t=d[el.getAttribute('data-i18n-template')];if(t!==undefined){el.textContent=t.split('{page}').join(el.getAttribute('data-page')||'').split('{total-pages}').join(el.getAttribute('data-total-pages')||'').split('{total}').join(el.getAttribute('data-total')||'').split('{visible}').join(el.getAttribute('data-visible')||'');}});document.querySelectorAll('[data-theme-target]').forEach(function(b){var light=document.documentElement.dataset.theme==='light';b.setAttribute('aria-label',light?d.toggle_theme_dark:d.toggle_theme_light);});document.querySelectorAll('[data-lang-target]').forEach(function(b){var zh=document.documentElement.lang==='zh';b.textContent=zh?'EN':'中文';b.setAttribute('aria-label',zh?d.toggle_lang_en:d.toggle_lang_zh);});}function setLang(l){document.documentElement.lang=l;try{localStorage.setItem('${PRODUCT.shortName}-lang',l);}catch(e){}applyLang();}function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('${PRODUCT.shortName}-theme',t);}catch(e){}applyLang();}document.addEventListener('click',function(e){var n=e.target.closest&&e.target.closest('[data-act]');if(!n)return;var a=n.getAttribute('data-act');if(a==='toggle-lang')setLang(document.documentElement.lang==='zh'?'en':'zh');else if(a==='toggle-theme')setTheme(document.documentElement.dataset.theme==='light'?'dark':'light');});applyLang();})();`, nonce);
}

export function fontLinks() {
  // System font stacks only — no external webfont fetch (self-hosted, offline-friendly).
  return '';
}

export function baseStyles() {
  return `:root {
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
  --cyan: var(--accent-fg); --cyan-soft: rgba(94, 106, 210, 0.12);
  --green: var(--success-fg); --green-soft: rgba(47, 148, 97, 0.10);
  --amber: var(--attention-fg); --amber-soft: rgba(176, 125, 16, 0.12);
  --red: var(--danger-fg); --red-soft: rgba(220, 76, 76, 0.08);
  --ok: var(--success-fg); --warn: var(--attention-fg); --fail: var(--danger-fg); --run: var(--accent-fg); --queued: var(--fg-subtle);
  --accent: var(--accent-fg);
  --link: var(--accent-fg); --link-hover: #4f5bbf; --link-shadow: none;
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
}
* { box-sizing: border-box; }
::selection { background: var(--cyan-soft); color: var(--text); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: var(--radius-pill); border: 2px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: var(--border-bright); background-clip: padding-box; }

html { scrollbar-gutter: stable; scroll-padding-top: 5rem; }

body {
  margin: 0;
  background-color: var(--canvas-default);
  color: var(--fg-default);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
p { margin: 0.75rem 0; }
a { color: var(--link); text-decoration: none; }
a:hover { color: var(--link-hover); text-shadow: var(--link-shadow); }
code { font-family: var(--font-mono); background: var(--canvas-subtle); padding: 0.15em 0.4em; border-radius: var(--radius-sm); color: var(--fg-default); font-size: 0.9em; border: 1px solid var(--border-muted); }
pre { margin: 0.8rem 0; padding: 1rem; white-space: pre-wrap; word-break: break-word; color: var(--fg-default); background: var(--canvas-subtle); border: 1px solid var(--border-default); border-radius: var(--radius); font-family: var(--font-mono); font-size: 13px; }
h1, h2, h3, h4 { font-weight: 600; letter-spacing: -0.01em; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }

.skip-link { position: absolute; left: -9999px; top: 0; z-index: 100; background: var(--accent); color: #ffffff; padding: 0.65rem 1.1rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 13px; }
.skip-link:focus { left: 1rem; top: 1rem; }
.vh { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (pointer: coarse) { button, .toggle-btn, .signout button, .chip, nav.pagination a, .filter-reset, .login-form button { min-height: 44px; } }

/* ── App shell: Linear-style quiet sidebar ── */
.app { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
.side {
  position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto;
  background: var(--canvas-default); border-right: 1px solid var(--border-muted);
  padding: 20px 12px; display: flex; flex-direction: column; gap: 24px;
}
.side .brand {
  display: flex; align-items: center; gap: 9px; padding: 4px 8px;
  font-size: 14px; font-weight: 600; color: var(--fg-default); text-decoration: none;
}
.side .brand .brand-icon { width: 28px; height: 28px; }
.brand-icon { object-fit: cover; border: 1px solid var(--border-muted); border-radius: 8px; flex: none; }
.side .brand-name { font-weight: 600; }
.side .brand-tag {
  margin-left: auto; font-size: 12px; font-weight: 500; color: var(--fg-muted);
  border: 1px solid var(--border-muted); padding: 1px 7px; border-radius: var(--radius-pill); line-height: 1.4;
}
.side .brand:hover { text-decoration: none; }
.nav { display: flex; flex-direction: column; gap: 2px; }
.nav a {
  position: relative;
  display: flex; align-items: center; gap: 8px; color: var(--fg-muted); text-decoration: none;
  padding: 5px 8px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 450;
}
.nav a:hover { background: var(--canvas-subtle); color: var(--fg-default); text-decoration: none; }
.nav a.active { background: var(--accent-subtle); color: var(--accent-fg); font-weight: 550; }
.nav a .ic { width: 16px; height: 16px; opacity: 0.72; flex: none; }
.nav a.active .ic { opacity: 1; }
.toggle-btn .ic { width: 16px; height: 16px; flex: none; display: none; }
:root[data-theme="light"] .toggle-btn .theme-moon { display: block; }
:root[data-theme="dark"] .toggle-btn .theme-sun { display: block; }
.nav a .nav-text { min-width: 0; }
.side-foot { margin-top: auto; font-size: 12px; color: var(--fg-muted); padding: 8px 10px; }
.main { display: flex; flex-direction: column; min-width: 0; min-height: 100vh; }
header.topbar {
  position: sticky; top: 0; z-index: 40; display: flex; align-items: center; gap: 16px;
  padding: 12px 28px; background: var(--canvas-default); border-bottom: 1px solid var(--border-muted);
}
.topbar .crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-muted); }
.topbar .crumb .muted { color: var(--fg-muted); }
.topbar .crumb .sep { color: var(--fg-muted); }
.topbar .crumb .crumb-current { color: var(--fg-default); font-weight: 600; }
.topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.toggles { display: inline-flex; align-items: center; gap: 8px; }
.toggle-btn, .signout button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font: inherit; font-size: 13px; font-weight: 500; color: var(--text);
  background: var(--surface); border: 1px solid var(--btn-border);
  padding: 5px 12px; border-radius: var(--radius-sm); cursor: pointer;
  text-transform: none; letter-spacing: 0; min-height: 32px;
}
.toggle-btn:hover, .signout button:hover {
  background: var(--surface-2); border-color: var(--border-bright); color: var(--text);
  transform: none; box-shadow: none;
}
.signout { margin: 0; }
.signout button:hover { color: var(--danger); border-color: var(--danger-border); background: var(--danger-subtle); }
h1.page-title { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 4px; color: var(--fg-default); line-height: 1.25; }

.content { padding: 24px 32px 64px; max-width: 1216px; width: 100%; }
main.centered { max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; }
.back { margin: 0 0 1.5rem; }
.back a { color: var(--fg-muted); font-weight: 500; padding: 0.4rem 0.8rem; background: var(--canvas-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-default); }
.back a:hover { color: var(--fg-default); background: var(--surface-2); text-decoration: none; }

@media (max-width: 860px) {
  .app { grid-template-columns: 1fr; }
  .side {
    position: static; height: auto; flex-direction: column; align-items: stretch;
    gap: 12px; padding: 12px 14px; border-right: 0; border-bottom: 1px solid var(--border-default); overflow: visible;
  }
  .side .brand { padding: 0; }
  .side .brand-tag { display: none; }
  .nav { flex-direction: row; flex-wrap: wrap; gap: 2px; }
  .nav a.active::before { content: none; }
  .side-foot { display: none; }
  header.topbar { padding: 10px 16px; }
  .content { padding: 18px 16px 48px; }
}

/* ── Shared components (design contract) ── */
/* Static container by default — display-only cards must not look pressable. */
.card {
  border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default);
  margin-bottom: 1.5rem; padding: 1.5rem; box-shadow: none;
}
.card > h2, .card > h3, .card > summary > h2 {
  font-size: 14px; font-weight: 600; color: var(--fg-default); margin: 0 0 1rem;
  padding: 0; background: transparent; border: 0; border-radius: 0;
  display: flex; align-items: center; gap: 0.5rem;
}
.card > h2::before, .card > summary > h2::before { content: none; }
.card > h3 { margin: 1.5rem 0 0.75rem; font-size: 12px; font-weight: 600; color: var(--fg-muted); padding: 0; border: 0; }
.card > *:last-child { margin-bottom: 0; }
.card-header {
  margin: -1.5rem -1.5rem 1rem; padding: 0.85rem 1.5rem;
  background: var(--canvas-subtle); border-bottom: 1px solid var(--border-muted);
  font-size: 14px; font-weight: 600; color: var(--fg-default);
}
.card-body > *:first-child { margin-top: 0; }
.card-body > *:last-child { margin-bottom: 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font: inherit; font-size: 13px; font-weight: 500; line-height: 20px; color: var(--fg-default);
  background: var(--canvas-subtle); border: 1px solid var(--btn-border);
  padding: 5px 16px; border-radius: var(--radius); cursor: pointer; text-decoration: none;
  white-space: nowrap; min-height: 32px; text-transform: none; letter-spacing: 0;
}
.btn:hover { background: var(--surface-2); border-color: var(--border-bright); color: var(--fg-default); text-decoration: none; }
.btn-primary { background: var(--primary-bg); border-color: var(--btn-border); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16); }
.btn-primary:hover { background: var(--primary-bg-hover); border-color: var(--btn-border); color: #ffffff; }
.btn-danger { color: var(--danger-fg); background: var(--canvas-default); }
.btn-danger:hover { color: #ffffff; background: var(--danger-fg); border-color: var(--danger-fg); }

.label {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
  font-size: 12px; font-weight: 500; line-height: 18px; border-radius: var(--radius-pill);
  border: 1px solid var(--border-muted); background: var(--neutral-subtle); color: var(--fg-muted);
  white-space: nowrap;
}
.label-success { background: var(--success-subtle); border-color: var(--success-border); color: var(--success-fg); }
.label-danger { background: var(--danger-subtle); border-color: var(--danger-border); color: var(--danger-fg); }
.label-attention { background: var(--attention-subtle); border-color: var(--attention-border); color: var(--attention-fg); }
.label-accent { background: var(--accent-subtle); border-color: var(--accent-border); color: var(--accent-fg); }
.label-muted { background: var(--neutral-subtle); border-color: var(--border-muted); color: var(--fg-muted); }

.flash {
  display: block; padding: 16px; margin-bottom: 16px;
  border: 1px solid var(--accent-border); border-radius: var(--radius);
  background: var(--accent-subtle); color: var(--fg-default);
}
.flash-error { background: var(--danger-subtle); border-color: var(--danger-border); }
.flash-success { background: var(--success-subtle); border-color: var(--success-border); }
.flash-attention { background: var(--attention-subtle); border-color: var(--attention-border); }

.blankslate { padding: 32px 24px; text-align: center; color: var(--fg-muted); }
.blankslate h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--fg-default); }
.blankslate p { margin: 0 auto 16px; max-width: 56ch; }

.muted { color: var(--fg-muted); }
.mono { font-family: var(--font-mono); }

dl { display: grid; grid-template-columns: minmax(140px, max-content) 1fr; gap: 0.8rem 1.5rem; align-items: center; }
dt { color: var(--fg-muted); font-size: 12px; font-weight: 600; padding: 0.5rem 0; border-bottom: 1px solid var(--border-muted); }
dd { margin: 0; color: var(--fg-default); font-size: 14px; padding: 0.5rem 0; border-bottom: 1px solid var(--border-muted); }

.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.strip .cell { padding: 1.5rem; border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-subtle); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.strip .num { font-size: 2.5rem; font-weight: 300; letter-spacing: -0.02em; line-height: 1; font-family: var(--font-sans); font-variant-numeric: tabular-nums; }
.strip .num.ok { color: var(--ok); }
.strip .num.warn { color: var(--warn); }
.strip .num.fail { color: var(--fail); }
.strip .num.run { color: var(--run); }
.strip .num.queued { color: var(--queued); }
.strip .lab { font-size: 12px; font-weight: 500; color: var(--fg-muted); margin-top: 0.75rem; }

/* Sensible table defaults — .table-scroll wraps any data table. */
.table-scroll { overflow-x: auto; margin: 0.5rem 0; }
table, .table-scroll > table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--border-muted); text-align: left; vertical-align: middle; }
thead th { text-align: left; font-size: 12px; font-weight: 600; color: var(--fg-muted); padding: 9px 14px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); white-space: nowrap; }
tbody tr:hover { background: var(--canvas-subtle); }
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }

button, input, select { font-family: var(--font-sans); color: var(--fg-default); background: var(--surface-2); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 13px; }
button { cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-transform: none; letter-spacing: 0; font-size: 13px; }
button:hover { border-color: var(--border-bright); background: var(--surface-2); }
button.primary { background: var(--primary-bg); color: #fff; border: 1px solid var(--btn-border); font-weight: 500; padding: 0.45rem 0.95rem; text-transform: none; letter-spacing: 0; min-height: 32px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16); }
button.primary:hover { background: var(--primary-bg-hover); opacity: 1; }
button.primary:active { background: var(--primary-bg-hover); }
.filter-reset { font-family: var(--font-sans); font-size: 13px; font-weight: 500; line-height: normal; color: var(--fg-default); text-transform: none; letter-spacing: 0; padding: 5px 12px; border: 1px solid var(--btn-border); border-radius: var(--radius-sm); background: var(--canvas-subtle); display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
.filter-reset:hover { color: var(--fg-default); border-color: var(--border-bright); background: var(--surface-2); text-decoration: none; }
.filter-reset:active { background: var(--surface-2); }

input:focus, select:focus, textarea:focus { border-color: var(--accent); outline: 2px solid var(--accent); outline-offset: 2px; }
input[type=radio], input[type=checkbox] { accent-color: var(--accent); width: 1.2em; height: 1.2em; cursor: pointer; }

.inline { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; background: var(--canvas-subtle); padding: 1.25rem; border-radius: var(--radius); border: 1px solid var(--border-default); margin-bottom: 1.5rem; }
.inline label { display: grid; gap: 0.4rem; font-size: 12px; font-weight: 600; color: var(--fg-muted); }
.inline input, .inline select { min-width: 140px; }
.inline .field-group { display: flex; gap: 1rem; }

/* GitHub flash messages (renderAlert markup) */
.alert { display: flex; gap: 0.75rem; align-items: center; background: var(--canvas-default); border: 1px solid var(--border-default); color: var(--fg-default); padding: 0.85rem 1rem; border-radius: var(--radius); margin-bottom: 1rem; }
.alert.error { background: var(--danger-subtle); border-color: var(--danger-border); }
.alert.warning { background: var(--attention-subtle); border-color: var(--attention-border); }
.alert.success { background: var(--success-subtle); border-color: var(--success-border); }
.alert-label { flex: none; font-size: 12px; font-weight: 600; line-height: 1.4; min-width: 3.5rem; }
.alert.error .alert-label { color: var(--danger-fg); }
.alert.warning .alert-label { color: var(--attention-fg); }
.alert.success .alert-label { color: var(--success-fg); }
.alert-body, .alert ul { margin: 0; flex: 1 1 auto; min-width: 0; }
.alert ul { padding-left: 1.25rem; width: auto; }

.pill { display: inline-flex; align-items: center; background: var(--neutral-subtle); border: 1px solid var(--border-muted); border-radius: var(--radius-pill); padding: 2px 8px; font-size: 12px; font-weight: 500; text-transform: none; letter-spacing: 0; color: var(--fg-default); margin: 0 4px 4px 0; }
.pill--ok { color: var(--success-fg); border-color: var(--success-border); background: var(--success-subtle); }
.pill--warn { color: var(--attention-fg); border-color: var(--attention-border); background: var(--attention-subtle); }
.pill--err { color: var(--danger-fg); border-color: var(--danger-border); background: var(--danger-subtle); }

/* status dot + pill — GitHub Primer Label look, global (shared by dashboard, jobs, job detail) */
.dot { width: 8px; height: 8px; border-radius: 50%; flex: none; display: inline-block; background: var(--fg-subtle); }
.dot.ok { background: var(--success-fg); } .dot.run { background: var(--accent-fg); }
.dot.warn { background: var(--attention-fg); } .dot.err { background: var(--danger-fg); } .dot.idle { background: var(--fg-subtle); }
.dpill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; line-height: 1; padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid transparent; white-space: nowrap; }
.dpill .dot { width: 7px; height: 7px; }
.dpill.ok { background: var(--success-subtle); color: var(--success-fg); border-color: var(--success-border); }
.dpill.run { background: var(--accent-subtle); color: var(--accent-fg); border-color: var(--accent-border); }
.dpill.queued { background: var(--neutral-subtle); color: var(--neutral-fg); border-color: var(--border-default); }
.dpill.warn { background: var(--attention-subtle); color: var(--attention-fg); border-color: var(--attention-border); }
.dpill.fail { background: var(--danger-subtle); color: var(--danger-fg); border-color: var(--danger-border); }
.dpill.skip { background: var(--done-subtle); color: var(--done); border-color: var(--done-border); }

/* filter chips + list-card shell — GitHub Primer */
.chip { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 1.4; padding: 4px 11px; border-radius: var(--radius-pill); border: 1px solid var(--border-default); color: var(--fg-muted); background: var(--canvas-default); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; appearance: none; -webkit-appearance: none; }
.chip:hover { background: var(--canvas-subtle); border-color: var(--border-bright); color: var(--fg-default); text-decoration: none; }
.chip.on { background: var(--accent-subtle); color: var(--accent-fg); border-color: var(--accent-border); font-weight: 600; }
.btn-sm { min-height: 30px; padding: 4px 12px; font-size: 12px; }
.tablewrap { border: 1px solid var(--border-default); border-radius: var(--r-lg); overflow: hidden; background: var(--canvas-default); }
.tablewrap .bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); }
.tablewrap .bar .count { margin-left: auto; font-size: 12px; color: var(--fg-subtle); }
.tablewrap .bar.bar-foot { border-top: 1px solid var(--border-default); border-bottom: 0; }


/* GitHub-style settings */
.settings { display: grid; gap: 16px; }
.settings-meta {
  display: flex; flex-wrap: wrap; gap: 6px 14px; margin: -4px 0 4px; font-size: 12px; align-items: center;
}
.settings-meta code { font-size: 11px; padding: 0.1em 0.35em; }
.settings-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; align-items: start; }
.settings-subnav { position: sticky; top: 4.5rem; display: grid; gap: 2px; }
.settings-subnav-link {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 12px; border-radius: var(--radius-sm); color: var(--fg-default); text-decoration: none;
  font-size: 14px; font-weight: 500; border: 1px solid transparent;
}
.settings-subnav-link:hover { background: var(--canvas-subtle); text-decoration: none; }
.settings-subnav-link.is-active { background: var(--canvas-subtle); color: var(--fg-default); font-weight: 600; }
.settings-count {
  display: inline-flex; min-width: 1.4rem; justify-content: center; padding: 1px 7px;
  border-radius: var(--radius-pill); border: 1px solid var(--border-default); background: var(--canvas-subtle);
  color: var(--fg-muted); font-size: 11px; font-family: var(--font-sans);
}
.settings-panel {
  border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default);
  overflow: hidden;
}
.settings-panel-head, .settings-panel-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px; background: var(--canvas-default);
}
.settings-panel-head { border-bottom: 1px solid var(--border-default); align-items: flex-start; }
.settings-panel-foot { border-top: 1px solid var(--border-default); }
.settings-panel-title { margin: 0; font-size: 16px; font-weight: 600; }
.settings-panel-count { margin: 0; font-size: 12px; }
.settings-list { display: grid; }
.settings-item { padding: 16px; border-bottom: 1px solid var(--border-muted); }
.settings-item:last-child { border-bottom: 0; }
.settings-item-main { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr); gap: 20px; align-items: start; }
.settings-item-copy .field-label { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
.settings-item-copy code { display: inline-block; margin: 0 0 8px; font-size: 12px; }
.settings-item-copy p { margin: 0 0 10px; font-size: 13px; line-height: 1.5; }
.settings-item-meta { display: flex; flex-wrap: wrap; gap: 4px; }
.settings-item-value { display: grid; gap: 10px; }
.settings-effective { min-height: 1.4em; }
.settings-control .config-control { width: 100%; }
.settings-actions { display: grid; gap: 6px; }
.settings-actions .nowrap { margin-top: 0; white-space: normal; }
.config-control { width: 100%; font-family: var(--font-mono); }
@media (max-width: 960px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-subnav { position: static; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
  .settings-item-main { grid-template-columns: 1fr; }
}
.stack { display: grid; gap: 0.6rem; }
.stack label { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 13.5px; text-transform: none; font-weight: normal; letter-spacing: 0; }

ul.diagnostics { list-style: none; margin: 0; padding: 0; }
ul.diagnostics li { padding: 0.85rem 0; border-bottom: 1px solid var(--border-muted); display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; }
ul.diagnostics li:last-child { border-bottom: 0; }
ul.diagnostics .diag-msg { flex: 1; min-width: 200px; color: var(--fg-muted); }

nav.pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; padding: 1.5rem 0 0; border-top: 1px solid var(--border-default); margin-top: 1.5rem; }
nav.pagination a { padding: 0.4rem 1rem; border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--fg-default); font-weight: 500; font-size: 13px; background: var(--canvas-subtle); }
nav.pagination a:hover { border-color: var(--border-bright); color: var(--fg-default); background: var(--surface-2); text-decoration: none; }
nav.pagination span { font-size: 13px; color: var(--fg-muted); }
nav.pagination span[aria-disabled=true] { opacity: 0.5; }

/* ── Login (github.com/signin idiom) ── */
.login-body { min-height: 100vh; background: var(--canvas-default); }
.login-shell { min-height: 100vh; display: grid; place-items: center; padding: 32px 16px 48px; }
.login-toolbar { position: absolute; top: 16px; right: 16px; }
.login-main { width: min(100%, 340px); }
.login-brand { display: flex; justify-content: center; margin: 0 0 16px; }
.login-brand .brand-icon { width: 40px; height: 40px; }
.login-title { margin: 0 0 4px; font-size: 24px; font-weight: 300; letter-spacing: -0.5px; text-align: center; color: var(--fg-default); }
.login-sub { margin: 0 0 16px; font-size: 14px; text-align: center; }
.login-card {
  background: var(--canvas-subtle); border: 1px solid var(--border-muted);
  border-radius: var(--radius); padding: 20px; font-size: 14px;
}
.login-card .alert { margin-bottom: 16px; }
.login-form { display: grid; gap: 8px; }
.login-form label { font-size: 14px; font-weight: 400; color: var(--fg-default); }
.login-form input {
  width: 100%; min-height: 32px; padding: 5px 12px; background: var(--canvas-default);
  border: 1px solid var(--border-default); border-radius: var(--radius); font-size: 14px;
}
.login-form input:focus { border-color: var(--accent); outline: 2px solid var(--accent); outline-offset: 2px; }
.login-form button.primary { width: 100%; margin-top: 8px; justify-self: stretch; }

main > *:first-child { margin-top: 0; }

details.card > summary { cursor: pointer; list-style: none; display: block; }
details.card > summary::-webkit-details-marker { display: none; }
details.card > summary:hover > h2 { background: var(--surface-3); }
details.card > summary > h2::after { content: "\\2192"; margin-left: auto; font-family: sans-serif; font-size: 14px; }
details.card[open] > summary > h2::after { transform: rotate(90deg); }

.empty { color: var(--fg-muted); font-style: italic; }
.danger { color: var(--fail); }
.nowrap { display: block; white-space: nowrap; margin-top: 0.35rem; }


/* Tablet: tighten the topbar so brand + nav + actions stay on one row. */
@media (max-width: 1024px) {
  header.topbar { gap: 0.75rem; padding: 0.75rem 1rem; }
  main { padding: 1.5rem 1rem 4rem; }
}
@media (max-width: 768px) {
  header.topbar { flex-wrap: wrap; align-items: center; padding: 0.75rem 1rem; gap: 0.75rem; }
  .signout { order: 2; margin-left: auto; }
  .toggles { order: 2; }
  .strip { grid-template-columns: repeat(2, 1fr); }
  dl { grid-template-columns: 1fr; gap: 0.2rem; }
  dl dt { margin-top: 0.8rem; border-bottom: none; padding-bottom: 0; }
  dl dd { padding-top: 0; }
  .inline { flex-direction: column; align-items: stretch; }
  .inline input, .inline select { width: 100%; }
}

/* Phone: hit targets grow to 44px, density relaxes. */
@media (max-width: 480px) {
  header.topbar { padding: 0.6rem 0.75rem; }
  .brand { font-size: 16px; }
  main { padding: 1.25rem 0.75rem 4rem; }
  .strip { grid-template-columns: 1fr; }
  .strip .num { font-size: 2rem; }
  .card { padding: 1.25rem; }
  .card > h2, .card > summary > h2 { margin: -1.25rem -1.25rem 1.25rem; padding: 0.85rem 1.25rem; }
  .card-header { margin: -1.25rem -1.25rem 1.25rem; padding: 0.85rem 1.25rem; }
  .signout button, .toggle-btn, nav.pagination a, .filter-reset, button { min-height: 44px; }
  .toggle-btn { min-width: 44px; }
}


/* Primer polish */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin: 0 0 16px; }
.page-header-link { flex: none; margin-top: 2px; font-size: 13px; font-weight: 500; color: var(--accent); text-decoration: none; white-space: nowrap; }
.page-header-link:hover { text-decoration: underline; }
.page-desc { margin: 0; font-size: 14px; max-width: 62ch; line-height: 1.5; color: var(--fg-muted); }
.metrics-page, .jobs-page { display: grid; gap: 16px; }
.metrics-page > .page-desc, .jobs-page > .page-desc { margin: 0; }
.box { border: 1px solid var(--border-default); border-radius: var(--radius); background: var(--canvas-default); overflow: hidden; margin: 0; }
.box-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); }
.box-header strong { font-size: 14px; font-weight: 600; }
.box-header-meta { font-size: 12px; }
.box-body { padding: 12px 16px; }
.box-grid { display: grid; gap: 16px; }
.box-grid.twocol, .box-grid.sfl { grid-template-columns: 1fr 1fr; }
.kv-list { display: grid; gap: 0; }
.kv-list .kv { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-muted); font-size: 13px; }
.kv-list .kv:last-child { border-bottom: 0; padding-bottom: 0; }
.kv-list .kv:first-child { padding-top: 0; }
.kv-list .k { color: var(--fg-muted); font-weight: 600; flex: none; }
.kv-list .v { color: var(--fg-default); text-align: right; word-break: break-word; }
.box-footer { padding: 10px 16px; border-top: 1px solid var(--border-default); background: var(--canvas-subtle); }
.filter-body { background: var(--canvas-subtle); border-bottom: 1px solid var(--border-default); }
.gh-filter { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin: 0; padding: 0; background: transparent; border: 0; }
.gh-filter label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; color: var(--fg-muted); text-transform: none; letter-spacing: 0; }
.gh-filter input, .gh-filter select { min-width: 140px; background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 5px 10px; min-height: 32px; font-size: 14px; }
.gh-filter .primary, .gh-filter .filter-reset { min-height: 32px; }
.filter-reset {
  font-family: var(--font-sans); font-size: 13px; font-weight: 500; line-height: normal; color: var(--fg-default);
  text-transform: none; letter-spacing: 0; padding: 5px 12px; border: 1px solid var(--btn-border);
  border-radius: var(--radius-sm); background: var(--canvas-subtle); display: inline-flex; align-items: center; justify-content: center;
  text-decoration: none;
}
.filter-reset:hover { color: var(--fg-default); border-color: var(--border-bright); background: var(--surface-2); transform: none; box-shadow: none; text-decoration: none; }
.gh-table-wrap { margin: 0; overflow-x: auto; }
.gh-table { width: 100%; table-layout: auto; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.gh-table th, .gh-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-muted); text-align: left; vertical-align: middle; white-space: nowrap; }
.gh-table thead th {
  text-transform: none; letter-spacing: 0; font-size: 12px; font-weight: 600; color: var(--fg-muted);
  background: var(--canvas-default); border-top: 0; border-left: 0; border-right: 0; border-bottom: 1px solid var(--border-default);
}
.gh-table tbody tr:hover { background: var(--canvas-subtle); }
.gh-table tbody tr:last-child td { border-bottom: 0; }
.gh-table .subtle, code.subtle { color: var(--fg-muted); }
.mono-link code { color: var(--accent-fg); background: transparent; border: 0; padding: 0; }
.mono-link:hover code { text-decoration: underline; }
/* Jobs list: short columns hug content; repository absorbs leftover and ellipsizes. */
.jobs-table .col-repo { width: 100%; }
.jobs-table td.repo {
  width: 100%;
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
/* Metrics: label caps/ellipsizes; numeric columns hug and right-align. */
.metrics-table thead th:first-child,
.metrics-table th[scope="row"] {
  max-width: 28rem;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: 500;
}
.metrics-table thead th:not(:first-child),
.metrics-table td {
  width: 1%;
  white-space: nowrap;
  text-align: right;
  padding-left: 1.25rem;
}
/* Narrow summary tables only: width:auto still fills the box; fit-content packs columns. */
.gh-table.metrics-table--compact {
  width: fit-content;
  max-width: 100%;
}
.empty-state { padding: 28px 16px; text-align: center; color: var(--fg-muted); font-style: normal; }
.jobs-page .tablewrap { margin-bottom: 16px; }
.job-filters { margin: 0; }
.job-filters .chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.adv-filters > summary { list-style: none; cursor: pointer; padding: 8px 14px; font-size: 12px; font-weight: 600; color: var(--fg-muted); display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--border-default); background: var(--canvas-default); }
.adv-filters > summary::-webkit-details-marker { display: none; }
.adv-filters > summary::before { content: ''; width: 0; height: 0; border-left: 4px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
.adv-filters[open] > summary::before { transform: rotate(90deg); }
.adv-filters[open] > summary { background: var(--canvas-subtle); }
.adv-grid { display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: flex-end; padding: 12px 14px; background: var(--canvas-subtle); border-bottom: 1px solid var(--border-default); }
.adv-grid > label, .adv-grid .adv-field-group > label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; color: var(--fg-muted); }
.adv-grid input, .adv-grid select { min-width: 132px; background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 5px 9px; min-height: 30px; font-size: 13px; color: var(--fg-default); font-family: inherit; }
.adv-grid input:focus, .adv-grid select:focus { outline: 2px solid var(--accent); outline-offset: 2px; border-color: var(--accent); }
.adv-grid .adv-field-group { display: flex; flex-wrap: nowrap; gap: 10px 12px; align-items: flex-end; }
.adv-grid .adv-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex: 1 1 100%; margin-left: 0; }
.adv-flag { pointer-events: none; padding: 1px 7px; font-size: 10px; }
nav.pagination { margin: 0; padding: 0; border: 0; justify-content: flex-start; gap: 12px; }
nav.pagination a, nav.pagination span[aria-disabled=true] {
  min-height: 32px; padding: 5px 12px; border-radius: var(--radius-sm); background: var(--canvas-default);
  border: 1px solid var(--border-default); font-size: 13px; text-transform: none; letter-spacing: 0;
}
nav.pagination a:hover { transform: none; background: var(--canvas-subtle); }
button, .toggle-btn, .signout button { text-transform: none; letter-spacing: 0; }
button { background: var(--canvas-subtle); border: 1px solid var(--btn-border); min-height: 32px; padding: 5px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; }
button:hover { transform: none; box-shadow: none; background: var(--surface-2); border-color: var(--border-bright); }
.dashboard .status-grid { margin-bottom: 12px; }
.dashboard .sect { margin-top: 24px; }
.dashboard .sect:first-child { margin-top: 0; }
.dashboard .sect > h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px; text-transform: none; }
.dashboard .sect > h3 { font-size: 14px; font-weight: 600; text-transform: none; color: var(--fg-default); margin: 0 0 10px; }
.dashboard .metric-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.settings-panel-head .primary, .settings-panel-foot .primary { min-width: 132px; }
.settings-item:hover { background: var(--canvas-subtle); }
.settings-panel-desc { margin: 4px 0 0; font-size: 13px; line-height: 1.45; max-width: 62ch; }
.pill { text-transform: none; letter-spacing: 0; font-size: 12px; font-weight: 500; padding: 2px 8px; margin: 0 4px 4px 0; }
.inline { background: transparent; border: 0; padding: 0; margin: 0; }


/* Job detail */
.job-detail { display: grid; gap: 16px; }
.job-detail .back { margin: 0; }
.back-link {
  display: inline-flex; align-items: center; gap: 6px; color: var(--fg-muted); font-weight: 500;
  padding: 5px 10px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background: var(--canvas-default);
}
.back-link:hover { color: var(--fg-default); background: var(--canvas-subtle); text-decoration: none; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.detail-grid.compact { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.detail-item { padding: 10px 0; border-bottom: 1px solid var(--border-muted); display: grid; gap: 4px; }
.detail-item .k { font-size: 12px; color: var(--fg-muted); font-weight: 600; }
.detail-item .v { font-size: 14px; color: var(--fg-default); word-break: break-word; }
.detail-item:nth-last-child(-n+2) { border-bottom: 0; }
.detail-grid.compact .detail-item { border-bottom: 0; }
.settings-panel-desc { margin: 4px 0 6px; font-size: 13px; line-height: 1.45; max-width: 62ch; }
.box-header .bar-link { font-size: 13px; font-weight: 500; }
@media (max-width: 900px) {
  .detail-grid, .detail-grid.compact { grid-template-columns: 1fr; }
  .detail-item:nth-last-child(-n+2) { border-bottom: 1px solid var(--border-muted); }
  .detail-item:last-child { border-bottom: 0; }
}


.dashboard .sect-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 12px; }
.dashboard .sect-head h2 { margin: 0; }
.metrics-page .metric-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0 0 4px; }
.metrics-page .dmetric { border: 1px solid var(--border-default); border-radius: var(--r); padding: 11px 13px; background: var(--canvas-default); }
.metrics-page .dmetric .k { font-size: 11px; color: var(--fg-muted); }
.metrics-page .dmetric .v { font-size: 18px; font-weight: 600; margin-top: 3px; }
.metrics-page .dmetric .sub { font-size: 11px; color: var(--fg-subtle); margin-top: 1px; }
@media (max-width: 860px) {
  .metrics-page .metric-row { grid-template-columns: repeat(2, 1fr); }
}

/* Linear/Vercel dark theme — the default. Near-black canvas, hairline white
   borders, single indigo accent. Components inherit the shared rules. */
:root[data-theme="dark"] {
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
  --cyan: var(--accent-fg); --cyan-soft: rgba(130, 143, 255, 0.14);
  --green: var(--success-fg); --green-soft: rgba(76, 183, 130, 0.12);
  --amber: var(--attention-fg); --amber-soft: rgba(242, 201, 76, 0.12);
  --red: var(--danger-fg); --red-soft: rgba(240, 112, 112, 0.10);
  --link: var(--accent-fg); --link-hover: #a5abff;
  --shadow-card: none;
  --shadow-flat: none;
}

.field-meta { margin-bottom: 0.5rem; }
/* ===== Dashboard — probe design system, scoped under .dashboard ===== */
.dashboard .sect { margin-top: 28px; }
.dashboard .sect > h2 { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: var(--fg-default); }
.dashboard .sect > h3 { font-size: 12px; font-weight: 600; color: var(--fg-muted); margin: 18px 0 8px; }
.dashboard .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.dashboard .st { border: 1px solid var(--border-default); border-radius: var(--r-lg); background: var(--canvas-default); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.dashboard .st .k { font-size: 12px; color: var(--fg-muted); display: flex; align-items: center; gap: 6px; }
.dashboard .st .v { font-size: 14px; font-weight: 600; color: var(--fg-default); }
.dashboard .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; display: inline-block; }
.dashboard .dot.ok { background: var(--success-fg); } .dashboard .dot.run { background: var(--accent-fg); }
.dashboard .dot.warn { background: var(--attention-fg); } .dashboard .dot.err { background: var(--danger-fg); } .dashboard .dot.idle { background: var(--fg-subtle); }
.dashboard .dpill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; line-height: 1; padding: 4px 9px; border-radius: var(--radius-pill); border: 1px solid transparent; white-space: nowrap; }
.dashboard .dpill .dot { width: 7px; height: 7px; }
.dashboard .dpill.ok { background: var(--success-subtle); color: var(--success-fg); border-color: var(--success-border); }
.dashboard .dpill.run { background: var(--accent-subtle); color: var(--accent-fg); border-color: var(--accent-border); }
.dashboard .dpill.queued { background: var(--neutral-subtle); color: var(--neutral-fg); border-color: var(--border-default); }
.dashboard .dpill.warn { background: var(--attention-subtle); color: var(--attention-fg); border-color: var(--attention-border); }
.dashboard .dpill.fail { background: var(--danger-subtle); color: var(--danger-fg); border-color: var(--danger-border); }
.dashboard .dpill.skip { background: var(--done-subtle); color: var(--done); border-color: var(--done-border); }
.dashboard .twocol, .dashboard .box-grid.twocol, .dashboard .box-grid.sfl { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.dashboard .dcard { background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius); overflow: hidden; }
.dashboard .dcard .bd { padding: 14px 16px; }
.dashboard .status-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 12px; }
.dashboard .status-group { background: var(--canvas-default); border: 1px solid var(--border-default); border-radius: var(--radius); overflow: hidden; }
.dashboard .status-group-label { padding: 10px 14px; border-bottom: 1px solid var(--border-default); background: var(--canvas-subtle); font-size: 12px; font-weight: 600; color: var(--fg-muted); }
.dashboard .status-group .kv { padding: 7px 14px; }
.dashboard .dcard .hd { padding: 12px 16px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.dashboard .subhead { font-size: 13px; font-weight: 600; margin: 0 0 8px; }
.dashboard .kv { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border-muted); font-size: 13px; }
.dashboard .kv:last-child { border-bottom: 0; }
.dashboard .kv .k { color: var(--fg-muted); flex: 0 0 auto; min-width: 0; }
.dashboard .kv .v { font-weight: 500; text-align: right; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dashboard .phase { display: flex; gap: 4px; margin-top: 10px; }
.dashboard .phase span { flex: 1; height: 6px; border-radius: 3px; background: var(--bg-inset); }
.dashboard .phase span.done { background: var(--success-fg); } .dashboard .phase span.cur { background: var(--accent-fg); }
.dashboard .qlist { display: flex; flex-direction: column; }
.dashboard .qrow { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-muted); font-size: 13px; }
.dashboard .qrow:last-child { border-bottom: 0; }
.dashboard .qrow .repo { font-weight: 500; }
.dashboard .sfl { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.dashboard .big { font-weight: 600; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.dashboard .meta { color: var(--fg-subtle); font-size: 12px; }
.dashboard .tablewrap { border: 1px solid var(--border-default); border-radius: var(--r-lg); overflow: hidden; background: var(--canvas-default); }
.dashboard .bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); }
.dashboard .bar-label { font-size: 13px; font-weight: 600; color: var(--fg-default); }
.dashboard .count { font-size: 12px; color: var(--fg-subtle); }
.dashboard .bar-link { margin-left: auto; font-size: 12px; color: var(--accent-fg); text-decoration: none; }
.dashboard .bar-link:hover { text-decoration: underline; }
.dashboard table { width: 100%; border-collapse: collapse; font-size: 13px; }
.dashboard thead th { text-align: left; font-size: 12px; font-weight: 600; color: var(--fg-muted); padding: 9px 14px; border-bottom: 1px solid var(--border-default); background: var(--canvas-default); white-space: nowrap; }
.dashboard tbody td { padding: 9px 14px; border-bottom: 1px solid var(--border-muted); vertical-align: middle; }
.dashboard tbody tr:last-child td { border-bottom: 0; }
.dashboard tbody tr:hover { background: var(--canvas-subtle); }
.dashboard td.repo, .dashboard .repo { font-weight: 500; }
.dashboard td.subtle, .dashboard .subtle { color: var(--fg-subtle); }
.dashboard .trend { display: flex; align-items: flex-end; gap: 6px; height: 120px; padding: 6px 2px 0; }
.dashboard .tbar { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; height: 100%; }
.dashboard .tbar i { display: block; width: 100%; max-width: 26px; border-radius: 3px 3px 0 0; background: var(--accent-fg); opacity: 0.85; }
.dashboard .tbar.fail i { background: var(--danger-fg); }
.dashboard .tbar.idle i { background: var(--bg-over); }
.dashboard .tbar .d { font-size: 10px; color: var(--fg-subtle); }
.dashboard .metric-row, .metrics-page .metric-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.dashboard .dmetric, .metrics-page .dmetric { border: 1px solid var(--border-default); border-radius: var(--r); padding: 11px 13px; background: var(--canvas-default); }
.dashboard .dmetric .k, .metrics-page .dmetric .k { font-size: 11px; color: var(--fg-muted); }
.dashboard .dmetric .v, .metrics-page .dmetric .v { font-size: 18px; font-weight: 600; margin-top: 3px; }
.dashboard .dmetric .sub, .metrics-page .dmetric .sub { font-size: 11px; color: var(--fg-subtle); margin-top: 1px; }
.dashboard .empty { color: var(--fg-muted); font-style: italic; font-size: 13px; }
@media (max-width: 860px) {
  .dashboard .status-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard .twocol, .dashboard .sfl, .dashboard .box-grid.twocol, .dashboard .box-grid.sfl, .box-grid.twocol, .box-grid.sfl { grid-template-columns: 1fr; }
  .dashboard .metric-row, .metrics-page .metric-row { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
}`;
}
