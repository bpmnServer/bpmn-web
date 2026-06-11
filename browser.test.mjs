// Playwright headless smoke/behaviour tests against a running bpmn-web (http://127.0.0.1:3000).
// Start the app first:  npm start    (uses the LOCAL Mongo .env)
// Then:  node --test browser.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const SHOTS = fileURLToPath(new URL('./browser-tests/screenshots/', import.meta.url));
mkdirSync(SHOTS, { recursive: true });

let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser?.close(); });

// Attach listeners that collect console errors, page errors and >=400 responses.
function track(page) {
  const rec = { consoleErrors: [], pageErrors: [], bad: [] };
  page.on('console', m => { if (m.type() === 'error') rec.consoleErrors.push(m.text()); });
  page.on('pageerror', e => rec.pageErrors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) rec.bad.push(`${r.status()} ${r.url()}`); });
  // CDN assets (font-awesome) may be blocked offline; ignore those for pass/fail.
  return rec;
}
const appJs = (rec) => rec.bad.filter(b => /\/(javascripts|stylesheets|vendor)\//.test(b) && !/cdnjs|fonts\.googleapis/.test(b));

async function open(path) {
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  const rec = track(page);
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  return { page, rec };
}

test('dashboard / renders without app-asset 404s', async () => {
  const { page, rec } = await open('/');
  await page.waitForSelector('nav, #omni_page, body');
  await page.screenshot({ path: SHOTS + 'home.png', fullPage: true });
  assert.deepEqual(appJs(rec), [], 'no missing local js/css on dashboard');
  await page.close();
});

test('model list renders models', async () => {
  const { page, rec } = await open('/model/list');
  const txt = await page.locator('body').innerText();
  assert.ok(/\.bpmn|Buy Used Car|Invoice/i.test(txt), 'model list shows known models');
  await page.screenshot({ path: SHOTS + 'model-list.png', fullPage: true });
  await page.close();
});

test('modeler (withProps) renders a real bpmn-js SVG diagram', async () => {
  const { page, rec } = await open('/model/edit/' + encodeURIComponent('Invoice.bpmn'));
  await page.waitForSelector('#js-canvas svg', { timeout: 25000 });
  // a rendered diagram has multiple djs groups (shapes/connections)
  const groups = await page.locator('#js-canvas svg .djs-group, #js-canvas svg g.djs-element').count();
  assert.ok(groups > 0, `bpmn-js rendered diagram elements (got ${groups})`);
  await page.screenshot({ path: SHOTS + 'modeler-withprops.png', fullPage: true });
  assert.deepEqual(appJs(rec), [], 'withProps bundle + assets all load');
  await page.close();
});

test('client helpers behave in a REAL browser (jsonHelper + SVGHelper)', async () => {
  // dashboard loads jquery + processEditor.js + jsonHelper.js + SVGHelper.js
  const { page, rec } = await open('/');
  await page.waitForFunction(() => typeof window.getItemDescription === 'function'
    && typeof window.getTreeData === 'function' && typeof window.getItemElement === 'function'
    && typeof window.getPropertyFromField === 'function');
  const out = await page.evaluate(() => {
    window.jsonData = { flows: [], elements: [{ id: 'e1', type: 'bpmn:Task', name: 'T' }] };
    return {
      tree: window.getTreeData([{ name: 'a', children: [] }], 'name'),
      elName: window.getItemElement('e1').name,
      desc: window.getItemDescription({ title: 'Task', desc: 'w', start: 's', completion: 'c' },
                                       { id: 'e1', type: 'bpmn:Task' }),
      attr: window.getDescAttribute({ opts: ['x', 'y'] }, 'opts', '<p>', '</p>'),
      prop: window.getPropertyFromField('form_input_color'),   // from processEditor.js
    };
  });
  assert.match(out.tree, /<ul><li>a<\/li>/);
  assert.equal(out.elName, 'T');
  assert.equal(out.prop, 'color');
  assert.match(out.desc, /<tr><td><b>Task<\/b><\/td><\/tr>/);   // title row closes (fixed)
  assert.match(out.desc, /id:<\/td><td>e1/);
  assert.match(out.attr, /<ul><li>x<\/li><li>y<\/li><\/ul>/);
  // no app-asset 404s on the dashboard
  assert.deepEqual(appJs(rec), []);
  await page.close();
});

test('noProp modeler now renders (modeller.js bug fixed: reuses working bundle)', async () => {
  const { page, rec } = await open('/model/editNoProp/' + encodeURIComponent('Invoice.bpmn'));
  await page.waitForSelector('#js-canvas svg', { timeout: 25000 });
  const groups = await page.locator('#js-canvas svg .djs-group, #js-canvas svg g.djs-element').count();
  assert.ok(groups > 0, `noProp modeler renders diagram elements (got ${groups})`);
  await page.screenshot({ path: SHOTS + 'modeler-noprop.png', fullPage: true });
  // the old 404 must be gone
  assert.ok(!rec.bad.some(b => /\/javascripts\/modeller\.js/.test(b)), 'no modeller.js 404 anymore');
  await page.close();
});
