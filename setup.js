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
        })
    });
};

console.log('This routine will copy initial files and setup bpmn-server database');

const cwd = process.cwd();
copyFiles();
promptForEdit();
if (checkConfiguration())
    install();

process.exit();


async function promptForEdit() { 
    let command = await question('Please edit ".env" file to point to your MongoDB commands\n\r> Press Enter when done.');
    console.log(' continue...');
    return command;
}
function checkConfiguration() {
    let configuration;
    const configPath = cwd + '/configuration.js';
    if (fs.existsSync(configPath)) {
        configuration = require(configPath).configuration;
        return true;
    }
    else {
        console.log(`**Error** configuration.js file does not exist in this folder '${cwd}'**`);
        console.log("please run this script from the folder containing 'configuration.js'");
        return false;
    }

}
function copyFiles() {
    copyFile('sample.env', '.env');
    copyFile('sample_configuration.ts', 'configuration.ts');
    copyFile('sample_configuration.js', 'configuration.js');
    copyFile('sample_configuration.js.map', 'configuration.js.map');
    copyFile('sample_appDelegate.ts', 'appDelegate.ts');
    copyFile('sample_appDelegate.js', 'appDelegate.js');
    copyFile('sample_appDelegate.js.map', 'appDelegate.js.map');
}
function copyFile(from,to) {
    if (!fs.existsSync(to)) {
        fs.copyFileSync(from, to);
        console.log(`file ${to} created.`);
    }
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
        }
        catch (exc) {
            console.log(exc);
        }
        console.log('---done.');
    });
}
//# sourceMappingURL=setup.js.map