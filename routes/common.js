"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.Common = void 0;
const express = require('express');
const lusca = require('lusca');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
class Common {
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
        console.log(' calling isAuthenticated', process.env.REQUIRE_AUTHENTICATION);
        if ((process.env.REQUIRE_AUTHENTICATION === 'true')
            &&
                (typeof req.isAuthenticated === "function")) {
            let check = req.isAuthenticated();
            console.log('is auth', check);
            if (check == true) {
                console.log('calling next?');
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
exports.Common = Common;
function config(webApp) {
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
exports.config = config;
//# sourceMappingURL=common.js.map