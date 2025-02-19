import * as readline from 'readline';
import { log } from '../test/helpers/BPMNTester';
import axios from 'axios';

const cl = readline.createInterface(process.stdin, process.stdout);
const question = function (q) {
    return new Promise((res, rej) => {
        cl.question(q, answer => {
            res(answer);
        })
    });
};
async function delay(time, result) {
    console.log("delaying ... " + time)
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log("delayed is done.");
            resolve(result);
        }, time);
    });
}

// var seq = 0;
class AppServices {
    appDelegate;
    constructor(delegate) {
        this.appDelegate = delegate;
    }
    async echo(input, context) {
        console.log('service echo - input', input);
        context.item.data['echo']=input;
        return input;
    }
    /**
        * Sample Code for Leave Application 
    * to demonstrate how to access DB and return results into scripts
    * This is called as such:
        *  	assignee	#(appServices.getSupervisorUser(this.data.requester))
    * 
        * @param userName
    * @param context 
    * @returns 
    */

    async service99() {
        console.log('>>>>>>>>>>appDelegate service99');
    }
    async notifyhead() {
        console.log('>>>>>>>>>>appDelegate notifyhead');
    }
    async getCollection(token) {
        console.log('get collection',token.currentNode.id);
        return ['A','B','C'];

    }
    async service1(input, context) {
        console.log('appService.service1 starting...');
        let item = context.item;
        let wait=5000;
        if (input.wait)
            wait=input.wait;
        item.vars = input;
        await delay(wait, 'test');

        console.log('appDelegate service1 is now complete input:',input, 'output:','item.data',item.data);
        return {  text: 'test' };
    }
    async DummyService1(input, context) {
        console.log('appServcie.DummyService1 starting');
        context.item.data.service1Result = 'Service1Exec';
    }

    async raiseBPMNError(input, context) {
        return({bpmnError:' Something went wrong'});
    }
}
export {AppServices}
