import { configuration} from '../WorkflowApp/configuration';
import { BPMNServer,BPMNAPI, Logger ,Definition} from "bpmn-server";
const logger = new Logger({ toConsole: false});
const server = new BPMNServer(configuration, logger, { cron: false });
const api = new BPMNAPI(server);
const fs = require('fs');

////////////////////
// Import the required modules
const { argv } = require('process');

// Function to parse command-line arguments
function parseArguments(args) {
  const parsedArgs = [];
  let currentArg = '';
  let inQuotes = false;

  args.forEach(arg => {
    if (arg.startsWith('"') || arg.startsWith("'")) {
      inQuotes = true;
      currentArg = arg.slice(1);
    } else if (inQuotes && (arg.endsWith('"') || arg.endsWith("'"))) {
      currentArg += ' ' + arg.slice(0, -1);
      parsedArgs.push(currentArg);
      currentArg = '';
      inQuotes = false;
    } else if (inQuotes) {
      currentArg += ' ' + arg;
    } else {
      parsedArgs.push(arg);
    }
  });

  return parsedArgs;
}

// Get the command-line arguments, excluding the first two (node and script path)
const rawArgs = process.argv.slice(2);

// Parse the arguments to handle quotes
const args = parseArguments(rawArgs);

// Output the parsed arguments
console.log('Parsed arguments:', args);

if (args.length<3)
    {
        console.log("Require 3 parameters: \n1) Model Name \n2) Format (json/md) \n3) filename ")
        process.exit(-1);
    }
    
    
    let outputFile= args[2];

    describe(args[0],args[1]);


async function describe(model,format) {

    var definition: Definition
    const server = new BPMNServer(configuration, logger, { cron: false });

    definition = await server.definitions.load(model);

    const json = JSON.parse(definition.getJson());

    if (format=='json') {
        fs.writeFileSync(outputFile,definition.getJson());
        console.log('file ',outputFile,' written');
            
        process.exit(0);
        return;
    }
        
        

    output('## Processes')
    json.processes.forEach(proc => {
        output(`- Process  ${proc.id} ${proc.name} ${proc.description}`);
    });
    output('## Elements')
    json.elements.forEach(el => {
        output("");
        output(`- Element: **${el.id}** ${el.type}, ${el.name||''}`);
        el.description.forEach(desc => {
            descArray([desc]);
            //output('   - ', desc);
        });
        el.behaviours.forEach(desc => {
            descArray(desc);
            //output('   - > ', desc);
        });
        if (el.docs)
            descArray(el.docs);

    });
    output('## Sequence Flows')
    json.flows.forEach(el => {
        output("");
        output(`- Flow: **${el.id}** ${el.type} ${el.name||''} ${el.from} ${el.to}`);
        descArray(el.description);
    });

}
function output(text) {
    console.log('>',text);
    fs.writeFileSync(outputFile,"\n"+text,{flag: 'a+'})
}
function descArray(arr) {

    arr.forEach(desc=>{
        if(Array.isArray(desc)){
            output(`   - ${desc[0]} : ${desc[1]}`);
        }
        else if (desc.text)
            output(`   - Doc:  ${desc.text}`)
        else 
            output(desc);
    })

}
