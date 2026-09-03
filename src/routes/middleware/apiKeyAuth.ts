import crypto from 'node:crypto';

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
    const adminRequest = typeof req.originalUrl === 'string' && req.originalUrl.startsWith('/admin/');
    const configured = adminRequest ? process.env.ADMIN_API_KEY : process.env.API_KEY;
    if (!configured) {
        const keyName = adminRequest ? 'ADMIN_API_KEY' : 'API_KEY';
        res.status(500).json({ errors: `server ${keyName} is not configured` });
        return;
    }

    const presented = req.header('x-api-key');
    if (typeof presented === 'string' && timingSafeEqualStr(presented, configured)) {
        next();
        return;
    }

    res.status(401).json({ errors: 'missing or invalid "x-api-key"' });
}
