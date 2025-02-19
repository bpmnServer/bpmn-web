import { IDataStore } from 'bpmn-server';
import {UserService } from '../userAccess/UserService'
console.log(UserService);


const pack = require("./feature");

console.log('Installing a new Database');

console.log('current directory is ' + process.cwd());
console.log('Installing a new Database based on configuration in current directory');
console.log('current directory is ' + process.cwd());
console.log('database configuration:',pack.configuration.database);

const server = new pack.BPMNServer(pack.configuration, null, { cron: false });

const dataStore:IDataStore = server.dataStore;

const modelsDataStore = server.definitions;


run();

async function run() {
    await install();
    await deleteAll();
    
    process.exit();
}
async function deleteAll() {
    console.log('deleting instances');
    let ret=await dataStore.deleteInstances({});
    console.log(ret['deletedCount'],'deleted');
}
async function install() {


    try {
        await dataStore.install();

        await modelsDataStore.install();

        let userService=new UserService();

        await userService.install();
    }
    catch (exc) {
        console.log(exc);
    }

    console.log('---done.');
    return server;

}
