declare const router: import("express-serve-static-core").Router;
import { Common } from './common';
export declare class API extends Common {
    get bpmnServer(): any;
    config(): import("express-serve-static-core").Router;
}
export default router;
