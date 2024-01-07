const { BPMNServer, DefaultAppDelegate, Logger } = require("./");
const { BPMNAPI, SecureUser } = require("./");
const { configuration } = require('../configuration');
const logger = new Logger({ toConsole: true });
const bpmnServer=new BPMNServer(configuration, logger, { cron: true });

checkInput();

async function checkInput() {
        let user1 = new SecureUser({ userName: 'user1', userGroups: ['Owner', 'Others'] });
        let user2 = new SecureUser({ userName: 'user2', userGroups: ['Owner', 'Others'] });
        let userSupervisor = new SecureUser({ userName: 'Supervisor', userGroups: ['Owner', 'Others'] });
//        let api = new BPMNAPI(bpmnServer);
        console.log('starting');
    let response = await bpmnServer.engine.start('Check Input', { reason: 'I like it', type: 'Vacation' });
    console.log(response.instance.data);
    return;

}
function report(instance) {
    instance.items.forEach(item => {
        console.log('--item', item.seq, item.elementId, item.type, item.status, item.userName, item.assignee, item.candidateUsers, item.candidateGroups, item.dueDate);
    });
}
