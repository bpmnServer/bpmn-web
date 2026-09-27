import test from 'node:test';
import assert from 'node:assert/strict';

import { APIv1 } from './dist/routes/api-v1.js';
import { API2 } from './dist/routes/api2.js';
import { deprecatedApi } from './dist/routes/middleware/deprecatedApi.js';

test('API2 remains only as a compatibility alias of APIv1', () => {
    assert.equal(Object.getPrototypeOf(API2.prototype), APIv1.prototype);
});

test('deprecated aliases advertise their canonical successor', () => {
    const headers = {};
    const response = { setHeader: (name, value) => { headers[name] = value; } };
    let continued = false;

    deprecatedApi('/api/v1')({}, response, () => { continued = true; });

    assert.equal(headers.Deprecation, 'true');
    assert.equal(headers.Link, '</api/v1>; rel="successor-version"');
    assert.equal(continued, true);
});

test('v1 migrates useful legacy execution operations but not unsafe or redundant routes', () => {
    const webApp = {
        bpmnServer: {},
        principalResolver: { resolve: async () => ({}) }
    };
    const router = new APIv1(webApp).config();
    const paths = router.stack.map(layer => layer.route?.path).filter(Boolean);

    assert.ok(paths.includes('/engine/get'));
    assert.ok(paths.includes('/engine/restart'));
    assert.ok(paths.includes('/datastore/find'));
    assert.equal(paths.includes('/engine/upgrade'), false);
    assert.equal(paths.includes('/engine/status'), false);
    assert.equal(paths.includes('/query'), false);
});

test.after(() => { setImmediate(() => process.exit(0)); });
