import { IDataStore } from 'bpmn-server';
import { UserService } from '../userAccess/UserService.js';
import { BPMNServer } from '../index.js';
import { configuration } from './testConfiguration.js';

console.log('Installing a new Database');
console.log('current directory is ' + process.cwd());
console.log('Installing a new Database based on configuration in current directory');
console.log('database configuration:', configuration.database);

const server = new BPMNServer(configuration, null, { cron: false });

const dataStore: IDataStore = server.dataStore;

const modelsDataStore = server.definitions;


run();

async function run() {
    await install();
    await deleteAll();

    process.exit();
}
async function deleteAll() {
    console.log('deleting instances');
    let ret = await dataStore.deleteInstances({});
    console.log(ret['deletedCount'], 'deleted');
}
async function install() {


    try {
        await dataStore.install();

        await modelsDataStore.install();

        let userService = new UserService();

        await userService.install();
    }
    catch (exc) {
        console.log(exc);
    }

    console.log('---done.');
    return server;

}
