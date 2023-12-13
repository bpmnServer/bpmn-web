import { IUserService } from '../';
export declare class UserService implements IUserService {
    static initialized: boolean;
    constructor(server: any);
    findUsers(query: any): Promise<any>;
    findUser(query: any): Promise<any>;
    addUser(userName: any, email: any, password: any, userGroups: any): Promise<any>;
    setPassword(userName: any, password: any): Promise<void>;
    install(): Promise<void>;
    init(): void;
}
