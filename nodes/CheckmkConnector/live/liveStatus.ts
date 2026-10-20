import type {IExecuteFunctions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {CheckmkClient} from '../transport/CheckmkClient';
import {isLegacyStatusApi} from '../transport/compatibility';
import type {CheckmkVersion} from '../transport/version';

const HOST_STATUS_PATH = '/domain-types/host/collections/all';
const SERVICE_STATUS_PATH = '/domain-types/service/collections/all';
const HOST_COLUMNS = ['name', 'state', 'plugin_output', 'address', 'alias', 'last_check'];
const SERVICE_COLUMNS = [
	'host_name',
	'description',
	'state',
	'state_type',
	'last_check',
	'plugin_output',
];
const PROBLEM_COLUMNS = [
	'host_name',
	'description',
	'state',
	'state_type',
	'acknowledged',
	'last_check',
	'plugin_output',
];
const PROBLEM_QUERY = {op: '!=', left: 'state', right: '0'};

interface StatusItem {
	id?: string;
	extensions?: Record<string, unknown>;
	[key: string]: unknown;
}

function readList(context: IExecuteFunctions, itemIndex: number, name: string, fallback: string): string[] {
	const raw = context.getNodeParameter(name, itemIndex, fallback);
	if (Array.isArray(raw)) return raw.map(entry => String(entry).trim()).filter(entry => entry !== '');
	return String(raw)
		.split(',')
		.map(entry => entry.trim())
		.filter(entry => entry !== '');
}

/**
 * Reads the query field and returns it as the JSON *string* the Checkmk status
 * collections expect, or undefined when no filter was supplied.
 */
function readQuery(
	context: IExecuteFunctions,
	itemIndex: number,
	fallback: unknown,
): string | undefined {
	const raw = context.getNodeParameter('query', itemIndex, fallback);
	let parsed: unknown = raw;
	if (typeof raw === 'string') {
		const trimmed = raw.trim();
		if (trimmed === '') return undefined;
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			throw new NodeOperationError(context.getNode(), 'Field "Query" must contain valid JSON');
		}
	}
	if (parsed === undefined || parsed === null) return undefined;
	if (typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new NodeOperationError(context.getNode(), 'Field "Query" must contain a JSON object');
	}
	if (Object.keys(parsed as Record<string, unknown>).length === 0) return undefined;
	return JSON.stringify(parsed);
}

function readPaging(context: IExecuteFunctions, itemIndex: number): {returnAll: boolean; limit: number} {
	const returnAll = Boolean(context.getNodeParameter('returnAll', itemIndex, false));
	const limit = Number(context.getNodeParameter('limit', itemIndex, 50));
	return {returnAll, limit};
}

function normalizeStatusItem(item: StatusItem | undefined): unknown {
	if (item === undefined) return null;
	return item.extensions ?? item;
}

function statusItems(response: unknown): StatusItem[] {
	if (typeof response === 'object' && response !== null) {
		const value = (response as {value?: unknown}).value;
		if (Array.isArray(value)) return value as StatusItem[];
	}
	return Array.isArray(response) ? (response as StatusItem[]) : [];
}

async function postStatus(
	client: CheckmkClient,
	path: string,
	body: Record<string, unknown>,
): Promise<StatusItem[]> {
	return statusItems(await client.request<unknown>({method: 'POST', path, body}));
}

/**
 * Checkmk before 2.4 only offers the GET status collections, which take the
 * same values as query parameters instead of a JSON body.
 */
async function fetchStatus(
	client: CheckmkClient,
	version: CheckmkVersion | undefined,
	path: string,
	body: Record<string, unknown>,
): Promise<StatusItem[]> {
	if (!isLegacyStatusApi(version)) return postStatus(client, path, body);
	return statusItems(await client.request<unknown>({method: 'GET', path, query: body}));
}

/**
 * Returns the host configuration together with its live status. The status is
 * nested under `host_status` so that status columns can never overwrite
 * configuration attributes.
 */
export async function getHostWithStatus(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	version?: CheckmkVersion,
): Promise<unknown> {
	const hostName = String(context.getNodeParameter('hostName', itemIndex, '')).trim();
	if (hostName === '') {
		throw new NodeOperationError(context.getNode(), 'Host name is required');
	}
	const columns = readList(context, itemIndex, 'columns', HOST_COLUMNS.join(','));
	const sites = readList(context, itemIndex, 'sites', '');
	const includeConfig = Boolean(context.getNodeParameter('includeConfig', itemIndex, true));

	const config = includeConfig
		? await client.request<Record<string, unknown>>({
				method: 'GET',
				path: `/objects/host_config/${encodeURIComponent(hostName)}`,
			})
		: undefined;

	const items = await fetchStatus(client, version, HOST_STATUS_PATH, {
		sites,
		query: JSON.stringify({op: '=', left: 'name', right: hostName}),
		columns,
	});
	const status = normalizeStatusItem(items[0]);

	if (includeConfig && config !== undefined) {
		return {...config, host_status: status};
	}
	return {host_name: hostName, host_status: status};
}

/**
 * Fetches every host configuration, then one bulk status request, and joins the
 * two by host name.
 */
export async function getHostsWithStatus(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	version?: CheckmkVersion,
): Promise<unknown[]> {
	const columns = readList(context, itemIndex, 'columns', HOST_COLUMNS.join(','));
	const sites = readList(context, itemIndex, 'sites', '');
	const query = readQuery(context, itemIndex, {});
	const includeConfig = Boolean(context.getNodeParameter('includeConfig', itemIndex, true));
	const {returnAll, limit} = readPaging(context, itemIndex);

	const configs = await client.requestAll<Record<string, unknown>>(
		{method: 'GET', path: '/domain-types/host_config/collections/all'},
		returnAll,
		limit,
	);
	if (configs.length === 0) return [];

	const body: Record<string, unknown> = {sites, columns};
	if (query !== undefined) body.query = query;
	const items = await fetchStatus(client, version, HOST_STATUS_PATH, body);

	const statusByHost = new Map<string, StatusItem | undefined>();
	for (const item of items) {
		const name = typeof item.extensions?.name === 'string' ? item.extensions.name : item.id;
		if (typeof name === 'string') statusByHost.set(name, item);
	}

	const joined = configs.map(config => {
		if (!includeConfig) {
			const hostName = String(config.id ?? '');
			return {host_name: hostName, host_status: normalizeStatusItem(statusByHost.get(hostName))};
		}
		const hostName = String(config.id ?? '');
		return {...config, host_status: normalizeStatusItem(statusByHost.get(hostName))};
	});

	return returnAll ? joined : joined.slice(0, Math.max(1, limit));
}

async function collectServices(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	version: CheckmkVersion | undefined,
	defaultColumns: string[],
	defaultQuery: unknown,
): Promise<unknown[]> {
	const columns = readList(context, itemIndex, 'columns', defaultColumns.join(','));
	const sites = readList(context, itemIndex, 'sites', '');
	const query = readQuery(context, itemIndex, defaultQuery);
	const {returnAll, limit} = readPaging(context, itemIndex);

	const body: Record<string, unknown> = {sites, columns};
	if (query !== undefined) body.query = query;

	if (isLegacyStatusApi(version)) {
		return client.requestAll<unknown>(
			{method: 'GET', path: SERVICE_STATUS_PATH, query: body},
			returnAll,
			limit,
		);
	}
	return client.requestAll<unknown>(
		{method: 'POST', path: SERVICE_STATUS_PATH, body},
		returnAll,
		limit,
	);
}

/** Returns the live service status rows matching the requested filter. */
export async function getServices(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	version?: CheckmkVersion,
): Promise<unknown[]> {
	return collectServices(context, client, itemIndex, version, SERVICE_COLUMNS, {});
}

/**
 * Returns the non-OK service rows. Checkmk 2.4 has no dedicated problem
 * collection, so this is the standard live status query.
 */
export async function getProblems(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
	version?: CheckmkVersion,
): Promise<unknown[]> {
	return collectServices(context, client, itemIndex, version, PROBLEM_COLUMNS, PROBLEM_QUERY);
}
