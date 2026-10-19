import type {IExecuteFunctions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {ApiOperation, ApiParameter} from '../catalog/types';
import type {CheckmkClient, CheckmkRequestOptions} from '../transport/CheckmkClient';
import {sanitize} from '../ui/buildProperties';

function readParameter(
	context: IExecuteFunctions,
	itemIndex: number,
	name: string,
	fallback?: unknown,
): unknown {
	return context.getNodeParameter(name, itemIndex, fallback);
}

function parseJsonField(context: IExecuteFunctions, value: unknown, field: string): unknown {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (trimmed === '') return {};
	try {
		return JSON.parse(trimmed);
	} catch {
		throw new NodeOperationError(context.getNode(), `Field "${field}" must contain valid JSON`);
	}
}

function buildPath(
	context: IExecuteFunctions,
	operation: ApiOperation,
	itemIndex: number,
): string {
	let path = operation.path;
	for (const parameter of operation.pathParameters) {
		const field = `path_${sanitize(operation.id)}_${sanitize(parameter.name)}`;
		const raw = readParameter(context, itemIndex, field, '');
		const value = raw === undefined || raw === null ? '' : String(raw).trim();
		if (value === '' && parameter.required) {
			throw new NodeOperationError(
				context.getNode(),
				`Parameter "${parameter.name}" is required for ${operation.method} ${operation.path}`,
			);
		}
		path = path.split(`{${parameter.name}}`).join(encodeURIComponent(value));
	}
	if (path.includes('{')) {
		throw new NodeOperationError(
			context.getNode(),
			`Unresolved path parameter in "${path}" for operation ${operation.id}`,
		);
	}
	return path;
}

function queryValue(
	context: IExecuteFunctions,
	parameter: ApiParameter,
	value: unknown,
	field: string,
): unknown {
	if (parameter.kind === 'array') {
		const list = Array.isArray(value)
			? value
			: String(value)
					.split(',')
					.map(entry => entry.trim())
					.filter(entry => entry !== '');
		if (list.length === 0) return undefined;
		return list.map(entry => String(entry));
	}
	if (parameter.kind === 'object') {
		return parseJsonField(context, value, field);
	}
	return value;
}

function buildQuery(
	context: IExecuteFunctions,
	operation: ApiOperation,
	itemIndex: number,
): Record<string, unknown> | undefined {
	const query: Record<string, unknown> = {};
	for (const parameter of operation.queryParameters) {
		const field = `query_${sanitize(operation.id)}_${sanitize(parameter.name)}`;
		const raw = readParameter(context, itemIndex, field);
		if (raw === undefined || raw === null || raw === '') continue;
		const value = queryValue(context, parameter, raw, field);
		if (value === undefined) continue;
		query[parameter.name] = value;
	}
	return Object.keys(query).length > 0 ? query : undefined;
}

function buildHeaders(
	context: IExecuteFunctions,
	operation: ApiOperation,
	itemIndex: number,
): Record<string, string> | undefined {
	const headers: Record<string, string> = {};
	for (const parameter of operation.headerParameters) {
		const field = `header_${sanitize(operation.id)}_${sanitize(parameter.name)}`;
		const raw = readParameter(context, itemIndex, field, '');
		const value = raw === undefined || raw === null ? '' : String(raw).trim();
		if (value !== '') headers[parameter.name] = value;
	}
	return Object.keys(headers).length > 0 ? headers : undefined;
}

function buildBody(
	context: IExecuteFunctions,
	operation: ApiOperation,
	itemIndex: number,
): unknown {
	if (!operation.requestBody) return undefined;
	const field = `body_${sanitize(operation.id)}`;
	const raw = readParameter(context, itemIndex, field);
	const parsed = parseJsonField(context, raw, field);
	if (parsed === undefined || parsed === null) {
		if (operation.requestBody.required) {
			throw new NodeOperationError(
				context.getNode(),
				`A request body is required for ${operation.method} ${operation.path}`,
			);
		}
		return undefined;
	}
	const validContainer = typeof parsed === 'object' && !Array.isArray(parsed);
	const validArray = Array.isArray(parsed);
	if (!validContainer && !validArray) {
		throw new NodeOperationError(
			context.getNode(),
			`Field "${field}" must contain a JSON object or array`,
		);
	}
	return parsed;
}

/**
 * Executes one catalog operation. The generated catalog is the only source of
 * methods, paths, parameters and body requirements.
 */
export async function executeCatalogOperation(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	operation: ApiOperation,
): Promise<unknown> {
	const requestOptions: CheckmkRequestOptions = {
		method: operation.method,
		path: buildPath(context, operation, itemIndex),
		query: buildQuery(context, operation, itemIndex),
		headers: buildHeaders(context, operation, itemIndex),
		body: buildBody(context, operation, itemIndex),
	};

	if (operation.ifMatch) {
		const field = `ifMatch_${sanitize(operation.id)}`;
		const raw = readParameter(context, itemIndex, field, '*');
		requestOptions.ifMatch = String(raw);
	}

	if (operation.paginated) {
		const returnAll = Boolean(readParameter(context, itemIndex, `returnAll_${sanitize(operation.id)}`, false));
		const limit = Number(readParameter(context, itemIndex, `limit_${sanitize(operation.id)}`, 50));
		return client.requestAll(requestOptions, returnAll, limit);
	}

	return client.request(requestOptions);
}
