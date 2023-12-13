"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const _1 = require("./");
const appDelegate_1 = require("./appDelegate");
const UserService_1 = require("../userAccess/UserService");
const dotenv = require('dotenv');
const res = dotenv.config();
class SQLite extends _1.DataStore {
}
const templatesPath = __dirname + '/emailTemplates/';
var configuration = new _1.Configuration({
    definitionsPath: process.env.DEFINITIONS_PATH,
    templatesPath: templatesPath,
    timers: {
        //forceTimersDelay: 1000, 
        precision: 3000,
    },
    database: {
        MongoDB: {
            db_url: process.env.MONGO_DB_URL //"mongodb://localhost:27017?retryWrites=true&w=majority",
        },
        SQLite: { db_connection: '' }
    },
    apiKey: process.env.API_KEY,
    /* Define Server Services */
    logger: function (server) {
        new _1.Logger(server);
    },
    definitions: function (server) {
        return new _1.ModelsDatastore(server);
    },
    appDelegate: function (server) {
        return new appDelegate_1.MyAppDelegate(server);
    },
    dataStore: function (server) {
        //			return new DataStore(server);
        return new SQLite(server);
    },
    cacheManager: function (server) {
        return new _1.NoCacheManager(server);
    },
    userService: function (server) {
        return new UserService_1.UserService(server);
    }
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map