/*
 * GET users listing.
 */
import express = require('express');
import { ModelerNoProp } from '../views/Modeler-noProp';
import { ModelerWProp } from '../views/Modeler-wProp';
import { ViewHelper } from './ViewHelper';

var bodyParser = require('body-parser')

const FS = require('fs');

import { BPMNServer,BPMNAPI} from '../';
import { Common } from './common';


const awaitHandlerFactory = (middleware) => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}
var bpmnAPI;

export class Model extends Common {
    config() {

        const bpmnServer = this.webApp.bpmnServer;

        const definitions = bpmnServer.definitions;
        bpmnAPI = new BPMNAPI(bpmnServer);


        var router = express.Router();

        router.get('/list', awaitHandlerFactory(async (request, response) => {

            let procs=await ViewHelper.getProcs(bpmnAPI);
            let procsDocs=ViewHelper.getProcsDocs(procs);
            
            response.render('models/list', {procs,request, procsDocs: JSON.stringify(procsDocs)});

        }));

        router.get('/new', awaitHandlerFactory(async (request, response) => {

            response.render('models/add');

        }));
        router.post('/new', awaitHandlerFactory(async (request, response) => {

            let processName = request.body.processName;
            request.session.processName = processName;

            response.redirect('/model/add/' + processName);
        }));
        router.get('/addNoProp/:process', awaitHandlerFactory(async (request, response) => {

            let processName = request.params.process;

            console.log('adding ' + processName);

            let view = new ModelerNoProp(bpmnServer);

            view.displayNew(processName, request, response);

        }));
        router.get('/add/:process', awaitHandlerFactory(async (request, response) => {

            let processName = request.params.process;
            request.session.processName = processName;

            console.log('adding ' + processName);

            let view = new ModelerWProp();

            view.displayNew(processName, request, response);

        }));
        router.get('/export', awaitHandlerFactory(async (request, response) => {
            console.log(request.params);
            let procs = await bpmnServer.definitions.getList();
            response.render('models/export', { procs});

        }));
        router.get('/download/:file', awaitHandlerFactory(async (request, response) => {
            console.log(request.params.file);

            const filePath = bpmnServer.configuration.definitionsPath + request.params.file;
            console.log('filePath:' + filePath);

            response.download(filePath); // Set disposition and send it.

        }));

        router.get('/import', awaitHandlerFactory(async (request, response) => {
            console.log(request.params);
            response.render('models/import');

        }));

        var fsx = require('fs-extra');       //File System - for file manipulation

        router.post('/import', awaitHandlerFactory(async (req, res) => {

            var fstream;

            try
                {
                   req.pipe(req.busboy);
                }
                catch(exc)
                {
                    console.log(exc);
                }
            req.busboy.on('file', function (fileUploaded, file, filename) {
                console.log("Uploading: ",filename);

                //Path where image will be uploaded
                const filepath = __dirname + '/../tmp/' + filename.filename;
                fstream = fsx.createWriteStream(filepath);
                file.pipe(fstream);
                fstream.on('close', async function () {
                    console.log("Upload Finished of " + filename.filename);
                    const name = filename.filename;
                    const source = fsx.readFileSync(filepath,
                        { encoding: 'utf8', flag: 'r' });

                    try {
                    await definitions.save(name, source, null);
                    }
                    catch(exc)
                    {
                        console.log('save error:',exc);
                    }

                    res.redirect('/');

                });
            });


        }));


        router.get('/delete/:process', awaitHandlerFactory(async (request, response) => {
            response.render('models/delete', { processName: request.params.process });

        }));
        router.post('/delete', awaitHandlerFactory(async (request, response) => {

            let process = request.body.processName;
            await definitions.deleteModel(process);
            console.log('deleting ' + process);
            response.redirect('/');

        }));
        router.post('/rename', awaitHandlerFactory(async (request, response) => {

            let process = request.body.processName;
            let newName = request.body.newName;
            await definitions.renameModel(process, newName);
            console.log('renamed ' + process + " to " + newName);
            response.redirect('/');

        }));
        router.get('/rename/:process', awaitHandlerFactory(async (request, response) => {

            response.render('models/rename', { processName: request.params.process });

        }));
        router.get('/editNoProp/:process', awaitHandlerFactory(async (request, response) => {
            let output = [];

            console.log('model.ts/:process ');
            let xml, base_url, title, processName;

            processName = request.params.process;
            xml = await definitions.getSource(processName);
            title = processName;

            let view = new ModelerNoProp(bpmnServer);

            view.display(processName, request, response);

        }));
        router.get('/edit/:process', awaitHandlerFactory(async (request, response) => {
            let output = [];

            console.log('model.ts/:process ');
            let xml, base_url, title, processName;

            processName = request.params.process;
            request.session.processName = processName;
            try {
                xml = await definitions.getSource(processName);
            } catch (exc) {
                xml = `
                    <?xml version="1.0" encoding="UTF-8"?>
                    <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
                      <bpmn2:process id="Process_1" isExecutable="false">
                        <bpmn2:startEvent id="StartEvent_1" />
                      </bpmn2:process>
                      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
                          <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
                            <dc:Bounds x="412" y="240" width="36" height="36" />
                          </bpmndi:BPMNShape>
                        </bpmndi:BPMNPlane>
                      </bpmndi:BPMNDiagram>
                    </bpmn2:definitions>
                `;
            }
            title = processName;

            let view = new ModelerWProp();

            response.setHeader('Content-Security-Policy', `frame-ancestors 'self' 192.168.1.14 localhost:80`);
            view.display(processName,xml, request, response);

        }));
        router.post('/addNoProp/:process?', awaitHandlerFactory(async (request, response) => {

            let body = request.body;

            let name = body.processId;
            let bpmn = body.bpmn;
            let svg = body.svg;

            await definitions.save(name, bpmn, svg);
            console.log(" save completed");

            //        console.log(request);
            response.status(200).send("");
        }));
        router.post('/add/:process?', awaitHandlerFactory(async (request, response) => {

            let body = request.body;

            let name = body.processId;
            request.session.processName = name;
            let bpmn = body.bpmn;
            let svg = body.svg;

            await definitions.save(name, bpmn, svg);
            console.log(" save completed");

            //        console.log(request);
            response.status(200).send("");
        }));


        router.post('/editNoProp/:process', awaitHandlerFactory(async (request, response) => {

            let body = request.body;

            let name = body.processId;
            let bpmn = body.bpmn;
            let svg = body.svg;

            let definitionsPath = bpmnServer.configuration.definitionsPath;
            let fullpath = definitionsPath + '/' + name + '.bpmn';

            fsx.writeFile(fullpath, bpmn, function (err) {
                if (err) throw err;
                console.log(`Saved bpmn to ${fullpath}`);
            });
            await definitions.save(name, bpmn, svg);
            console.log(" save completed");

            //        console.log(request);
            response.status(200).send("");
        }));
        router.post('/edit/:process', awaitHandlerFactory(async (request, response) => {

            console.log('edit/process request.body', request.params, request.query)
            let body = request.body;

            let name = body.processId;
            request.session.processName = name;
            let bpmn = body.bpmn;
            let svg = body.svg;

            let definitionsPath = bpmnServer.configuration.definitionsPath;
            let fullpath = definitionsPath + '/' + name + '.bpmn';

            fsx.writeFile(fullpath, bpmn, function (err) {
                if (err) throw err;
                console.log(`Saved bpmn to ${fullpath}`);
            });
            await definitions.save(name, bpmn, svg);
            console.log(" save completed");

            //        console.log(request);
            response.status(200).send("");
        }));


        router.get('/getSvg/:process', awaitHandlerFactory(async (request, response) => {

            let processName = request.params.process;
            let fileName = __dirname + '/../processes/' + processName + '.svg';

            let svg = await definitions.getSVG(processName);

            response.header("Content-Type", "image/svg+xml");
            response.send(svg);

        }));
        return router;
    }
}

