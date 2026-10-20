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

test('operation labels are human names without the HTTP method prefix', () => {
	for (const operation of OPERATIONS) {
		assert.equal(
			/^(GET|POST|PUT|PATCH|DELETE)\s/.test(operation.label),
			false,
			`${operation.id} label "${operation.label}" still starts with the method`,
		);
	}
});

test('operation labels drop the resource noun', () => {
	const label = id => OPERATIONS.find(operation => operation.id === id).label;
	// The resource already says "Hosts", so the operation only names the verb.
	assert.equal(label('cmk.gui.openapi.endpoints.host_config.list_hosts'), 'Get Many');
	assert.equal(label('cmk.gui.openapi.endpoints.host_config.create_host'), 'Create');
	assert.equal(label('cmk.gui.openapi.endpoints.host_config.update_nodes'), 'Update Nodes of Cluster');
	// Singular and plural reads of one resource stay distinguishable.
	assert.equal(label('cmk.gui.openapi.endpoints.aux_tags.show_aux_tag'), 'Get');
	assert.equal(label('cmk.gui.openapi.endpoints.aux_tags.show_aux_tags'), 'Get Many');
	// Resources whose operations name different objects keep the noun.
	assert.equal(label('cmk.gui.bi._openapi.bi_aggregation_state_get'), 'Get State of BI Aggregations (GET)');
	assert.equal(label('cmk.gui.bi._openapi.bi_aggregation_state_post'), 'Get State of BI Aggregations (POST)');
});

test('operation labels keep the noun when dropping it would leave a dangling word', () => {
	const label = id => OPERATIONS.find(operation => operation.id === id).label;
	assert.equal(
		label('cmk.gui.openapi.endpoints.user_config.dismiss_user_warning'),
		'Save Warning Dismissal for Current User',
	);
	assert.equal(label('cmk.gui.openapi.endpoints.downtime.show_downtime'), 'Get');
});

test('operation labels are unique within a resource', () => {
	const seen = new Set();
	for (const operation of OPERATIONS) {
		const key = `${operation.resource}\u0000${operation.label}`;
		assert.equal(seen.has(key), false, `${operation.resource} shows "${operation.label}" twice`);
		seen.add(key);
	}
});

test('generated operation options carry the method and path as description', () => {
	const {buildProperties} = require('../dist/nodes/CheckmkConnector/ui/buildProperties.js');
	const {RESOURCES} = require('../dist/nodes/CheckmkConnector/catalog/operations.generated.js');
	const selectors = buildProperties().filter(
		field => field.type === 'options' && field.name === 'operation',
	);

	for (const resource of RESOURCES) {
		const selector = selectors.find(
			field => field.displayOptions.show.resource[0] === resource.value,
		);
		assert.ok(selector !== undefined, `no operation selector for ${resource.value}`);
		assert.ok(selector.options.some(option => option.value === selector.default));
		const defaultOperation = OPERATIONS.find(operation => operation.id === selector.default);
		if (defaultOperation.method === 'GET') {
			assert.equal(defaultOperation.deprecated, false, `${resource.value} defaults to a deprecated GET`);
		}
		for (const option of selector.options) {
			const operation = OPERATIONS.find(entry => entry.id === option.value);
			assert.equal(option.name, operation.label);
			assert.equal(option.description, `${operation.method} ${operation.path}`);
		}
	}
});

test('the Monitoring resource is offered next to Live Status', () => {
	const {buildProperties} = require('../dist/nodes/CheckmkConnector/ui/buildProperties.js');
	const resource = buildProperties().find(field => field.name === 'resource');
	const values = resource.options.map(option => option.value);

	assert.ok(values.includes('monitoring'));
	assert.ok(values.includes('liveStatus'));
	assert.equal(values.indexOf('monitoring') < values.indexOf('liveStatus'), true);
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

test('the site is a credential concern, never an operation parameter', () => {
	for (const operation of OPERATIONS) {
		for (const param of operation.queryParameters) {
			assert.ok(!['site', 'sites'].includes(param.name), `${operation.id} exposes ${param.name}`);
		}
	}
	const {buildProperties} = require('../dist/nodes/CheckmkConnector/ui/buildProperties.js');
	for (const field of buildProperties()) {
		assert.ok(!['site', 'sites'].includes(field.name), `node exposes ${field.name}`);
	}
});

test('the node exposes response shaping and host status fields', () => {
	const {buildProperties} = require('../dist/nodes/CheckmkConnector/ui/buildProperties.js');
	const properties = buildProperties();
	const byName = name => properties.filter(field => field.name === name);

	assert.equal(byName('extensionAttributes').length, 1);
	assert.equal(byName('customContentType').length, 1);
	assert.equal(byName('customResponseFormat').length, 1);
	const status = byName('includeStatus');
	assert.equal(status.length, 1);
	assert.deepEqual(status[0].displayOptions.show.operation.sort(), [
		'cmk.gui.openapi.endpoints.host_config.list_hosts',
		'cmk.gui.openapi.endpoints.host_config.show_host',
	]);
});

test('extension attribute filtering keeps only the requested attributes', () => {
	const {keepAttributes} = require('../dist/nodes/CheckmkConnector/CheckmkConnector.node.js');
	const row = {
		id: 'web-01',
		extensions: {
			attributes: {alias: 'Web', ipaddress: '10.0.0.1', tag_site_id: 'S1'},
			effective_attributes: {alias: 'Web', tag_agent: 'cmk-agent'},
			is_cluster: false,
		},
	};
	assert.deepEqual(keepAttributes(row, new Set(['alias'])), {
		id: 'web-01',
		extensions: {attributes: {alias: 'Web'}, effective_attributes: {alias: 'Web'}, is_cluster: false},
	});
	assert.equal(keepAttributes(row, new Set()), row);
});
