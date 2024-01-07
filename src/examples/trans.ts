import  { configuration }   from './';
import { BPMNServer, Logger } from './';
import { EventEmitter } from 'events';
import { Definition } from './';

const logger = new Logger({ toConsole: true});


let name = 'Trans'; //      'error event';
let process;
let needsRepairs = true;
let needsCleaning = true;
let response;
let items;
let item;
let query, query1;

let server;
let instanceId;

test();
async function test() {

    console.log("st");
    const server = new BPMNServer(configuration, logger, { cron: false });


    await server.engine.start(name);
    await logger.save('trans.log');
    return;

}
function checkItem(items, criteria) {

    //    expect(items.length).greaterThan(0);

    if (items.length == 0) {
        console.log(" No items");
        return false;
    }
    const item = items[0];
    let pass = '';
    console.log(' items' + items.length);
    /*
    Object.keys(criteria).forEach(key => {
        if (item[key] != criteria[key]) {
            if (item[key] == criteria[key])
        }

    }); */
}
function checkInstance(instances, criteria) {

    //    expect(items.length).greaterThan(0);

    if (instances.length == 0) {
        console.log(" No items");
        return false;
    }
    const instance = instances[0];
    let pass = '';
    Object.keys(criteria).forEach(key => {
        if (instance[key] != criteria[key]) {
            //expect(instance[key]).equals(criteria[key]);
        }

    });
}

async function delay(time, result) {
    console.log("delaying ... " + time)
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log("delayed is done.");
            resolve(result);
        }, time);
    });
}