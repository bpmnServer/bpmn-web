import { configuration } from './';
import { BPMNServer, Logger, Definition } from './';
import { inherits } from 'util';
//import { MyDelegate } from './test2.js';
const logger = new Logger({ toConsole: true});
const server = new BPMNServer(configuration, logger, { cron: false });

test2();
//listAssign();

let process;
let response;
let instanceId;

async function test2() {
    await server.dataStore.deleteInstances({ "data.caseId": 1050 });

    let response = await server.engine.start('Buy Used Car', { caseId: 1050 }, null, 'user1');

    response = await server.engine.invoke({ "data.caseId": 1050, "items.elementId": 'task_Buy' },
        { needsCleaning: "Yes", needsRepairs: "Yes" });


    await server.engine.invoke({ "data.caseId": 1050, "items.elementId": 'task_repair' });

    await server.engine.invoke({ "data.caseId": 1050, "items.elementId": 'task_clean' });

}
function listen(listener) {
    listener.on('end', function ({ context, event }) {
        console.log('----->'+event+" "+ context.item.elementId);
    });

    listener.on('all', function ({ context, event, }) {
//        console.log('-----> Event:', event);
    });

    listener.on('wait', function ({ context, event }) {
        console.log('-----> wait 1' + event , context.instance.id,context.item.id);
    });
}
async function listAssign() {
    const server = new BPMNServer(configuration, logger, {cron:false});

    var res = await server.dataStore.findItems(
        {"items.elementId": "task_Buy",
          "items.dueDate" : { "$gt" : new Date("2022-01-12T20:15:31Z") , "$lt": new Date("2024-10-12T20:15:31Z")  }
        }   );
    
    console.log( res.length);
    res.forEach(item=>{
        console.log('--',item.dueDate,item.followUpDate);
    });

    return;
}
async function test() {
    console.log('test');
    const server = new BPMNServer(configuration, logger, {cron:false});
    const listener = server.listener;
    //console.log(userKey);

    //listen(listener);
    var userId='user1';
    
    let response = await server.engine.start('Buy Used Car with Lanes', { caseId: 1050 },null,'user1');

    console.log('return from start');
    
     console.log('response id',response.id);

    server.cache.shutdown();

    const assignment = {assignee: 'user3', candidateUsers: ['user4','user5'],dueDate: new Date()};
    const newData={var1:650};

    response = await server.engine.assign({ id: response.id, "items.elementId": 'task_Buy' }
        , newData, assignment, userId);


    response.instance.items.forEach(item=>{
        console.log('item',item);
    });


    var res = await server.dataStore.findItems(
        {
            "data.var1" : 650 ,
            "items.status": "wait", "items.elementId": "task_Buy",
            "items.candidateUsers":"user5",
            "items.dueDate" : { "$gt" : new Date("2012-01-12T20:15:31Z") }
        }
    );
    console.log( res.length);
    res.forEach(item=>{
        console.log('waiting item',item.elementId,item.id)
    });


    response = await server.engine.invoke({id: response.id , "items.elementId": 'task_Buy' });


/*
    response.instance.items.forEach(item => { console.log(item.id); });

    // let us get the items
    const items = response.instance.items.filter(item => {
        return (item.status == 'wait');
    });
    console.log('-------------------------------------');

    items.forEach(item => {
        console.log(`====  waiting for <${item.name}> -<${item.elementId}> id: <${item.id}> `);
    });
    console.log('Invoking Buy');
    console.log('ID:' + response.execution.id);
//    return;

    const insts = await server.dataStore.findInstance({ id: response.execution.id }, {});
    console.log(insts.items);

    response = await server.engine.invoke({id: response.execution.id , "items.elementId": 'Buy' },
        { model: 'Thunderbird', needsRepairs: false, needsCleaning: false });

    console.log("Ready to drive");
    console.log(response.instance.items.length);
    return;
    let item = response.instance.items.filter(item => {
        return (item.name== 'Drive');
    })[0];

    console.log('item: -------------');

    console.log(item.data);
    item.data = { cost: 45000 };
    console.log('item: -------------');
    console.log(item.data);
    */

    response = await server.engine.invoke({id: response.id , "items.elementId": 'Drive' });

    console.log(`that is it!, process is now complete status=<${response.execution.status}>`)

    await logger.save('car.log');

}
function getItem(id) {
    const item = response.instance.items.filter(item => { return item.elementId == id; })[0]
    if (!item) {
        log('item ' + id + ' not found');
    }
    return item;
}
function log(msg) {
    logger.log(msg);
}