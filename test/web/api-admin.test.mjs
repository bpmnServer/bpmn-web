// Model administration over /admin/api2, with a service account in the ADMIN group.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { startWebApp, ADMIN_API_KEY, API_KEY, FIXTURES, WebClient } from '../support/webApp.mjs';

let web;
test.before(async () => { web = await startWebApp({ env: { API_SERVICE_USER_GROUPS: 'ADMIN' } }); });
test.after(async () => { await web?.stop(); setImmediate(() => process.exit(0)); });

const admin = (method, url, body) => web.api(method, url, body, ADMIN_API_KEY);
const names = async () => JSON.stringify((await admin('GET', '/admin/api2/model/list')).body);

test('import, list, load, rename and delete a model', async () => {
  const source = fs.readFileSync(path.join(FIXTURES, 'leave-request.bpmn'), 'utf8');
  const imported = await new WebClient(web.base).request('POST', '/admin/api2/model/import/api-model', {
    headers: { 'x-api-key': ADMIN_API_KEY }, multipart: { file: { filename: 'api-model.bpmn', content: source, type: 'application/xml' } },
  });
  assert.equal(imported.status, 200, JSON.stringify(imported.body));
  assert.match(await names(), /api-model/);

  const loaded = await admin('GET', '/admin/api2/model/load/api-model');
  assert.equal(loaded.status, 403, 'loading the definition needs the SYSTEM group, not ADMIN');

  const renamed = await admin('POST', '/admin/api2/model/rename', { name: 'api-model', newName: 'api-model-2' });
  assert.equal(renamed.status, 200, JSON.stringify(renamed.body));
  assert.match(await names(), /api-model-2/);

  const deleted = await admin('POST', '/admin/api2/model/delete', { name: 'api-model-2' });
  assert.equal(deleted.status, 200, JSON.stringify(deleted.body));
  assert.doesNotMatch(await names(), /api-model/);
});

test('the runtime key does not reach model administration', async () => {
  assert.equal((await web.api('GET', '/admin/api2/model/list', undefined, API_KEY)).status, 401);
});

test('an administrator service account may delete instances', async () => {
  await web.api('POST', '/api2/engine/start', { name: 'leave-request', data: { marker: 'delete-me' } });
  const res = await web.api('DELETE', '/api2/data/deleteInstances', { query: { 'data.marker': 'delete-me' } });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal((await web.bpmnServer.dataStore.findInstances({ 'data.marker': 'delete-me' }, 'summary')).length, 0);
});
