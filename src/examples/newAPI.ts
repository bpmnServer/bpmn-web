/*


class _BPMNServer
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
class _Engine
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
class _DataStore extends CComponent
{
    findItems(params)
    {
        this.server.dataStore.findInstances(user,params);
    }
}
// at the very beginning
var server=new _BPMNServer();

// when user logs in
var user=User.login('abc','123');
// store user into session

// at calls

var conn = server.connect(user.key);
conn.engine.start({});
conn.dataStore.findItems({});


// script class
/**
    the object available to the script as 'this'
    
    has all item properties
    
*/ /*
class ScriptObject
{
    constructor(scope)
    {
    }
    log(msg) {}
    
}
class ScriptExecutor
{

    static Evaluate(scope, script) {
        let result;

        try {
            var js = `
            var item=this;
            var data=this.data;
            var input=this.input;
            var output=this.output;
            return (${script});`;

            var obj=new ScriptObject(scope);

            result = Function(js).bind(obj)();
        }
        catch (exc) {
            console.log('error in script evaluation', js);
            console.log(exc);
        }
        return result;
    }
    
    static async Execute(scope, script) {
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        let result;
        try {
            var js = `
            var item=this;
            var data=this.data;
            var input=this.input;
            var output=this.output;
            ${script}`;

            var obj=new ScriptObject(scope);

            result = await new AsyncFunction(js).bind(obj)();

            scope.token.log("..executing js is done " + scope.id);
        }
        catch (exc) {
            scope.token.log("ERROR in executing Script " + exc.message + "\n" + script);
            console.log('error in script execution', js);
            console.log(exc);
        }
        return result;

    }
}


*/