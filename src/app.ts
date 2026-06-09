import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath as __f2p } from 'url';
import { dirname as __dn } from 'path';
const __filename = __f2p(import.meta.url);
const __dirname = __dn(__filename);
console.log('app.ts from ',__filename);


import debug from 'debug';
const flash = require('connect-flash');
const cors = require('cors');

import {UserManager } from './userAccess/UserManager.js'
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

import { BPMNServer, Logger } from './index.js';


import { configuration as config } from './WorkflowApp/configuration.js';
import { Workflow } from './routes/workflow.js';
import { EndUser } from './routes/endUser.js';
import { Docs } from './routes/docs.js';
import { Model } from './routes/model.js';
import { API } from './routes/api.js';
import { API2 } from './routes/api2.js';



var busboy = require('connect-busboy'); //middleware for form/file upload



export class WebApp {
	app;
	userManager;
	bpmnServer;
	packageJson;
	server;

	constructor() {

		const fs = require('fs');
	
		const configPath = __dirname + '/../package.json';
		if (fs.existsSync(configPath)) {
	
			this.packageJson= JSON.parse(fs.readFileSync(configPath, 'utf8'));
			var _version = this.packageJson['version'];
			console.log("bpmn-server WebApp.ts version "+ _version);
		}
	

		this.initExpress();

		this.userManager = new UserManager(this.app);

		this.userManager.init();
		const wflogger = new Logger({ toConsole: true });


		this.bpmnServer = new BPMNServer(config,wflogger);
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
		app.set('views', path.join(__dirname, '../src/views'));
		app.set('view engine', 'pug');
		app.use(compression());
		// Security headers. CSP is disabled because the modeler/UI loads inline scripts
		// and a CDN; HSTS only takes effect over HTTPS (harmless over HTTP).
		const helmet = require('helmet');
		app.use(helmet({ contentSecurityPolicy: false }));
		// Trust the TLS-terminating proxy (or our own HTTPS listener) so `secure`
		// cookies and req.ip work. Enabled only when serving over TLS.
		if (process.env.HTTPS === 'true' || process.env.SECURE_COOKIES === 'true') {
			app.set('trust proxy', 1);
		}
        app.use(cors({
            origin: process.env.ITSM_HOST,
        }));
		app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
		const bodyLimit = process.env.BODY_LIMIT || '50mb';
		app.use(bodyParser.json({ limit: bodyLimit }));
		app.use(bodyParser.urlencoded({ limit: bodyLimit, extended: true }));

		app.use(busboy());

		// Unauthenticated health/readiness probe for load balancers (before auth).
		app.get('/healthz', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

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
		} else {
			app.use((err, req, res, next) => {
				console.error(err);
				res.status(500).send('Server Error');
			});
		}

		/**
		 * Start the server. Serve over HTTPS when HTTPS=true and SSL_KEY_PATH/SSL_CERT_PATH
		 * are provided; otherwise plain HTTP (suitable for internal use or behind a
		 * TLS-terminating proxy).
		 */
		const port = app.get('port');
		const fs = require('fs');
		const useHttps =
			process.env.HTTPS === 'true' && !!process.env.SSL_KEY_PATH && !!process.env.SSL_CERT_PATH;

		let server;
		if (useHttps) {
			const https = require('https');
			server = https.createServer(
				{ key: fs.readFileSync(process.env.SSL_KEY_PATH), cert: fs.readFileSync(process.env.SSL_CERT_PATH) },
				app,
			);
		} else {
			const http = require('http');
			server = http.createServer(app);
		}

		server.listen(port, () => {
			const proto = useHttps ? 'https' : 'http';
			console.log('App is running at %s://localhost:%s in %s mode', proto, port, app.get('env'));
			console.log('  Press CTRL-C to stop\n');
		});

		this.server = server;
		this.installShutdownHandlers(server);

		return app;
	}

	/**
	 * Process-level resilience: log unhandled errors, and on SIGTERM/SIGINT stop
	 * accepting connections, let in-flight requests finish, close Mongo, then exit
	 * (force-exit after a timeout so a stuck connection can't block restart).
	 */
	installShutdownHandlers(server) {
		const shutdown = (signal) => {
			console.log(`${signal} received — shutting down gracefully...`);
			server.close(() => {
				const mongoose = require('mongoose');
				Promise.resolve(mongoose.connection.close(false)).finally(() => process.exit(0));
			});
			setTimeout(() => process.exit(1), 10000).unref();
		};
		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
		process.on('uncaughtException', (err) => {
			console.error('Uncaught Exception:', err);
			process.exit(1);
		});
	}

	setupRoutes() {
		var router = express.Router();
		var root=path.join(__dirname,'../');
		
		router.use('/', express.static(path.join(root, 'public'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(root, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(root, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(root, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(root, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
		router.use('/webfonts', express.static(path.join(root, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
		this.app.use('/', router);











		this.app.use('/', (new Workflow(this)).config());
		this.app.use('/user', (new EndUser(this)).config());
		this.app.use('/docs', (new Docs(this)).config());
		this.app.use('/model', (new Model(this)).config());
		this.app.use('/api', (new API(this)).config());
		this.app.use('/api2', (new API2(this)).config());


	}

}

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

export default webApp.app;

