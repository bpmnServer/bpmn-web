import  { configuration }   from './';
import { BPMNServer, Logger, ModelsDatastore } from '..';
import { Definition, BpmnModelData  } from '..';

const logger = new Logger({ toConsole: true});


let name = 'ds';
let process;
let needsRepairs = true;
let needsCleaning = true;
let response;
let items;
let item;
let query, query1;

let server;
let instanceId;

load('Buy Used Car');
// importAll();

//importModel('multiStart');
//build();
async function test() {

    let events = await findEvents({ "events.subType": 'Timer' });

}
async function build() {
    const server = new BPMNServer(configuration, logger);

    const mds: ModelsDatastore = server.definitions;

    mds.install();


}
async function load(name) {
    // called from Execution

    const server = new BPMNServer(configuration, logger);

    const mds: ModelsDatastore = server.definitions;

    const list = await mds.getList();


    // two objects are needed here:
    //1
    let definition: Definition; // this definition holds nodes and flows, fundemental to execution
    let bpmnModelData: BpmnModelData; // name,source and so one

    definition = await mds.load(name);

    bpmnModelData = await mds.loadModel(name);

    let source = await mds.getSource(name);
    let svg= await mds.getSVG(name);


    await mds.save(name, source, svg);

    mds.saveModel(bpmnModelData);
    console.log(bpmnModelData.name);
//    definition = new Definition(BpmnModelData.name, bpmnModelData.source, logger);
    console.log(definition);

    return definition;
}
async function importAll() {

    const server = new BPMNServer(configuration, logger);
    const defs = server.definitions;
    const list = await defs.getList();
    list.forEach(model => {
        importModel(model);
    });


}

async function importModel(name) {

    const server = new BPMNServer(configuration, logger);
    const defs = server.definitions;
    const source = await defs.getSource(name);
    const svg = await defs.getSVG(name);
    const mds: ModelsDatastore = server.definitions;

    mds.save(name, source, svg);



}
async function findEvents(query)  {

    const server = new BPMNServer(configuration, logger);

    const mds: ModelsDatastore = server.definitions;

    const list = await mds.findEvents(query);
    console.log(list);
    return list;
} 
