import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';

import bodyParser from 'body-parser';
import compression from 'compression';
import flash from 'connect-flash';
import busboy from 'connect-busboy'; // middleware for form/file upload
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';

import { UserManager } from './userAccess/UserManager.js';
import { BPMNServer, Logger } from './index.js';
import { configuration as config } from './WorkflowApp/configuration.js';
import { Workflow } from './routes/workflow.js';
import { EndUser } from './routes/endUser.js';
import { Docs } from './routes/docs.js';
import { Model } from './routes/model.js';
import { API } from './routes/api.js';
import { API2 } from './routes/api2.js';
import { APIv1 } from './routes/api-v1.js';
import { deprecatedApi } from './routes/middleware/deprecatedApi.js';

const __dirname = import.meta.dirname;
console.log('app.ts from ', import.meta.filename);

const upload = multer({ dest: path.join(__dirname, 'uploads') });



export class WebApp {
	app;
	userManager;
	bpmnServer;
	packageJson;
	server;

	constructor() {

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
		app.use(helmet({ contentSecurityPolicy: false }));
		// Trust the TLS-terminating proxy (or our own HTTPS listener) so `secure`
		// cookies and req.ip work. Enabled only when serving over TLS.
		if (process.env.HTTPS === 'true' || process.env.SECURE_COOKIES === 'true') {
			app.set('trust proxy', 1);
		}
        app.use(cors({
            origin: process.env.ITSM_HOST,
        }));
		app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
		const bodyLimit = process.env.BODY_LIMIT || '50mb';
		app.use(bodyParser.json({ limit: bodyLimit }));
		app.use(bodyParser.urlencoded({ limit: bodyLimit, extended: true }));

		app.use(busboy());

		// Unauthenticated health/readiness probe for load balancers (before auth).
		app.get('/healthz', (req, res) => {
			// mongo readyState: 0=disconnected 1=connected 2=connecting 3=disconnecting
			const mongoState = mongoose.connection?.readyState ?? 0;
			const ok = mongoState === 1;
			res.status(ok ? 200 : 503).json({
				status: ok ? 'ok' : 'degraded',
				uptime: process.uptime(),
				mongo: mongoState,
			});
		});

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
		const useHttps =
			process.env.HTTPS === 'true' && !!process.env.SSL_KEY_PATH && !!process.env.SSL_CERT_PATH;

		let server;
		if (useHttps) {
			server = https.createServer(
				{ key: fs.readFileSync(process.env.SSL_KEY_PATH), cert: fs.readFileSync(process.env.SSL_CERT_PATH) },
				app,
			);
		} else {
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
		this.app.use('/api/v1', (new APIv1(this)).config());
		this.app.use('/admin/api/v1', (new APIv1(this)).adminConfig());

		// Compatibility aliases. Responses identify the canonical successor.
		this.app.use('/api2', deprecatedApi('/api/v1'), (new API2(this)).config());
		this.app.use('/api', deprecatedApi('/api/v1'), (new API(this)).config());
		this.app.use('/admin/api2', deprecatedApi('/admin/api/v1'), (new API2(this)).adminConfig());
		this.app.use('/admin/api', deprecatedApi('/admin/api/v1'), (new API(this)).adminConfig());


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

/**
 * Warn (don't hard-fail — this is a demo) about unsafe/incomplete config:
 *  - an empty API_KEY previously authenticated EVERY /api request
 *    (`undefined == undefined`); the middleware now fails closed, but a
 *    misconfigured server should still be flagged;
 *  - REQUIRE_AUTHENTICATION=false disables all UI auth.
 */
function warnBootConfig() {
    const warnings: string[] = [];
    if (!process.env.API_KEY) warnings.push('API_KEY is not set — /api and /api2 will reject all requests (fail closed).');
    if (!process.env.ADMIN_API_KEY) warnings.push('ADMIN_API_KEY is not set — /admin/api and /admin/api2 will reject all requests (fail closed).');
    if (!process.env.SESSION_SECRET) warnings.push('SESSION_SECRET is not set — sessions/CSRF cannot be secured.');
    if (process.env.REQUIRE_AUTHENTICATION === 'false') warnings.push('REQUIRE_AUTHENTICATION=false — UI authentication is DISABLED (dev only).');
    if (warnings.length) console.warn('[config] ' + warnings.join('\n[config] '));
}

warnBootConfig();

const webApp = new WebApp();

export default webApp.app;
