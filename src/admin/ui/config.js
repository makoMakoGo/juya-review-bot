import { ENGINE } from '../../brand.js';
import { escapeAttribute, escapeHtml, formatConfigValue, isSecretKey } from './helpers.js';
import { renderAlert } from './partials.js';
import { renderLayout } from './layout.js';

export function renderConfigPage({ csrfToken, config = {}, adminRoot = '/data/admin', flash = null, cspNonce = '', section = 'service' } = {}) {
  const fields = Array.isArray(config.fields) ? config.fields : legacyConfigFields(config);
  const revision = config.revision ?? '';
  const flashHtml = flash
    ? renderAlert(escapeHtml(flash.message), { tone: flash.type === 'success' ? 'success' : 'error' })
    : '';
  const pending = config.pendingRestart;
  const pendingHtml = pending?.required
    ? renderAlert(`<span data-i18n="config_restart_required_for">Restart required for</span>: ${escapeHtml((pending.keys ?? []).join(', '))}`, { tone: 'warning' })
    : '';
  const groups = groupConfigFields(fields);
  const counts = summarizeConfigFieldCounts(fields);
  const activeId = groups.some((group) => group.id === section) ? section : (groups[0]?.id || 'service');
  const activeGroup = groups.find((group) => group.id === activeId) || groups[0] || { id: 'service', label: 'Service', labelKey: 'config_group_service', fields: [] };

  const subnav = groups.map((group) => {
    const active = group.id === activeId ? ' is-active' : '';
    const count = group.fields.length;
    return `<a class="settings-subnav-link${active}" href="/admin/config?section=${escapeAttribute(group.id)}"><span data-i18n="${escapeAttribute(group.labelKey)}">${escapeHtml(group.label)}</span><span class="settings-count">${count}</span></a>`;
  }).join('');

  const rows = activeGroup.fields.map(renderSettingsField).join('');
  const body = `<div class="settings" data-config-editor data-settings-section="${escapeAttribute(activeId)}">
  <p class="page-desc muted" data-i18n="config_page_desc">Runtime configuration with audit trail. High-risk fields require confirmation.</p>
  <div class="settings-meta muted">
    <span><span data-i18n="admin_storage_root">Storage</span> <code>${escapeHtml(adminRoot)}</code></span>
    <span><span data-i18n="revision">Revision</span> <code>${escapeHtml(revision)}</code></span>
    <span><span data-i18n="config_field_total">fields</span> <code>${fields.length}</code></span>
    <span><span data-i18n="config_override_count">overrides</span> <code>${counts.overrides}</code></span>
    <span><span data-i18n="config_secret_count">secrets</span> <code>${counts.secrets}</code></span>
    <span><span data-i18n="config_restart_count">restart required</span> <code>${counts.restartRequired}</code></span>
  </div>
  ${flashHtml}${pendingHtml}
  <div class="settings-layout">
    <nav class="settings-subnav" aria-label="Config groups" data-i18n-aria-label="aria_config_groups">${subnav}</nav>
    <section class="settings-panel">
      <form method="post" action="/admin/config" class="settings-form">
        <input type="hidden" name="_csrf" value="${escapeAttribute(csrfToken)}">
        <input type="hidden" name="revision" value="${escapeAttribute(revision)}">
        <input type="hidden" name="section" value="${escapeAttribute(activeId)}">
        <header class="settings-panel-head">
          <div>
            <h2 class="settings-panel-title" data-i18n="${escapeAttribute(activeGroup.labelKey)}">${escapeHtml(activeGroup.label)}</h2>
            <p class="muted settings-panel-desc" data-i18n="${escapeAttribute(activeGroup.descriptionKey || '')}">${escapeHtml(activeGroup.description || '')}</p>
          </div>
          <button type="submit" class="btn btn-primary" data-i18n="btn_save_config">Save changes</button>
        </header>
        <div class="settings-list" data-config-group="${escapeAttribute(activeId)}" id="config-group-${escapeAttribute(activeId)}">${rows || '<p class="empty" data-i18n="config_no_matches">No matching configuration fields.</p>'}</div>
        <footer class="settings-panel-foot">
          <span class="muted settings-panel-count"><span class="settings-count">${activeGroup.fields.length}</span> <span data-i18n="config_field_total">fields</span></span>
          <button type="submit" class="btn btn-primary" data-i18n="btn_save_config">Save changes</button>
        </footer>
      </form>
    </section>
  </div>
</div>`;
  return renderLayout({ title: 'Settings', active: 'config', csrfToken, body, titleKey: 'page_config', cspNonce, pageStyles: CONFIG_PAGE_STYLES });
}

function renderSettingsField(field) {
  const envKey = field.envKey ?? field.name ?? '';
  const label = field.label ?? envKey;
  const description = field.description ?? '';
  const searchText = [label, envKey, description].join(' ').toLowerCase();
  const flags = [
    field.secret ? 'secret' : '',
    field.highRisk ? 'highRisk' : '',
    field.restartRequired || field.pendingRestart ? 'restart' : '',
    field.overridden ? 'override' : '',
  ].filter(Boolean).join(' ');
  return `<article class="settings-item" id="config-field-${escapeAttribute(envKey)}" data-config-row data-env-key="${escapeAttribute(envKey)}" data-group="${escapeAttribute(field.group || 'service')}" data-search="${escapeAttribute(searchText)}" data-flags="${escapeAttribute(flags)}">
  <div class="settings-item-main">
    <div class="settings-item-copy">
      <div class="field-label" id="config-label-${escapeAttribute(envKey)}">${escapeHtml(label)}</div>
      <code>${escapeHtml(envKey)}</code>
      ${description ? `<p class="muted">${escapeHtml(description)}</p>` : ''}
      <div class="settings-item-meta">${renderConfigBadges(field)}</div>
    </div>
    <div class="settings-item-value">
      <div class="settings-effective">${renderConfigFieldValue(field)}</div>
      <div class="settings-control">${renderConfigEditorControl(field)}</div>
      <div class="settings-actions">${renderSettingsFieldActions(field)}</div>
    </div>
  </div>
</article>`;
}

function renderSettingsFieldActions(field) {
  const confirmHtml = renderHighRiskConfirm(field);
  const resetHtml = renderConfigReset(field);
  if (!confirmHtml) return resetHtml;
  return `${resetHtml}<div class="settings-danger-zone">${confirmHtml}</div>`;
}

function groupConfigFields(fields) {
  const groups = new Map(CONFIG_GROUP_DEFS.map(group => [group.id, { ...group, fields: [] }]));
  for (const field of fields) {
    const groupId = field.group && groups.has(field.group) ? field.group : 'service';
    groups.get(groupId).fields.push(field);
  }
  return [...groups.values()].filter(group => group.fields.length > 0);
}

function summarizeConfigFieldCounts(fields) {
  return {
    overrides: fields.filter(field => field.overridden).length,
    secrets: fields.filter(field => field.secret).length,
    restartRequired: fields.filter(field => field.restartRequired || field.pendingRestart).length,
    highRisk: fields.filter(field => field.highRisk).length,
  };
}


function renderConfigFieldValue(field) {
  if (field.envKey === 'ADMIN_PASSWORD') return renderAdminPasswordFieldValue(field);
  if (field.secret) return renderSecretFieldValue(field);
  return `<code>${escapeHtml(formatConfigValue(field.envKey ?? field.name, field.effectiveValue ?? field.value))}</code>`;
}

function renderSecretFieldValue(field) {
  return field.set
    ? '<code class="settings-secret-mask">••••••••</code>'
    : '<span class="empty" data-i18n="not_set">not set</span>';
}

function renderAdminPasswordFieldValue(field) {
  const secretStatus = renderSecretFieldValue(field);
  if (typeof field.adminDashboardEnabled !== 'boolean') return secretStatus;
  const enabled = field.adminDashboardEnabled;
  const status = enabled
    ? '<span class="label label-success" data-i18n="admin_dashboard_enabled">dashboard enabled</span>'
    : '<span class="label label-attention" data-i18n="admin_dashboard_disabled">dashboard disabled</span>';
  const reason = !enabled && field.adminDashboardDisabledReason
    ? `<span class="empty">${escapeHtml(field.adminDashboardDisabledReason)}</span>`
    : '';
  return `<div class="stack">${secretStatus}${status}${reason}</div>`;
}

function renderConfigEditorControl(field) {
  const envKey = field.envKey ?? '';
  if (!field.editable) return '<span class="empty" data-i18n="not_editable">Not editable from dashboard.</span>';
  if (field.secret) {
    return `<div class="stack"><label><input type="radio" name="secret_${escapeAttribute(envKey)}" value="keep" checked> <span data-i18n="keep_secret">Keep current secret</span></label><label><input type="radio" name="secret_${escapeAttribute(envKey)}" value="clear"> <span data-i18n="clear_secret">Clear secret</span></label><label><input type="radio" name="secret_${escapeAttribute(envKey)}" value="replace"> <span data-i18n="replace_with">Replace with</span></label><input class="config-control" type="password" name="value_${escapeAttribute(envKey)}" autocomplete="off" value="" placeholder="••••••••" aria-labelledby="config-label-${escapeAttribute(envKey)}"></div>`;
  }
  return `<input class="config-control" name="value_${escapeAttribute(envKey)}" value="${escapeAttribute(formatEditorValue(field.effectiveValue ?? field.value))}" aria-labelledby="config-label-${escapeAttribute(envKey)}">`;
}

function renderConfigBadges(field) {
  const badges = [];
  if (field.source) badges.push({ text: `source: ${field.source}`, tone: 'label-muted' });
  badges.push({ text: field.secret ? 'secret' : 'non-secret', tone: field.secret ? 'label-accent' : 'label-muted' });
  badges.push({ text: field.restartRequired ? 'restart required' : 'hot reload', tone: field.restartRequired ? 'label-attention' : 'label-success' });
  badges.push({ text: field.overridden ? 'override active' : 'no override', tone: field.overridden ? 'label-attention' : 'label-muted' });
  if (field.pendingRestart) badges.push({ text: 'pending restart', tone: 'label-danger' });
  if (field.highRisk) badges.push({ text: 'high risk', tone: 'label-danger' });
  return `<div class="field-meta">${badges.map(badge => `<span class="label ${badge.tone}">${escapeHtml(badge.text)}</span>`).join(' ')}</div>`;
}

function renderConfigReset(field) {
  if (!field.canReset) return '';
  const envKey = field.envKey ?? '';
  return `<label class="nowrap"><input type="checkbox" name="reset_${escapeAttribute(envKey)}" value="1"> <span data-i18n="reset_override">Reset override</span></label>`;
}

function renderHighRiskConfirm(field) {
  if (!field.highRisk || !field.editable) return '';
  const envKey = field.envKey ?? '';
  return `<label class="danger nowrap"><input type="checkbox" name="confirm_${escapeAttribute(envKey)}" value="1"> <span data-i18n="confirm_high_risk">Confirm high-risk change</span></label>`;
}

export const CONFIG_GROUP_DEFS = Object.freeze([
  { id: 'service', label: 'Service', labelKey: 'config_group_service', descriptionKey: 'config_group_service_desc', description: 'Core runtime process, ports, and workdir behavior.' },
  { id: 'access', label: 'Triggers & Access', labelKey: 'config_group_access', descriptionKey: 'config_group_access_desc', description: 'Who can trigger reviews and which repositories are allowed.' },
  { id: 'github', label: 'GitHub App', labelKey: 'config_group_github', descriptionKey: 'config_group_github_desc', description: 'GitHub App identity, private key path, and webhook secret.' },
  { id: 'ocr', label: 'OCR Engine', labelKey: 'config_group_ocr', descriptionKey: 'config_group_ocr_desc', description: `${ENGINE.name} engine provider endpoint, model, and concurrency.` },
  { id: 'proxy', label: 'LLM Proxy', labelKey: 'config_group_proxy', descriptionKey: 'config_group_proxy_desc', description: 'Internal LLM proxy routing and upstream authentication.' },
  { id: 'admin', label: 'Admin Dashboard', labelKey: 'config_group_admin', descriptionKey: 'config_group_admin_desc', description: 'Dashboard access, host allowlist, cookies, and data root.' },
  { id: 'retention', label: 'Retention & Storage', labelKey: 'config_group_retention', descriptionKey: 'config_group_retention_desc', description: 'How long jobs, logs, stats, and audits are kept.' },
]);
export const CONFIG_GROUP_IDS = Object.freeze(CONFIG_GROUP_DEFS.map((group) => group.id));

function legacyConfigFields(config) {
  return Object.entries(config)
    .filter(([key]) => key !== 'revision' && key !== 'pendingRestart')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ name: key, envKey: key, label: key, value, effectiveValue: value, source: '', secret: isSecretKey(key), editable: false, restartRequired: false, hotReloadable: true, overridden: false, canReset: false, highRisk: false, group: 'service' }));
}

function formatEditorValue(value) {
  if (value instanceof Set) return [...value].sort().join(',');
  if (Array.isArray(value)) return value.map(item => formatEditorValue(item)).join(',');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value == null) return '';
  return String(value);
}

// Linear/Vercel settings-page styles. Scoped under .settings so shared
// component classes (.btn, .label, .flash…) stay owned by baseStyles().
// Relies on the shared CSS custom properties (--canvas-*, --border-*,
// --fg-*, --accent-fg, --danger-fg, --radius, --font-mono).
const CONFIG_PAGE_STYLES = `
.settings .page-desc { margin: 0 0 12px; font-size: 14px; color: var(--fg-muted); }
.settings-meta {
  display: flex; flex-wrap: wrap; gap: 4px 20px;
  margin: 0 0 24px; padding: 8px 16px;
  background: var(--canvas-subtle);
  border: 1px solid var(--border-muted); border-radius: var(--radius);
  font-size: 12px; line-height: 1.8; color: var(--fg-muted);
}
.settings-meta code {
  padding: 0; background: transparent; border: 0;
  font-size: 12px; color: var(--fg-default);
}
.settings-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; align-items: start; }
.settings-subnav { position: sticky; top: 76px; display: flex; flex-direction: column; gap: 1px; }
.settings-subnav-link {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 10px; border-radius: var(--radius);
  font-size: 14px; font-weight: 400; color: var(--fg-default); text-decoration: none;
}
.settings-subnav-link:hover { background: var(--canvas-subtle); text-decoration: none; }
.settings-subnav-link.is-active { background: var(--accent-subtle); color: var(--accent-fg); font-weight: 600; }
.settings-count {
  display: inline-block; min-width: 20px; padding: 0 6px;
  font-size: 12px; font-weight: 500; line-height: 18px; text-align: center;
  color: var(--fg-muted);
  background: color-mix(in srgb, var(--fg-muted) 14%, transparent);
  border: 0; border-radius: 20px;
}
.settings-panel {
  background: var(--canvas-default);
  border: 1px solid var(--border-default); border-radius: var(--radius);
  box-shadow: none;
}
.settings-panel-head, .settings-panel-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px;
}
.settings-panel-head { align-items: flex-start; border-bottom: 1px solid var(--border-muted); }
.settings-panel-foot { border-top: 1px solid var(--border-muted); }
.settings-panel-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--fg-default); }
.settings-panel-desc { margin: 4px 0 0; font-size: 13px; line-height: 1.5; max-width: 62ch; color: var(--fg-muted); }
.settings-panel-count { margin: 0; font-size: 12px; }
.settings-list { display: flex; flex-direction: column; }
.settings-item { padding: 16px; border-bottom: 1px solid var(--border-muted); }
.settings-item:last-child { border-bottom: 0; }
.settings-item-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 380px); gap: 24px; align-items: start; }
.settings-item-copy .field-label { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: var(--fg-default); }
.settings-item-copy > code {
  display: inline-block; margin: 0 0 6px; padding: 0;
  background: transparent; border: 0;
  font-size: 12px; color: var(--fg-muted); word-break: break-all;
}
.settings-item-copy p { margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: var(--fg-muted); }
.settings-item-meta .field-meta { display: flex; flex-wrap: wrap; gap: 4px; }
.settings-item-value { display: grid; gap: 10px; }
.settings-effective { min-height: 1.4em; font-size: 13px; }
.settings-effective code {
  padding: 0; background: transparent; border: 0;
  font-size: 13px; color: var(--fg-default); word-break: break-all;
}
.settings-secret-mask { font-family: var(--font-mono); font-size: 13px; color: var(--fg-muted); }
.settings-control .config-control {
  width: 100%; padding: 5px 12px;
  font-size: 14px; line-height: 20px; font-family: var(--font-sans);
  color: var(--fg-default); background: var(--canvas-default);
  border: 1px solid var(--border-default); border-radius: var(--radius);
}
.settings-control .config-control::placeholder { color: var(--fg-muted); opacity: 1; }
.settings-control .config-control:focus {
  border-color: var(--accent-fg); outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-fg) 30%, transparent);
}
.settings-control .stack, .settings-effective .stack { display: grid; gap: 6px; justify-items: start; }
.settings-control .stack label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--fg-default);
}
.settings input[type="radio"], .settings input[type="checkbox"] { accent-color: var(--accent-fg); margin: 0; }
.settings-actions { display: grid; gap: 8px; font-size: 13px; justify-items: start; }
.settings-actions label {
  display: flex; align-items: center; gap: 6px; margin: 0;
  white-space: normal; color: var(--fg-default);
}
.settings-danger-zone {
  width: 100%; padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--danger-fg) 45%, transparent);
  border-radius: var(--radius);
}
.settings-danger-zone label { color: var(--danger-fg); font-weight: 600; }
.settings .empty { margin: 0; font-size: 13px; font-style: normal; color: var(--fg-muted); }
.settings-item:hover { background: transparent; }
@media (max-width: 900px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-subnav { position: static; flex-direction: row; flex-wrap: wrap; }
  .settings-item-main { grid-template-columns: 1fr; }
  .settings-panel-head { flex-direction: column; align-items: stretch; }
}
`;
