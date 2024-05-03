"use strict";

console.log('----', __filename);


Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const __1 = require("../");
const appDelegate_1 = require("./appDelegate");
const __2 = require("../");
const __3 = require("../");
//require("dotenv/config");
console.log('cwd',process.cwd(),__dirname);
let envirn=require('dotenv').config({ path: __dirname+'/.env' })
console.log(envirn);
console.log('==============================================');
exports.configuration = new __1.Configuration({
    definitionsPath: process.env.DEFINITIONS_PATH,
    templatesPath: __dirname + '/../emailTemplates',
    timers: {
        //forceTimersDelay: 1000,
        precision: 3000,
    },
    database: {
        MongoDB: {
            db_url: process.env.MONGO_DB_URL,
            db: 'bpmn'
        }
    },
    apiKey: process.env.API_KEY,
    logger: function (server) {
        new __3.Logger(server);
    },
    definitions: function (server) {
        return new __1.ModelsDatastore(server);
    },
    appDelegate: function (server) {
        return new appDelegate_1.TestAppDelegate(server);
    },
    dataStore: function (server) {
        let ds = new __2.DataStore(server);
        ds.enableSavePoints = true;
        return ds;
    },
    cacheManager: function (server) {
        return new __2.NoCacheManager(server);
    }
});
//# sourceMappingURL=testConfiguration.js.map