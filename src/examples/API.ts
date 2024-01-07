///
///# Buy Used Car Example:
///
///![Image description](buyUsedCar.png)
///
///For the model above we will walk - through how to execute it programaticaly.
///
///## Using bpmn - server Server Class
///
///```javascript

import { configuration } from './';
import { BPMNServer, Logger, Process, SubProcess, TOKEN_TYPE } from './';
import { Definition, IInstanceData, IItemData } from './';
import {
    Execution, Token, Node, Item, EXECUTION_EVENT,
    Behaviour, TOKEN_STATUS, NODE_ACTION, Engine, DataStore, IDataStore, IEngine
} from './';
import { EventEmitter } from 'events';
import { userInfo } from 'os';

const logger = new Logger({ toConsole: true });
function apis() {
    invoke();
    flow();
    delegate();
}
function apiNew() {
    const server = null;

    server.start();     // starts background and cron jobs
    server.stop();
    server.resume();

    const engine = null;
    engine.launch("process");   // starts a new process
    engine.invoke({ id: "123", item: "abc" });      // invoke an item in wait state
    // execution
    let execution;
    execution= engine.get({ id: "123" });
    execution.invoke("item");
    execution.stop();
    execution.resume();
    engine.get("instance");
}
function invoke() {

    let server = new BPMNServer(configuration, logger); // future: , userContext);
    server.engine.start('<name>');

}

function delegate() {
/*
 *  1.  delegates are appDelegate methods 
 *  2.  javascript events embeded in bpmn 
 *  
 *  what can delegate do:
 *  
 *  1.  invoke external functions
 *  2.  read/write process variables
 *  3.  set input /output
 *  4.  raise bpmnError
 *  5.  raise Escalation
 *  
 *  
 * 
 */ 
    const listener = new EventEmitter();

    listener.on('end', function ({ context, event }) {
        console.log('----->' + event + " " + context.item.elementId);
    });

    listener.on('all', function ({ context, event, }) {
    });

    listener.on('wait', function (object, event) {
        //        console.log('----->' + event);
    });

}

function myService1(input, context) {

    context.action = 'wait';
    continueWorking(context)
    return;

}
function continueWorking(context) {

    // process will go into wait state - save instances and return control
    // ... do your work here - takes whatever time...


    context.server.engine.invoke({ id: context.item.id});

}
function relation(obj1, rel, obj2,impl1,impl2) {}
async function dataMode() {
    // Meta:
    /*  Process --> Process (childrenProcesses <- parent
     *  Node    <-- Process  <- childrenNodes
     * 
     */
    let p: Process;
    let n: Node;
    let sb: SubProcess;
    let i: Item;
    relation(Process, 'Has one or more Child', Process, null, p.parent);
    relation(Process, 'Has one or more ', Node , p.childrenNodes, n.process);
    relation(SubProcess, 'is implemented by to one ', Process ,sb.childProcess, null );

    //
    relation(Item, 'is an implementation of one', Node,i.node , null);

}
async function classTypes() {

    // server objects
    
    const server = new BPMNServer(configuration, logger);
    const datastore: IDataStore = server.dataStore;

    let context: Execution= await server.engine.start('name', {})
    server.engine.invoke({}, {});


//    context.nodeAction = NODE_ACTION.wait;

    //  engine
    
    context = await server.engine.start('SubProcess');
    //  invoke an existing item
    const itemQuery = {};
    const instanceQuery = {};
    const data = {};
    const signalId = 'aaa';
    context = await server.engine.invoke(itemQuery,data);
    //  invoke an element (not yet started) in an existing instance 
    //      pizza received, order# 
    //      or cancel invoice, invoice#
    context = await server.engine.startEvent(instanceQuery, 'elementId', data);
    let instances: IInstanceData[];
    instances= await server.engine.throwSignal(signalId, data);

    context = await server.engine.get(instanceQuery);

    const status = context.instance.status;

    let items: IItemData[];
    
    items = await server.dataStore.findItems(itemQuery);
    instances = await server.dataStore.findInstances(instanceQuery, 'full');
    
//
}
async function flow2() {

    let server,userInfo, xContext, response;
    // done once on startup
    server = new BPMNServer(configuration, logger); 

    server.cache.start();

    server.dataStore.find({});

    userInfo = { username: 'user', password: 'abc123' };
    userInfo = { key: 'api_key_abc_123' };   

    const userKey=server.acl.login(userInfo);

    server.acl.canStart(userKey, process);

    server.engine.start(userKey, process);


    //  for each request:


    
    response = await server.engine.start('procName', { name: 'abc', address: '' }, xContext);
    if (response.error) {
        console.log(response.error);
        return;
    }

    console.dir(response);
    // or 
    response = server.engine.startNoWait('procName', { name: 'abc', address: '' });
    let itemSpec;
    response = await server.engine.invoke(itemSpec, { name: 'abc', address: '' });
    if (response.error) {
        console.log(response.error);
        return;
    }

}

async function flow() {

    /**
     * schematic code only
     * -------------------- 
     * does not run; only compiles
     * 
     * */
    let server = new BPMNServer(configuration, logger); // future: , userContext);
    server.engine.start('<name>');
    //  
    {
        const execution = new Execution(server,'<name>', '<source>');
        //....
        await execution.execute('<startNodeId>', {});
        //------------------------------
        {
            await this.definition.load();

            let startNode = this.definition.getStartNode();
            let result = await Token.startNewToken(TOKEN_TYPE.Primary,this, startNode, null, null, null, null);
            // -----------------------------------
            {
                let token: Token,node: Node,item: Item,behaviour: Behaviour,promises;
                token.execute(null);
                //-------------
                {
                    let ret=await node.execute(item);
                    //---------------
                    {
                        this.enter(item);   // no choice

                        node.start(item);
                        // ------------same as run
                        node.run(item);
                        // -----------------------
                        {
                            // fire event
                            behaviour.run(item);
                            execution.doItemEvent(item, EXECUTION_EVENT);
                        }
                        node.end(item,false);
                        // ------------same as run
                    }
                    if (ret == NODE_ACTION.wait) {
                        token.status = TOKEN_STATUS.wait;
                        return;     // goto sleep for now will call you by signal
                    }

                    token.goNext();
                    //--------------
                    {
                        if (!await token.preNext())
                            return;

                        const outbounds = this.currentNode.getOutbounds(this.currentItem);

                        if (outbounds.length == 0) {
                            return await this.end();
                        }

                        outbounds.forEach(async function (flowItem) {

                            /// need to check if next node is converging; therefore no new item``
                            let nextNode = flowItem.element['to'];
                            if (nextNode) {
                                if (outbounds.length == 1) {
                                    promises.push(token.execute(null));
                                }
                                else {
                                    promises.push(Token.startNewToken(TOKEN_TYPE.Diverge,token.execution, nextNode, null, token, token.currentItem, null));
                                }
                            }
                        });
                        await Promise.all(promises);
                    }
                }
            }
        }
        //...
        return;
    }

}
function executionStructure() {
    let instance: Execution;
    let token: Token;
    let item: Item;
    instance.tokens;

    //  tokens hierarchy:   due to subprocess, instance , diverge , eventSubProcess, boundaryEvents
    let items:Item[]=token.path;
    let pToken:Token= token.parentToken;
    let children: Token[]=token.childrenTokens;




}
function objectsStructure() {

    const server = new BPMNServer(configuration, logger); // future: , userContext);
    /*
        engine: Engine;
        configuration: any;
        logger: ILogger;
        definitions;
        appDelegate: IAppDelegate;
        dataStore: IDataStore;
        cache: CacheManager;
        cron: Cron;
    */

    /*
    	server;
            engine: Engine;
            configuration: any;
            logger: ILogger;
            definitions;
            appDelegate: IAppDelegate;
            dataStore: IDataStore;
            cache: CacheManager;
            cron: Cron;
        execution ?: IExecution;
        logger;                 
        listener;
        dataStore;              
        errors;

        item;
            element: Element;
            token: Token;
            node: Node;
        input;
        output;
    */
    const definition: Definition = server.definitions.load('');
    const execution = new Execution(server,'<name>', '<source>');
    var token: Token;
    var item: Item;
    
}
async function test() {


    let signalId, messageId;
    let itemQuery, instanceQuery, eventQuery;

    itemQuery = {
         id: '<instanceId>', name: '<name>' ,
        "items.id": '<id>', elementId: '<>', status: 'wait', itemKey: '<key>', messageId: '', type: '' 
    };

    instanceQuery = {
         id: '<instanceId>', name: '<name>' ,
        "items.id": '<id>', elementId: '<>', status: 'wait', itemKey: '<key>', messageId: '', type: ''
    };
    // or short format:
    instanceQuery = { id: '<instanceId>', name: '<name>' };

    eventQuery = {
        procesName: '<name>', messageId: ''
    };

    // all of the calls below are independent  and will load different instances if need be
    let status, instance: IInstanceData;
    let response: Execution;
    let data = {};

    const bpmn = new BPMNServer(configuration, logger);

///  
/**
 *  engine.start   - start new process instance
 *  ------------
 *      preConditions:
 *          an executable process in the a model
 *      outcome:
 *          new instance of the model
 */
    response = await bpmn.engine.start('SubProcess');

/**
 *  engine.invokeItem       - invoke an item in waiting
 *  ------------------
 *      preConditions:
 *          an instance with an item with state='wait' (already started)
 *      outcome:
 *          continue execution of the instance
 */

    response = await bpmn.engine.invokeItem(itemQuery, data);

///  invoke an element (not yet started) in an existing instance 
///      pizza received, order# 
///      or cancel invoice, invoice#

/**
 *  engine.startEvent       - start a node in an already started instance
 *  ------------------
 *      preConditions:
 *          an instance with multiple processes
 *      outcome:
 *          execute the target node 
 */
    response = await bpmn.engine.startEvent(instanceQuery, 'elementId', data);

/**
 *  engine.throwMessage     - issue a message by id
 *  ------------------
 *  
 *  there are two types of messages/signals
 *      Scoped Messsage: fired for particular instance
 *      Process Message: aimed at a start event of process; starts a new instance
 *  
 *      scenario: 1 - an instance message   : same as engine.invokeItem()
 *        preConditions:
 *              an instance with an item with state='wait' and a catching message
 *        outcome:
 *              continue the target item
 *              
 *      scenario: 2 - a process message     : same as engine.start
 *        preConditions:
 *              a process with a start event catching message
 *        outcome:
 *              start a new process 
 */              

     response = await bpmn.engine.throwMessage(messageId,data);

/*
 *  engine.throwSignal     - issue a signal by id
 *  ------------------
 *      same as message except multiple receipients 
 *
 *  
 * 
 */

    let instances: IInstanceData[];
    instances = await bpmn.engine.throwSignal(signalId, data);

    response = await bpmn.engine.get(instanceQuery);
        
    status = response.instance.status;

    let items: IItemData[];
    items = await bpmn.dataStore.findItems(itemQuery);
    instances= await bpmn.dataStore.findInstances(instanceQuery, 'full');
//    items = await bpmn.dataStore.findEvents(eventQuery);
            await bpmn.dataStore.deleteInstances(instanceQuery);

    let definition: Definition;
    let list;
    definition = bpmn.definitions.load('SubProcess');
    list       = bpmn.definitions.list();

    let instanceId;
    list =  bpmn.cache.list();
            bpmn.cache.remove(instanceId);
            bpmn.cache.shutdown();

}
