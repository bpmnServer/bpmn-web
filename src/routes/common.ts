
const express = require('express');

const lusca = require('lusca');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

import { BPMNAPI , SystemUser } from '../';

export class Common {
	webApp;
	constructor(webApp) {
		this.webApp = webApp;
	}
	config() {
		var router = express.Router();

		router.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
		router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
		router.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

		return router;

	}

	isAuthenticated(req, res, next) {
	console.log(' calling isAuthenticated',process.env.REQUIRE_AUTHENTICATION);
		if ((process.env.REQUIRE_AUTHENTICATION === 'true')
			&&
			(typeof req.isAuthenticated === "function")) {
			let check=req.isAuthenticated();
			if (check==true) {
				console.log('is auth',check,req.user.userGroups,req.user.isAdmin);
				if (req.user.userGroups && req.user.userGroups.indexOf('ADMIN') === -1)
					req.isAdmin=false;
				else
					req.isAdmin=true;
				return next();
			}
			else {
				console.log('not authenticated redirecting to login');
				res.redirect('/login');
			}
		}
		else
			return next();
	}
	
}

export function config(webApp) {
	console.log("common config");
	var router = express.Router();

	router.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
	router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
	router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
	router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
	router.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
	router.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

	return router;
}