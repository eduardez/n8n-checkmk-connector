'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');

const {CheckmkClient} = require('../dist/nodes/CheckmkConnector/transport/CheckmkClient.js');
const {
	acknowledgeProblem,
	scheduleDowntime,
} = require('../dist/nodes/CheckmkConnector/monitoring/monitoring.js');
const {getHostServices} = require('../dist/nodes/CheckmkConnector/live/liveStatus.js');
const {CREDENTIALS, createMockContext, jsonResponse} = require('./helpers/mockContext.js');

const BASE = 'https://monitoring.example.com/cmk/check_mk/api/1.0';

function capture(context) {
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({});
	};
}

test('acknowledgeProblem acknowledges a whole host', async () => {
	const context = createMockContext({
		params: {hostName: 'web-01', acknowledgementComment: 'on it'},
	});
	capture(context);
	const client = new CheckmkClient(context, CREDENTIALS);

	await acknowledgeProblem(context, client, 0);

	assert.equal(context.requests.length, 1);
	const [request] = context.requests;
	assert.equal(request.options.method, 'POST');
	assert.equal(request.options.url, `${BASE}/domain-types/acknowledge/collections/host`);
	assert.deepEqual(request.options.body, {
		acknowledge_type: 'host',
		host_name: 'web-01',
		comment: 'on it',
		sticky: true,
		persistent: false,
		notify: true,
	});
});

test('acknowledgeProblem acknowledges one service with an expiry', async () => {
	const context = createMockContext({
		params: {
			target: 'service',
			hostName: 'web-01',
			serviceDescription: 'CPU load',
			acknowledgementComment: 'known',
			sticky: false,
			persistent: true,
			notify: false,
			expireOn: '2026-01-01T00:00:00Z',
		},
	});
	capture(context);
	const client = new CheckmkClient(context, CREDENTIALS);

	await acknowledgeProblem(context, client, 0);

	const [request] = context.requests;
	assert.equal(request.options.url, `${BASE}/domain-types/acknowledge/collections/service`);
	assert.deepEqual(request.options.body, {
		acknowledge_type: 'service',
		host_name: 'web-01',
		comment: 'known',
		sticky: false,
		persistent: true,
		notify: false,
		service_description: 'CPU load',
		expire_on: '2026-01-01T00:00:00Z',
	});
});

test('acknowledgeProblem rejects a missing host name before calling the API', async () => {
	const context = createMockContext({params: {hostName: '  ', acknowledgementComment: 'x'}});
	capture(context);
	const client = new CheckmkClient(context, CREDENTIALS);

	await assert.rejects(() => acknowledgeProblem(context, client, 0), /Host name is required/);
	assert.equal(context.requests.length, 0);
});

test('scheduleDowntime schedules downtime for several services', async () => {
	const context = createMockContext({
		params: {
			target: 'service',
			hostName: 'web-01',
			serviceDescriptions: 'CPU load, Disk IO',
			startTime: '2026-01-01T00:00:00Z',
			endTime: '2026-01-01T01:00:00Z',
			downtimeComment: 'maintenance',
		},
	});
	capture(context);
	const client = new CheckmkClient(context, CREDENTIALS);

	await scheduleDowntime(context, client, 0);

	const [request] = context.requests;
	assert.equal(request.options.method, 'POST');
	assert.equal(request.options.url, `${BASE}/domain-types/downtime/collections/service`);
	assert.deepEqual(request.options.body, {
		downtime_type: 'service',
		host_name: 'web-01',
		start_time: '2026-01-01T00:00:00Z',
		end_time: '2026-01-01T01:00:00Z',
		service_descriptions: ['CPU load', 'Disk IO'],
		comment: 'maintenance',
	});
});

test('scheduleDowntime requires at least one service description', async () => {
	const context = createMockContext({
		params: {
			target: 'service',
			hostName: 'web-01',
			serviceDescriptions: ' , ',
			startTime: '2026-01-01T00:00:00Z',
			endTime: '2026-01-01T01:00:00Z',
		},
	});
	capture(context);
	const client = new CheckmkClient(context, CREDENTIALS);

	await assert.rejects(() => scheduleDowntime(context, client, 0), /Service descriptions are required/);
	assert.equal(context.requests.length, 0);
});

test('getHostServices filters one host and flattens the status rows', async () => {
	const context = createMockContext({params: {hostName: 'web-01'}});
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({
			value: [
				{id: 'svc-1', extensions: {host_name: 'web-01', description: 'CPU load', state: 2}},
				{id: 'svc-2', extensions: {host_name: 'web-01', description: 'Disk IO', state: 0}},
			],
		});
	};
	const client = new CheckmkClient(context, CREDENTIALS);

	const rows = await getHostServices(context, client, 0);

	assert.deepEqual(rows, [
		{host_name: 'web-01', description: 'CPU load', state: 2},
		{host_name: 'web-01', description: 'Disk IO', state: 0},
	]);
	const [request] = context.requests;
	assert.equal(request.options.method, 'POST');
	assert.equal(request.options.url, `${BASE}/domain-types/service/collections/all`);
	assert.deepEqual(JSON.parse(request.options.body.query), {
		op: '=',
		left: 'host_name',
		right: 'web-01',
	});
	assert.equal(request.options.body.sites, undefined, 'site comes from the credential');
});

test('getHostServices narrows the query to non-OK services', async () => {
	const context = createMockContext({params: {hostName: 'web-01', onlyProblems: true}});
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({value: []});
	};
	const client = new CheckmkClient(context, CREDENTIALS);

	await getHostServices(context, client, 0);

	assert.deepEqual(JSON.parse(context.requests[0].options.body.query), {
		op: 'and',
		expr: [
			{op: '=', left: 'host_name', right: 'web-01'},
			{op: '!=', left: 'state', right: '0'},
		],
	});
});

test('getHostServices uses the legacy GET collection before Checkmk 2.4', async () => {
	const context = createMockContext({params: {hostName: 'web-01', columns: 'host_name,state'}});
	context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
		context.requests.push({credentialName: name, options});
		return jsonResponse({value: [{id: 'svc-1', extensions: {state: 1}}]});
	};
	const client = new CheckmkClient(context, CREDENTIALS);

	const rows = await getHostServices(context, client, 0, {
		raw: '2.2.0p47.cre',
		major: 2,
		minor: 2,
		patch: 0,
	});

	assert.deepEqual(rows, [{state: 1}]);
	const request = context.requests[0].options;
	assert.equal(request.method, 'GET');
	assert.equal(request.url, `${BASE}/domain-types/service/collections/all`);
	assert.equal(request.body, undefined);
	assert.deepEqual(JSON.parse(request.qs.query), {op: '=', left: 'host_name', right: 'web-01'});
	assert.deepEqual(request.qs.columns, ['host_name', 'state']);
});

test('the Monitoring operation selector lists the curated operations', () => {
	const {buildProperties} = require('../dist/nodes/CheckmkConnector/ui/buildProperties.js');
	const selector = buildProperties().find(
		field =>
			field.name === 'operation' &&
			field.displayOptions?.show?.resource?.[0] === 'monitoring',
	);

	assert.ok(selector !== undefined);
	assert.equal(selector.default, 'getHostServices');
	assert.deepEqual(
		selector.options.map(option => option.value),
		['acknowledgeProblem', 'getHostServices', 'scheduleDowntime'],
	);
	for (const option of selector.options) {
		assert.ok(/^(GET|POST|PUT|PATCH|DELETE) \//.test(option.description), option.value);
	}
});
