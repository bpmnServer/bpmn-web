import test from 'node:test';
import assert from 'node:assert/strict';

import { EnvironmentPrincipalResolver } from './dist/security/PrincipalResolver.js';
import { trustedPrincipal } from './dist/routes/middleware/trustedPrincipal.js';

function responseState() {
    const state = { status: 200, body: undefined };
    return {
        state,
        response: {
            status(value) { state.status = value; return this; },
            json(value) { state.body = value; return this; },
        },
    };
}

test('rejects identity supplied in workflow request data', async () => {
    const { state, response } = responseState();
    const request = { body: { user: { userName: 'forged' } } };
    let continued = false;

    await trustedPrincipal({ resolve: () => { throw new Error('must not resolve'); } })(
        request, response, () => { continued = true; },
    );

    assert.equal(state.status, 400);
    assert.equal(continued, false);
});

test('default resolver derives identity from server configuration', () => {
    process.env.API_USER_NAME = 'workflow-service';
    process.env.API_USER_GROUPS = 'OPERATIONS,REVIEWERS';
    process.env.API_TENANT_ID = 'tenant-a';

    const user = new EnvironmentPrincipalResolver().resolve({ originalUrl: '/api/v1/status' });
    assert.equal(user.userName, 'workflow-service');
    assert.deepEqual(user.userGroups, ['OPERATIONS', 'REVIEWERS']);
    assert.equal(user.tenantId, 'tenant-a');
});

test('accepts identity only from the configured resolver', async () => {
    const { response } = responseState();
    const trusted = { userName: 'verified-user', userGroups: [] };
    const request = { body: {} };
    let continued = false;

    await trustedPrincipal({ resolve: () => trusted })(request, response, () => { continued = true; });
    assert.equal(request.workflowUser, trusted);
    assert.equal(continued, true);
});
