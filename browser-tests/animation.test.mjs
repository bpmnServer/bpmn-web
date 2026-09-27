import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { chromium } from 'playwright';
import { join } from 'node:path';
import { renderInstanceFixture, renderModelsFixture, root } from './instanceFixture.mjs';

async function startFixtureServer() {
  const app = express();
  app.use('/vendor/gsap', express.static(join(root, 'node_modules/gsap/dist')));
  app.use(express.static(join(root, 'public')));
  app.get('/', (_request, response) => response.send(renderInstanceFixture()));
  app.get('/models', (_request, response) => response.send(renderModelsFixture()));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

test('instance Show Animation plays and can be replayed', { timeout: 20000 }, async () => {
  const { server, url } = await startFixtureServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    assert.equal(await page.locator('script[src="/vendor/gsap/gsap.min.js"]').count(), 1);
    assert.equal(await page.evaluate(() => typeof gsap), 'object');
    assert.equal(await page.evaluate(() => typeof MotionPathPlugin), 'function');
    assert.equal(await page.locator('#jsonInfo').count(), 1);

    const button = page.getByRole('button', { name: 'Show Animation' });
    const flow = page.locator('[data-element-id="Flow_1"]');
    await button.click();
    await page.waitForFunction(() =>
      document.querySelector('[data-element-id="Flow_1"]').classList.contains('Completed'),
    );
    assert.equal((await flow.getAttribute('class')).includes('Completed'), true);

    await button.click();
    await page.waitForFunction(() =>
      document.querySelector('[data-element-id="Flow_1"]').classList.contains('Completed'),
    );
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('model search updates the preview and section navigation', { timeout: 20000 }, async () => {
  const { server, url } = await startFixtureServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url + '/models', { waitUntil: 'domcontentloaded' });

    await page.getByRole('searchbox', { name: 'Search models' }).fill('invoice');
    assert.deepEqual(await page.locator('#process option').allTextContents(), ['Invoice']);
    assert.equal(await page.locator('#selected-model-name').innerText(), 'Invoice');
    assert.equal(await page.locator('#modelLink').getAttribute('href'), '/model/edit/Invoice/');

    await page.locator('.workbench-tabs [data-section="tasks"]').click();
    assert.equal(await page.locator('#tasks').isVisible(), true);
    assert.equal(await page.locator('#processes').isVisible(), false);
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
