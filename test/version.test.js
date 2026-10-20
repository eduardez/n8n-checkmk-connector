'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
	compatibilityWarning,
	parseCheckmkVersion,
	probeCheckmkVersion,
} = require('../dist/nodes/CheckmkConnector/transport/version.js');

const CREDENTIALS = {
	host: 'https://monitoring.example.com',
	site: 'cmk',
	apiVersion: '1.0',
	username: 'automation',
	password: 'secret',
	allowUnauthorizedCerts: false,
};

function fakeContext(staticData = {}) {
	const warnings = [];
	return {
		warnings,
		logger: {warn: message => warnings.push(message)},
		getWorkflowStaticData: () => staticData,
	};
}

function fakeClient(version) {
	return {
		calls: 0,
		async request() {
			this.calls += 1;
			return {versions: {checkmk: version}};
		},
	};
}

test('parses Checkmk version strings', () => {
	assert.deepEqual(parseCheckmkVersion('2.4.0p37.cre'), {
		raw: '2.4.0p37.cre',
		major: 2,
		minor: 4,
		patch: 0,
	});
	assert.deepEqual(parseCheckmkVersion('3.0'), {raw: '3.0', major: 3, minor: 0, patch: 0});
	assert.equal(parseCheckmkVersion('not-a-version'), undefined);
	assert.equal(parseCheckmkVersion(undefined), undefined);
});

test('warns for Checkmk older than 2.4', () => {
	const warning = compatibilityWarning(parseCheckmkVersion('2.3.0p1'), '1.0');
	assert.match(warning, /predates 2\.4/);
	assert.equal(compatibilityWarning(parseCheckmkVersion('2.4.0p37.cre'), '1.0'), undefined);
});

test('requires v1 on Checkmk 3.0', () => {
	assert.match(compatibilityWarning(parseCheckmkVersion('3.0.0'), '1.0'), /"v1"/);
	assert.equal(compatibilityWarning(parseCheckmkVersion('3.0.0'), 'v1'), undefined);
});

test('caches the version probe per workflow', async () => {
	const context = fakeContext();
	const client = fakeClient('2.3.0p1');

	await probeCheckmkVersion(context, client, CREDENTIALS);
	await probeCheckmkVersion(context, client, CREDENTIALS);

	assert.equal(client.calls, 1);
	assert.equal(context.warnings.length, 2);
});

test('never fails the execution when the version probe fails', async () => {
	const context = fakeContext();
	const client = {
		async request() {
			throw new Error('connection refused');
		},
	};

	await probeCheckmkVersion(context, client, CREDENTIALS);
	assert.deepEqual(context.warnings, []);
});

test('drops query parameters that Checkmk 2.2 does not know', () => {
	const {filterLegacyQuery} = require('../dist/nodes/CheckmkConnector/transport/compatibility.js');
	const context = {logger: {warn: message => context.warnings.push(message)}, warnings: []};
	const operation = {
		method: 'GET',
		path: '/domain-types/host_config/collections/all',
	};
	const query = {include_links: false, site: 'site1', effective_attributes: false};

	const filtered = filterLegacyQuery(context, parseCheckmkVersion('2.2.0p47.cre'), operation, query);

	assert.deepEqual(filtered, {effective_attributes: false});
	assert.match(context.warnings[0], /include_links, site/);
	assert.deepEqual(
		filterLegacyQuery(context, parseCheckmkVersion('2.4.0p37.cre'), operation, query),
		query,
	);
});
