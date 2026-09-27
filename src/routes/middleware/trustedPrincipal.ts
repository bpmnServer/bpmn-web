import type { PrincipalResolver } from '../../security/PrincipalResolver.js';

export function trustedPrincipal(resolver: PrincipalResolver) {
    return async (request, response, next): Promise<void> => {
        if (request.body?.user !== undefined) {
            response.status(400).json({ errors: 'user identity must not be supplied in the request body' });
            return;
        }
        try {
            request.workflowUser = await resolver.resolve(request);
            next();
        } catch (error) {
            response.status(401).json({ errors: error instanceof Error ? error.message : 'invalid principal' });
        }
    };
}
