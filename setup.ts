import { BPMNServer } from '.';

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
function copyFile(from, to) {
    if (!fs.existsSync(to)) {
        fs.copyFileSync(from, to);
        console.log(`file ${to} created.`);
    }
}

async function install() {

    console.log('Installing a new Database');

    console.log('current directory is ' + process.cwd());
    console.log('Installing a new Database based on configuration in current directory');
    console.log('current directory is ' + process.cwd());
    console.log('database configuration:',configuration.database);

    const server = new BPMNServer(configuration, null, { cron: false });

    const dataStore = server.dataStore;

    const modelsDataStore = server.definitions;
    try {
        await dataStore.install();

        await modelsDataStore.install();

    }
    catch (exc) {
        console.log(exc);
    }

    console.log('---done.');
    process.exit();
}


