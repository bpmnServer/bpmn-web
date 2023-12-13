declare class AppServices {
    echo(input: any, context: any): Promise<any>;
    getSupervisorUser(input: any, context: any): Promise<string>;
    promptUser(input: any, context: any): Promise<any>;
    serviceTask(input: any, context: any): Promise<void>;
    simulateCrash(input: any, context: any): Promise<void>;
    add({ v1, v2 }: {
        v1: any;
        v2: any;
    }): Promise<number>;
    service99(): Promise<void>;
    notifyhead(): Promise<void>;
    service1(input: any, context: any): Promise<{
        seq: number;
        text: string;
    }>;
    DummyService1(input: any, context: any): Promise<void>;
    DummyService2(input: any, context: any): Promise<void>;
}
export { AppServices };
