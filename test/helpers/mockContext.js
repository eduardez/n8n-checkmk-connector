'use strict';

const CREDENTIALS = {
	host: 'https://monitoring.example.com',
	site: 'cmk',
	apiVersion: '1.0',
	username: 'automation',
	password: 'secret',
	allowUnauthorizedCerts: false,
};

const NODE = {
	id: 'mock-node',
	name: 'Checkmk Connector',
	type: 'checkmkConnector',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
};

/**
 * Minimal IExecuteFunctions double. `responses` is a queue consumed by every
 * httpRequestWithAuthentication call; entries are returned as-is or thrown when
 * they are Error instances.
 */
function createMockContext({params = {}, responses = [], credentials = CREDENTIALS} = {}) {
	const requests = [];
	const queue = [...responses];

	const context = {
		requests,
		credentials,
		getNode: () => NODE,
		getCredentials: async () => credentials,
		getNodeParameter(name, itemIndex, fallback) {
			return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : fallback;
		},
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: {
				async call(self, credentialName, options) {
					requests.push({credentialName, options});
					if (queue.length === 0) {
						throw new Error(`Unexpected request to ${options.url}`);
					}
					const next = queue.shift();
					if (typeof next === 'function') return next(options);
					if (next instanceof Error) throw next;
					return next;
				},
			},
		},
	};

	return context;
}

function jsonResponse(body, {statusCode = 200, headers = {}} = {}) {
	return {body, headers, statusCode};
}

module.exports = {CREDENTIALS, createMockContext, jsonResponse};
