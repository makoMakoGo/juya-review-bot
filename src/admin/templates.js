// Barrel module: the admin UI renderers live in ./ui/*; this file preserves the
// original public surface of templates.js so importers keep working unchanged.
export {
  escapeAttribute,
  escapeHtml,
  formatConfigValue,
  formatRepository,
  isSecretKey,
  redactInlineSecrets,
  redactSecretValue,
  safeText,
} from './ui/helpers.js';
export { renderLayout, safeScriptJson } from './ui/layout.js';
export { renderLoginPage } from './ui/login.js';
export { renderDashboardPage } from './ui/dashboard.js';
export { renderJobDetailPage, renderJobsPage, renderJobsTable } from './ui/jobs.js';
export { CONFIG_GROUP_DEFS, CONFIG_GROUP_IDS, renderConfigPage } from './ui/config.js';
export { renderErrorPage } from './ui/error.js';
export { renderDiagnosticsList } from './ui/partials.js';
