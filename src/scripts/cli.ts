import { BPMNServer, DefaultAppDelegate, Logger } from "bpmn-server";
import { configuration} from '../WorkflowApp/configuration';
import * as readline from "readline";
import "dotenv/config";

const logger = new Logger({ toConsole: false});

const server = new BPMNServer(configuration, logger,{cron:false});

const cl = readline.createInterface({input: process.stdin, output: process.stdout,terminal:false});

const question = function(q: string) {
  return new Promise<string>( (res, rej) => {
      cl.question( q, answer => {
          res(answer);
      })
  });
};

completeUserTask();

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
			
		case 's':
			console.log("Starting Process");
			await start();
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
			var list = await server.userService.findUsers({});
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
			var list = await server.userService.setPassword(userName, newPassword);


	}
  
  }


  console.log("bye");
	cl.close();
	process.exit();

}
async function start()
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

}
async function listItems() {
	const answer = await question('Please items criteria name value pair; example: items.status wait ');
	let str=''+ answer;

	const list = str.split(' ');
	let criteria = {};
	console.log(list);
	for (var i = 0; i < list.length; i += 2) {
		console.log(list[i], list[i + 1]);
		criteria[list[i]] = list[i + 1];
    }
	console.log(criteria);	

	var items = await server.dataStore.findItems(criteria)
	console.log(items.length);

	for (var j = 0; j < items.length; j++) {
		let item = items[j];
		console.log(`element: ${item.elementId} status: ${item.status}  processName: ${item['processName']} InstanceId: ${item['instanceId']}	id:	${item.id}`);
	}
}

async function listInstances() {
	const name = await question('Please provide your process name: ');

	let insts = await server.dataStore.findInstances({ name: name },'full')

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
			if (item.type == 'bpmn:ScriptTask' || item.type == 'bpmn:ServiceTask') {
				console.log(item.processName, item.elementId, item.type, item.startedAt, item.status,'since:',dateDiff(item.startedAt));

				const response = await question('RE-INVOKE this item(Y/N?')
				if (response == 'Y' || response == 'y') {
					console.log('invoking item');
					let ret = await server.engine.invoke({ "items.id": item.id }, {}, null, { recover: true });
				}
			}
//			else
//				console.log(item.processName, item.elementId, item.type, item.startedAt, 'status', item.status, 'since:', dateDiff(item.startedAt));

		}
		console.log('recovering is complete');
	}
	else
		console.log('nothing to recover');

}
function dateDiff(dateStr: string) {

    var endDate = new Date();
    var startTime = new Date(dateStr);
    var seconds = Math.abs(endDate.getTime() - startTime.getTime()) / 1000;

	// get total seconds between the times
	var delta = seconds; //Math.abs(date_future - date_now) / 1000;

	// calculate (and subtract) whole days
	var days = Math.floor(delta / 86400);
	delta -= days * 86400;

	// calculate (and subtract) whole hours
	var hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	// calculate (and subtract) whole minutes
	var minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	// what's left is seconds
	var seconds = Math.floor(delta % 60);  // in theory the modulus is not required
	if (days > 0)
		return (days + " days");
	if (hours > 0)
		return (hours + " hours");
	if (minutes > 0)
		return (minutes + " minutes");
	return (seconds + " seconds");
}

