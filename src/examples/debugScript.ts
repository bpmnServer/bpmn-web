import { exec } from 'child_process';
import { ScriptHandler, SystemUser, configuration } from './';
import { BPMNServer,BPMNAPI, Logger, Definition ,SecureUser } from './';
import { inherits } from 'util';

const logger = new Logger({ toConsole: false});
const server = new BPMNServer(configuration, logger, { cron: false });
const api = new BPMNAPI(server);
let user = new SecureUser({userName:'user1',userGroups:['admin']});


//testSubProcess();

let process;
let response;
let instanceId;

logger.log('test1',1234,{abc:'abc'});

debugScript('dce96d65-b6e9-4e8e-8f50-ab4b59b41599',2,`
this.log("hi",this.data);
`);



async function debugScript(instanceId,itemSeq,script) {
    
    let ex=await server.engine.get({id:instanceId});

    let items=ex.getItems();
    
    let item=items[itemSeq];
    
    logger.callback=logCall;

    await ScriptHandler.executeScript(item,script);

    logger.callback=null;
    
    return;

}
function logCall(msg,type) {
    console.log('>>logCall',msg,type);
}
