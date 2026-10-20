import type {INodeParameters, INodeProperties} from 'n8n-workflow';

import {OPERATIONS, RESOURCES} from '../catalog/operations.generated';
import type {ApiOperation, ApiParameter} from '../catalog/types';

export const LIVE_STATUS_RESOURCE = 'liveStatus';
export const CUSTOM_API_RESOURCE = 'customApi';
export const MONITORING_RESOURCE = 'monitoring';

const HOST_COLUMNS = ['name', 'state', 'plugin_output', 'address', 'alias', 'last_check'];
const SERVICE_COLUMNS = ['host_name', 'description', 'state', 'state_type', 'last_check', 'plugin_output'];
const PROBLEM_COLUMNS = [
	'host_name',
	'description',
	'state',
	'state_type',
	'acknowledged',
	'last_check',
	'plugin_output',
];

// Curated Live Status columns. Any other column can still be requested through
// the Custom API resource.
const HOST_COLUMN_OPTIONS = [
	...HOST_COLUMNS,
	'last_state',
	'last_hard_state',
	'state_type',
	'acknowledged',
	'acknowledged_by',
	'checks_enabled',
	'notifications_enabled',
	'parents',
	'host_groups',
	'contact_groups',
	'host_tags',
	'inventory_last',
	'num_services',
	'num_services_ok',
	'num_services_warn',
	'num_services_crit',
	'num_services_unknown',
	'worst_service_state',
];
const SERVICE_COLUMN_OPTIONS = [
	...SERVICE_COLUMNS,
	'acknowledged',
	'acknowledged_by',
	'checks_enabled',
	'notifications_enabled',
	'last_state',
	'last_hard_state',
	'service_groups',
	'contact_groups',
	'host_alias',
	'host_address',
	'host_state',
	'perf_data',
];
const PROBLEM_QUERY: INodeParameters = {op: '!=', left: 'state', right: '0'};
const EMPTY_JSON: INodeParameters = {};

export function sanitize(value: string): string {
	return value.replace(/[^A-Za-z0-9]/g, '_');
}

function fieldName(prefix: string, operation: ApiOperation, suffix?: string): string {
	const base = `${prefix}_${sanitize(operation.id)}`;
	return suffix === undefined ? base : `${base}_${sanitize(suffix)}`;
}

function sampleNote(param: ApiParameter): string {
	if (param.example === undefined) return '';
	if (Array.isArray(param.example) || typeof param.example === 'object') return '';
	return `Example: ${String(param.example)}`;
}

function describe(param: ApiParameter, extra?: string): string {
	return [param.description?.replace(/\.$/, ''), sampleNote(param), extra]
		.filter(part => part !== undefined && part !== '')
		.join('. ');
}

function scalarDefault(
	param: ApiParameter,
	kind: 'string' | 'number' | 'boolean',
): string | number | boolean | undefined {
	// Examples are documentation hints (site1, host1), not values to send.
	const candidate = param.defaultValue;
	if (candidate === undefined) return undefined;
	if (kind === 'string') return String(candidate);
	if (kind === 'number') {
		const value = Number(candidate);
		return Number.isFinite(value) ? value : undefined;
	}
	if (typeof candidate === 'boolean') return candidate;
	return candidate === 'true' || candidate === 1;
}

function parameterField(
	operation: ApiOperation,
	param: ApiParameter,
	scope: 'path' | 'query' | 'header',
): INodeProperties {
	const name = fieldName(scope, operation, param.name);
	const displayOptions = {show: {resource: [operation.resource], operation: [operation.id]}};
	const typeOptions = param.enumValues && param.enumValues.length > 0 ? 'options' : param.kind;
	const declaredDefault = param.defaultValue;
	const enumDefault =
		typeof declaredDefault === 'string' && param.enumValues?.includes(declaredDefault)
			? declaredDefault
			: param.enumValues?.[0];

	const base = {
		displayName: param.name,
		name,
		required: param.required,
		displayOptions,
		description: describe(param),
	};

	switch (typeOptions) {
		case 'options':
			return {
				...base,
				type: 'options',
				default: enumDefault ?? '',
				options: (param.enumValues ?? []).map(value => ({name: value, value})),
			};
		case 'number':
			return {
				...base,
				type: 'number',
				default: scalarDefault(param, 'number') ?? 0,
				typeOptions: {numberPrecision: 0},
			};
		case 'boolean':
			return {...base, type: 'boolean', default: scalarDefault(param, 'boolean') ?? false};
		case 'array':
			return {
				...base,
				type: 'string',
				displayName: `${param.name} (comma-separated)`,
				default: Array.isArray(param.defaultValue)
					? param.defaultValue.map(value => String(value)).join(',')
					: '',
				description: describe(
					param,
					'Supply a comma-separated list; values are sent as repeated query keys',
				),
			};
		case 'object':
			return {
				...base,
				type: 'json',
				default:
					declaredDefault !== undefined && typeof declaredDefault === 'object'
						? (declaredDefault as INodeParameters)
						: EMPTY_JSON,
				description: describe(param, 'Supply a JSON object'),
			};
		default:
			return {...base, type: 'string', default: scalarDefault(param, 'string') ?? ''};
	}
}

function operationFields(operation: ApiOperation): INodeProperties[] {
	const fields: INodeProperties[] = [];
	for (const param of operation.pathParameters) {
		fields.push(parameterField(operation, param, 'path'));
	}
	for (const param of operation.queryParameters) {
		fields.push(parameterField(operation, param, 'query'));
	}
	for (const param of operation.headerParameters) {
		fields.push(parameterField(operation, param, 'header'));
	}

	const displayOptions = {show: {resource: [operation.resource], operation: [operation.id]}};

	const body = operation.requestBody;
	if (body) {
		const schemaName = body.schemaRef?.split('/').pop();
		const bodyDefault: INodeParameters =
			typeof body.example === 'object' && body.example !== null
				? (body.example as INodeParameters)
				: EMPTY_JSON;
		fields.push({
			displayName: 'Body (JSON)',
			name: fieldName('body', operation),
			type: 'json',
			default: bodyDefault,
			required: body.required,
			displayOptions,
			description: [
				`JSON request body for ${operation.method} ${operation.path}`,
				schemaName ? `schema ${schemaName}` : '',
			]
				.filter(part => part !== '')
				.join(', '),
		});
	}

	if (operation.ifMatch) {
		fields.push({
			displayName: 'If-Match (ETag)',
			name: fieldName('ifMatch', operation),
			type: 'string',
			default: '*',
			displayOptions,
			description:
				'"*" bypasses optimistic locking and is last-write-wins. Paste the exact ETag from a prior read to enforce concurrency control; it is sent verbatim.',
		});
	}

	if (operation.paginated) {
		fields.push({
			displayName: 'Return All',
			name: fieldName('returnAll', operation),
			type: 'boolean',
			default: false,
			displayOptions,
			description: 'Whether to return all results or only up to a given limit',
		});
		fields.push({
			displayName: 'Limit',
			name: fieldName('limit', operation),
			type: 'number',
			default: 50,
			typeOptions: {minValue: 1},
			displayOptions: {
				show: {
					resource: [operation.resource],
					operation: [operation.id],
					[fieldName('returnAll', operation)]: [false],
				},
			},
			description: 'Max number of results to return',
		});
	}

	return fields;
}

function operationSelector(resource: {value: string; label: string}): INodeProperties {
	const operations = OPERATIONS.filter(operation => operation.resource === resource.value);
	const defaultOperation =
		operations.find(operation => operation.method === 'GET' && !operation.deprecated) ??
		operations.find(operation => !operation.deprecated) ??
		operations[0];
	const defaultOperationId = defaultOperation.id;
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {show: {resource: [resource.value]}},
		options: operations.map(operation => ({
			name: operation.label,
			value: operation.id,
			description: `${operation.method} ${operation.path}`,
		})),
		default: defaultOperationId,
	};
}

function liveStatusProperties(): INodeProperties[] {
	const show = (operations: string[]) => ({
		show: {resource: [LIVE_STATUS_RESOURCE], operation: operations},
	});

	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {show: {resource: [LIVE_STATUS_RESOURCE]}},
			options: [
				{name: 'Get Host with Status', value: 'getHost'},
				{name: 'Get Hosts with Status', value: 'getHosts'},
				{name: 'Get Problems', value: 'getProblems'},
				{name: 'Get Services', value: 'getServices'},
			],
			default: 'getHost',
		},
		{
			displayName: 'Host Name',
			name: 'hostName',
			type: 'string',
			default: '',
			required: true,
			displayOptions: show(['getHost']),
			description: 'Name of the host whose configuration and live status are returned',
		},
		{
			displayName: 'Columns',
			name: 'columns',
			type: 'multiOptions',
			default: [...HOST_COLUMNS],
			options: HOST_COLUMN_OPTIONS.map(column => ({name: column, value: column})),
			displayOptions: show(['getHost', 'getHosts']),
			description:
				'Live status columns to return. Other columns can be requested through the Custom API resource.',
		},
		{
			displayName: 'Columns',
			name: 'columns',
			type: 'multiOptions',
			default: [...SERVICE_COLUMNS],
			options: SERVICE_COLUMN_OPTIONS.map(column => ({name: column, value: column})),
			displayOptions: show(['getServices']),
			description:
				'Live status columns to return. Other columns can be requested through the Custom API resource.',
		},
		{
			displayName: 'Columns',
			name: 'columns',
			type: 'multiOptions',
			default: [...PROBLEM_COLUMNS],
			options: SERVICE_COLUMN_OPTIONS.map(column => ({name: column, value: column})),
			displayOptions: show(['getProblems']),
			description:
				'Live status columns to return. Other columns can be requested through the Custom API resource.',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'json',
			default: EMPTY_JSON,
			displayOptions: show(['getHosts', 'getServices']),
			description:
				'Checkmk live status filter expression as a JSON object; leave empty to return everything',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'json',
			default: PROBLEM_QUERY,
			displayOptions: show(['getProblems']),
			description:
				'Checkmk live status filter expression as a JSON object; a supplied expression replaces the non-OK default',
		},
		{
			displayName: 'Sites',
			name: 'sites',
			type: 'string',
			default: '',
			displayOptions: show(['getHost', 'getHosts', 'getServices', 'getProblems']),
			description: 'Comma-separated site names; leave empty to use every site',
		},
		{
			displayName: 'Include Host Configuration',
			name: 'includeConfig',
			type: 'boolean',
			default: true,
			displayOptions: show(['getHost', 'getHosts']),
			description: 'Whether to merge the host configuration with its live status',
		},
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: true,
			displayOptions: show(['getHosts']),
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			displayOptions: show(['getServices']),
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: {minValue: 1},
			displayOptions: {
				show: {
					resource: [LIVE_STATUS_RESOURCE],
					operation: ['getHosts', 'getServices'],
					returnAll: [false],
				},
			},
			description: 'Max number of results to return',
		},
	];
}

function monitoringProperties(): INodeProperties[] {
	const displayOptions = {show: {resource: [MONITORING_RESOURCE]}};
	const show = (operations: string[], extra: Record<string, string[]> = {}) => ({
		show: {resource: [MONITORING_RESOURCE], operation: operations, ...extra},
	});

	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions,
			options: [
				{
					name: 'Acknowledge Problem',
					value: 'acknowledgeProblem',
					description: 'POST /domain-types/acknowledge/collections/{host|service}',
					action: 'Acknowledge a host or service problem',
				},
				{
					name: 'Get Host Services',
					value: 'getHostServices',
					description: 'POST /domain-types/service/collections/all (GET on Checkmk < 2.4)',
					action: 'Get the live status of every service on a host',
				},
				{
					name: 'Schedule Downtime',
					value: 'scheduleDowntime',
					description: 'POST /domain-types/downtime/collections/{host|service}',
					action: 'Schedule a host or service downtime',
				},
			],
			default: 'getHostServices',
		},
		{
			displayName: 'Host Name',
			name: 'hostName',
			type: 'string',
			default: '',
			required: true,
			displayOptions,
			description: 'Name of the host to act on',
		},
		{
			displayName: 'Target',
			name: 'target',
			type: 'options',
			default: 'host',
			displayOptions: show(['acknowledgeProblem', 'scheduleDowntime']),
			options: [
				{name: 'Host', value: 'host'},
				{name: 'Service', value: 'service'},
			],
			description: 'Whether the acknowledgement or downtime applies to the host or one of its services',
		},
		{
			displayName: 'Service Description',
			name: 'serviceDescription',
			type: 'string',
			default: '',
			required: true,
			displayOptions: show(['acknowledgeProblem'], {target: ['service']}),
			description: 'Exact service description of the problem to acknowledge',
		},
		{
			displayName: 'Service Descriptions',
			name: 'serviceDescriptions',
			type: 'string',
			default: '',
			required: true,
			displayOptions: show(['scheduleDowntime'], {target: ['service']}),
			description: 'Comma-separated service descriptions that receive the downtime',
		},
		{
			displayName: 'Comment',
			name: 'acknowledgementComment',
			type: 'string',
			default: '',
			required: true,
			displayOptions: show(['acknowledgeProblem']),
			description: 'Comment stored with the acknowledgement',
		},
		{
			displayName: 'Sticky',
			name: 'sticky',
			type: 'boolean',
			default: true,
			displayOptions: show(['acknowledgeProblem']),
			description: 'Whether the acknowledgement survives a state change',
		},
		{
			displayName: 'Persistent',
			name: 'persistent',
			type: 'boolean',
			default: false,
			displayOptions: show(['acknowledgeProblem']),
			description: 'Whether the comment stays when the acknowledgement is removed',
		},
		{
			displayName: 'Notify',
			name: 'notify',
			type: 'boolean',
			default: true,
			displayOptions: show(['acknowledgeProblem']),
			description: 'Whether contacts are notified about the acknowledgement',
		},
		{
			displayName: 'Expire On',
			name: 'expireOn',
			type: 'dateTime',
			default: '',
			displayOptions: show(['acknowledgeProblem']),
			description: 'Optional ISO 8601 timestamp after which the acknowledgement expires',
		},
		{
			displayName: 'Only Problems',
			name: 'onlyProblems',
			type: 'boolean',
			default: false,
			displayOptions: show(['getHostServices']),
			description: 'Whether to return only services that are not OK',
		},
		{
			displayName: 'Columns',
			name: 'columns',
			type: 'multiOptions',
			default: [...SERVICE_COLUMNS],
			options: SERVICE_COLUMN_OPTIONS.map(column => ({name: column, value: column})),
			displayOptions: show(['getHostServices']),
			description:
				'Live status columns to return. Other columns can be requested through the Custom API resource.',
		},
		{
			displayName: 'Sites',
			name: 'sites',
			type: 'string',
			default: '',
			displayOptions: show(['getHostServices']),
			description: 'Comma-separated site names; leave empty to use every site',
		},
		{
			displayName: 'Start Time',
			name: 'startTime',
			type: 'dateTime',
			default: '',
			required: true,
			displayOptions: show(['scheduleDowntime']),
			description: 'ISO 8601 timestamp at which the downtime starts',
		},
		{
			displayName: 'End Time',
			name: 'endTime',
			type: 'dateTime',
			default: '',
			required: true,
			displayOptions: show(['scheduleDowntime']),
			description: 'ISO 8601 timestamp at which the downtime ends',
		},
		{
			displayName: 'Comment',
			name: 'downtimeComment',
			type: 'string',
			default: '',
			displayOptions: show(['scheduleDowntime']),
			description: 'Optional comment stored with the downtime',
		},
	];
}

function customApiProperties(): INodeProperties[] {
	const displayOptions = {show: {resource: [CUSTOM_API_RESOURCE]}};
	return [
		{
			displayName: 'Method',
			name: 'customMethod',
			type: 'options',
			default: 'GET',
			displayOptions,
			options: [
				{name: 'DELETE', value: 'DELETE'},
				{name: 'GET', value: 'GET'},
				{name: 'PATCH', value: 'PATCH'},
				{name: 'POST', value: 'POST'},
				{name: 'PUT', value: 'PUT'},
			],
		},
		{
			displayName: 'Path',
			name: 'customPath',
			type: 'string',
			default: '/version',
			required: true,
			displayOptions,
			description:
				'Path relative to the Checkmk API base, starting with "/"; absolute URLs are not allowed',
		},
		{
			displayName: 'Query',
			name: 'customQuery',
			type: 'json',
			default: EMPTY_JSON,
			displayOptions,
			description: 'Query parameters as a JSON object',
		},
		{
			displayName: 'Headers',
			name: 'customHeaders',
			type: 'json',
			default: EMPTY_JSON,
			displayOptions,
			description:
				'Additional headers as a JSON object; Authorization, Host, Content-Length and Cookie cannot be overridden',
		},
		{
			displayName: 'Body (JSON)',
			name: 'customBody',
			type: 'json',
			default: EMPTY_JSON,
			displayOptions,
			description: 'Request body as JSON; ignored for GET and DELETE when empty',
		},
		{
			displayName: 'Return Full Response',
			name: 'customReturnFullResponse',
			type: 'boolean',
			default: false,
			displayOptions,
			description: 'Whether to return the status code and headers alongside the body',
		},
	];
}

export function buildProperties(): INodeProperties[] {
	const properties: INodeProperties[] = [
		{
			displayName:
				'Requests are sent to <code>{host}/{site}/check_mk/api/{apiVersion}</code> with the Bearer credentials stored in the Checkmk Connector API credential',
			name: 'credentialNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				...RESOURCES.map(resource => ({name: resource.label, value: resource.value})),
				{name: 'Monitoring', value: MONITORING_RESOURCE},
				{name: 'Live Status', value: LIVE_STATUS_RESOURCE},
				{name: 'Custom API', value: CUSTOM_API_RESOURCE},
			],
			default: 'hosts',
		},
	];

	for (const resource of RESOURCES) {
		properties.push(operationSelector(resource));
	}
	for (const operation of OPERATIONS) {
		properties.push(...operationFields(operation));
	}

	properties.push(...monitoringProperties());
	properties.push(...liveStatusProperties());
	properties.push(...customApiProperties());
	return properties;
}
