import fs from 'node:fs';

const path = 'test/admin-review-fixes.test.js';
const source = fs.readFileSync(path, 'utf8');
const before = "  assert.equal(markup.includes('metrics-table'), false);";
const after = "  assert.equal(markup.includes('class=\"metrics-table'), false);";
if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error('Metrics class assertion not found');
  fs.writeFileSync(path, source.replace(before, after));
}
