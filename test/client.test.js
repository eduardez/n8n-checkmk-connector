'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');

const {NodeApiError, NodeOperationError} = require('n8n-workflow');

const {CheckmkClient} = require('../dist/nodes/CheckmkConnector/transport/CheckmkClient.js');
const {CREDENTIALS, createMockContext, jsonResponse} = require('./helpers/mockContext.js');

function clientFor(responses, overrides = {}) {
	const credentials = {...CREDENTIALS, ...overrides};
	const context = createMockContext({responses, credentials});
	return {client: new CheckmkClient(context, credentials), context};
}

test('buildUrl joins host, site and api version and ignores stray slashes', () => {
	const {client} = clientFor([], {host: 'https://monitoring.example.com/'});
	assert.equal(
		client.buildUrl('/version'),
		'https://monitoring.example.com/cmk/check_mk/api/1.0/version',
	);
	assert.equal(
		client.buildUrl('domain-types/host_config/collections/all'),
		'https://monitoring.example.com/cmk/check_mk/api/1.0/domain-types/host_config/collections/all',
	);
});

test('buildUrl uses the v1 prefix on request', () => {
	const {client} = clientFor([jsonResponse({})], {apiVersion: 'v1'});
	assert.equal(
		client.buildUrl('/version'),
		'https://monitoring.example.com/cmk/check_mk/api/v1/version',
	);
});

test('buildUrl passes absolute pagination links through and rejects other schemes', () => {
	const {client} = clientFor([]);
	const absolute = 'https://monitoring.example.com/cmk/check_mk/api/1.0/objects/host?after=x';
	assert.equal(client.buildUrl(absolute), absolute);
	assert.throws(() => client.buildUrl('//evil.example.com/path'), NodeOperationError);
	assert.throws(() => client.buildUrl('ftp://evil.example.com/path'), NodeOperationError);
});

test('requests use repeated query keys, JSON, and credential-derived TLS handling', async () => {
	const {client, context} = clientFor([jsonResponse({value: []})], {
		allowUnauthorizedCerts: true,
	});
	await client.request({
		method: 'GET',
		path: '/domain-types/host_config/collections/all',
		query: {host_name: ['a', 'b']},
	});

	const [sent] = context.requests;
	assert.equal(sent.credentialName, 'checkmkConnectorApi');
	assert.equal(sent.options.arrayFormat, 'repeat');
	assert.equal(sent.options.json, true);
	assert.equal(sent.options.returnFullResponse, true);
	assert.equal(sent.options.skipSslCertificateValidation, true);
	assert.deepEqual(sent.options.qs, {host_name: ['a', 'b']});
	assert.equal(sent.options.body, undefined);
	assert.equal(sent.options.headers['Content-Type'], undefined);
	assert.equal(sent.options.headers.Accept, 'application/json');
});

test('a body adds the JSON content type and is forwarded verbatim', async () => {
	const {client, context} = clientFor([jsonResponse({ok: true})]);
	const body = {acknowledge_type: 'host', host_name: 'web-01'};
	await client.request({
		method: 'POST',
		path: '/domain-types/acknowledge/actions/delete/invoke',
		body,
	});

	const [sent] = context.requests;
	assert.deepEqual(sent.options.body, body);
	assert.equal(sent.options.headers['Content-Type'], 'application/json');
});

test('If-Match is sent verbatim, quotes included', async () => {
	const {client, context} = clientFor([jsonResponse({})]);
	await client.request({
		method: 'PUT',
		path: '/objects/host_config/web-01',
		body: {update_attributes: {}},
		ifMatch: '"abc123"',
	});
	assert.equal(context.requests[0].options.headers['If-Match'], '"abc123"');
});

test('full response requests return status, headers and body', async () => {
	const {client} = clientFor([jsonResponse({value: 1}, {statusCode: 201, headers: {etag: 'x'}})]);
	const response = await client.request({
		method: 'GET',
		path: '/version',
		returnFullResponse: true,
	});
	assert.deepEqual(response, {statusCode: 201, headers: {etag: 'x'}, body: {value: 1}});
});

test('Checkmk problem details become a NodeApiError', async () => {
	const failure = Object.assign(new Error('Request failed with status code 400'), {
		statusCode: 400,
		response: {
			body: {
				title: 'Bad Request',
				detail: 'Invalid parameter',
				fields: {host_name: 'must not be empty'},
			},
		},
	});
	const {client} = clientFor([failure]);
	await assert.rejects(
		client.request({method: 'GET', path: '/version'}),
		error => {
			assert.ok(error instanceof NodeApiError);
			assert.equal(error.message, 'Bad Request');
			assert.match(error.description, /Invalid parameter/);
			assert.match(error.description, /host_name: must not be empty/);
			return true;
		},
	);
});

test('pagination follows rel=next links and concatenates value', async () => {
	const nextHref = 'https://monitoring.example.com/cmk/check_mk/api/1.0/objects?after=2';
	const {client, context} = clientFor([
		jsonResponse({
			value: [{id: 'a'}],
			links: [{rel: 'next', href: nextHref, method: 'GET'}],
		}),
		jsonResponse({value: [{id: 'b'}], links: []}),
	]);

	const items = await client.requestAll(
		{method: 'GET', path: '/domain-types/host_config/collections/all'},
		true,
		50,
	);

	assert.deepEqual(items, [{id: 'a'}, {id: 'b'}]);
	assert.equal(context.requests.length, 2);
	assert.equal(context.requests[1].options.url, nextHref);
});

test('returnAll=false stops after one page and slices to the limit', async () => {
	const {client, context} = clientFor([
		jsonResponse({
			value: [{id: 1}, {id: 2}, {id: 3}],
			links: [{rel: 'next', href: 'https://x/y', method: 'GET'}],
		}),
	]);
	const items = await client.requestAll(
		{method: 'GET', path: '/domain-types/host_config/collections/all'},
		false,
		2,
	);
	assert.deepEqual(items, [{id: 1}, {id: 2}]);
	assert.equal(context.requests.length, 1);
});

test('pagination guard stops runaway link chains', async () => {
	const responses = Array.from({length: 1001}, () =>
		jsonResponse({
			value: [{id: 'x'}],
			links: [{rel: 'next', href: 'https://monitoring.example.com/loop', method: 'GET'}],
		}),
	);
	const {client} = clientFor(responses);
	await assert.rejects(
		client.requestAll({method: 'GET', path: '/domain-types/host_config/collections/all'}, true, 50),
		error => {
			assert.ok(error instanceof NodeOperationError);
			assert.match(error.message, /Pagination exceeded 1000 pages/);
			return true;
		},
	);
});

test('non-collection bodies yield a single element array', async () => {
	const {client} = clientFor([jsonResponse({id: 'web-01', extensions: {}})]);
	const items = await client.requestAll({method: 'GET', path: '/objects/host_config/web-01'}, false, 50);
	assert.deepEqual(items, [{id: 'web-01', extensions: {}}]);
});
