import  { configuration }   from './';
import { BPMNServer, Logger } from './';

const server = new BPMNServer(configuration);

const model = 'test1';

server.definitions.rebuild(model);
