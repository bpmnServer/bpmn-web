import  { configuration } from './';
import { BPMNServer, Logger } from './';

const logger = new Logger({ toConsole: true});

test();

async function test() {
    let name = 'SubProcess';

    const server = new BPMNServer(configuration, logger);

    let response = await server.engine.start(name, { task_subProcess: { clients: ['abc', 'mbc', 'cbc'] } });

    listItems(response.instance);
    response = await server.engine.invoke({
        "items.elementId": "Task_design",
        "id": response.instance.id 
    });

    listItems(response.instance);

    response = await server.engine.invoke({
        "items.elementId": "sub_usertask_2",
        "id": response.instance.id
    });

        
    log('end');
    logger.save(name + '.log');
}
function listItems(response) {
    response.items.forEach(item => {
        log(`-<${item.elementId}> id: <${item.id}>  ${item.status}`);
    });
}
function getItem(response) {
    let current;
    response.items.forEach(item => {
       log(`-<${item.elementId}> id: <${item.id}>  ${item.status}`);
        console.log(item['data']);
        if (item.status == 'wait')
            current = item;
    });

    return current;
}
function log(msg) {
    logger.log(msg);
}

