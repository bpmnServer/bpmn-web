


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
    
    async createAsset(input, context) {
        let item = context.item;
    
        console.log("Début de la tâche de service");
        console.log("ID de l'élément BPMN :", item.elementId);
    
        const initSessionUrl = "http://192.168.1.14/~leo/itsm-ng/apirest.php/initSession";
        const ticketApiUrl = "http://192.168.1.14/~leo/itsm-ng/apirest.php/Ticket/";
        const appToken = "FYDJpt3ViPVrpL8EVjLiwCtUXpWcdGZ5LRp6aLft";
    
        const payload = {
            input: {
                name: "Ticket test",
                content: "12345",
            },
        };
    
        try {
            const sessionResponse = await axios.get(initSessionUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "user_token CxP5lJu3PlnQVXLEe7uovnJtRjpD7UpsZvjl7uef",
                    "App-Token": appToken,
                },
            });
    
            if (sessionResponse.status === 200 && sessionResponse.data && sessionResponse.data.session_token) {
                const sessionToken = sessionResponse.data.session_token;
    
                const headers = {
                    "Content-Type": "application/json",
                    "Session-Token": sessionToken,
                    "App-Token": appToken,
                };
    
                const ticketResponse = await axios.post(ticketApiUrl, payload, { headers });
    
                if (ticketResponse.status === 201) {
                    console.log("Asset créé avec succès :", ticketResponse.data);
                } else {
                    console.log("Problème lors de la création :", ticketResponse.status, ticketResponse.data);
                }
            } else {
                console.error("Impossible de récupérer le session token :", sessionResponse.data);
            }
        } catch (error) {
            console.error("Erreur lors de la communication avec l'API :", error.message);
        }
    
        console.log("Fin de la tâche de service");
    }
    // async service1(input, context) {
    //     let item = context.item;
    //     let wait=5000;
    //     if (input.wait)
    //         wait=input.wait;
    //     item.vars = input;
    //     // seq++;
    //     await delay(wait, 'test');
    //     item.token.log("SERVICE 1: input: " + JSON.stringify(input)+ item.token.currentNode.id + " current seq: " + seq);
        
    //     console.log('appDelegate service1 is now complete input:',input, 'output:',seq,'item.data',item.data);
    //     return { seq , text: 'test' };
    // }

    // async DummyService1(input, context) {
    //     context.item.data.service1Result = 'Service1Exec';
    // }
    
    async raiseBPMNError(input, context) {
        return({bpmnError:' Something went wrong'});
    }
}
export {AppServices}