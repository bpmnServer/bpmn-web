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
const _1 = require("./");
const configuration_1 = require("./WorkflowApp/configuration");
const logger = new _1.Logger({ toConsole: false });
const server = new _1.BPMNServer(configuration_1.configuration, logger, { cron: false });
const readline = require("readline");
const dotenv = require('dotenv');
dotenv.config();
const cl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
const question = function (q) {
    return new Promise((res, rej) => {
        cl.question(q, answer => {
            res(answer);
        });
    });
};
completeUserTask();
function menu() {
    console.log('Commands:');
    console.log('	q	to quit');
    console.log('	s	start process ');
    console.log('	lo	list outstanding items');
    console.log('	li	list items');
    console.log('	l	list instances for a process');
    console.log('	di	display Instance information');
    console.log('	i	Invoke Task');
    console.log('	sgl	Signal Task');
    console.log('	msg	Message Task');
    console.log('	d	delete instnaces');
    console.log('	lm	List of Models');
    console.log('	lme	List of Model Events');
    console.log('	ck	Check locked instnaces');
    console.log('	re	Recover hung processes');
    console.log('	lu	List Users');
    console.log('	spw	Set User Password');
    console.log('	?	repeat this list');
}
function completeUserTask() {
    return __awaiter(this, void 0, void 0, function* () {
        menu();
        let option = '';
        var command;
        while (option !== 'q') {
            command = yield question('Enter Command, q to quit, or ? to list commands\n\r>');
            let opts = command.split(' ');
            option = opts[0];
            switch (option) {
                case '?':
                    menu();
                    break;
                case 're':
                    yield recover();
                    break;
                case 'ck':
                    yield checkLocks();
                    break;
                case 'lo':
                    console.log("Listing Outstanding Items");
                    yield findItems({ "items.status": "wait" });
                    break;
                case 'l':
                    console.log("Listing Instances for a Process");
                    yield listInstances();
                    break;
                case 'li':
                    console.log("list items");
                    yield listItems();
                    break;
                case 'di':
                    yield displayInstance();
                    break;
                case 'i':
                    console.log("invoking");
                    yield invoke();
                    break;
                case 's':
                    console.log("Starting Process");
                    yield start();
                    break;
                case 'sgl':
                    console.log("Signalling Process");
                    yield signal();
                    break;
                case 'msg':
                    console.log("Message Process");
                    yield message();
                    break;
                case 'd':
                    console.log("deleting");
                    yield delInstances();
                    break;
                case 'lm':
                    console.log("listing Models");
                    var list = yield server.definitions.getList({});
                    console.log(list);
                    break;
                case 'lme':
                    console.log("listing Models");
                    var list = yield server.definitions.findEvents({});
                    console.log(list);
                    break;
                case 'lu':
                    console.log("listing Users");
                    var list = yield server.userService.findUsers({});
                    console.log('users');
                    list.forEach(u => {
                        console.log(`userName:${u.userName} email:${u.email} groups: ${u.userGroups}`);
                    });
                    break;
                case 'spw':
                    console.log("setting user password");
                    const userName = yield question('UserName: ');
                    const newPassword = yield question('NewPassword: ');
                    //			server.userService['initMongo']();
                    var list = yield server.userService.setPassword(userName, newPassword);
            }
        }
        console.log("bye");
        cl.close();
        process.exit();
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield question('Please provide your process name: ');
        let taskData = yield question('Please provide your Task Data (json obj) if any: ');
        console.log(taskData);
        try {
            if (taskData === "") {
                taskData = {};
            }
            else {
                taskData = JSON.parse(taskData.toString());
            }
        }
        catch (exc) {
            console.log(exc);
            return;
        }
        let response = yield server.engine.start(name, taskData);
        console.log("Process " + name + " started:", 'InstanceId', response.id);
        return yield displayInstance(response.id);
    });
}
function findItems(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var items = yield server.dataStore.findItems(query);
        console.log(`processName	item.name	item.elementId	instanceId	item.id`);
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            console.log(`${item['processName']}	${item.name}	${item.elementId}	${item['instanceId']}	${item.id}`);
        }
    });
}
function listItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield question('Please items criteria name value pair; example: items.status wait ');
        let str = '' + answer;
        const list = str.split(' ');
        let criteria = {};
        console.log(list);
        for (var i = 0; i < list.length; i += 2) {
            console.log(list[i], list[i + 1]);
            criteria[list[i]] = list[i + 1];
        }
        console.log(criteria);
        var items = yield server.dataStore.findItems(criteria);
        console.log(items.length);
        for (var j = 0; j < items.length; j++) {
            let item = items[j];
            console.log(`element: ${item.elementId} status: ${item.status}  processName: ${item['processName']} InstanceId: ${item['instanceId']}	id:	${item.id}`);
        }
    });
}
function listInstances() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield question('Please provide your process name: ');
        let insts = yield server.dataStore.findInstances({ name: name }, 'full');
        for (var i = 0; i < insts.length; i++) {
            let inst = insts[i];
            console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`, 'data:', inst.data);
        }
    });
}
function displayInstance(instanceId = null) {
    return __awaiter(this, void 0, void 0, function* () {
        if (instanceId == null)
            instanceId = yield question('Please provide your Instance ID: ');
        console.log("Displaying Instance Details for" + instanceId);
        let insts = yield server.dataStore.findInstances({ id: instanceId }, 'full');
        console.log(insts.length);
        for (var i = 0; i < insts.length; i++) {
            let inst = insts[i];
            var items = inst.items;
            console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`, 'data:', inst.data);
            for (var j = 0; j < items.length; j++) {
                let item = items[j];
                console.log(`element: ${item.elementId} status: ${item.status}	id:	${item.id}`);
            }
        }
    });
}
function invoke() {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceId = yield question('Please provide your Instance ID: ');
        const taskId = yield question('Please provide your Task ID: ');
        let taskData = yield question('Please provide your Task Data (json obj) if any: ');
        if (taskData === "") {
            taskData = {};
        }
        else {
            taskData = JSON.parse(taskData.toString());
        }
        try {
            let response = yield server.engine.invoke({ id: instanceId, "items.elementId": taskId }, taskData);
            console.log("Completed UserTask:", taskId);
            return yield displayInstance(response.id);
        }
        catch (exc) {
            console.log("Invoking task failed for:", taskId, instanceId);
            yield findItems({ id: instanceId, "items.elementId": taskId });
        }
    });
}
function signal() {
    return __awaiter(this, void 0, void 0, function* () {
        const signalId = yield question('Please provide signal ID: ');
        let signalData = yield question('Please provide your Data (json obj) if any: ');
        //if (typeof signalData === 'string' && signalData.trim() === '') {
        if (signalData === "") {
            signalData = {};
        }
        else {
            try {
                signalData = JSON.parse(signalData.toString());
            }
            catch (exc) {
                console.log(exc);
                return;
            }
        }
        let response = yield server.engine.throwSignal(signalId, signalData);
        console.log("Signal Response:", response);
    });
}
function message() {
    return __awaiter(this, void 0, void 0, function* () {
        const messageId = yield question('Please provide message ID: ');
        let messageData = yield question('Please provide your Data (json obj) if any: ');
        if (typeof messageData === 'string' && messageData.trim() === '') {
            messageData = {};
        }
        else {
            messageData = JSON.parse(messageData.toString());
        }
        let response = yield server.engine.throwMessage(messageId, messageData);
        if (response['id'])
            return yield displayInstance(response['id']);
        else {
            console.log(' no results.');
            return null;
        }
    });
}
function delInstances() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield question('Please provide process name to delete instances for process: ');
        let response = yield server.dataStore.deleteInstances({ name: name });
        console.log("Instances Deleted:", response['result']['deletedCount']);
    });
}
function checkLocks() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- checking locks ---');
        var list = yield server.dataStore.locker.list();
        if (list.length > 0) {
            console.log('current locks ...', list.length);
            for (var i = 0; i < list.length; i++) {
                let item = list[i];
                console.log('lock:', item.id, item.server, item.time, dateDiff(item.time));
            }
            const response = yield question('delete all(Y/N?');
            if (response == 'Y' || response == 'y') {
                yield server.dataStore.locker.delete({});
            }
        }
    });
}
function recover() {
    return __awaiter(this, void 0, void 0, function* () {
        var query = { "items.status": "start" };
        var list = yield server.dataStore.findItems(query);
        console.log("items to recover: " + list.length);
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                let item = list[i];
                if (item.type == 'bpmn:ScriptTask' || item.type == 'bpmn:ServiceTask') {
                    console.log(item.processName, item.elementId, item.type, item.startedAt, item.status, 'since:', dateDiff(item.startedAt));
                    const response = yield question('RE-INVOKE this item(Y/N?');
                    if (response == 'Y' || response == 'y') {
                        console.log('invoking item');
                        let ret = yield server.engine.invoke({ "items.id": item.id }, {}, null, { recover: true });
                    }
                }
                //			else
                //				console.log(item.processName, item.elementId, item.type, item.startedAt, 'status', item.status, 'since:', dateDiff(item.startedAt));
            }
            console.log('recovering is complete');
        }
        else
            console.log('nothing to recover');
    });
}
function dateDiff(dateStr) {
    var endDate = new Date();
    var startTime = new Date(dateStr);
    var seconds = Math.abs(endDate.getTime() - startTime.getTime()) / 1000;
    // get total seconds between the times
    var delta = seconds; //Math.abs(date_future - date_now) / 1000;
    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    // what's left is seconds
    var seconds = Math.floor(delta % 60); // in theory the modulus is not required
    if (days > 0)
        return (days + " days");
    if (hours > 0)
        return (hours + " hours");
    if (minutes > 0)
        return (minutes + " minutes");
    return (seconds + " seconds");
}
//# sourceMappingURL=cli.js.map