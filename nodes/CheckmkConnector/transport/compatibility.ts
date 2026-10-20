import type {IExecuteFunctions} from 'n8n-workflow';

import type {ApiOperation} from '../catalog/types';
import type {CheckmkVersion} from './version';

/**
 * Query parameters that exist in the Checkmk 2.4 OpenAPI document but not in
 * 2.2.0p47. Older servers reject the whole request with HTTP 400 when they see
 * an unknown query parameter, so these are dropped before sending.
 */
const QUERY_PARAMETERS_ADDED_AFTER_2_2: Record<string, string[]> = {
	'GET /domain-types/host_config/collections/all': [
		'fields',
		'hostnames',
		'include_links',
		'site',
	],
	'GET /objects/folder_config/{folder}/collections/hosts': ['effective_attributes'],
	'DELETE /objects/host_tag_group/{name}': ['mode'],
	'GET /objects/host/{host_name}/actions/show_service/invoke': ['columns'],
};

/** Checkmk before 2.4 only serves the deprecated GET status collections. */
export function isLegacyStatusApi(version: CheckmkVersion | undefined): boolean {
	return version !== undefined && version.major === 2 && version.minor < 4;
}

/**
 * Removes query parameters an older server cannot parse. Returns the original
 * object when nothing changes, and undefined when every parameter was dropped.
 */
export function filterLegacyQuery(
	context: IExecuteFunctions,
	version: CheckmkVersion | undefined,
	operation: ApiOperation,
	query: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
	if (!isLegacyStatusApi(version) || query === undefined) return query;

	const unsupported = QUERY_PARAMETERS_ADDED_AFTER_2_2[`${operation.method} ${operation.path}`];
	if (unsupported === undefined) return query;

	const dropped = unsupported.filter(name => name in query);
	if (dropped.length === 0) return query;

	context.logger.warn(
		`Checkmk ${version?.raw} does not support ${dropped.join(', ')} on ${operation.method} ${operation.path}; ${dropped.length === 1 ? 'it was' : 'they were'} not sent.`,
	);

	const filtered = {...query};
	for (const name of dropped) delete filtered[name];
	return Object.keys(filtered).length > 0 ? filtered : undefined;
}
