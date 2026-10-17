import crypto from 'node:crypto';
import { SecureUser } from 'bpmn-server';

export function configuredApiUser(): SecureUser {
    const userName = process.env.API_SERVICE_USER_NAME;
    const groups = process.env.API_SERVICE_USER_GROUPS?.split(',').map(g => g.trim()).filter(Boolean);
    if (!userName || !groups?.length)
        throw new Error('API service principal is not configured');
    return new SecureUser({
        userName,
        userGroups: groups,
        tenantId: process.env.API_SERVICE_TENANT_ID,
        modelsOwner: process.env.API_SERVICE_MODELS_OWNER,
    });
}

export function apiServiceAuth(req, res, next): void {
    try {
        configuredApiUser();
        next();
    } catch (error) {
        res.status(500).json({ errors: error.message });
    }
}

/**
 * Constant-time string comparison. Both sides are hashed first so inputs of
 * differing length can be compared without leaking length and without
 * timingSafeEqual throwing.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
    const ha = crypto.createHash('sha256').update(a, 'utf8').digest();
    const hb = crypto.createHash('sha256').update(b, 'utf8').digest();
    return crypto.timingSafeEqual(ha, hb);
}

/**
 * API-key auth for the machine-to-machine routers (/api, /api2).
 *
 * Replaces the previous inline `loggedIn`, which had three problems:
 *   - `apiKey == process.env.API_KEY` authenticated EVERY request when API_KEY
 *     was unset (undefined == undefined);
 *   - the comparison was not constant-time;
 *   - the key was also accepted via `?apiKey=` query param, which leaks it into
 *     access logs, proxy logs and browser history.
 *
 * This fails closed when API_KEY is not configured, accepts the header only,
 * and returns proper status codes so callers/monitoring can tell auth failures
 * apart from application errors.
 */
export function apiKeyAuth(req, res, next): void {
    const configured = process.env.API_KEY;
    if (!configured) {
        res.status(500).json({ errors: 'server API key is not configured' });
        return;
    }

    const presented = req.header('x-api-key');
    if (typeof presented === 'string' && timingSafeEqualStr(presented, configured)) {
        next();
        return;
    }

    res.status(401).json({ errors: 'missing or invalid "x-api-key"' });
}
