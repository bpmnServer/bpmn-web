import  { configuration }   from './';
import { BPMNServer, Logger } from './';
import { EventEmitter } from 'events';
import { Definition } from './';
import { Token } from './';

const logger = new Logger({ toConsole: true});


let name = 'test_gateway1'; //      'error event';
let process;
let needsRepairs = true;
let needsCleaning = true;
let response;
let items;
let item;
let query, query1;

let server;
let instanceId;

//test();
defScripts();
function getTree(response) {
    let tokens = response.tokens;
    //tokens.forEach(t)
}
async function defScripts() {

    var definition: Definition
    console.log("start");
    const server = new BPMNServer(configuration, logger, { cron: false });

    definition = await server.definitions.load('Leave Application');

    const json = JSON.parse(definition.getJson());

    json.processes.forEach(proc => {
        console.log('process', proc.id, proc.name, proc.description,proc.docs);
    });
    json.elements.forEach(el => {
        console.log();
        console.log('Element:', el.id, el.type, el.name,el.docs);
        el.description.forEach(desc => {
            console.log('-', desc);
        });
        el.behaviours.forEach(desc => {
            console.log('>', desc);
        });
    });
    json.flows.forEach(el => {
        console.log();
        console.log('Flow:', el.id, el.type, el.name, el.from, el.to);
        el.description.forEach(desc => {
            console.log('-', desc);
        });
    });
    return;
    definition.nodes.forEach(node => {
        node.init();
        //        console.log(node.scripts);
        node.scripts.forEach((value, key) => {
            console.log(node.id, 'script on:', key, '->', value)
        })
        node.behaviours.forEach(behav => behav.init());
        //        console.log(node.type, node.id, node.subType);
    })
    return;

}
async function defScripts1() {

    var definition: Definition
    console.log("start");
    const server = new BPMNServer(configuration, logger, { cron: false });

    definition = await server.definitions.load('Leave Application');

    definition.nodes.forEach(node => {
        node.init();
        if (node.def.documentation) {
            node.def.documentation.forEach(doc => {
                console.log('doc', node.id, doc.text);
            })
        }
    })
    return;

}
async function test() {

    var definition: Definition 
    console.log("start");
    const server = new BPMNServer(configuration, logger, { cron: false });

    try {
        definition= await server.definitions.load(name);

        response = await server.engine.start(name);
        response = await server.engine.invoke({ id: response.instance.id, "items.elementId": 'Activity_1' });

        response = await server.engine.invoke({ id: response.instance.id, "items.elementId": 'Activity_2_4_1' });
        response = await server.engine.invoke({ id: response.instance.id, "items.elementId": 'Activity_2_4_2' });
        response.instance.items.forEach(item => {
            console.log(item.name, item.elementId,item.status);

        });

        getTree(response);

        await logger.save('test_gateway1.log');
    }
    catch (exc) {
        console.log(exc);
    }
    return;
    definition.nodes.forEach(node => {
        node.init();
        node.behaviours.forEach(behav => behav.init());
        console.log(node.type, node.id, node.subType);
    })
    return;
    var def = JSON.parse(definition.getJson());
    Object.keys(def).forEach(key => { console.log(key); });
    var els = def['elements'];
    for (var i = 0; i < els.length; i++) {
        var el = els[i];
        console.log(el['type'] + ' ' + el['name']);
        console.log(el.description);
        console.log(el.behaviours);
    }
    return;
    const starts = definition.getStartNodes();

    const starts2 = definition.getStartNodes(true);

    console.log(starts);
    return;

    const node = await definition.getNodeById('StartEvent_0iay4ar');
    console.log(node.def);
    console.log('----------');
    console.log(node.def.extensionElements);

    const xml = await definition.moddle.toXML(node.def);
    console.log(xml);


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