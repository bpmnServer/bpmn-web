// ESM barrel for the feature suite: re-exports bpmn-server API + the test configuration.
export * from 'bpmn-server';
export { configuration } from '../testConfiguration.js';
console.log('----', import.meta.url);
