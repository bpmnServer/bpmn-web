export class Common {
    webApp;
    constructor(webApp) {
        this.webApp = webApp;
    }

    /**
     * Session-auth gate for the UI routers. Apply router-wide
     * (`router.use(this.isAuthenticated)`) for deny-by-default.
     *
     * `REQUIRE_AUTHENTICATION=false` keeps the historical dev bypass so the
     * demo can be explored without setting up users.
     */
    isAuthenticated(req, res, next) {
        if (process.env.REQUIRE_AUTHENTICATION === 'false') return next();
        if (typeof req.isAuthenticated !== 'function' || req.isAuthenticated() !== true || !req.user) {
            return res.redirect('/login');
        }
        req.isAdmin = Array.isArray(req.user.userGroups) &&
            (req.user.userGroups.includes('ADMIN') || req.user.userGroups.includes('SYSTEM'));
        return next();
    }

    isAdmin(req, res, next) {
        if (process.env.REQUIRE_AUTHENTICATION === 'false' || req.isAdmin === true) return next();
        return res.status(403).send('Administrator permission required');
    }
}
