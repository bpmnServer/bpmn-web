import { SystemUser, configuration } from './';
import { BPMNServer,BPMNAPI, Logger, Definition ,SecureUser } from './';
const logger = new Logger({ toConsole: true});
const server = new BPMNServer(configuration, logger, { cron: false });
const api = new BPMNAPI(server);
let user = new SecureUser({userName:'user1',userGroups:['admin']});



leave();
//testLoop();

let process;
let response;
let instanceId;

async function leave() {
    

        let user = new SecureUser({userName:'user1',userGroups:['Employee']});
        let caseId =1051;
        let id;
    
        console.log('-------------------');
        
        let response = await api.engine.start('Leave Application',{caseId} );
        response = await api.engine.invoke({ "id": id, "items.elementId": 'Request'},
            {   RequestReason:"Feels Like it",
                LeaveType:"Sick",
                StartDate:"2024-05-16",
                EndDate:"2024-05-22"});

        response.getItems().forEach(item=>{

        });
        new Helper(response).report();
    
        console.log('----------------------------');
        
        let list=await api.data.findItems({ "id": id,"items.elementId": 'Activity_vote' },user);
        
        list.forEach(item=>{
                console.log('findItems: item:',item);
        });    
    
        return;
        response.getItems().filter(itm=>(itm.elementId=='Activity_vote')).forEach(voteItem=>{
            let vote =voteItem['data']['vote'];
            console.log("vote Item",voteItem.seq,'vote',vote);
    
        });
        
    return;
    //    response = await server.engine.invoke({ "id": id, "items.elementId": 'Activity_summary' , "items.itemKey":".department.HR.department" },{"MyVote":"Billing"});
    
    console.log('======================================');
        new Helper(response).report();
    
    
    }
    
class Helper {
    response;

    tokens;
    items;
    loops;
    constructor(response) {
        this.response=response;
        this.tokens=response.tokens;
        this.items=response.getItems();
    }
    

    report() {

        console.log('.Execution Report ----');
        console.log('..Status:' + this.response.instance.status);
        this.tokens.forEach(token => {
            const branch = token.originItem ? token.originItem.elementId : 'root';
            const parent = token.parentToken ? token.parentToken.id : '-';
            let p='';
            let loopId='';
            if (token.loop)
                loopId=token.loop.id;

            for(var i=0;i<token.path.length;i++)
                {p+=''+token.path[i].node.id+'->'; }
    
            console.log(`..token: ${token.id} DP: '${token._dataPath}' ${token.type} current: ${token.currentNode.id} from ${branch} child of ${parent} L:${loopId}`);

//            console.log(`..token: ${token.id} - ${token.status} - DP: '${token._dataPath}' ${token.type} current: ${token.currentNode.id} from ${branch} child of ${parent} loop ${loopId}`);
//            console.log('   path: ',p);
//            console.log('   ',JSON.stringify(token.data) );
        });

        let indx = 0;
        const items = this.items;
        for (indx = 0; indx < items.length; indx++) {
            const item = items[indx];
            const endedAt = (item.endedAt) ? item.endedAt : '-';

            if (item.element.type !== 'bpmn:SequenceFlow')
                {
                console.log(`..Item:${indx} -T# ${item.token.id} Key ${item.itemKey} Type: ${item.element.type} status: ${item.status}  `);
                if (item.itemKey)
                    {
//                        console.log('       CD:',this.getItemData(item));
//                        console.log('       TD:',item.token.data);
                        console.log('       ID:',item.data);
    
                    }
                }
        }
        console.log('.data:');
        console.log(JSON.stringify(this.response.instance.data));
    }
    getItemData(item) {
        let path=item.token.dataPath+'.'+item.itemKey;
        
        return this.response.getData(item.token.dataPath);
        

    }
}

async function testLoop() {

    let name = 'loop';
    
    let context;
        let items;
    
        let data = {};// records: [1, 2, 3] };
        context = await server.engine.start(name, data);
    
    
                      await delay(500, 'test');
                      items = context.instance.items;
    //console.log('items:',context.instance.items);
    
                      console.log(items.filter(i => i.elementId == 'scriptTask').length+" Should be 3");
                      console.log(items.filter(i => i.elementId == 'serviceTask').length+" should be 3");

        new Helper(context).report();
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