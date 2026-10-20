'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');

const {CheckmkClient} = require('../dist/nodes/CheckmkConnector/transport/CheckmkClient.js');
const {
	getHostWithStatus,
	getHostsWithStatus,
	getProblems,
	getServices,
} = require('../dist/nodes/CheckmkConnector/live/liveStatus.js');
const {CREDENTIALS, createMockContext, jsonResponse} = require('./helpers/mockContext.js');

test('getHostWithStatus nests live status under host_status', async () => {
	const context = createMockContext({params: {hostName: 'web-01'}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		if (options.url.endsWith('/objects/host_config/web-01')) {
			return jsonResponse({id: 'web-01', extensions: {ipaddress: '10.0.0.1'}});
		}
		return jsonResponse({
			value: [{id: 'web-01', extensions: {name: 'web-01', state: 0, plugin_output: 'OK'}}],
		});
	};

	const result = await getHostWithStatus(context, client, 0);
	assert.equal(result.id, 'web-01');
	assert.deepEqual(result.extensions, {ipaddress: '10.0.0.1'});
	assert.deepEqual(result.host_status, {name: 'web-01', state: 0, plugin_output: 'OK'});

	const statusRequest = context.requests.find(request => request.options.method === 'POST');
	assert.equal(statusRequest.options.url, 'https://monitoring.example.com/cmk/check_mk/api/1.0/domain-types/host/collections/all');
	assert.equal(typeof statusRequest.options.body.query, 'string');
	assert.deepEqual(JSON.parse(statusRequest.options.body.query), {
		op: '=',
		left: 'name',
		right: 'web-01',
	});
	assert.deepEqual(statusRequest.options.body.columns, [
		'name',
		'state',
		'plugin_output',
		'address',
		'alias',
		'last_check',
	]);
});

test('getHostWithStatus returns a null status when the host has no live data', async () => {
	const context = createMockContext({params: {hostName: 'ghost'}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		if (options.method === 'GET') return jsonResponse({id: 'ghost', extensions: {}});
		return jsonResponse({value: []});
	};

	const result = await getHostWithStatus(context, client, 0);
	assert.equal(result.id, 'ghost');
	assert.equal(result.host_status, null);
});

test('includeConfig=false returns only the host name and status', async () => {
	const context = createMockContext({
		params: {hostName: 'web-01', includeConfig: false},
	});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({value: [{id: 'web-01', extensions: {name: 'web-01', state: 1}}]});
	};

	const result = await getHostWithStatus(context, client, 0);
	assert.deepEqual(result, {host_name: 'web-01', host_status: {name: 'web-01', state: 1}});
	assert.equal(context.requests.length, 1);
	assert.equal(context.requests[0].options.method, 'POST');
});

test('getHostsWithStatus issues one bulk status request and joins by host id', async () => {
	const context = createMockContext({params: {returnAll: true}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		if (options.method === 'GET') {
			return jsonResponse({
				value: [{id: 'a'}, {id: 'b'}],
				links: [],
			});
		}
		return jsonResponse({
			value: [
				{id: 'a', extensions: {name: 'a', state: 0}},
				{id: 'b', extensions: {name: 'b', state: 2}},
			],
		});
	};

	const result = await getHostsWithStatus(context, client, 0);
	assert.equal(context.requests.filter(request => request.options.method === 'POST').length, 1);
	assert.deepEqual(
		result.map(entry => [entry.id, entry.host_status?.state ?? null]),
		[
			['a', 0],
			['b', 2],
		],
	);
});

test('getServices sends a JSON-string query and comma-parsed columns', async () => {
	const context = createMockContext({
		params: {
			columns: 'host_name, state ,description',
			sites: 'cmk,',
			query: {op: '=', left: 'host_name', right: 'a'},
			returnAll: false,
			limit: 10,
		},
	});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({value: [{host_name: 'a'}], links: []});
	};

	const rows = await getServices(context, client, 0);
	assert.deepEqual(rows, [{host_name: 'a'}]);
	const [sent] = context.requests;
	assert.equal(sent.options.method, 'POST');
	assert.equal(sent.options.url, 'https://monitoring.example.com/cmk/check_mk/api/1.0/domain-types/service/collections/all');
	assert.deepEqual(sent.options.body.columns, ['host_name', 'state', 'description']);
	assert.deepEqual(sent.options.body.sites, ['cmk']);
	assert.equal(typeof sent.options.body.query, 'string');
	assert.deepEqual(JSON.parse(sent.options.body.query), {
		op: '=',
		left: 'host_name',
		right: 'a',
	});
});

test('getProblems defaults to the non-OK query and lets a user query replace it', async () => {
	const defaults = createMockContext({params: {}});
	const defaultClient = new CheckmkClient(defaults, CREDENTIALS);
	defaults.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		defaults.requests.push({credentialName: name, options});
		return jsonResponse({value: [], links: []});
	};
	await getProblems(defaults, defaultClient, 0);
	assert.deepEqual(JSON.parse(defaults.requests[0].options.body.query), {
		op: '!=',
		left: 'state',
		right: '0',
	});
	assert.ok(defaults.requests[0].options.body.columns.includes('acknowledged'));

	const override = createMockContext({
		params: {query: '{"op":"=","left":"state","right":2}'},
	});
	const overrideClient = new CheckmkClient(override, CREDENTIALS);
	override.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		override.requests.push({credentialName: name, options});
		return jsonResponse({value: [], links: []});
	};
	await getProblems(override, overrideClient, 0);
	assert.deepEqual(JSON.parse(override.requests[0].options.body.query), {
		op: '=',
		left: 'state',
		right: 2,
	});
});

test('live status never touches the deprecated GET status collections', async () => {
	const context = createMockContext({params: {returnAll: true}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		if (options.method === 'GET') return jsonResponse({value: [], links: []});
		return jsonResponse({value: [], links: []});
	};

	await getHostsWithStatus(context, client, 0);
	await getServices(context, client, 0);
	await getProblems(context, client, 0);

	for (const request of context.requests) {
		const isStatusCollection =
			request.options.url.includes('/domain-types/host/collections/all') ||
			request.options.url.includes('/domain-types/service/collections/all');
		if (isStatusCollection) {
			assert.equal(request.options.method, 'POST', `deprecated GET on ${request.options.url}`);
		}
	}
});

test('getServices falls back to the GET status collection before Checkmk 2.4', async () => {
	const context = createMockContext({params: {query: '{}', sites: '', columns: 'host_name,state'}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({value: [{id: 'svc-1', extensions: {state: 2}}]});
	};

	const result = await getServices(context, client, 0, {
		raw: '2.2.0p47.cre',
		major: 2,
		minor: 2,
		patch: 0,
	});

	assert.deepEqual(result, [{id: 'svc-1', extensions: {state: 2}}]);
	const request = context.requests[0].options;
	assert.equal(request.method, 'GET');
	assert.equal(request.url, 'https://monitoring.example.com/cmk/check_mk/api/1.0/domain-types/service/collections/all');
	assert.equal(request.body, undefined);
	assert.deepEqual(request.qs, {sites: [], columns: ['host_name', 'state']});
	assert.equal(request.arrayFormat, 'repeat');
});

test('getHostWithStatus reads live status with GET before Checkmk 2.4', async () => {
	const context = createMockContext({params: {hostName: 'web-01'}});
	const client = new CheckmkClient(context, CREDENTIALS);
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		if (options.url.endsWith('/objects/host_config/web-01')) {
			return jsonResponse({id: 'web-01', extensions: {ipaddress: '10.0.0.1'}});
		}
		return jsonResponse({value: [{extensions: {name: 'web-01', state: 0}}]});
	};

	const result = await getHostWithStatus(context, client, 0, {
		raw: '2.2.0p47.cre',
		major: 2,
		minor: 2,
		patch: 0,
	});

	assert.deepEqual(result.host_status, {name: 'web-01', state: 0});
	const statusRequest = context.requests.find(request =>
		request.options.url.endsWith('/domain-types/host/collections/all'),
	);
	assert.equal(statusRequest.options.method, 'GET');
	assert.equal(statusRequest.options.body, undefined);
});
