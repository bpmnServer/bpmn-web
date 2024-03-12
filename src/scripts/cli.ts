import { BPMNServer,dateDiff, DefaultAppDelegate, Logger, SystemUser ,BPMNAPI} from "bpmn-server";
import { configuration} from '../WorkflowApp/configuration';
import * as readline from "readline";
import "dotenv/config";
import { UserService } from "../userAccess/UserService";

const logger = new Logger({ toConsole: false});


const server = new BPMNServer(configuration, logger,{cron:false});

const userService =new UserService(server);

const api=new BPMNAPI(server);

const cl = readline.createInterface({input: process.stdin, output: process.stdout,terminal:false});

const question = function(q: string) {
  return new Promise<string>( (res, rej) => {
      cl.question( q, answer => {
          res(answer);
      })
  });
};

start();

async function start() {
	completeUserTask();
}



function menu() {
	console.log('Commands:');
	console.log('	q	to quit');
	console.log('	s	start process ');
	console.log('	lo	list outstanding items');
	console.log('	li	list items');
	console.log('	l	list instances for a process');
	console.log('	di	display Instance information');
	console.log('	i	Invoke Task');
	console.log('	sgl	Signal Task');
	console.log('	msg	Message Task');
	console.log('	rs	Restart an Instance');
	console.log('	d	delete instnaces');
	console.log('	lm	List of Models');
	console.log('	lme	List of Model Events');
	console.log('	ck	Check locked instnaces');
	console.log('	re	Recover hung processes');
	console.log('	lu	List Users');
	console.log('	spw	Set User Password');
	console.log('	?	repeat this list');

}
async function completeUserTask() {

	menu();
	
  let option = '';
  let command = '';
  while(option!=='q')
  {
	command= await question('Enter Command, q to quit, or ? to list commands\n\r>');
	let opts=command.split(' ');
	option=opts[0];
	switch(option)
	{
		case '?':
			menu();
			break;
		case 're':
			await recover();
			break;
		case 'ck':
			await checkLocks();
			break;
		case 'lo':
			console.log("Listing Outstanding Items");
			await findItems({ "items.status": "wait"});
			break;
		case 'l':
			console.log("Listing Instances for a Process");
			await listInstances();
			break;
		case 'li':
			console.log("list items");
			await listItems();
			break;
		case 'di':
			await displayInstance();
			break;
		case 'i':
			console.log("invoking");
			await invoke();
			break;
		case 'rs':
				console.log("restarting");
				await restart();
				break;
				
		case 's':
			console.log("Starting Process");
			await startProc();
			break;
		case 'sgl':
			console.log("Signalling Process");
			await signal();
			break;
		case 'msg':
			console.log("Message Process");
			await message();
			break;

		case 'd':
			console.log("deleting");
			await delInstances();
			break;
		case 'lm':
			console.log("listing Models");
			var list=await server.definitions.getList({});
			list.forEach(m=>{console.log(m.name);});
			console.log();

			break;
		case 'lme':
			console.log("listing Models");
			var list = await server.definitions.findEvents({});
			console.log(list);
			break;
		case 'lu':
			console.log("listing Users");
			var list = await userService.findUsers({});
			console.log('users:\n name\t email\t userGroups');
			list.forEach(u => {
				console.log(`${u.userName} \t${u.email} \t ${u.userGroups}`)
			});
			console.log();
			break;
		case 'spw':
			console.log("setting user password");

			const userName = await question('UserName: ');
			const newPassword = await question('NewPassword: ');
//			server.userService['initMongo']();
			list = await userService.setPassword(userName, newPassword);


	}
  
  }


  console.log("bye");
	cl.close();
	process.exit();

}
async function startProc()
{
  const name = await question('Please provide your process name: ');
  const taskDataString = await question('Please provide your Task Data (json obj) if any: ');
	let taskData = {};
	console.log(taskDataString);

	try {
		if (taskDataString === "") {
			taskData = {};
		} else {
			taskData = JSON.parse(taskDataString.toString());
		}

	}
	catch (exc) {
		console.log(exc);
		return;
    }
  
  let response=await server.engine.start(name, taskData);

	console.log("Process " + name + " started:", 'InstanceId', response.id);
	return await displayInstance(response.id);
}
async function findItems(query) {
	var items = await server.dataStore.findItems(query);

	console.log(`processName	item.name	item.elementId	instanceId	item.id`);
	for (var i = 0; i < items.length; i++) {
		let item = items[i];
		console.log(`${item['processName']}	${item.name}	${item.elementId}	${item['instanceId']}	${item.id}`);
	}
	return items;

}
async function getCriteria() {
	const answer = await question('Please items criteria name value pair; example: items.status wait ');
	let str=''+ answer;

	const list = str.match(/(?:[^\s"]+|"[^"]*")+/g);//str.split(' ');

	// s = 'Time:"Last 7 Days" Time:"Last 30 Days"'

	let criteria = {};
	console.log(list);
	for (var i = 0; i < list.length; i += 2) {
		console.log(list[i], list[i + 1]);
		criteria[list[i]] = list[i + 1];
    }
	console.log(criteria);	

	return criteria;

}
async function listItems() {

	var criteria = await getCriteria();
	var items = await server.dataStore.findItems(criteria)
	console.log(items.length);

	for (var j = 0; j < items.length; j++) {
		let item = items[j];
		console.log(`element: ${item.elementId} status: ${item.status}  processName: ${item['processName']} InstanceId: ${item['instanceId']}	id:	${item.id}`);
	}
}

async function listInstances() {
	var criteria = await getCriteria();

	let insts = await server.dataStore.findInstances(criteria,'full')

	for (var i = 0; i < insts.length; i++) {
		let inst = insts[i];
		console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`, 'data:', inst.data);
	}
}

async function displayInstance(instanceId=null) {

	if (instanceId==null)
		instanceId = await question('Please provide your Instance ID: ');

	console.log("Displaying Instance Details for"+instanceId);

	let insts = await server.dataStore.findInstances({id: instanceId},'full')
	console.log(insts.length);
	for (var i = 0; i < insts.length; i++) {
		let inst = insts[i];
		var items = inst.items;
		console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`,'data:', inst.data);
		for (var j = 0; j < items.length; j++) {
			let item= items[j];
			console.log(`element: ${item.elementId} status: ${item.status}	id:	${item.id}`);
		}
	}
}
async function invoke()
{
  const instanceId = await question('Please provide your Instance ID: ');
  const taskId = await question('Please provide your Task ID: ');
  let taskDataString = await question('Please provide your Task Data (json obj) if any: ');
	let taskData = {};
  if (taskDataString === ""){
      taskData = {};
  }else{
      taskData = JSON.parse(taskDataString.toString());
  }

	try {
		let response = await server.engine.invoke(
			{ id: instanceId, "items.elementId": taskId }
			, taskData);

		console.log("Completed UserTask:", taskId);

		return await displayInstance(response.id);
	}
	catch (exc) {
		console.log("Invoking task failed for:", taskId, instanceId);
		await findItems({ id: instanceId, "items.elementId": taskId });


    }
}

async function restart()
{
  const query=await getCriteria();

	try {
		let response = await server.engine.restart(query,{},'');
		console.log(' Instance restarted: new Instance follows:');
		return await displayInstance(response.id);
	}
	catch (exc) {
		console.log("Invoking task failed for:", exc);

    }
}

async function signal() {
	const signalId = await question('Please provide signal ID: ');

	const signalDataString = await question('Please provide your Data (json obj) if any: ');
	let signalData = {};
	//if (typeof signalData === 'string' && signalData.trim() === '') {
	if (signalDataString === "") {
		signalData = {};
	} else {
		try {
			signalData = JSON.parse(signalDataString.toString());
		}
		catch (exc) {
			console.log(exc);
			return;
        }
	}

	let response = await server.engine.throwSignal(signalId, signalData);

	console.log("Signal Response:", response);
}

async function message() {
	const messageId = await question('Please provide message ID: ');

	const messageDataString = await question('Please provide your Data (json obj) if any: ');
	let messageData = {};
	if (typeof messageDataString === 'string' && messageDataString.trim() === '') {
		messageData = {};
	} else {
		messageData = JSON.parse(messageDataString.toString());
	}

	let response = await server.engine.throwMessage(messageId, messageData);

	if (response['id'])
		return await displayInstance(response['id']);
	else {
		console.log(' no results.');
		return null;
    }
}

async function delInstances() {
	const name = await question('Please provide process name to delete instances for process: ');

	let response = await server.dataStore.deleteInstances({ name: name });

	console.log("Instances Deleted:", response['result']['deletedCount']);
}

async function checkLocks() {
	console.log('--- checking locks ---');
	var list = await server.dataStore.locker.list();
	if (list.length > 0) {
		console.log('current locks ...', list.length);
		for (var i = 0; i < list.length; i++) {
			let item = list[i];
			console.log('lock:', item.id, item.server, item.time,dateDiff(item.time));
		}
		const response = await question('delete all(Y/N?')
		if (response == 'Y' || response == 'y') {
			await server.dataStore.locker.delete({});
		}
	}

}

async function recover() {
	var query = { "items.status": "start" };

	var list = await server.dataStore.findItems(query);
	console.log("items to recover: " + list.length);
	if (list.length > 0) {

		for (var i = 0; i < list.length; i++) {
			let item = list[i];

//			if (item.type == 'bpmn:ScriptTask' || item.type == 'bpmn:ServiceTask') 
			{
				console.log(item.processName, item.elementId, item.type, item.startedAt, item.status,'since:',dateDiff(item.startedAt));

				const response = await question('RE-INVOKE this item(Y/N?')
				if (response == 'Y' || response == 'y') {
					console.log('invoking item',item.id);

					await server.dataStore.locker.delete({id: item.instanceId});

					let ret = await server.engine.invoke({ "items.id": item.id }, {}, null, { recover: true });
					console.log('done');
				}
			}

		}
	}
	else
		console.log('nothing to recover');

}

