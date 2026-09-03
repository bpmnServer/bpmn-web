export * from 'bpmn-server';
import type { WorkflowApplication } from '../runtime/WorkflowApplication.js';
import { configuration } from './configuration.js';

/** Bundled example application used by the standalone bpmn-web executable. */
export const sampleWorkflowApplication: WorkflowApplication = { configuration };

export { configuration };
