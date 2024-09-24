console.log('----', __filename);
const { BPMNServer , DefaultAppDelegate , Logger } = require('./');
const { configuration } = require('./');

console.log('-------- restart2.js -----------');

const logger = new Logger({ toConsole: true});

const server = new BPMNServer(configuration, logger);
var caseId = Math.floor(Math.random() * 10000);

let name = 'Restart';
let process;
let response;
let instanceId;
let userId='user1';


Feature('Start Restart Process', () => {
        Scenario('Simple', () => {
            Given('Start Restart Process',async () => {
                response = await server.engine.start(name, {caseId: caseId},null,userId);

                instanceId = response.id;

                response= await server.engine.invoke({
                    id: instanceId ,
                    "items.elementId": 'task1'
                } ,{ } );

                response= await server.engine.invoke({
                    id: instanceId ,
                    "items.elementId": 'task2'} ,{  } );

            });
            Then('check for output', () => {
                expect(response).to.have.property('execution');
                expect(response.instance.data.caseId).equals(caseId);
                expect(response.execution.status).equals('end');
                expect(response.instance.endedAt).not.equals(null);
                expect(getItem('task2').status).equals('end');
                report(response);
            });

             When('restart', async () => {
                response = await server.engine.startEvent(instanceId,'start2',null,userId,{restart:true});

            });

            Then('check for output after restart', () => {
                let task1=response.instance.items.filter(item => { return (item.elementId =='task1' && item.seq>2); })[0];

                console.log('response.instance.status:',response.instance.status)
                report(response);
                expect(response.instance.data.caseId).equals(caseId);
                expect(response.instance.status).equals('running');
                expect(response.instance.endedAt).equals(null);
                expect(task1.status).equals('wait');
             });


            let fileName = __dirname + '/../logs/restart2.log';

            and('write log file to ' + fileName, async () => {
                logger.save(fileName);
//                console.log('filename:', __filename);
            });

        });

    });
function report(response) {
    response.instance.items.forEach(item => {
        console.log('item:',item.seq,item.elementId,item.status);
        
    });
}
function getItem(id)
{
    return response.instance.items.filter(item => { return item.elementId == id; })[0];
}