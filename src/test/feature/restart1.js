console.log('----', __filename);
const { BPMNServer , DefaultAppDelegate , Logger } = require('./');
const { configuration } = require('./');

console.log('-------- restart1.js -----------');

const logger = new Logger({ toConsole: false});

const server = new BPMNServer(configuration, logger);
var caseId = Math.floor(Math.random() * 10000);

let name = 'Buy Used Car';
let process;
let response;
let instanceId;
let userId='user1';


Feature('Buy Used Car- and Driver', () => {
        Scenario('Simple', () => {
            Given('Start Buy Used Car Process',async () => {
                response = await server.engine.start(name, {caseId: caseId},null,userId);

                instanceId = response.id;

                response= await server.engine.invoke({
                    id: instanceId ,
                    "items.elementId": 'task_Buy'
                } ,{ needsCleaning: "No", needsRepairs: "No" } );

                response= await server.engine.invoke({
                    id: instanceId ,
                    "items.elementId": 'task_Drive'} ,{  } );

            });
            Then('check for output', () => {
                expect(response).to.have.property('execution');
                expect(response.instance.data.caseId).equals(caseId);
                expect(response.execution.status).equals('end');
                expect(response.instance.endedAt).not.equals(null);
                expect(getItem('task_Drive').status).equals('end');
             });

             When('restart', async () => {
                const query = {id: instanceId ,"items.elementId": 'task_Buy' };
                response = await server.engine.restart(query,null);

            });

            Then('check for output after restart', () => {
                expect(response.instance.data.caseId).equals(caseId);
                expect(response.execution.status).equals('running');
                expect(response.instance.endedAt).equals(null);
                expect(getItem('task_Buy').status).equals('wait');
             });



            let fileName = __dirname + '/../logs/restart1.log';

            and('write log file to ' + fileName, async () => {
                logger.save(fileName);
//                console.log('filename:', __filename);
            });

        });

    });

function getItem(id)
{
    return response.instance.items.filter(item => { return item.elementId == id; })[0];
}