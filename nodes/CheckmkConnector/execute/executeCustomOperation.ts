import type {IExecuteFunctions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {CheckmkMethod} from '../catalog/types';
import type {CheckmkClient} from '../transport/CheckmkClient';

const FORBIDDEN_HEADERS: Record<string, true> = {
	authorization: true,
	host: true,
	'content-length': true,
	cookie: true,
};

function parseJsonObject(
	context: IExecuteFunctions,
	value: unknown,
	field: string,
): Record<string, unknown> {
	let parsed: unknown = value;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed === '') return {};
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			throw new NodeOperationError(context.getNode(), `Field "${field}" must contain valid JSON`);
		}
	}
	if (parsed === undefined || parsed === null) return {};
	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new NodeOperationError(context.getNode(), `Field "${field}" must contain a JSON object`);
	}
	return parsed as Record<string, unknown>;
}

/**
 * Executes an arbitrary Checkmk API call. Credential-derived authentication and
 * transport-controlled headers can never be overridden.
 */
export async function executeCustomOperation(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
): Promise<unknown> {
	const method = context.getNodeParameter('customMethod', itemIndex, 'GET') as CheckmkMethod;
	const rawPath = String(context.getNodeParameter('customPath', itemIndex, '')).trim();
	if (!rawPath.startsWith('/')) {
		throw new NodeOperationError(
			context.getNode(),
			'Path must start with "/" and be relative to the Checkmk API base',
		);
	}
	if (/^\/\//.test(rawPath) || /^[/\\]{2}/.test(rawPath) || /^\/[a-z][a-z0-9+.-]*:/i.test(rawPath)) {
		throw new NodeOperationError(
			context.getNode(),
			'Absolute URLs are not allowed; supply a path relative to the API base',
		);
	}

	const query = parseJsonObject(
		context,
		context.getNodeParameter('customQuery', itemIndex, {}),
		'Query',
	);
	const rawHeaders = parseJsonObject(
		context,
		context.getNodeParameter('customHeaders', itemIndex, {}),
		'Headers',
	);
	const headers: Record<string, string> = {};
	for (const [name, value] of Object.entries(rawHeaders)) {
		if (FORBIDDEN_HEADERS[name.toLowerCase()] === true) {
			throw new NodeOperationError(
				context.getNode(),
				`Header "${name}" cannot be set; it is controlled by the credential or the transport`,
			);
		}
		headers[name] = String(value);
	}

	const parsedBody = context.getNodeParameter('customBody', itemIndex, {});
	const body = parseJsonObject(context, parsedBody, 'Body (JSON)');
	const hasBody = Object.keys(body).length > 0;
	const sendBody = hasBody && method !== 'GET' && method !== 'DELETE';
	const returnFullResponse = Boolean(
		context.getNodeParameter('customReturnFullResponse', itemIndex, false),
	);

	return client.request({
		method,
		path: rawPath,
		query: Object.keys(query).length > 0 ? query : undefined,
		headers: Object.keys(headers).length > 0 ? headers : undefined,
		body: sendBody ? body : undefined,
		returnFullResponse,
	});
}
