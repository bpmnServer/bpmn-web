import { SecureUser, type IUserInfo } from 'bpmn-server';

export interface PrincipalResolver {
    resolve(request): SecureUser | Promise<SecureUser>;
}

/**
 * Default service-to-service identity. Values come from server configuration,
 * never from the request body. Applications may inject a resolver that verifies
 * a session or bearer token and returns the same SecureUser contract.
 */
export class EnvironmentPrincipalResolver implements PrincipalResolver {
    resolve(request): SecureUser {
        const prefix = request.originalUrl?.startsWith('/admin/') ? 'ADMIN_' : 'API_';
        const userName = process.env[prefix + 'USER_NAME'];
        if (!userName) throw new Error(`${prefix}USER_NAME is not configured`);

        const params: IUserInfo = {
            userName,
            userGroups: (process.env[prefix + 'USER_GROUPS'] ?? '')
                .split(',').map(value => value.trim()).filter(Boolean),
            tenantId: process.env[prefix + 'TENANT_ID'] || null,
            modelsOwner: process.env[prefix + 'MODELS_OWNER'] || null,
        };
        return new SecureUser(params);
    }
}
