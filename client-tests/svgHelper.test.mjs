import test from 'node:test';
import assert from 'node:assert/strict';
import { loadClientScript } from './load.mjs';

const sb = loadClientScript('SVGHelper.js');

test('getItemElement finds an element by id in jsonData.elements', () => {
  sb.jsonData = {
    flows: [{ id: 'f1', type: 'bpmn:SequenceFlow' }],
    elements: [{ id: 'e1', type: 'bpmn:Task', name: 'T' }],
  };
  assert.equal(sb.getItemElement('e1').name, 'T');
});

test('getItemElement finds a flow by id in jsonData.flows', () => {
  sb.jsonData = {
    flows: [{ id: 'f1', type: 'bpmn:SequenceFlow' }],
    elements: [{ id: 'e1', type: 'bpmn:Task' }],
  };
  assert.equal(sb.getItemElement('f1').type, 'bpmn:SequenceFlow');
});

test('getItemElement returns undefined for an unknown id', () => {
  sb.jsonData = { flows: [], elements: [] };
  assert.equal(sb.getItemElement('nope'), undefined);
});

test('getDescAttribute wraps a scalar value with pre/post', () => {
  assert.equal(sb.getDescAttribute({ a: 'x' }, 'a', '<b>', '</b>'), '<b>x</b>');
});

test('getDescAttribute renders an array as a <ul>', () => {
  const html = sb.getDescAttribute({ opts: ['x', 'y'] }, 'opts', '<p>', '</p>');
  assert.match(html, /<ul><li>x<\/li><li>y<\/li><\/ul>/);
});

test('getDescAttribute returns empty string for missing/empty attribute', () => {
  assert.equal(sb.getDescAttribute({}, 'a', '<b>', '</b>'), '');
});

test('getItemDescription builds an HTML table with id and type rows', () => {
  const desc = { title: 'Task', desc: 'work', start: 's', completion: 'c' };
  const el = { id: 'e1', type: 'bpmn:Task' };
  const html = sb.getItemDescription(desc, el);
  assert.match(html, /<table/);
  assert.match(html, /id:<\/td><td>e1/);
  assert.match(html, /type:<\/td><td>bpmn:Task/);
  assert.match(html, /Starts:<\/td><td>s/);
  // title row must be a closed table row (was previously left unclosed)
  assert.match(html, /<tr><td><b>Task<\/b><\/td><\/tr>/);
});

test('getItemDescription returns empty string when desc is null', () => {
  assert.equal(sb.getItemDescription(null, { id: 'x' }), '');
});

test('Show animation plays the selected instance events and restarts on a second click', () => {
  const events = [];
  const timelines = [];
  const gsap = {
    registerPlugin() {},
    killTweensOf(selector) { events.push(['killTweensOf', selector]); },
    timeline(options) {
      const timeline = {
        options,
        to(selector) { events.push(['to', selector]); return this; },
        call(callback) { events.push(['call', callback]); return this; },
        play() { events.push(['play']); return this; },
        kill() { events.push(['kill']); return this; },
      };
      timelines.push(timeline);
      return timeline;
    },
  };
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (id !== 'jsonInfo') return null;
      return { textContent: JSON.stringify([
        { message: `{\"seq\":1,\"type\":'bpmn:StartEvent',\"id\":'start',\"action\":'Started'}` },
        { message: `{\"seq\":2,\"type\":'bpmn:UserTask',\"id\":'task',\"action\":'Waiting'}` },
      ]) };
    },
    querySelectorAll() { return []; },
  };
  const animation = loadClientScript('SVGHelper.js', { document, gsap });
  animation.startAnimation();
  assert.equal(timelines.length, 1);
  assert.equal(timelines[0].options.paused, true);
  assert.deepEqual(events.filter(([name]) => name === 'to'), [['to', '[data-element-id="start"]']]);
  assert.equal(events.at(-1)[0], 'play');

  animation.startAnimation();
  assert.equal(timelines.length, 2);
  assert.equal(events.filter(([name]) => name === 'kill').length, 1);
  assert.equal(events.filter(([name]) => name === 'play').length, 2);
});
