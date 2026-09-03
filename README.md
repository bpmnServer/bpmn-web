# bpmn-web

HTTP integration and web UI for `bpmn-server`.

The reusable `WebApp` host is independent of any particular workflow
application. An application supplies its own workflow definitions,
configuration, persistence adapters and service implementations through a
`WorkflowApplication`. The bundled `src/sample-app` provides the standalone
demo configuration only.

## Installation

### Requirements

* Node.js >= 10.x
* NPM >= 6.x
* MongoDB >= 4.x

### Installation
Setup .env with your mongodb connection string like so:

```bash
# PORT # for express application
PORT=3000

#API_KEY is used for remote access
API_KEY=12345

# MongoDB Settings
MONGO_DB_URL=mongodb://0.0.0.0:27017/bpmn
#
... more settings
```
Install dependencies
```bash
git clone https://github.com/bpmnServer/bpmn-web.git

npm install

npm run setup
```

## Usage

### Standalone sample application

Start the bundled sample application with:

```bash
npm start
```

### Embed the web adapter in an application

```ts
import { WebApp, defineWorkflowApplication } from 'bpmn-web';
import { configuration } from './workflow/configuration.js';

const workflowApplication = defineWorkflowApplication({ configuration });
const webApp = new WebApp(workflowApplication);

webApp.start();
```

Constructing `WebApp` composes the Express application and workflow runtime.
Calling `start()` is explicit, so tests or a larger application can mount
`webApp.app` without opening another listener.
