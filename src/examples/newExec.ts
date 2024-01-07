/*

class EngineX {
    start() {

    }
    invoke() {

    }
} */
/**
 *  no methods only holds state
 * 
class Execution {

}
class Item {
    token;
}
 **/

/**
 *  New Token Scenarios
 *      Lane
 *      Branching/Diverge
 *      Loops       parallel,sequential,repeat
 *      SubProcess
 *      Transaction
 *  Close Taken Scenarios
 *      End of processing (no more nodes)
 *      End of loops
 *      Converge
 *      Abort/Terminate
 *            
 *  Action:
 *      before      prepare
 *      start       start processing
 *      wait        go into wait state
 *      continue    continue processing
 *      end         end item processing and go to next item
 *      after       clean-up
 *      
 *      abort       end item/token processing 
 *      terminate   end item/token/process processing 
 *  TOKEN / ITEM States
 *  
 *      none
 *      init    
 *      start   -continue/wait/end/abort
 *      run
 *      end     finish and continue next node
 *      abort   
 *     special
 *      wait/abort
 *      
 * 
 * 
class Token {
    currentItem;
    get currentNode() { return this.currentItem.node; }
    init()  // create first item
    {

    }
    execute() {
        this.executeItem();
    }
    executeItem() {
        this.doAction(this.currentNode.start(this.currentItem));
        this.doAction(this.currentNode.run(this.currentItem));
        this.doAction(this.currentNode.end(this.currentItem));
        this.doAction(this.currentNode.close(this.currentItem));
        this.doAction(this.goNext());
    }
    async doAction(action)    // continue,next,end,abort
    {
        switch (action) {
            case 'continue':    // continue processing this node
                return;
                break;
            case 'next':    // go to next node
                return;
                break;
        }
    }
    resume() {  //  called after token and item goto wait state
        this.executeItem();
    }
    end() {
        this.currentNode.start(this.currentItem);
    }
    abort() {
        this.currentNode.start(this.currentItem);
    }
    goNext() {
        var nextNode = this.getNext();
        // create a new item
        this.currentItem = new Item();
        this.executeItem();
    }
    getNext() {
    }
}
class Node {
    init(item) { }
    async start(item) { }
    continue(item) { }
    end(item) { }

}
class BPMNServer
{
    engine;
    dataStore;
    constructor(){
        this.engine=new Engine();
        this.dataStore=new DataStore();
    }
    connect(userKey)
    {
        var user=User.getUser(userKey);
        return new Connection(this,user);
    }
}
class Engine
{
    start(user,process,data){}
}
class DataStore
{
    findInstnace(user,query,projection){}
}
class User
{
    userId;
    key;
    
    static login(userId,password) : User
    {
        return new User();
    }
    static getUser(userKey): User
    {
        return new User();
    }
    static loginWithAPIKey(apiKey) : User
    {
        return new User();
    }
}
class Connection
{
    server;
    configuration;
    appDelegate;
    user;
    engine;
    dataStore;
    constructor(server,user)
    {
        this.server=server;
        this.user=user;
        this.engine=new CEngine(this);
        this.dataStore=new CDataStore(this);
    }
    login(obj)
    {
        return this;
    }
    
}
class CComponent
{
    conn;
    get server() { return conn.server; }
    get user() { return conn.user; }
    constructor(connection)
    {
        this.conn=connection;
    }
}
class CEngine extends CComponent
{
    start(proc,data)
    {
        this.server.engine(user,proc,data);
    }
}
class CDataStore extends CComponent
{
    findItems(params)
    {
        this.server.dataStore.findInstances(user,params);
    }
}
*/      