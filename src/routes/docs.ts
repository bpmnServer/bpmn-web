import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath as __f2p } from 'url';
import { dirname as __dn } from 'path';
const __filename = __f2p(import.meta.url);
const __dirname = __dn(__filename);
import express from 'express';
const router = express.Router();
var bodyParser = require('body-parser')

const FS = require('fs');

import { BPMNServer   } from '../index.js';
import { Common } from './common.js';

/* GET users listing. */

const url = 'https://raw.githubusercontent.com/ralphhanna/bpmn-server/master/';

const https = require('https');

function getRemoteFile(file) {
    return new Promise(resolve => {


        https.get(url + file, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                //console.log(data);
                resolve(data);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });


    });


}

//console.log('get file',getRemoteFile('README.md').then(file=>{console.log(file)}));

const awaitAppDelegateFactory = (middleware) => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}
var docsFolder=__dirname + '\\..\\..\\..\\bpmn-server/docs/';
export class Docs extends Common {

    constructor(app) {
        super(app);

//        docsFolder= this.webApp.packageJson.homepage;
        console.log(docsFolder);
        
    }

    config() {

        var router = express.Router();

        router.get('/', function (request, response) {
            let fileName =  '../README.md';
            return processFile(fileName, response);

        });
        router.get('/api/*splat/:fileName', awaitAppDelegateFactory(async (request, response) => {

            let folder = '';
            const splat = (request.params as any).splat;
            if (splat && splat.length)
                folder = (Array.isArray(splat) ? splat.join('/') : splat) + '/';
            let fileName = 'api/' + folder + request.params.fileName;

            return processFile(fileName, response);
        }));
        router.get('/api/:fileName', awaitAppDelegateFactory(async (request, response) => {

            let fileName = 'api/' + request.params.fileName;

            return processFile(fileName, response);
        }));
        router.get('/examples/:fileName', awaitAppDelegateFactory(async (request, response) => {

            let fileName = 'examples/' + request.params.fileName;

            return processFile(fileName, response);
        }));

        router.get('/images/:fileName', awaitAppDelegateFactory(async (request, response) => {

            let fileName = 'images/' + request.params.fileName;

            return processFile(fileName, response);
        }));

        router.get('/:fileName', awaitAppDelegateFactory(async (request, response) => {

            let fileName = request.params.fileName;

            return processFile(fileName, response);


        }));
        router.get('/readme_md', awaitAppDelegateFactory(async (request, response) => {

            let processName = request.params.process;
            let fileName = __dirname + '/../node_modules/bpmn-server/README.md';

            let file = FS.readFileSync(fileName,
                { encoding: 'utf8', flag: 'r' });

            response.send(file);

        }));
        return router;
    }
}
function processFile(fileName,response) {

    if (!fileName.includes('.'))
        fileName=fileName+'.md';
    
    fileName = docsFolder + fileName;

    let file = FS.readFileSync(fileName);



    if (fileName.toLowerCase().endsWith('.png')) {
        //            response.header("Content-Type", "image/png");
        //            response.send(file);
        response.writeHead(200, { 'Content-Type': 'image/png' });
        response.end(file, 'binary');
        return;
    }
    else if (fileName.endsWith('.gif')) {
        response.header("Content-Type", "image/gif");
        response.send(file);
    }
    else {
        let sidebar = null;
        if (FS.existsSync(docsFolder + 'sidebar.md')) 
            sidebar = FS.readFileSync(docsFolder + 'sidebar.md');
        response.render('docs', { md: file , sidebar});
    }


}
function show(output) {
    return output;
}
export default router;
