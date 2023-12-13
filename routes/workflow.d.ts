import { Common } from './common';
export declare class Workflow extends Common {
    config(): import("express-serve-static-core").Router;
    tasks(request: any, response: any): Promise<any>;
}
export declare class ViewHelper {
    static dateDisplay(date: any): any;
    static dateInput(dateString: any): Date;
    static formatData(data: any): any[];
    static getNodeInfo(processName: any, elementId: any): Promise<{
        node: any;
        fields: any;
    }>;
    static parseField(field: any, value: any, data: any): void;
    static calculateDecorations(items: any): any[];
}
