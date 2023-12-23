"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const WorkflowApp_1 = require("../WorkflowApp");
const appDelegate_1 = require("./appDelegate");
const __1 = require("../");
const __2 = require("../");
const UserService_1 = require("../userAccess/UserService");
require("dotenv/config");
exports.configuration = new WorkflowApp_1.Configuration({
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
        new __2.Logger(server);
    },
    definitions: function (server) {
        return new WorkflowApp_1.ModelsDatastore(server);
    },
    appDelegate: function (server) {
        return new appDelegate_1.TestAppDelegate(server);
    },
    dataStore: function (server) {
        return new __1.DataStore(server);
    },
    cacheManager: function (server) {
        return new __1.NoCacheManager(server);
    },
    userService: function (server) {
        return new UserService_1.UserService(server);
    }
});
//# sourceMappingURL=testConfiguration.js.map