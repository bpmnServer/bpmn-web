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

test.after(() => { setImmediate(() => process.exit(0)); });
