import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pug from 'pug';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const startedAt = '2026-09-27T10:00:00.000Z';
const steps = [
  { id: 'StartEvent_1', type: 'bpmn:StartEvent', action: 'Started' },
  { id: 'Flow_1', type: 'bpmn:SequenceFlow', action: 'Ended' },
  { id: 'Task_1', type: 'bpmn:Task', action: 'Ended' },
];

export function renderInstanceFixture() {
  const items = steps.map((step, index) => ({
    id: `item-${index}`, elementId: step.id, name: step.id, type: step.type,
    status: 'end', startedAt, endedAt: startedAt,
  }));
  const definition = {
    processes: [],
    elements: steps.filter(step => step.type !== 'bpmn:SequenceFlow')
      .map(step => ({ id: step.id, type: step.type, description: [], behaviours: [] })),
    flows: [{ id: 'Flow_1', type: 'bpmn:SequenceFlow', description: [] }],
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="150" viewBox="0 0 600 150">
    <g class="djs-element" data-element-id="StartEvent_1">
      <g class="djs-visual"><circle cx="65" cy="75" r="20" fill="white" stroke="black"/></g>
    </g>
    <g class="djs-element" data-element-id="Flow_1">
      <g class="djs-visual"><path d="M85 75 L350 75" fill="none" stroke="black" stroke-width="2"/></g>
    </g>
    <g class="djs-element" data-element-id="Task_1">
      <g class="djs-visual"><rect x="350" y="45" width="120" height="60" fill="white" stroke="black"/></g>
    </g>
  </svg>`;
  return pug.renderFile(join(root, 'src/views/InstanceDetails.pug'), {
    title: 'Instance Details',
    instance: { id: 'browser-test', name: 'Animation Fixture', startedAt, endedAt: startedAt, data: {} },
    lastItem: items.at(-1),
    logs: steps.map((step, index) => ({
      type: 'info', date: startedAt,
      message: JSON.stringify({ id: step.id, type: step.type, action: step.action, seq: index + 1 }),
    })),
    items, vars: [], svg, definition: JSON.stringify(definition),
    decorations: JSON.stringify(items.map((item, index) => ({
      type: 'seq', id: item.elementId, color: 'black', seq: index + 1,
    }))),
    user: { isAdmin: () => true },
  });
}

export function renderModelsFixture() {
  return pug.renderFile(join(root, 'src/views/index.pug'), {
    title: 'Workbench',
    request: { session: {} },
    user: { userName: 'system', userGroups: ['SYSTEM'], isAdmin: () => true },
    procs: ['Buy Used Car', 'Invoice'],
    waiting: [], instances: [], _csrf: 'browser-test',
  });
}

export { root };
