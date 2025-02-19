# itsm-workflows-bpmn
A backend execution engine for the ITSM-NG workflow plugin

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
Start the server with the following command:
```bash
npm start
```
