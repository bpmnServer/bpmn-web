
import debug = require('debug');

/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');//const sass = require('node-sass-middleware');
const multer = require('multer');


const User = require('./models/User');


export class UserManager {
	app;
	passport;
	passportConfig;

	constructor(app) {

		this.app = app;
		this.passport = passport;
		this.passportConfig = require('./config/passport');

	}
	/**
	 * Create Express server.
	 */
	init() {

		const app = this.app;
		/**
		 * Express configuration.
		 */
		/*app.use(sass({
		  src: path.join(__dirname, 'public'),
		  dest: path.join(__dirname, 'public')
		}));*/
		app.use(session({
			resave: true,
			saveUninitialized: true,
			secret: process.env.SESSION_SECRET,
			cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
			store: new MongoStore({
				url: process.env.MONGO_DB_URL,
				autoReconnect: true,
			})
		})); 
		app.use(flash());
		app.use((req, res, next) => {
			res.locals.errors = req.flash("errors");
			res.locals.successes = req.flash("success");
			res.locals.info = req.flash("info");
			next();
		});

		this.initMongo();
		this.initPassport();
	}
	initMongo() {

		console.log("MongoDB URL", process.env.MONGO_DB_URL)
		mongoose.set('strictQuery', false);
		mongoose.connect(process.env.MONGO_DB_URL);
		mongoose.connection.on('error', (err) => {
			console.error(err);
			console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
			process.exit();
		});
	}
	
	initPassport() {

		this.app.use(passport.initialize());
		this.app.use(passport.session());
		this.app.use(flash());
		
		this.app.use((req, res, next) => {
			if (req.path === '/api/upload') {
				// Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
				next();
			} else {
				lusca.csrf({
					cookie: { name: '_csrf' },
					allowlist: '/',
					secret: 'qwerty'
				})(req, res, next);
			}
		}); 

	} 
	setup() {

		const app = this.app;

		/*
		app.use(lusca({
			csrf:  {
				cookie: { name: '_csrf' },
				allowlist: '/',
				secret: 'qwerty'
			},
			hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
			nosniff: true,
			referrerPolicy: "same-origin",
			xframe: "SAMEORIGIN",
			xssProtection: true,
		}));
		*/
		app.use(lusca.xframe('SAMEORIGIN'));
		app.use(lusca.xssProtection(true));
		app.disable('x-powered-by');
		app.use((req, res, next) => {
			res.locals.user = req.user;
			next();
		});

		
		app.use((req, res, next) => {
			// After successful login, redirect back to the intended page
			if (!req.user
				&& req.path !== '/login'
				&& req.path !== '/signup'
				&& !req.path.match(/^\/auth/)
				&& !req.path.match(/\./)) {
				console.log("redirecting to:", req.originalUrl);
				req.session.returnTo = req.originalUrl;
			} else if (req.user
				&& (req.path === '/account' || req.path.match(/^\/api/))) {
				req.session.returnTo = req.originalUrl;
			}
			next();
		});
		

		this.setupRoutes();
	}

	setupRoutes() {

		var Account = require("./routes/account").Account;
		this.app.use('/', (new Account(this)).config());

	}

	isAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	}
}

