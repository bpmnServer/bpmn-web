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
        if (process.env.REQUIRE_AUTHENTICATION !== 'false' && typeof req.isAuthenticated === 'function') {
            if (req.isAuthenticated() === true) {
                req.isAdmin = !(req.user.userGroups && req.user.userGroups.indexOf('ADMIN') === -1);
                return next();
            }
            return res.redirect('/login');
        }
        return next();
    }
}
