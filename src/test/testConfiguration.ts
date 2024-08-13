
import { ModelsDatastore, Configuration} from '../';
import { TestAppDelegate } from './appDelegate';
import { IConfiguration, DataStore, ILogger , NoCacheManager} from '../';
import { Logger } from '../'
import { UserService } from '../userAccess/UserService';
import 'dotenv/config';
console.log('cwd',process.cwd(),__dirname);
let envirn=require('dotenv').config({ path: __dirname+'/.env' }).parsed;
console.log(envirn);
console.log('==============================================');
export const configuration = new Configuration(
	{
		definitionsPath: envirn.DEFINITIONS_PATH,
		templatesPath: __dirname + '/../emailTemplates',
		timers: {
			//forceTimersDelay: 1000,
			precision: 3000,
		},
		database: {
			MongoDB:
			{
				db_url: envirn.MONGO_DB_URL,
				db: 'bpmn'
			}
		},
		apiKey: envirn.API_KEY,
		logger: function (server) {
			new Logger(server);
		},							
		definitions: function (server) {
			return new ModelsDatastore(server);
		},			
		appDelegate: function (server) {
			return new TestAppDelegate(server);
		},		
		dataStore: function (server) {
			let ds=new DataStore(server);
			ds.enableSavePoints=true;
			return ds;
		},
		cacheManager: function (server) {
			return new NoCacheManager(server);
		}

	});
