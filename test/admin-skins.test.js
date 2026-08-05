import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderConfigPage,
  renderDashboardPage,
  renderErrorPage,
  renderJobsPage,
  renderLoginPage,
  renderMetricsPage,
} from '../src/admin/index.js';
import { PRODUCT } from '../src/brand.js';
import { I18N } from '../src/admin/ui/i18n.js';
import { SKINS, skinStyles } from '../src/admin/ui/themes/index.js';

const SCOPED_SKINS = ['notion', 'linear', 'terminal'];
const THEME_KEY = `${PRODUCT.shortName}-theme`;
const SKIN_KEY = `${PRODUCT.shortName}-skin`;

function renderAllPages() {
  return {
    dashboard: renderDashboardPage({ csrfToken: 'csrf', summary: {}, diagnostics: [], serviceStatus: null }),
    jobs: renderJobsPage({
      csrfToken: 'csrf',
      jobs: [],
      filters: {},
      pagination: { page: 1, totalPages: 1, total: 0, pageSize: 50, hasPrev: false, hasNext: false },
    }),
    metrics: renderMetricsPage({ csrfToken: 'csrf', stats: {}, window: 'all', trend: 'data' }),
    config: renderConfigPage({ csrfToken: 'csrf', config: {}, adminRoot: '/data/admin' }),
    login: renderLoginPage({}),
    errorAnonymous: renderErrorPage({ title: 'Error', message: 'boom' }),
    errorAuthed: renderErrorPage({ csrfToken: 'csrf', title: 'Error', message: 'boom' }),
  };
}

test('every page renderer embeds all three scoped skin blocks in one stylesheet', () => {
  for (const [name, html] of Object.entries(renderAllPages())) {
    const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
    assert.ok(style, `${name} should embed a stylesheet`);
    for (const skin of SCOPED_SKINS) {
      assert.ok(style.includes(`[data-skin="${skin}"]`), `${name} stylesheet missing [data-skin="${skin}"] scope`);
    }
  }
});

test('SKINS registry lists four skins with valid default schemes and labels', () => {
  assert.equal(SKINS.length, 4);
  assert.deepEqual(SKINS.map((skin) => skin.id), ['primer', 'notion', 'linear', 'terminal']);
  for (const skin of SKINS) {
    assert.ok(['light', 'dark'].includes(skin.defaultScheme), `${skin.id} defaultScheme must be light or dark`);
    assert.ok(I18N.en[skin.labelKey], `missing en label for ${skin.labelKey}`);
    assert.ok(I18N.zh[skin.labelKey], `missing zh label for ${skin.labelKey}`);
  }
  assert.equal(SKINS.find((skin) => skin.id === 'primer').defaultScheme, 'light');
  assert.equal(SKINS.find((skin) => skin.id === 'notion').defaultScheme, 'light');
  assert.equal(SKINS.find((skin) => skin.id === 'linear').defaultScheme, 'dark');
  assert.equal(SKINS.find((skin) => skin.id === 'terminal').defaultScheme, 'dark');
  // primer is the base stylesheet itself: no scoped block is shipped for it.
  assert.ok(!skinStyles().includes('[data-skin="primer"]'), 'primer should not need a scoped override block');
});

test('toggles markup includes a skin picker select with four i18n options', () => {
  const html = renderDashboardPage({ csrfToken: 'csrf', summary: {}, diagnostics: [], serviceStatus: null });
  const select = html.match(/<select[^>]*data-skin-picker[^>]*>[\s\S]*?<\/select>/)?.[0] ?? '';
  assert.ok(select, 'expected a skin picker select in the toggles area');
  assert.match(select, /class="toggle-btn skin-picker"/);
  assert.match(select, /data-act="pick-skin"/);
  assert.match(select, /data-i18n-aria-label="skin"/);
  assert.equal(select.match(/<option /g)?.length ?? 0, 4);
  for (const skin of SKINS) {
    assert.ok(select.includes(`value="${skin.id}"`), `picker missing option ${skin.id}`);
    assert.ok(select.includes(`data-i18n="${skin.labelKey}"`), `picker option ${skin.id} missing i18n label`);
  }
});

test('init script reads the skin storage key before first paint and validates it', () => {
  const html = renderDashboardPage({ csrfToken: 'csrf', summary: {}, diagnostics: [], serviceStatus: null });
  const init = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(init, 'expected the theme init script');
  assert.ok(init.includes(SKIN_KEY), 'init script should read the skin storage key');
  assert.ok(init.includes(`${THEME_KEY}:`), 'init script should read the per-skin scheme key');
  assert.match(init, /dataset\.skin=/);
  assert.match(init, /if\(!D\[s\]\)\{s='primer';\}/, 'unknown stored skins fall back to primer');
  assert.match(init, new RegExp(`localStorage\\.getItem\\('${THEME_KEY}'\\)`), 'primer keeps honoring the legacy theme key');
});

test('body script switches skins without reload and stores scheme per skin', () => {
  const html = renderDashboardPage({ csrfToken: 'csrf', summary: {}, diagnostics: [], serviceStatus: null });
  assert.ok(html.includes(`localStorage.setItem('${SKIN_KEY}'`), 'skin choice is persisted');
  assert.ok(html.includes(`localStorage.setItem('${THEME_KEY}:'+`), 'scheme is persisted under the per-skin key');
  assert.match(html, /addEventListener\('change',function\(e\)\{var n=e\.target\.closest&&e\.target\.closest\('\[data-act="pick-skin"\]'\)/);
  assert.match(html, /document\.documentElement\.dataset\.skin=skin\.id/, 'switching only flips attributes, no reload');
  assert.match(html, /if\(t!=='light'&&t!=='dark'\)\{t=skin\.scheme;\}/, 'new skin falls back to its default scheme');
});
