import { configuration }  from './';
import { BPMNServer, Logger, Process, SubProcess, TOKEN_TYPE } from '..';


const logger = new Logger({ toConsole: false });
const server = new BPMNServer(configuration, logger, { cron: false }); 

const listener = server.listener;


/*    let self = this;
    server.listener.on('all', async function (eventApi) {
        await self.executionEvent(eventApi);
    });
    */
listener.on('all', async function ({ context, event, }) {
    if (context.item)
        console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
    else
        console.log('----->All:' + event, context.definition.name);

        if (context.item && event=='wait')
        {
            console.log(' start item',context.item.node.id);
            let ex=context.execution;
            let items=ex.getItems();
            items.forEach(item=>{console.log(item.node.id);});
//            console.log(res.length);

        }

    });


listener.on('wait', function ({ object, event }) {
          console.log('----->Wait:' + event);
    });

test(server);
async function test(server)
{
    let res = server.engine.start('Buy Used Car', {});
}
