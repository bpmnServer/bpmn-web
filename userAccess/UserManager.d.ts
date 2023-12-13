export declare class UserManager {
    app: any;
    passport: any;
    passportConfig: any;
    constructor(app: any);
    /**
     * Create Express server.
     */
    init(): void;
    initMongo(): void;
    initPassport(): void;
    setup(): void;
    setupRoutes(): void;
    isAuthenticated(req: any, res: any, next: any): any;
}
