import { escapeHtml } from './helpers.js';
import { baseStyles, bodyScript, fontLinks, renderLayout, themeInitScript } from './layout.js';
import { skinStyles } from './themes/index.js';

export function renderErrorPage({ csrfToken = '', status = 500, title = 'Error', message = 'Something went wrong', cspNonce = '' } = {}) {
  const body = `<section class="card"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><p class="muted">status ${escapeHtml(status)}</p></section>`;
  return csrfToken
    ? renderLayout({ title, active: '', csrfToken, body, cspNonce })
    : `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>${fontLinks()}${themeInitScript(cspNonce)}<style>${baseStyles()}${skinStyles()}</style></head><body><main class="centered"><h1 class="page-title">${escapeHtml(title)}</h1>${body}</main>${bodyScript(cspNonce)}</body></html>`;
}
