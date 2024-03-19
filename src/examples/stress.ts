import { exec } from 'child_process';
import { SystemUser, USER_ROLE, configuration } from './';
import { BPMNServer,BPMNAPI, Logger, Definition ,SecureUser } from './';
import { inherits } from 'util';
import { copyFileSync } from 'fs';

const logger = new Logger({ toConsole: false});
const server = new BPMNServer(configuration, logger, { cron: false });
const api = new BPMNAPI(server);
let user = new SecureUser({userName:'user1',userGroups:[USER_ROLE.ADMIN]});

stressLoad(100,10000);


let process;
let response;
let instanceId;
async function stressLoad(waitCount,caseCount) {

    await api.data.deleteInstances({},user);
    
    console.log('=====');
    console.profile();
    console.time('STRESS');

    for(var i=0;i<=waitCount;i++)
    {
        console.log('   ');
        console.time('car-'+i);
        await car(false);
        console.timeEnd('car-'+i);
    }


    for(var i=0;i<=caseCount;i++)
    {
        console.log('   ');
        console.time('car-'+i);
        await car();
        console.timeEnd('car-'+i);
    }
    console.timeEnd('STRESS');
    console.profileEnd();

    process.exit(0);
}

async function car(drive=true) {

    let user = new SecureUser({userName:'user1',userGroups:['admin']});
    api.defaultUser= user;
    var caseId = Math.floor(Math.random() * 10000);

    let id;

    console.log('start Buy Used Car');
    let response = await api.engine.start('Buy Used Car', { caseId } );

    id =response.id;

    
    console.time('invoke');
    response = await server.engine.invoke({ "id": id, "items.elementId": 'task_Buy' },
        { needsCleaning: "Yes", needsRepairs: "Yes" });

    console.timeEnd('invoke');

    await api.engine.invoke({ "id": id, "items.elementId": 'task_repair' },{},user,{noWait:false,myOption:'abc',anObj:{}});

    console.time('invoke');
    await api.engine.invoke({ "id": id, "items.elementId": 'task_clean' },{},user);
    console.timeEnd('invoke');

    console.time('find');
    let list = await api.data.findInstances({"items.status":"wait"});
    console.timeEnd('find');
    console.log('find returned ',list.length);

    if (drive) {
        console.time('invoke');
        await api.engine.invoke({ "id": id, "items.elementId": 'task_Drive' },{},user);
        console.timeEnd('invoke');
    }

    return id;

}