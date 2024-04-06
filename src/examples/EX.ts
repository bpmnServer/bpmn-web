
console.log('----------------------------- EX.ts ------------------');

/*


<Token.signal: invoking SubProcess_A bpmn:SubProcess with data=null
<Node.execute
...
>Node.execute
>Token.signal
Token.terminate
Token.end

Node(Sub Process A|SubProcess_A).getInput: inputnull
Node(Sub Process A|SubProcess_A).doEvent: executing script for event:transformInput newStatus:null
Node(Sub Process A|SubProcess_A).doEvent: executing script for event:transformInput ended
Node(Sub Process A|SubProcess_A).doEvent: executing script for event:validate newStatus:wait
Node(Sub Process A|SubProcess_A).doEvent: executing script for event:validate ended
Node(Sub Process A|SubProcess_A).run: item=0e18970a-e600-4ebd-aa90-067d0df69986
Node(Sub Process A|SubProcess_A).continue: item=0e18970a-e600-4ebd-aa90-067d0df69986
Node(Sub Process A|SubProcess_A).end: item=0e18970a-e600-4ebd-aa90-067d0df69986 cancel:false attachments:2
        boundaryEvent:BoundaryEvent_catchErrors
     childToken:5 startnode:StartEvent_14s2cpf status:wait
     childToken:6 startnode:BoundaryEvent_catchErrors status:start
     childToken:7 startnode:Event_1kwlr0m status:wait
     childToken:8 startnode:ExclusiveGateway_2 status:end
        boundaryEvent:Event_1kwlr0m
     childToken:5 startnode:StartEvent_14s2cpf status:wait
     childToken:6 startnode:BoundaryEvent_catchErrors status:start
     childToken:7 startnode:Event_1kwlr0m status:wait
Token(7).terminate: terminating ....
Token(7).end: currentNode=Event_1kwlr0m status=wait currentItem.status=wait

*/

//require('./errorEvent');
class VLogger2 {
    logs=[];
    lastId=0;
    currentParent=-1;

    /**
     * Starting a new log series
     * 
     * @param msg 
     * @returns 
     */
    log(msg) {
        this.logs.push({msg,parent:this.currentParent});
        if (msg.startsWith('>'))
            this.currentParent=this.lastId;
        else if (msg.startsWith('<'))
        {
            let tag=msg.substring(msg,1,msg.indexOf('   '));
            let i=this.lastId;
            let parentId=-1;
            while(i>0 && parentId==-1) {
                if(this.logs[i].startsWith(tag))
                    parentId=i;
            }
            this.currentParent=parentId;
        }
        
        this.lastId++;
    }

}
class VLogger {
    logs=[];
    lastId=0;
    currentParent=-1;

    /**
     * Starting a new log series
     * 
     * @param msg 
     * @returns 
     */
    logS(msg):number {
        this.logs.push({msg,parent:this.currentParent});
        this.currentParent=this.lastId;
        return this.lastId++;
    }
    /**
     * issue a log under current series, preceded by `logS`
     * @param msg 
     * @returns 
     */
    log(msg):number{
        this.logs.push({msg,parent:this.currentParent});
        return this.lastId++;
    }
    // restores parent to PID
    logC(pId,msg) {
        this.currentParent=pId;
        return this.log(msg);
    }
    /**
     * ends current series , return to parent series
     * @param id 
     * @param msg 
     * @returns 
     */
    logE(id,msg) {
        let seq=this.log(msg);
        this.currentParent=this.logs[id].parent;
        return seq;
    }
    out() {
        console.log(this.logs);
    }

}
const logg=new VLogger();
const log=new VLogger2();

let lid1,lid2;

log.log('<Engine.start ')
log.log('Engine.start  some other stuff')
log.log('Execution.start   ')
log.log('>Engine.start ')


lid1=logg.logS('A');
logg.log('B');
let idC=logg.logS('C');
logg.logE(idC,'end of C');
logg.logE(lid1,'end of A');
lid2=logg.logS('D');
logg.log('D1');
logg.out();

