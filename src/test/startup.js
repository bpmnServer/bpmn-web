const { BPMNServer, DefaultAppDelegate, Logger } = require('./feature/index.js');
const { configuration } = require('./feature/index.js');

export const logger = new Logger({ toConsole: false });

export const server = new BPMNServer(configuration, logger);
