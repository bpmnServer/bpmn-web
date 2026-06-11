// ESM mocha root setup: expose chai's expect/assert as globals for the feature specs.
import { expect, assert } from 'chai';

console.log('test/helpers/setup.js');

process.env.NODE_ENV = 'test';
Error.stackTraceLimit = 20;
global.expect = expect;
global.assert = assert;
