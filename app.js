"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebApp = void 0;
console.log("bpmn-server WebApp.ts version " + getVersion());
const flash = require('connect-flash');
const UserManager_1 = require("./userAccess/UserManager");
/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const _1 = require("./");
const configuration_1 = require("./WorkflowApp/configuration");
var busboy = require('connect-busboy'); //middleware for form/file upload
function getVersion() {
    const fs = require('fs');
    const configPath = __dirname + '/package.json';
    if (fs.existsSync(configPath)) {
        var configuration = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        var _version = configuration['version'];
        return _version;
    }
    else
        return 'cannot locate package.json current: ' + __dirname + ' path ' + configPath;
}
class WebApp {
    constructor() {
        this.initExpress();
        this.userManager = new UserManager_1.UserManager(this.app);
        this.userManager.init();
        const wflogger = new _1.Logger({ toConsole: true });
        this.bpmnServer = new _1.BPMNServer(configuration_1.configuration, wflogger);
        this.bpmnServer.appDelegate.winSocket = null;
        this.setupExpress();
    }
    /**
     * Create Express server.
     */
    initExpress() {
        const app = express();
        /**
         * Express configuration.
         */
        app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
        app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        app.use(compression());
        /*app.use(sass({
          src: path.join(__dirname, 'public'),
          dest: path.join(__dirname, 'public')
        }));*/
        app.use(logger('dev'));
        app.use(bodyParser.json({ limit: '200mb' }));
        app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
        app.use(busboy());
        this.app = app;
    }
    setupExpress() {
        const app = this.app;
        this.userManager.setup();
        this.setupRoutes();
        /**
         * Error Handler.
         */
        if (process.env.NODE_ENV === 'development') {
            // only use in development
            app.use(errorHandler());
        }
        else {
            app.use((err, req, res, next) => {
                console.error(err);
                res.status(500).send('Server Error');
            });
        }
        /**
         * Start Express server.
         */
        app.listen(app.get('port'), () => {
            console.log('App is running at http://localhost:%s in %s mode', app.get('port'), app.get('env'));
            console.log('  Press CTRL-C to stop\n');
        });
        return app;
    }
    setupRoutes() {
        var router = express.Router();
        router.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
        router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
        router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
        router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
        router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
        router.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
        this.app.use('/', router);
        var Common = require("./routes/common");
        var Workflow = require("./routes/workflow").Workflow;
        var Docs = require("./routes/docs").Docs;
        var Model = require("./routes/model").Model;
        var API = require("./routes/api").API;
        this.app.use('/', (new Workflow(this)).config());
        this.app.use('/docs', (new Docs(this)).config());
        this.app.use('/model', (new Model(this)).config());
        this.app.use('/api', (new API(this)).config());
    }
}
exports.WebApp = WebApp;
/** Main logic
*/
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
function setupEnvVars() {
    dotenv.config();
    var argv = process.argv;
    var args = {};
    for (let i = 2; i < argv.length; i++) {
        const key = argv[i];
        const val = argv[++i];
        process.env[key] = val;
    }
}
setupEnvVars();
const webApp = new WebApp();
module.exports = webApp.app;
//# sourceMappingURL=app.js.map