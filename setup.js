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
const _1 = require(".");
const fs = require('fs');
const readline = require("readline");
const cl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
const question = function (q) {
    return new Promise((res, rej) => {
        cl.question(q, answer => {
            res(answer);
        });
    });
};
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('This routine will copy initial files and setup bpmn-server database');
        const ret = yield copyFiles();
        if (ret) // created an .env file
         {
            console.log(' setup is not complete....');
            console.log('------------------------------------------------------------------');
            console.log('Please edit ".env" file to point to your MongoDB');
            console.log('Once complete editing the .env file, please run setup one more time to complete process.');
            console.log('------------------------------------------------------------------');
        }
        else {
            if (checkConfiguration()) {
                const server = yield install();
                yield docModels(server);
            }
        }
        process.exit();
    });
}
function promptForEdit() {
    return __awaiter(this, void 0, void 0, function* () {
        let command = yield question('Please edit ".env" file to point to your MongoDB commands\n\r> Press Enter when done.');
        console.log(' continue...');
        return command;
    });
}
var configuration;
function checkConfiguration() {
    const cwd = process.cwd();
    const configPath = cwd + '/WorkflowApp/configuration.js';
    if (fs.existsSync(configPath)) {
        configuration = require(configPath).configuration;
        return true;
    }
    else {
        console.log(`**Error** configuration.js file does not exist in this folder '${configPath}'**`);
        console.log("please run this script from the folder containing 'configuration.js'");
        return false;
    }
}
function copyFiles() {
    const ret = copyFile('INSTALL.env', '.env');
    copyFile('./WorkflowApp/INSTALL_configuration.ts', './WorkflowApp/configuration.ts');
    copyFile('./WorkflowApp/INSTALL_configuration.js', './WorkflowApp/configuration.js');
    copyFile('./WorkflowApp/INSTALL_appDelegate.ts', './WorkflowApp/appDelegate.ts');
    copyFile('./WorkflowApp/INSTALL_appDelegate.js', './WorkflowApp/appDelegate.js');
    return ret;
}
function copyFile(from, to) {
    if (!fs.existsSync(to)) {
        fs.copyFileSync(from, to);
        console.log(`file ${to} created.`);
        return true;
    }
    return false;
}
function install() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Installing a new Database');
        console.log('current directory is ' + process.cwd());
        console.log('Installing a new Database based on configuration in current directory');
        console.log('current directory is ' + process.cwd());
        console.log('database configuration:', configuration.database);
        const server = new _1.BPMNServer(configuration, null, { cron: false });
        const dataStore = server.dataStore;
        const modelsDataStore = server.definitions;
        try {
            yield dataStore.install();
            yield modelsDataStore.install();
            yield server.userService.install();
        }
        catch (exc) {
            console.log(exc);
        }
        console.log('---done.');
        return server;
    });
}
//  upgrade logic 
function docModels(server) {
    return __awaiter(this, void 0, void 0, function* () {
        let models = yield server.definitions.getList({});
        let note = `

UPGRADE WARNING: Listing of Potential invalid expressions:
------------------------------------------------------------
    If you are upgrading from an earlier release, Please note: bpmn-server release 2.0.0 and higher requires all script expression to start with $
    Older releases can have expression like this:
        data.val1==5
    now:
        $data.val1==5
    or if you prefer
        $(data.val1==5)

    This report lists all expression scripts for models in your installation
    Please verify that they have the correct syntax
    We recommend to make a backup of our models folder location at ${server.configuration.definitionsPath}

------------------------------------------------------------------------------------------------------
    `;
        let text = note;
        let modelsCount = 0;
        for (let i = 0; i < models.length; i++) {
            let model = models[i];
            let docs = yield docModel(server, model.name);
            if (docs.size > 0) {
                modelsCount++;
                text += ('\n\nModel:' + model.name + '\n');
                docs.forEach((list, node) => {
                    text += ('\n\t Element:' + node);
                    list.forEach(item => {
                        text += ('\n\t\t' + item.type + '\n\t\t' + item.text);
                        if (item.value) {
                            text += ('\n\t\t\t' + item.value);
                        }
                    });
                });
            }
        }
        fs.writeFileSync('./upgrade.log', text);
        console.log(note);
        console.log(`       there are ${modelsCount} models that can be impacted
        log file was written to 'upgrade.log'
     if this is a new install, please ignore this message`);
    });
}
function docModel(server, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let model = yield server.definitions.load(name);
        let docs = new Map();
        //init 
        model.nodes.forEach(node => {
            node.init();
            node.behaviours.forEach(behav => behav.init());
        });
        model.nodes.forEach(node => {
            //console.log(node.type, node.id, node.subType);
            switch (node.type) {
                case 'bpmn:SequenceFlow':
                    const exp = node.def.conditionExpression;
                    if (exp) {
                        docItem(docs, node, 'condition', exp.body);
                    }
                    break;
                default:
                    break;
            }
            node.behaviours.forEach(behav => {
                switch (behav.constructor.name) {
                    case 'LoopBehaviour':
                        docItem(docs, node, 'Loop', behav.collection);
                        break;
                    case 'IOBehaviour':
                        behav.parameters.forEach(param => {
                            docItem(docs, node, 'Parameter', param.name, JSON.stringify(param.value));
                        });
                        break;
                }
            });
        });
        return docs;
    });
}
function docItem(docs, node, type, text, value = null) {
    let docNode = docs.get(node.id);
    if (!docNode)
        docs.set(node.id, []);
    let list = docs.get(node.id);
    let item = { type, text };
    if (value)
        item['value'] = value;
    list.push(item);
}
function report(instance) {
    instance.items.forEach(item => {
        console.log('--item', item.seq, item.elementId, item.type, item.status, item.userName, item.assignee, item.candidateUsers, item.candidateGroups, item.dueDate);
    });
}
//# sourceMappingURL=setup.js.map