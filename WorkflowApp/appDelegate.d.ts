import { Item, IExecution } from './';
import { DefaultAppDelegate } from './';
declare class MyAppDelegate extends DefaultAppDelegate {
    winSocket: any;
    appServices: any;
    appUtils: any;
    constructor(server: any);
    getServicesProvider(context: any): Promise<any>;
    /**
    * is fired on application startup
    **/
    startUp(options: any): Promise<void>;
    /**
     * sends emails is called by Notification class
     *
     * @param to
     * @param subject
     * @param text
     */
    sendEmail(to: any, subject: any, text: any): Promise<any>;
    executionStarted(execution: IExecution): Promise<void>;
    executionEvent(context: any, event: any): Promise<void>;
    messageThrown(messageId: any, data: any, matchingQuery: any, item: Item): Promise<void>;
    signalThrown(signalId: any, data: any, matchingQuery: any, item: Item): Promise<void>;
    serviceCalled(input: any, context: any): Promise<void>;
}
export { MyAppDelegate };
