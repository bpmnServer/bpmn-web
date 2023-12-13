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
exports.ViewHelper = exports.Workflow = void 0;
const express = require("express");
const FS = require('fs');
const __1 = require("../");
const __2 = require("../");
const common_1 = require("./common");
var caseId = Math.floor(Math.random() * 10000);
const docsFolder = __dirname + '/../bpmnServer/docs/';
// main functions
function awaitAppDelegateFactory(middleware) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            /*            if (req.query.userName && typeof (req.query.userName) !=='undefined' && req.query.userName !=='undefined') {
                            req.session.userName = req.query.userName;
                        }
                        else if (!req.session.userName)
                            req.session.userName = 'demoUser';
                            */
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
class Workflow extends common_1.Common {
    config() {
        var router = express.Router();
        bpmnServer = this.webApp.bpmnServer;
        definitions = bpmnServer.definitions;
        router.get('/home', home);
        router.get('/', this.isAuthenticated, awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let output = [];
            output = show(output);
            console.log("isAuthenticated", request.isAuthenticated(), 'user', request.user);
            display(request, response, 'Show', output);
        })));
        router.get('/setUser', this.isAuthenticated, awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let output = [];
            setForUser(request);
            output = show(output);
            console.log("isAuthenticated", request.isAuthenticated(), 'user', request.user);
            display(request, response, 'Show', output);
        })));
        router.get('/readme_md', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let processName = request.params.process;
            let fileName = docsFolder + '../README.md';
            let file = FS.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
            response.send(file);
        })));
        router.get('/userName', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            response.send(getUser(request).userName);
        })));
        /*
         *  3 methods for execute:
         *      get: /execute       fires execute without input
         *      get: /executeInput  redirect to executeInput page -> call post: execute
         *      post:/execute       from form with input data
         *
         */
        router.get('/executeInput/:processName', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let processName = request.params.processName;
            response.render('executeInput', { processName });
        })));
        router.get('/execute/:processName', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let processName = request.params.processName;
            request.session.processName = processName;
            console.log('username', getUser(request).userName);
            let context = yield bpmnServer.engine.start(processName, { caseId: caseId++ }, null, getUser(request).userName);
            if (context.errors) {
                displayError(response, context.errors);
            }
            let execution = context.execution;
            response.redirect('/instanceDetails?id=' + execution.id);
        })));
        router.post('/execute', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let process = request.body.processName;
            request.session.processName = process;
            let data = {};
            ViewHelper.parseField(request.body.field1, request.body.value1, data);
            ViewHelper.parseField(request.body.field2, request.body.value2, data);
            let startNodeId = request.body.startNodeId;
            console.log('username', getUser(request).userName);
            data['caseId'] = caseId++;
            let context = yield bpmnServer.engine.start(process, data, startNodeId, getUser(request).userName);
            if (context.errors) {
                displayError(response, context.errors);
            }
            let instance = context.execution;
            response.redirect('/instanceDetails?id=' + instance.id);
        })));
        router.get('/listDefinitions', function (req, res) {
            let output = ['Data Reset'];
            output = show(output);
            display(req, res, 'Show', output);
        });
        router.get('/resetData', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            yield bpmnServer.dataStore.deleteInstances();
            let output = ['Data Reset'];
            output = show(output);
            display(request, response, 'Show', output);
        })));
        router.get('/refresh', function (req, res) {
            let output = [];
            output = show(output);
            display(req, res, 'Show', output);
        });
        router.get('/clearDebug', function (req, res) {
            //    Logger.clear();
            let output = [];
            output = show(output);
            display(req, res, 'Show', output);
        });
        router.get('/invokeItem', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let id = request.query.id;
            let processName = request.query.processName;
            let elementId = request.query.elementId;
            let fields = yield ViewHelper.getFields(processName, elementId);
            if (fields && fields.length > 0) {
                response.render('invokeItem', {
                    id, fields, processName, elementId
                });
                return;
            }
            try {
                let result = yield bpmnServer.engine.invoke({ "items.id": id }, {}, getUser(request).userName);
                response.redirect('/instanceDetails?id=' + result.execution.id);
            }
            catch (exc) {
                response.send(exc.toString());
            }
        })));
        router.post('/invokeItem', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let id = request.body.itemId;
            let data = {};
            Object.entries(request.body).forEach(entry => {
                if (entry[0] == 'itemId') { }
                else {
                    data[entry[0]] = entry[1];
                }
            });
            try {
                let result = yield bpmnServer.engine.invoke({ "items.id": id }, data, getUser(request).userName);
                response.redirect('/instanceDetails?id=' + result.execution.id);
            }
            catch (exc) {
                response.send(exc.toString());
            }
        })));
        router.get('/assign', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let id = request.query.id;
            let processName = request.query.processName;
            let elementId = request.query.elementId;
            let itemId = request.query.itemId;
            let api = getAPI(request);
            let fields = yield ViewHelper.getFields(processName, elementId);
            let item = yield api.data.findItem({ "items.id": id });
            console.log('item:', item);
            if (!item) {
                request.flash('errors', [{ msg: 'Item not found or not authorized' }]);
                response.redirect('/');
                return;
            }
            const instances = yield api.data.findInstances({ "id": item.instanceId }, 'full');
            const instance = instances[0];
            const lastItem = instance.items[instance.items.length - 1];
            let vars = ViewHelper.formatData(instance.data);
            response.render('assign', {
                item, instance, vars, lastItem,
                dueDate: ViewHelper.dateDisplay(item.dueDate),
                followUpDate: ViewHelper.dateDisplay(item.followUpDate),
                id, fields, processName, elementId
            });
            return;
        })));
        router.post('/assign', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let id = request.body.itemId;
            let data = {};
            let assignment = {};
            Object.entries(request.body).forEach(entry => {
                const label = entry[0];
                if (label == 'itemId') { }
                else if (label.startsWith('data_')) {
                    data[label.substr(5)] = entry[1];
                }
                else {
                    console.log(label, entry[1]);
                    assignment[label] = entry[1];
                }
            });
            try {
                assignment['dueDate'] = ViewHelper.dateInput(assignment['DueDate']);
                assignment['followUpDate'] = ViewHelper.dateInput(assignment['followUpDate']);
                assignment['candidateUsers'] = assignment['candidateUsers'].split(',');
                assignment['candidateGroups'] = assignment['candidateGroups'].split(',');
                console.log('data', data, 'assignment', assignment);
                let result = yield bpmnServer.engine.assign({ "items.id": id }, data, getUser(request).userName, assignment);
                response.redirect('/instanceDetails?id=' + result.execution.id);
            }
            catch (exc) {
                response.send(exc.toString());
            }
        })));
        router.get('/mocha', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            const mocha = require('../node_modules/mocha/bin/mocha');
        })));
        router.get('/run/:process', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let process = request.params.process;
            console.log('username', getUser(request).userName);
            let exec = yield bpmnServer.engine.start(process, { caseId: caseId++ }, null, getUser(request).userName);
            if (exec.errors) {
                displayError(response, exec.errors);
            }
            let output = ['run ' + process];
            output = show(output);
            display(request, response, 'Run Prcesses', output, exec.instance.logs, exec.instance.items);
        })));
        router.get('/instanceDetails', awaitAppDelegateFactory((request, response) => __awaiter(this, void 0, void 0, function* () {
            let imageId = request.query.id;
            yield instanceDetails(response, imageId);
        })));
        router.get('/deleteInstance', deleteInstance);
        router.get('/shutdown', shutdown);
        router.get('/restart', restart);
        router.get('/manage', manage);
        return router;
    }
}
exports.Workflow = Workflow;
function home(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = [];
        output = show(output);
        if (request.session.views) {
            request.session.views++;
        }
        else {
            request.session.views = 1;
        }
        console.log('Session:', request.session);
        display(request, response, 'Show', output);
    });
}
function deleteInstance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let instanceId = req.query.id;
        yield bpmnServer.dataStore.deleteInstances({ id: instanceId });
        let output = ['Complete ' + instanceId];
        display(req, res, 'Show', output);
    });
}
function shutdown(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let instanceId = req.query.id;
        yield bpmnServer.cache.shutdown();
        let output = ['Complete ' + instanceId];
        display(req, res, 'Show', output);
    });
}
function restart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let instanceId = req.query.id;
        yield bpmnServer.cache.restart();
        let output = ['Complete ' + instanceId];
        display(req, res, 'Show', output);
    });
}
function getProcs() {
    return __awaiter(this, void 0, void 0, function* () {
        let list = [];
        let procs = yield bpmnServer.definitions.getList();
        procs.forEach(p => { list.push(p.name); });
        return list;
    });
}
function manage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render('manageProcesses', {
            procs: yield getProcs()
        });
    });
}
function displayError(res, error) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = '';
        if (typeof error === 'object') {
            if (error.message) {
                //            msg += error.message;
                msg += '<br/>Error Message: ' + error.message;
            }
            if (error.stack) {
                msg += '<br/>Stacktrace:';
                msg += '<br/>====================<br/>';
                msg += error.stack.split('\n').join('<br/>');
            }
        }
        else {
            msg += error;
        }
        res.send(msg);
    });
}
function getUser(req) {
    console.log('getUser', req.user, req.session.forUser);
    if (req.session.forUser)
        return req.session.forUser;
    else
        return req.user;
}
function setForUser(req) {
    let forUserName;
    let forUserGroups;
    if ('forUserName' in req.query) {
        forUserName = req.query.forUserName;
        forUserGroups = req.query.forUserGroups;
        let userInfo = { userName: forUserName, userGroups: forUserGroups.split(',') };
        req.session.forUser = userInfo;
    }
}
function getAPI(req) {
    /* console.log('req.params', req.params, req.query);

    let forUserName = req.session.forUserName;
    if ('forUserName' in req.query) {
        forUserName = req.query.forUserName;
        req.session.forUserName = forUserName;
    }
    let forUserGroups = req.session.forUserGroups;
    if ('forUserGroups' in req.query) {
        forUserGroups = req.query.forUserGroups;
        req.session.forUserGroups = forUserGroups;
    }
    console.log('Session:', req.session);
    */
    return new __2.APIClient(bpmnServer, getUser(req));
}
function display(req, res, title, output, logs = [], items = []) {
    return __awaiter(this, void 0, void 0, function* () {
        let api = getAPI(req);
        var instances = yield api.data.findInstances({}, 'summary');
        let waiting = yield api.data.findItems({ "items.status": 'wait', "items.type": 'bpmn:UserTask' });
        waiting.forEach(item => {
            item['fromNow'] = (0, __1.dateDiff)(item.startedAt);
        });
        let engines = bpmnServer.cache.list();
        engines.forEach(engine => {
            engine.fromNow = (0, __1.dateDiff)(engine.startedAt);
            engine.fromLast = (0, __1.dateDiff)(engine.lastAt);
        });
        instances.forEach(item => {
            item['fromNow'] = (0, __1.dateDiff)(item.startedAt);
            if (item.endedAt)
                item['endFromNow'] = (0, __1.dateDiff)(item.endedAt);
            else
                item['endFromNow'] = '';
        });
        res.render('index', {
            title: title, output: output,
            engines,
            userName: req.session.userName,
            procs: yield getProcs(),
            debugMsgs: [],
            waiting: waiting,
            instances,
            request: req,
            logs, items,
            forUserGroups: req.session.forUserGroups, forUserName: req.session.forUserName
        });
    });
}
function show(output) {
    return output;
}
function instanceDetails(response, instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = yield bpmnServer.dataStore.findInstance({ id: instanceId }, 'Full');
        let logs = instance.logs;
        let svg = null;
        try {
            svg = yield definitions.getSVG(instance.name);
        }
        catch (ex) {
        }
        const lastItem = instance.items[instance.items.length - 1];
        const def = yield bpmnServer.definitions.load(instance.name);
        yield def.load();
        const defJson = def.getJson();
        let output = ['View Process Log'];
        output = show(output);
        let vars = ViewHelper.formatData(instance.data);
        let decorations = JSON.stringify(ViewHelper.calculateDecorations(instance.items));
        response.render('InstanceDetails', {
            instance, vars,
            accessRules: def.accessRules,
            title: 'Instance Details',
            logs, items: instance.items, svg,
            decorations, definition: defJson, lastItem,
        });
    });
}
class ViewHelper {
    static dateDisplay(date) {
        if (date)
            return (date).toISOString().split('T')[0];
        else
            return '';
    }
    static dateInput(dateString) {
        if (dateString === '' || dateString == 'Invalid Date')
            return null;
        else
            return new Date(dateString);
    }
    static formatData(data) {
        let vars = [];
        Object.keys(data).forEach(function (key) {
            let value = data[key];
            if (Array.isArray(value))
                value = JSON.stringify(value);
            if (typeof value === 'object' && value !== null)
                value = JSON.stringify(value);
            vars.push({ key, value });
        });
        return vars;
    }
    static getFields(processName, elementId) {
        return __awaiter(this, void 0, void 0, function* () {
            let definition = yield bpmnServer.definitions.load(processName);
            let node = definition.getNodeById(elementId);
            let extName = __1.Behaviour_names.CamundaFormData;
            let ext = node.getBehaviour(extName);
            if (ext) {
                return ext.fields;
            }
            else
                return null;
        });
    }
    static parseField(field, value, data) {
        if (field) {
            if (value.substring(0, 1) == '[') {
                value = value.substring(1);
                value = value.substring(0, value.length - 1);
                let array = value.split(',');
                value = array;
            }
            data[field] = value;
        }
    }
    static calculateDecorations(items) {
        let decors = [];
        let seq = 1;
        items.forEach(item => {
            let color = 'red';
            if (item.status == 'end') {
                if (item.endedAt == null && item.type != 'bpmn:SequenceFlow')
                    color = 'gray';
                else
                    color = 'black';
            }
            let decor = { id: item.elementId, color, seq };
            decors.push(decor);
            seq++;
        });
        return decors;
    }
}
exports.ViewHelper = ViewHelper;
//export default router;
//# sourceMappingURL=index.js.map