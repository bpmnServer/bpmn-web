// ESM test configuration. Reads a throwaway local .env from this directory.
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
    Configuration, ModelsDatastore, DataStore, Logger, NoCacheManager, ScriptHandler,
} from '../index.js';
import { TestAppDelegate } from './appDelegate.js';
import dotenv from 'dotenv';

console.log('cwd', process.cwd(), __dirname);
const envirn = dotenv.config({ path: __dirname + '/.env' }).parsed;
console.log(envirn);
console.log('==============================================');

export const configuration = new Configuration({
    definitionsPath: envirn.DEFINITIONS_PATH,
    templatesPath: __dirname + '/../emailTemplates',
    timers: {
        //forceTimersDelay: 1000,
        precision: 3000,
    },
    database: {
        MongoDB: {
            db_url: envirn.MONGO_DB_URL,
            db: 'bpmnTest',
        },
    },
    apiKey: envirn.API_KEY,
    logger: function (server) {
        new Logger(server);
    },
    definitions: function (server) {
        return new ModelsDatastore(server);
    },
    appDelegate: function (server) {
        return new TestAppDelegate(server);
    },
    dataStore: function (server) {
        let ds = new DataStore(server);
        ds.enableSavePoints = true;
        return ds;
    },
    scriptHandler: function (server) {
        return new ScriptHandler();
    },
    cacheManager: function (server) {
        return new NoCacheManager(server);
    },
});
