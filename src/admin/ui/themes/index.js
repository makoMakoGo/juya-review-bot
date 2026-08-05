// Skin registry. The primer skin IS the base stylesheet (baseStyles() +
// pageStyles), so it needs no override block; the other skins are scoped
// CSS strings whose selectors all live under [data-skin="<id>"].
import { linearSkin } from './linear.js';
import { notionSkin } from './notion.js';
import { terminalSkin } from './terminal.js';

export const SKINS = Object.freeze([
  { id: 'primer', labelKey: 'skin_primer', defaultScheme: 'light' },
  { id: 'notion', labelKey: 'skin_notion', defaultScheme: 'light' },
  { id: 'linear', labelKey: 'skin_linear', defaultScheme: 'dark' },
  { id: 'terminal', labelKey: 'skin_terminal', defaultScheme: 'dark' },
]);

export function skinStyles() {
  return `${notionSkin}${linearSkin}${terminalSkin}`;
}
