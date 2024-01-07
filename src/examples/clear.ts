import { EventEmitter } from "events";

import { configuration } from './';
import { BPMNServer, Logger } from './';

function scopeEval(scope, script) {
    let result;
    try {
        result = Function('"use strict";return ' + script + '').bind(scope)();
    }
    catch (exc) {
        console.log(exc);
    }
    console.log(script, result);
    return result;
}
function scopeEval2(scope, script) {
    let result;
    try {
        result = Function( script ).bind(scope)();
    }
    catch (exc) {
        console.log(exc);
    }
    console.log(script, result);
    return result;
}
async function scopeJS(scope, script) {
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

    let result;
    try {
        scope.token.log("..executing js " + scope.id);
        result = await new AsyncFunction('"use strict";' + script).bind(scope)();
        scope.token.log("..executing js is done " + scope.id);
    }
    catch (exc) {
        scope.token.log("ERROR in executing Script " + exc.message + "\n" + script);
        console.log(exc);
    }
    return result;

}
scopeEval({}, '1==2');
scopeEval({}, '(1==2)');
scopeEval({}, '(3==3) && (1>3)');
scopeEval({}, 'true');
scopeEval({}, '{return false}');

scopeEval2({}, 'return 1==2');
scopeEval2({}, 'return (1==2)');
scopeEval2({}, 'return (3==3)');
scopeEval2({}, 'return true');
scopeEval2({}, 'return false');


const fs = require('fs');

const logger = new Logger({ toConsole: false });

//clear();
async function clear() {

    const server = new BPMNServer(configuration, logger, { cron: false });
    let res = await server.dataStore.deleteInstances();
    console.log("deleted ", res['result']['n']);

}
