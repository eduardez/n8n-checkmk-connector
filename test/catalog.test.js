'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {test} = require('node:test');

const {OPERATIONS, RESOURCES} = require('../dist/nodes/CheckmkConnector/catalog/operations.generated.js');

const SUPPORTED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

test('the committed 2.4.0p37 catalog covers every operation', () => {
	assert.equal(OPERATIONS.length, 189);
	assert.equal(RESOURCES.length, 40);
});

test('operation ids are unique and stable strings', () => {
	const ids = new Set();
	for (const operation of OPERATIONS) {
		assert.equal(typeof operation.id, 'string');
		assert.ok(operation.id.length > 0, 'operation id must not be empty');
		assert.ok(!ids.has(operation.id), `duplicate id ${operation.id}`);
		ids.add(operation.id);
		assert.ok(operation.label.length > 0, `${operation.id} must have a label`);
	}
});

test('every resource has at least one operation and is exposed', () => {
	const used = new Set(OPERATIONS.map(operation => operation.resource));
	assert.equal(used.size, RESOURCES.length);
	for (const resource of RESOURCES) {
		assert.ok(used.has(resource.value), `resource ${resource.value} has no operations`);
		assert.equal(typeof resource.label, 'string');
		assert.ok(resource.label.length > 0);
	}
});

test('methods, paths and pagination follow the catalog contract', () => {
	for (const operation of OPERATIONS) {
		assert.ok(SUPPORTED_METHODS.has(operation.method), `bad method ${operation.method}`);
		assert.ok(operation.path.startsWith('/'), `bad path ${operation.path}`);
		if (operation.paginated) {
			assert.equal(operation.method, 'GET');
			assert.ok(operation.path.includes('/collections/'), `paginated ${operation.path}`);
		}
		if (operation.requestBody) {
			assert.equal(typeof operation.requestBody.required, 'boolean');
		}
		if (operation.ifMatch) {
			assert.ok(operation.headerParameters.every(param => param.name !== 'If-Match'));
		}
	}
});

test('status collections expose the supported POST operations', () => {
	const hostStatus = OPERATIONS.filter(
		operation => operation.path === '/domain-types/host/collections/all',
	).map(operation => operation.method);
	const serviceStatus = OPERATIONS.filter(
		operation => operation.path === '/domain-types/service/collections/all',
	).map(operation => operation.method);

	assert.deepEqual(hostStatus.sort(), ['GET', 'POST']);
	assert.deepEqual(serviceStatus.sort(), ['GET', 'POST']);
	assert.equal(
		OPERATIONS.some(
			operation => operation.method === 'POST' && operation.path === '/domain-types/host/collections/all',
		),
		true,
	);
});

test('deprecated endpoints are flagged', () => {
	const deprecated = OPERATIONS.filter(operation => operation.deprecated);
	assert.ok(deprecated.length > 0);
	for (const operation of deprecated) {
		assert.ok(operation.label.endsWith('(deprecated)'), `${operation.id} label`);
	}
	assert.ok(
		deprecated.some(
			operation =>
				operation.method === 'GET' && operation.path === '/domain-types/host/collections/all',
		),
	);
});

test('the catalog carries no trace of prior packages', () => {
	const source = readFileSync(
		join(__dirname, '..', 'nodes', 'CheckmkConnector', 'catalog', 'operations.generated.ts'),
		'utf8',
	);
	for (const marker of ['n8n-nodes-checkmk', 'LynxmindRepo', 'CheckmkEvo', 'Elicarlos']) {
		assert.equal(source.includes(marker), false, `catalog contains ${marker}`);
	}
});
