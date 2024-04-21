
const { BPMNServer , DefaultHandler , Logger } = require('./');
const { configuration } = require('./');


const logger = new Logger({ toConsole: false });

const server = new BPMNServer(configuration, logger);

const listener = server.listener;
/*
let lastCall;
listener.on('all', async function ({ context, event }) {
    let r=false;
    let item=context.item;
    switch(event)
    {
        case 'enter':
        case 'transformInput':
            break;
        case 'validate':
            if (lastCall=='process.invoke')
                console.log('Invoking item',item.elementId);
            else
                console.log(`----->Event: '${event}'    -#${item.seq}   for ${item.element.type} '${item.element.id}'  ${item.status} `);
            break;
        case 'end':
            if (item.endedAt===null)
                event='Cancel';
        default:
            if (item)
                console.log(`----->Event: '${event}'    -#${item.seq}   for ${item.element.type} '${item.element.id}'  ${item.status} `);
            else
                console.log('----->All:' + event, context.definition.name);
       }
    });
*/
let name = 'Trans';

let process;
let response;
let instanceId;

testAll();

async function testAll() {

   await runTest(6010,'Complete Process',{},{},'Event_end','end');  //works fine
  
   await runTest(6011,'Error thrown',{error:'true'},null,'Event_end_error','end');
   await runTest(6012,'Cancel thrown',{cancel:'true'},null,'Activity_after_trans_cancel','end');
   
   await runTest(6013,'Cancel after Complete Process',{},{cancel2:'true'},'Activity_cancelHotel','end'); 
    
   await logger.save('trans.log');
}
async function runTest(caseId,scenario,data1,data2,checkItem,checkStatus) {

    Feature('Transaction', () =>{
        Scenario(scenario, () => {

            Given('invoke',async () =>{

                response=await server.engine.start(name,{caseId,scenario});

                response=await server.engine.invoke({id:response.instance.id,'items.elementId':'Activity_bookFlight'},{});
                response=await server.engine.invoke({id:response.instance.id,'items.elementId':'Activity_bookHotel'},{});
                response=await server.engine.invoke({id:response.instance.id,'items.elementId':'Activity_confirm'},data1);
                if (data2)
                    response=await server.engine.invoke({id:response.instance.id,'items.elementId':'Activity_after_trans'},data2);
            });
            Then('output:'+checkItem+' to be '+checkStatus,()=>{
                listItems();
                expect(getItem(checkItem).status).equals(checkStatus);

            });
        });
    });

}


async function invoke(id,data={}) {
    response = await server.engine.invoke({
        "items.elementId": id,
        "id": response.instance.id },data);

}
async function delay(time) {
    log("delaying ... " + time)
    return new Promise(function (resolve) {
        setTimeout(function () {
            log("delayed is done.");
            resolve();
        }, time);
    });
}
function log(msg) {
    logger.log(msg);
}
function getItem(id)
{
    const item = response.instance.items.filter(item => { return item.elementId == id; })[0]
    if (!item) {
        log('item ' + id + ' not found');
    }
    return item;
}

function listItems() {
    response.instance.items.forEach(item=>{
        console.log('>item:',item.seq,item.elementId,item.status);
    });
}
///```
