bpmn-server
===========

[![Project Status: Active - The project has reached a stable, usable state and is being actively developed.](http://www.repostatus.org/badges/latest/active.svg)](http://www.repostatus.org/#active)

## Introduction
BPMN 2.0 Modeling, Execution and Presistence, an open source Workflow Server for Node.js 

This package is designed specifically for Node.js and TypeScript


# Sample Web App

This is a sample web application (running Node.js and Express.js) to allow you to visualize your workflow 

# Installation

## bpmn-server and bpmn-web
This installs bpmn-server along with a sample web application
It requires 
- Node.js 
- MongoDB , you can install it locally you can [create a free cloud account here](http://bit.ly/cyd-atlas)

```javascript

git clone https://github.com/bpmnServer/bpmn-web.git

cd bpmn-web

npm install

npm run setup
```
the above setup command will copy .env and configuration files
Edit .env file to have MongoDB point to your server or free cloud account

```javascript
API_KEY=12345
MONGO_DB_URL=mongodb://0.0.0.0:27017/bpmn <---- point to your MONGODB
MONGO_DB_NAME=bpmn
DEFINITIONS_PATH="./processes/"
SESSION_SECRET=omni-secret
```

```javascript
npm start
## To Update
```javascript
git pull
npm update

```
### To start server
```
npm run start
```
Console will display:
```text 
bpmn-server WebApp.ts version 1.4.0
MongoDB URL mongodb://0.0.0.0:27017/bpmn
db connection open

App is running at http://localhost:3000 in development mode
  Press CTRL-C to stop

```
Use your browser to view the bpmn-server running

### to update to latest release

```
$ npm update bpmn-server
```
# Full Demo

a full demo site is available @ http://bpmn.omniworkflow.com

# Example Script

```javascript
    const server = new BPMNServer(configuration, logger);

    let response = await server.execute('Buy Used Car');

    // let us get the items
    const items = response.items.filter(item => {
        return (item.status == 'wait');
    });

    items.forEach(item => {
        console.log(`  waiting for <${item.name}> -<${item.elementId}> id: <${item.id}> `);
    });

    console.log('Invoking Buy');

    response = await server.invoke({instanceId: response.execution.id, elementId: 'task_Buy' },
        { model: 'Thunderbird', needsRepairs: false, needsCleaning: false });

    console.log("Ready to drive");

    response = await server.invoke({ instanceId: response.execution.id, elementId: 'task_Drive' });

    console.log(`that is it!, process is now complete status=<${response.execution.status}>`)

```
## BPMN-Client (for remote access)

This requires a Server to be installed or using cloud server on https://bpmn.omniworkflow.com

create a folder or use an existing project
```js
git clone https://github.com/bpmnServer/bpmn-client-sample.git 
copy sample.env .env
```
Edit .env file to point to the server and set api-key 

```js
npm install
To Update
git pull
npm update
```

Add your own code in this directory


for more complete examples see [Examples](./docs/examples.md)

# Acknowledgments

The **bpmn-server** resides upon the excellent library [bpmn-io/bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) developed by [bpmn.io](http://bpmn.io/)

The **bpmn-server** is inspired by the library [bpmn-engine](https://github.com/paed01/bpmn-engine) 
