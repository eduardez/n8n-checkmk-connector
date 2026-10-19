'use strict';

const assert = require('node:assert/strict');
const {after, before, test} = require('node:test');

const {CheckmkClient} = require('../../dist/nodes/CheckmkConnector/transport/CheckmkClient.js');
const {getHostsWithStatus, getProblems} = require('../../dist/nodes/CheckmkConnector/live/liveStatus.js');

const BASE_URL = process.env.CHECKMK_BASE_URL;
const SITE = process.env.CHECKMK_SITE;
const USERNAME = process.env.CHECKMK_USERNAME;
const PASSWORD = process.env.CHECKMK_PASSWORD;
const ENABLED = Boolean(BASE_URL && SITE && USERNAME && PASSWORD);

const CREDENTIALS = {
	host: BASE_URL,
	site: SITE,
	apiVersion: '1.0',
	username: USERNAME,
	password: PASSWORD,
	allowUnauthorizedCerts: true,
};

const RUN = Date.now().toString(36);
const FOLDER = `n8n_connector_it_${RUN}`;
const HOST = `n8n-it-${RUN}.example.com`;
const FOLDER_PATH = `~${FOLDER}`;

const NODE = {
	id: 'integration',
	name: 'Checkmk Connector',
	type: 'checkmkConnector',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
};

/** Bridges the node's httpRequestWithAuthentication contract onto global fetch. */
function fetchContext(credentials) {
	const requests = [];
	const context = {
		requests,
		getNode: () => NODE,
		getCredentials: async () => credentials,
		getNodeParameter: (name, itemIndex, fallback) => fallback,
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: {
				async call(self, credentialName, options) {
					requests.push({credentialName, options});
					const url = new URL(options.url);
					for (const [key, value] of Object.entries(options.qs ?? {})) {
						for (const entry of Array.isArray(value) ? value : [value]) {
							if (entry !== undefined) url.searchParams.append(key, String(entry));
						}
					}

					const headers = {...options.headers};
					headers.Authorization = `Bearer ${credentials.username} ${credentials.password}`;
					const response = await fetch(url, {
						method: options.method,
						headers,
						body:
							options.body === undefined
								? undefined
								: typeof options.body === 'string'
									? options.body
									: JSON.stringify(options.body),
					});

					const text = await response.text();
					const body = text === '' ? undefined : JSON.parse(text);
					if (!response.ok) {
						const error = new Error(`Request failed with status code ${response.status}`);
						error.statusCode = response.status;
						error.response = {
							statusCode: response.status,
							headers: Object.fromEntries(response.headers),
							body,
						};
						throw error;
					}
					return {
						statusCode: response.status,
						headers: Object.fromEntries(response.headers),
						body,
					};
				},
			},
		},
	};
	return context;
}

const enabled = ENABLED ? test : test.skip;
const context = fetchContext(CREDENTIALS);
const client = new CheckmkClient(context, CREDENTIALS);

async function waitForHost(name, timeoutMs = 60000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const body = await client.request({
			method: 'POST',
			path: '/domain-types/host/collections/all',
			body: {
				columns: ['name', 'state'],
				query: JSON.stringify({op: '=', left: 'name', right: name}),
			},
		});
		const match = (body.value ?? []).find(entry => entry.id === name);
		if (match) return match;
		await new Promise(resolve => setTimeout(resolve, 2000));
	}
	throw new Error(`Host ${name} did not reach the monitoring core within ${timeoutMs}ms`);
}

async function deleteQuietly(options) {
	try {
		await client.request(options);
	} catch {
		// Cleanup is best effort; a missing resource must not mask the real failure.
	}
}

before(async () => {
	if (!ENABLED) return;
	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/host_config/${encodeURIComponent(HOST)}`,
		ifMatch: '*',
	});
	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/folder_config/${encodeURIComponent(FOLDER_PATH)}`,
		query: {delete_mode: 'recursive'},
	});
});

after(async () => {
	if (!ENABLED) return;
	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/host_config/${encodeURIComponent(HOST)}`,
		ifMatch: '*',
	});
	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/folder_config/${encodeURIComponent(FOLDER_PATH)}`,
		query: {delete_mode: 'recursive'},
	});
	await deleteQuietly({
		method: 'POST',
		path: '/domain-types/activation_run/actions/activate-changes/invoke',
		body: {sites: [SITE], force_foreign_changes: true, redirect: false},
		ifMatch: '*',
	});
});

enabled('GET /version reports the expected Checkmk release', async () => {
	const version = await client.request({method: 'GET', path: '/version'});
	assert.equal(version.versions.checkmk, '2.4.0p37.cre');
	assert.equal(version.site, SITE);
});

enabled('folder collection is paginated and readable', async () => {
	const folders = await client.requestAll(
		{method: 'GET', path: '/domain-types/folder_config/collections/all'},
		true,
		50,
	);
	assert.ok(Array.isArray(folders));
	assert.ok(folders.every(folder => typeof folder.id === 'string'));
});

enabled('POST host status collection returns live rows', async () => {
	const body = await client.request({
		method: 'POST',
		path: '/domain-types/host/collections/all',
		body: {columns: ['name', 'state']},
	});
	assert.ok(Array.isArray(body.value));
});

enabled('POST service status collection accepts a JSON query string', async () => {
	const body = await client.request({
		method: 'POST',
		path: '/domain-types/service/collections/all',
		body: {
			columns: ['host_name', 'description', 'state'],
			query: JSON.stringify({op: '!=', left: 'state', right: '0'}),
		},
	});
	assert.ok(Array.isArray(body.value));
});

enabled('live status helpers read the real status collections', async () => {
	const problems = await getProblems(context, client, 0);
	assert.ok(Array.isArray(problems));
	assert.ok(problems.every(problem => Number(problem.state) !== 0));

	const hosts = await getHostsWithStatus(context, client, 0);
	assert.ok(Array.isArray(hosts));
	assert.ok(hosts.every(host => Object.prototype.hasOwnProperty.call(host, 'host_status')));
});

enabled('host lifecycle honours ETags, activation and cleanup', async () => {
	await client.request({
		method: 'POST',
		path: '/domain-types/folder_config/collections/all',
		body: {name: FOLDER, title: `n8n connector integration ${RUN}`, parent: '/'},
	});

	const created = await client.request({
		method: 'POST',
		path: '/domain-types/host_config/collections/all',
		body: {
			host_name: HOST,
			folder: `/${FOLDER}`,
			attributes: {ipaddress: '192.0.2.1', alias: 'n8n integration host'},
		},
	});
	assert.equal(created.id, HOST);
	assert.equal(created.extensions.folder, `/${FOLDER}`);

	const read = await client.request({
		method: 'GET',
		path: `/objects/host_config/${encodeURIComponent(HOST)}`,
		returnFullResponse: true,
	});
	const etag = read.headers.etag;
	assert.ok(typeof etag === 'string' && etag.length > 0, 'response must carry an ETag');

	await assert.rejects(
		client.request({
			method: 'PUT',
			path: `/objects/host_config/${encodeURIComponent(HOST)}`,
			body: {update_attributes: {alias: 'stale write'}},
			ifMatch: '"stale-etag"',
		}),
		error => {
			assert.equal(String(error.httpCode), '412');
			return true;
		},
	);

	await client.request({
		method: 'PUT',
		path: `/objects/host_config/${encodeURIComponent(HOST)}`,
		body: {update_attributes: {alias: 'n8n integration host updated'}},
		ifMatch: etag,
	});

	const activation = await client.request({
		method: 'POST',
		path: '/domain-types/activation_run/actions/activate-changes/invoke',
		body: {sites: [SITE], force_foreign_changes: true, redirect: false},
		ifMatch: '*',
		returnFullResponse: true,
	});
	assert.ok([200, 204, 302].includes(activation.statusCode), `unexpected ${activation.statusCode}`);

	const live = await waitForHost(HOST);
	assert.equal(live.id, HOST);
	assert.equal(live.extensions.name, HOST);

	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/host_config/${encodeURIComponent(HOST)}`,
		ifMatch: '*',
	});
	await deleteQuietly({
		method: 'DELETE',
		path: `/objects/folder_config/${encodeURIComponent(FOLDER_PATH)}`,
		query: {delete_mode: 'recursive'},
	});
	await deleteQuietly({
		method: 'POST',
		path: '/domain-types/activation_run/actions/activate-changes/invoke',
		body: {sites: [SITE], force_foreign_changes: true, redirect: false},
		ifMatch: '*',
	});

	const folders = await client.requestAll(
		{method: 'GET', path: '/domain-types/folder_config/collections/all'},
		true,
		50,
	);
	assert.equal(
		folders.some(folder => folder.id.endsWith(FOLDER)),
		false,
		'integration folder must be removed',
	);
});
