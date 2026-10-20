'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');

const {CheckmkClient} = require('../dist/nodes/CheckmkConnector/transport/CheckmkClient.js');
const {
	executeCustomOperation,
} = require('../dist/nodes/CheckmkConnector/execute/executeCustomOperation.js');
const {CREDENTIALS, createMockContext, jsonResponse} = require('./helpers/mockContext.js');

function run(params, responses = [jsonResponse({ok: true})]) {
	const context = createMockContext({params});
	for (const response of responses) {
		context.helpers.httpRequestWithAuthentication.call = async (self, name, options) => {
			context.requests.push({credentialName: name, options});
			return response;
		};
	}
	const client = new CheckmkClient(context, CREDENTIALS);
	return {context, client};
}

test('the custom API sends JSON bodies with the JSON content type by default', async () => {
	const params = {
		customMethod: 'POST',
		customPath: '/objects/host_config/web-01',
		customBody: {attributes: {alias: 'Web'}},
	};
	const {context, client} = run(params);

	await executeCustomOperation(context, client, 0);

	const [request] = context.requests;
	assert.equal(request.options.headers['Content-Type'], 'application/json');
	assert.deepEqual(request.options.body, {attributes: {alias: 'Web'}});
	assert.equal(request.options.json, true);
});

test('the custom API encodes form bodies and repeats array values', async () => {
	const params = {
		customMethod: 'POST',
		customPath: '/domain-types/activate/collections/all',
		customContentType: 'application/x-www-form-urlencoded',
		customBody: {sites: ['cmk', 'other'], force_foreign_changes: true},
	};
	const {context, client} = run(params);

	await executeCustomOperation(context, client, 0);

	const [request] = context.requests;
	assert.equal(request.options.headers['Content-Type'], 'application/x-www-form-urlencoded');
	assert.equal(request.options.body, 'sites=cmk&sites=other&force_foreign_changes=true');
});

test('the custom API can send raw text and read the response as text', async () => {
	const params = {
		customMethod: 'PUT',
		customPath: '/objects/host_config/web-01',
		customContentType: 'text/plain',
		customResponseFormat: 'text',
		customBody: '"plain payload"',
	};
	const {context, client} = run(params, [jsonResponse('plain payload')]);

	const result = await executeCustomOperation(context, client, 0);

	const [request] = context.requests;
	assert.equal(request.options.headers['Content-Type'], 'text/plain');
	assert.equal(request.options.headers.Accept, '*/*');
	assert.equal(request.options.body, 'plain payload');
	assert.equal(request.options.json, false);
	assert.equal(request.options.encoding, 'text');
	assert.equal(result, 'plain payload');
});
