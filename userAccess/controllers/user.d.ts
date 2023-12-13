export declare class UserController {
    static admin(req: any, res: any): any;
    /**
     * GET /account/edit
     * Edit user Page.
     */
    static getEdit(req: any, res: any): any;
    /**
     * POST /account/edit
     * Update profile information by admin
     */
    static postEdit(req: any, res: any, next: any): any;
    /**
     * GET /login
     * Login page.
     */
    static getLogin(req: any, res: any): any;
    /**
     * POST /login
     * Sign in using email and password.
     */
    static postLogin(req: any, res: any, next: any): any;
    /**
     * GET /logout
     * Log out.
     */
    static logout(req: any, res: any, next: any): void;
    /**
     * GET /signup
     * Signup page.
     */
    static getSignup(req: any, res: any): any;
    /**
     * POST /signup
     * Create a new local account.
     */
    static postSignup(req: any, res: any, next: any): any;
    /**
     * GET /account
     * Profile page.
     */
    static getAccount(req: any, res: any): void;
    /**
     * POST /account/profile
     * Update profile information.
     */
    static postUpdateProfile(req: any, res: any, next: any): any;
    /**
     * POST /account/password
     * Update current password.
     */
    static postUpdatePassword(req: any, res: any, next: any): void;
    /**
     * POST /account/delete
     * Delete user account.
     */
    static postDeleteAccount(req: any, res: any, next: any): void;
    /**
     * GET /account/unlink/:provider
     * Unlink OAuth provider.
     */
    static getOauthUnlink(req: any, res: any, next: any): void;
    /**
     * GET /reset/:token
     * Reset Password page.
     */
    static getReset(req: any, res: any, next: any): any;
    /**
     * GET /account/verify/:token
     * Verify email address
     */
    static getVerifyEmailToken(req: any, res: any, next: any): any;
    /**
     * GET /account/verify
     * Verify email address
     */
    static getVerifyEmail(req: any, res: any, next: any): any;
    /**
     * POST /reset/:token
     * Process the reset password request.
     */
    static postReset(req: any, res: any, next: any): any;
    /**
     * GET /forgot
     * Forgot Password page.
     */
    static getForgot(req: any, res: any): any;
    /**
     * POST /forgot
     * Create a random token, then the send user an email with a reset link.
     */
    static postForgot(req: any, res: any, next: any): any;
}
