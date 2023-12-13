export declare class WebApp {
    app: any;
    userManager: any;
    bpmnServer: any;
    constructor();
    /**
     * Create Express server.
     */
    initExpress(): void;
    setupExpress(): any;
    setupRoutes(): void;
}
