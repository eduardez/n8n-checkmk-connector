import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import {OPERATIONS} from './catalog/operations.generated';
import {executeCatalogOperation} from './execute/executeCatalogOperation';
import {executeCustomOperation} from './execute/executeCustomOperation';
import {
	attachHostStatus,
	HOST_CONFIG_STATUS_OPERATIONS,
	getHostServices,
	getHostWithStatus,
	getHostsWithStatus,
	getProblems,
	getServices,
} from './live/liveStatus';
import {acknowledgeProblem, scheduleDowntime} from './monitoring/monitoring';
import {CheckmkClient} from './transport/CheckmkClient';
import type {CheckmkCredentials} from './transport/CheckmkClient';
import {toNodeApiError} from './transport/errors';
import type {CheckmkVersion} from './transport/version';
import {probeCheckmkVersion} from './transport/version';
import {buildProperties, CUSTOM_API_RESOURCE, LIVE_STATUS_RESOURCE, MONITORING_RESOURCE} from './ui/buildProperties';

const LIVE_STATUS_OPERATIONS: Record<string, (context: IExecuteFunctions, client: CheckmkClient, itemIndex: number, version?: CheckmkVersion) => Promise<unknown>> = {
	getHost: getHostWithStatus,
	getHosts: getHostsWithStatus,
	getServices,
	getProblems,
};

const MONITORING_OPERATIONS: Record<string, (context: IExecuteFunctions, client: CheckmkClient, itemIndex: number, version?: CheckmkVersion) => Promise<unknown>> = {
	acknowledgeProblem,
	getHostServices,
	scheduleDowntime,
};

const ATTRIBUTE_CONTAINERS = new Set(['attributes', 'effective_attributes']);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Keeps only the requested attribute names inside `attributes` and
 * `effective_attributes` maps anywhere in the response. An empty selection
 * returns the response untouched.
 */
export function keepAttributes(value: unknown, keep: Set<string>): unknown {
	if (keep.size === 0) return value;
	if (Array.isArray(value)) return value.map(entry => keepAttributes(entry, keep));
	if (!isRecord(value)) return value;

	const result: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (ATTRIBUTE_CONTAINERS.has(key) && isRecord(entry)) {
			result[key] = Object.fromEntries(
				Object.entries(entry)
					.filter(([name]) => keep.has(name))
					.map(([name, attribute]) => [name, keepAttributes(attribute, keep)]),
			);
		} else {
			result[key] = keepAttributes(entry, keep);
		}
	}
	return result;
}

export class CheckmkConnector implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkmk Connector',
		name: 'checkmkConnector',
		icon: 'file:checkmk.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'Interact with the Checkmk REST API',
		usableAsTool: true,
		defaults: {name: 'Checkmk Connector'},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{name: 'checkmkConnectorApi', required: true}],
		properties: buildProperties(),
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = (await this.getCredentials(
			'checkmkConnectorApi',
		)) as unknown as CheckmkCredentials;
		const client = new CheckmkClient(this, credentials);
		const version = await probeCheckmkVersion(this, client, credentials);
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				let result: unknown;

				if (resource === CUSTOM_API_RESOURCE) {
					result = await executeCustomOperation(this, client, itemIndex);
				} else if (resource === LIVE_STATUS_RESOURCE) {
					const operation = this.getNodeParameter('operation', itemIndex) as string;
					const handler = LIVE_STATUS_OPERATIONS[operation];
					if (handler === undefined) {
						throw new NodeOperationError(this.getNode(), `Unknown Live Status operation "${operation}"`);
					}
					result = await handler(this, client, itemIndex, version);
				} else if (resource === MONITORING_RESOURCE) {
					const operation = this.getNodeParameter('operation', itemIndex) as string;
					const handler = MONITORING_OPERATIONS[operation];
					if (handler === undefined) {
						throw new NodeOperationError(this.getNode(), `Unknown Monitoring operation "${operation}"`);
					}
					result = await handler(this, client, itemIndex, version);
				} else {
					const operationId = this.getNodeParameter('operation', itemIndex) as string;
					const operation = OPERATIONS.find(entry => entry.id === operationId);
					if (operation === undefined) {
						throw new NodeOperationError(this.getNode(), `Unknown operation "${operationId}"`);
					}
					result = await executeCatalogOperation(this, client, itemIndex, operation, version);
					if (
						HOST_CONFIG_STATUS_OPERATIONS.has(operation.id) &&
						Boolean(this.getNodeParameter('includeStatus', itemIndex, true))
					) {
						result = await attachHostStatus(client, version, result);
					}
				}

				const keep = new Set(
					String(this.getNodeParameter('extensionAttributes', itemIndex, ''))
						.split(',')
						.map(attribute => attribute.trim())
						.filter(attribute => attribute !== ''),
				);
				const rows = Array.isArray(result) ? result : [result];
				for (const row of rows) {
					const json = keepAttributes(
						typeof row === 'object' && row !== null ? row : {value: row},
						keep,
					) as IDataObject;
					returnData.push({json, pairedItem: {item: itemIndex}});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {error: (error as Error).message},
						pairedItem: {item: itemIndex},
					});
					continue;
				}
				throw error instanceof Error && (error as {node?: unknown}).node !== undefined
					? error
					: toNodeApiError(this, error);
			}
		}

		return [returnData];
	}
}
