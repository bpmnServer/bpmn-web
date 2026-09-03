export function deprecatedApi(successorPath: string) {
    return (request, response, next): void => {
        response.setHeader('Deprecation', 'true');
        response.setHeader('Link', `<${successorPath}>; rel="successor-version"`);
        next();
    };
}
