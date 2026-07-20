import { PRODUCT } from '../../brand.js';
import { escapeAttribute, escapeHtml } from './helpers.js';
import { renderAlert } from './partials.js';
import { baseStyles, bodyScript, fontLinks, themeInitScript, togglesHtml } from './layout.js';
import { skinStyles } from './themes/index.js';

export function renderLoginPage({ csrfToken = '', error = '', disabledReason = '', cspNonce = '' } = {}) {
  const disabled = disabledReason !== '';
  const message = disabled
    ? renderAlert(escapeHtml(disabledReason))
    : error ? renderAlert(escapeHtml(error)) : '';
  const form = disabled ? '' : `<form method="post" action="/admin/login" class="login-form">
<label for="password" data-i18n="label_password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
<input type="hidden" name="_csrf" value="${escapeAttribute(csrfToken)}">
<button type="submit" class="primary" data-i18n="sign_in">Sign in</button>
</form>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · ${escapeHtml(PRODUCT.consoleName)}</title>
<link rel="icon" type="image/jpeg" href="${escapeAttribute(PRODUCT.iconPath)}">
${fontLinks()}${themeInitScript(cspNonce)}<style>${baseStyles()}${skinStyles()}</style>
</head>
<body class="login-body">
<div class="login-shell">
  <div class="login-toolbar">${togglesHtml()}</div>
  <main class="login-main">
    <div class="login-brand"><img class="brand-icon" src="${escapeAttribute(PRODUCT.iconPath)}" width="32" height="32" alt=""></div>
    <h1 class="login-title" data-i18n="login_title">Sign in</h1>
    <p class="login-sub muted" data-i18n="login_sub">${escapeHtml(PRODUCT.name)} administration</p>
    <div class="login-card">${message}${form}</div>
  </main>
</div>
${bodyScript(cspNonce)}
</body>
</html>`;
}
