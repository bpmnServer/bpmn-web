"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tasks = void 0;
const express = require("express");
const FS = require('fs');
const __1 = require("../");
const common_1 = require("./common");
const __2 = require("../");
console.log('tasks.ts--------------------');
var caseId = Math.floor(Math.random() * 10000);
// main functions
function awaitAppDelegateFactory(middleware) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.userName && typeof (req.query.userName) !== 'undefined' && req.query.userName !== 'undefined') {
                req.session.userName = req.query.userName;
            }
            else if (!req.session.userName)
                req.session.userName = 'demoUser';
            yield middleware(req, res, next);
        }
        catch (err) {
            next(err);
        }
    });
}
//   
var bpmnServer;
var definitions;
class Tasks extends common_1.Common {
    config() {
        var router = express.Router();
        bpmnServer = this.webApp.bpmnServer;
        definitions = bpmnServer.definitions;
        router.get('/', this.isAuthenticated, awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            return yield this.home(request, response);
        })));
        router.get('/search', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
        })));
        return router;
    }
    home(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('request.params', request.params, request.query);
            let forUserEmail = (!('forUserEmail' in request.query)) ? 'User1' : request.query.forUserEmail;
            let forUserGroups = (!('forUserGroups' in request.query)) ? 'group1' : request.query.forUserGroups;
            request.session.forUserEmail = forUserEmail;
            request.session.forUserGroups = forUserGroups;
            console.log('Session:', request.session);
            let api = new __2.APIClient(bpmnServer, { userName: forUserEmail, userGroups: forUserGroups.split(',') });
            let items = yield api.data.findItems({ "items.type": "bpmn:UserTask", "items.status": "wait" });
            items.forEach(item => {
                item['fromNow'] = (0, __1.dateDiff)(item.startedAt);
                item['dueFrom'] = (0, __1.dateDiff)(item.dueDate);
                item['followFrom'] = (0, __1.dateDiff)(item.followUpDate);
            });
            let starts = yield api.model.findStartEvents({});
            yield response.render('tasks', {
                forUserEmail,
                forUserGroups,
                userName: request.session.userName,
                starts: starts,
                debugMsgs: [],
                request,
                items: items
            });
            console.log('end');
            return null;
        });
    }
}
exports.Tasks = Tasks;
//export default router;
//# sourceMappingURL=tasks.js.map